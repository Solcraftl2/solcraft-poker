"""
SolCraft Backend Integration
Handles off-chain data, real-time updates, and SDK integration
"""

import asyncio
import json
import logging
from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta
from dataclasses import dataclass, asdict
from enum import Enum

import aiohttp
import websockets
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import redis
from solana.rpc.async_api import AsyncClient
from solana.publickey import PublicKey
from solders.signature import Signature

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Solana configuration
SOLANA_RPC_URL = "https://api.devnet.solana.com"
PROGRAM_IDS = {
    "POKER": "SoLCraftPoker11111111111111111111111111111",
    "TOKEN": "SoLCraftToken1111111111111111111111111111",
    "ESCROW": "SoLCraftEscrow111111111111111111111111111",
    "GOVERNANCE": "SoLCraftGov1111111111111111111111111111111",
    "STAKING": "SoLCraftStaking11111111111111111111111111",
    "TOURNAMENTS": "SoLCraftTournament1111111111111111111111111",
}

# Redis configuration
REDIS_URL = "redis://localhost:6379"

# Data models
class TableStatus(str, Enum):
    WAITING = "Waiting"
    PLAYING = "Playing"
    FINISHED = "Finished"

class PlayerAction(str, Enum):
    NONE = "None"
    FOLD = "Fold"
    CHECK = "Check"
    CALL = "Call"
    BET = "Bet"
    RAISE = "Raise"
    ALL_IN = "AllIn"

@dataclass
class GameEvent:
    event_type: str
    table_id: str
    player_id: Optional[str] = None
    data: Dict[str, Any] = None
    timestamp: datetime = None
    
    def __post_init__(self):
        if self.timestamp is None:
            self.timestamp = datetime.utcnow()
        if self.data is None:
            self.data = {}

@dataclass
class TableInfo:
    table_id: str
    authority: str
    max_players: int
    current_players: int
    buy_in_amount: float
    small_blind: float
    big_blind: float
    ante: float
    status: TableStatus
    pot_amount: float
    current_round: int
    dealer_position: int
    created_at: datetime
    players: List[str]
    player_chips: List[float]

@dataclass
class PlayerInfo:
    player_id: str
    table_id: str
    chips: float
    position: int
    is_active: bool
    last_action: PlayerAction
    cards: Optional[List[str]] = None

class SolCraftBackend:
    def __init__(self):
        self.app = FastAPI(title="SolCraft Poker Backend", version="1.0.0")
        self.setup_cors()
        self.setup_routes()
        
        # Connections
        self.solana_client: Optional[AsyncClient] = None
        self.redis_client: Optional[redis.Redis] = None
        self.websocket_connections: Dict[str, WebSocket] = {}
        
        # Game state
        self.active_tables: Dict[str, TableInfo] = {}
        self.active_players: Dict[str, PlayerInfo] = {}
        self.game_events: List[GameEvent] = []
        
        # Background tasks
        self.monitoring_task: Optional[asyncio.Task] = None

    def setup_cors(self):
        """Setup CORS middleware"""
        self.app.add_middleware(
            CORSMiddleware,
            allow_origins=["*"],  # Configure appropriately for production
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )

    def setup_routes(self):
        """Setup API routes"""
        
        @self.app.on_event("startup")
        async def startup_event():
            await self.initialize()

        @self.app.on_event("shutdown")
        async def shutdown_event():
            await self.cleanup()

        @self.app.get("/health")
        async def health_check():
            return {
                "status": "healthy",
                "timestamp": datetime.utcnow().isoformat(),
                "solana_connected": self.solana_client is not None,
                "redis_connected": self.redis_client is not None,
                "active_tables": len(self.active_tables),
                "active_players": len(self.active_players)
            }

        @self.app.get("/api/tables")
        async def get_tables():
            """Get all active tables"""
            return {
                "success": True,
                "data": [asdict(table) for table in self.active_tables.values()],
                "total": len(self.active_tables)
            }

        @self.app.get("/api/tables/{table_id}")
        async def get_table(table_id: str):
            """Get specific table info"""
            if table_id not in self.active_tables:
                raise HTTPException(status_code=404, detail="Table not found")
            
            table = self.active_tables[table_id]
            players = [
                asdict(player) for player in self.active_players.values()
                if player.table_id == table_id
            ]
            
            return {
                "success": True,
                "data": {
                    "table": asdict(table),
                    "players": players
                }
            }

        @self.app.get("/api/players/{player_id}")
        async def get_player(player_id: str):
            """Get player info"""
            if player_id not in self.active_players:
                raise HTTPException(status_code=404, detail="Player not found")
            
            return {
                "success": True,
                "data": asdict(self.active_players[player_id])
            }

        @self.app.get("/api/events")
        async def get_events(table_id: Optional[str] = None, limit: int = 100):
            """Get game events"""
            events = self.game_events
            
            if table_id:
                events = [e for e in events if e.table_id == table_id]
            
            events = events[-limit:]  # Get latest events
            
            return {
                "success": True,
                "data": [asdict(event) for event in events],
                "total": len(events)
            }

        @self.app.post("/api/tables/{table_id}/join")
        async def join_table_notification(table_id: str, player_data: dict):
            """Handle table join notification from frontend"""
            try:
                await self.handle_player_joined(table_id, player_data)
                return {"success": True, "message": "Player joined notification processed"}
            except Exception as e:
                logger.error(f"Error processing join notification: {e}")
                raise HTTPException(status_code=500, detail=str(e))

        @self.app.post("/api/tables/{table_id}/action")
        async def player_action_notification(table_id: str, action_data: dict):
            """Handle player action notification from frontend"""
            try:
                await self.handle_player_action(table_id, action_data)
                return {"success": True, "message": "Player action notification processed"}
            except Exception as e:
                logger.error(f"Error processing action notification: {e}")
                raise HTTPException(status_code=500, detail=str(e))

        @self.app.websocket("/ws/{table_id}")
        async def websocket_endpoint(websocket: WebSocket, table_id: str):
            await self.handle_websocket_connection(websocket, table_id)

    async def initialize(self):
        """Initialize backend services"""
        try:
            # Initialize Solana client
            self.solana_client = AsyncClient(SOLANA_RPC_URL)
            logger.info("Solana client initialized")
            
            # Initialize Redis client
            self.redis_client = redis.from_url(REDIS_URL, decode_responses=True)
            await self.redis_client.ping()
            logger.info("Redis client initialized")
            
            # Start monitoring task
            self.monitoring_task = asyncio.create_task(self.monitor_blockchain())
            logger.info("Blockchain monitoring started")
            
        except Exception as e:
            logger.error(f"Initialization error: {e}")
            raise

    async def cleanup(self):
        """Cleanup resources"""
        if self.monitoring_task:
            self.monitoring_task.cancel()
        
        if self.solana_client:
            await self.solana_client.close()
        
        if self.redis_client:
            await self.redis_client.close()

    async def monitor_blockchain(self):
        """Monitor blockchain for game events"""
        logger.info("Starting blockchain monitoring...")
        
        while True:
            try:
                # Monitor for new transactions on our programs
                await self.check_program_transactions()
                
                # Update game state from blockchain
                await self.sync_game_state()
                
                # Wait before next check
                await asyncio.sleep(5)
                
            except asyncio.CancelledError:
                logger.info("Blockchain monitoring cancelled")
                break
            except Exception as e:
                logger.error(f"Blockchain monitoring error: {e}")
                await asyncio.sleep(10)  # Wait longer on error

    async def check_program_transactions(self):
        """Check for new transactions on our programs"""
        if not self.solana_client:
            return
        
        try:
            # Get recent signatures for our programs
            for program_name, program_id in PROGRAM_IDS.items():
                signatures = await self.solana_client.get_signatures_for_address(
                    PublicKey(program_id),
                    limit=10
                )
                
                for sig_info in signatures.value:
                    await self.process_transaction(sig_info.signature, program_name)
                    
        except Exception as e:
            logger.error(f"Error checking program transactions: {e}")

    async def process_transaction(self, signature: Signature, program_name: str):
        """Process a specific transaction"""
        try:
            if not self.solana_client:
                return
            
            # Get transaction details
            tx = await self.solana_client.get_transaction(signature)
            
            if not tx.value:
                return
            
            # Parse transaction and extract game events
            # This would involve parsing the transaction logs and instruction data
            # For now, we'll create mock events
            
            event = GameEvent(
                event_type=f"{program_name}_TRANSACTION",
                table_id="mock_table",
                data={
                    "signature": str(signature),
                    "program": program_name,
                    "slot": tx.value.slot
                }
            )
            
            await self.add_game_event(event)
            
        except Exception as e:
            logger.error(f"Error processing transaction {signature}: {e}")

    async def sync_game_state(self):
        """Sync game state from blockchain"""
        try:
            # This would fetch current state from blockchain accounts
            # For now, we'll update with mock data
            
            # Update active tables from blockchain
            await self.update_tables_from_blockchain()
            
            # Update player states
            await self.update_players_from_blockchain()
            
        except Exception as e:
            logger.error(f"Error syncing game state: {e}")

    async def update_tables_from_blockchain(self):
        """Update table information from blockchain"""
        # Mock implementation - in real version would query blockchain accounts
        pass

    async def update_players_from_blockchain(self):
        """Update player information from blockchain"""
        # Mock implementation - in real version would query blockchain accounts
        pass

    async def handle_player_joined(self, table_id: str, player_data: dict):
        """Handle player joining a table"""
        player_id = player_data.get("player_id")
        
        if not player_id:
            raise ValueError("Player ID required")
        
        # Create or update player info
        player = PlayerInfo(
            player_id=player_id,
            table_id=table_id,
            chips=player_data.get("chips", 0),
            position=player_data.get("position", 0),
            is_active=True,
            last_action=PlayerAction.NONE
        )
        
        self.active_players[player_id] = player
        
        # Create event
        event = GameEvent(
            event_type="PLAYER_JOINED",
            table_id=table_id,
            player_id=player_id,
            data={"position": player.position, "chips": player.chips}
        )
        
        await self.add_game_event(event)
        await self.broadcast_to_table(table_id, {
            "type": "player_joined",
            "data": asdict(player)
        })

    async def handle_player_action(self, table_id: str, action_data: dict):
        """Handle player action"""
        player_id = action_data.get("player_id")
        action = action_data.get("action")
        amount = action_data.get("amount", 0)
        
        if not player_id or not action:
            raise ValueError("Player ID and action required")
        
        # Update player state
        if player_id in self.active_players:
            player = self.active_players[player_id]
            player.last_action = PlayerAction(action)
            
            if action in ["BET", "RAISE", "CALL"]:
                player.chips -= amount
        
        # Create event
        event = GameEvent(
            event_type="PLAYER_ACTION",
            table_id=table_id,
            player_id=player_id,
            data={"action": action, "amount": amount}
        )
        
        await self.add_game_event(event)
        await self.broadcast_to_table(table_id, {
            "type": "player_action",
            "data": {
                "player_id": player_id,
                "action": action,
                "amount": amount
            }
        })

    async def add_game_event(self, event: GameEvent):
        """Add a game event"""
        self.game_events.append(event)
        
        # Keep only last 1000 events
        if len(self.game_events) > 1000:
            self.game_events = self.game_events[-1000:]
        
        # Store in Redis for persistence
        if self.redis_client:
            try:
                await self.redis_client.lpush(
                    f"events:{event.table_id}",
                    json.dumps(asdict(event), default=str)
                )
                await self.redis_client.ltrim(f"events:{event.table_id}", 0, 999)
            except Exception as e:
                logger.error(f"Error storing event in Redis: {e}")

    async def handle_websocket_connection(self, websocket: WebSocket, table_id: str):
        """Handle WebSocket connection for real-time updates"""
        await websocket.accept()
        connection_id = f"{table_id}_{id(websocket)}"
        self.websocket_connections[connection_id] = websocket
        
        try:
            # Send initial table state
            if table_id in self.active_tables:
                table = self.active_tables[table_id]
                players = [
                    asdict(player) for player in self.active_players.values()
                    if player.table_id == table_id
                ]
                
                await websocket.send_json({
                    "type": "initial_state",
                    "data": {
                        "table": asdict(table),
                        "players": players
                    }
                })
            
            # Keep connection alive
            while True:
                try:
                    # Wait for messages from client
                    message = await websocket.receive_json()
                    
                    # Handle client messages (ping, etc.)
                    if message.get("type") == "ping":
                        await websocket.send_json({"type": "pong"})
                        
                except WebSocketDisconnect:
                    break
                    
        except Exception as e:
            logger.error(f"WebSocket error: {e}")
        finally:
            # Clean up connection
            if connection_id in self.websocket_connections:
                del self.websocket_connections[connection_id]

    async def broadcast_to_table(self, table_id: str, message: dict):
        """Broadcast message to all clients connected to a table"""
        disconnected = []
        
        for connection_id, websocket in self.websocket_connections.items():
            if connection_id.startswith(f"{table_id}_"):
                try:
                    await websocket.send_json(message)
                except Exception as e:
                    logger.error(f"Error sending to WebSocket {connection_id}: {e}")
                    disconnected.append(connection_id)
        
        # Clean up disconnected clients
        for connection_id in disconnected:
            del self.websocket_connections[connection_id]

# Create backend instance
backend = SolCraftBackend()
app = backend.app

# Export for use in main API
__all__ = ["app", "backend", "SolCraftBackend"]

