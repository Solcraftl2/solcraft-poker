"""
Simplified FastAPI backend for SolCraft Poker - Test Integration
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import logging
import os
import time
from datetime import datetime
from typing import Dict, Any, List, Optional
from pydantic import BaseModel

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="SolCraft Poker API - Test",
    description="Simplified Backend API for SolCraft Poker Testing",
    version="1.0.0-test",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class WalletBalanceResponse(BaseModel):
    wallet: str
    solp_balance: float
    sol_balance: float
    staked_amount: float
    pending_rewards: float
    last_updated: int

class TournamentResponse(BaseModel):
    tournament_id: int
    organizer: str
    name: str
    buy_in: int
    max_players: int
    current_players: int
    start_time: int
    status: str
    prize_pool: int
    created_at: int

# Mock data storage
mock_tournaments = []
mock_staking_pools = []
mock_proposals = []

# Initialize mock data
def init_mock_data():
    global mock_tournaments, mock_staking_pools, mock_proposals
    
    # Mock tournaments
    for i in range(5):
        tournament = {
            "tournament_id": i + 1,
            "organizer": f"mock_organizer_{i}",
            "name": f"Tournament {i + 1}",
            "buy_in": 100 + (i * 50),
            "max_players": 50 + (i * 10),
            "current_players": 10 + (i * 5),
            "start_time": int(time.time()) + (i * 3600),
            "status": ["registration_open", "in_progress", "completed_won"][i % 3],
            "prize_pool": (100 + (i * 50)) * (50 + (i * 10)),
            "created_at": int(time.time()) - (i * 1800)
        }
        mock_tournaments.append(tournament)
    
    # Mock staking pools
    for i in range(3):
        pool = {
            "pool_id": i + 1,
            "creator": f"mock_creator_{i}",
            "apy": 8.5 + (i * 2.5),
            "lock_period": 30 + (i * 30),
            "max_stake_amount": 10000 + (i * 5000),
            "total_staked": 5000 + (i * 2000),
            "active_stakers": 50 + (i * 25),
            "pool_status": "active",
            "rewards_distributed": 500 + (i * 200),
            "created_at": int(time.time()) - (i * 86400)
        }
        mock_staking_pools.append(pool)
    
    # Mock governance proposals
    for i in range(4):
        proposal = {
            "proposal_id": i + 1,
            "proposer": f"mock_proposer_{i}",
            "title": f"Proposal {i + 1}: Platform Improvement",
            "description": f"Description for proposal {i + 1}",
            "votes_for": 100 + (i * 50),
            "votes_against": 20 + (i * 10),
            "status": ["active", "passed", "rejected"][i % 3],
            "created_at": int(time.time()) - (i * 86400),
            "voting_ends_at": int(time.time()) + ((7 - i) * 86400)
        }
        mock_proposals.append(proposal)

# Initialize mock data on startup
init_mock_data()

# Root endpoint
@app.get("/")
async def root():
    return {
        "message": "SolCraft Poker API - Test Mode",
        "version": "1.0.0-test",
        "status": "running",
        "timestamp": datetime.now().isoformat(),
        "endpoints": {
            "docs": "/docs",
            "health": "/health",
            "blockchain": "/api/blockchain"
        }
    }

# Health check
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "mode": "test",
        "services": {
            "database": "mock",
            "blockchain": "simulated"
        }
    }

# ==================== BLOCKCHAIN API ENDPOINTS ====================

@app.get("/api/blockchain/health")
async def blockchain_health():
    return {
        "status": "healthy",
        "rpc_url": "mock://devnet.solana.com",
        "contracts": {
            "tournaments": "mock_contract_1",
            "staking": "mock_contract_2",
            "governance": "mock_contract_3"
        },
        "timestamp": int(time.time())
    }

@app.get("/api/blockchain/network-stats")
async def network_stats():
    return {
        "success": True,
        "data": {
            "current_slot": 123456789,
            "epoch_info": {"epoch": 400, "slot_index": 12345},
            "network": "devnet",
            "timestamp": int(time.time())
        }
    }

@app.get("/api/blockchain/wallet/{wallet_address}")
async def get_wallet_info(wallet_address: str):
    return {
        "success": True,
        "wallet_info": {
            "wallet": wallet_address,
            "solp_balance": 1000.0 + (hash(wallet_address) % 5000),
            "sol_balance": 2.5 + (hash(wallet_address) % 10),
            "staked_amount": 500.0 + (hash(wallet_address) % 2000),
            "pending_rewards": 12.34 + (hash(wallet_address) % 50),
            "last_updated": int(time.time())
        }
    }

@app.get("/api/blockchain/tournaments")
async def get_all_tournaments():
    return {
        "success": True,
        "tournaments": mock_tournaments,
        "count": len(mock_tournaments)
    }

@app.get("/api/blockchain/tournaments/{tournament_id}")
async def get_tournament_by_id(tournament_id: int):
    tournament = next((t for t in mock_tournaments if t["tournament_id"] == tournament_id), None)
    
    if not tournament:
        raise HTTPException(status_code=404, detail="Tournament not found")
    
    return {
        "success": True,
        "tournament": tournament
    }

@app.post("/api/blockchain/tournaments/create")
async def create_tournament(request: dict):
    tournament_id = len(mock_tournaments) + 1
    
    tournament = {
        "tournament_id": tournament_id,
        "organizer": request.get("organizer_wallet", "unknown"),
        "name": request.get("tournament_name", f"Tournament {tournament_id}"),
        "buy_in": request.get("buy_in", 100),
        "max_players": request.get("max_players", 50),
        "current_players": 0,
        "start_time": request.get("start_time", int(time.time()) + 3600),
        "status": "registration_open",
        "prize_pool": request.get("buy_in", 100) * request.get("max_players", 50),
        "created_at": int(time.time())
    }
    
    mock_tournaments.append(tournament)
    
    return {
        "success": True,
        "tournament_id": tournament_id,
        "transaction_signature": f"mock_tx_{tournament_id}_{int(time.time())}",
        "data": tournament
    }

@app.get("/api/blockchain/staking/pools")
async def get_all_staking_pools():
    return {
        "success": True,
        "pools": mock_staking_pools,
        "count": len(mock_staking_pools)
    }

@app.get("/api/blockchain/governance/proposals")
async def get_all_proposals():
    return {
        "success": True,
        "proposals": mock_proposals,
        "count": len(mock_proposals)
    }

@app.get("/api/blockchain/analytics/summary")
async def get_platform_analytics():
    total_staked = sum(p["total_staked"] for p in mock_staking_pools)
    active_stakers = sum(p["active_stakers"] for p in mock_staking_pools)
    total_prize_pool = sum(t["prize_pool"] for t in mock_tournaments)
    
    return {
        "success": True,
        "analytics": {
            "tournaments": {
                "total": len(mock_tournaments),
                "active": len([t for t in mock_tournaments if t["status"] in ["registration_open", "in_progress"]]),
                "total_prize_pool": total_prize_pool
            },
            "staking": {
                "total_pools": len(mock_staking_pools),
                "total_staked": total_staked,
                "active_stakers": active_stakers
            },
            "governance": {
                "total_proposals": len(mock_proposals),
                "active_proposals": len([p for p in mock_proposals if p["status"] == "active"])
            },
            "last_updated": int(time.time())
        }
    }

# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    logger.error(f"Global exception: {str(exc)}")
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "message": str(exc),
            "timestamp": datetime.now().isoformat()
        }
    )

if __name__ == "__main__":
    import uvicorn
    
    port = int(os.getenv("PORT", 8000))
    
    logger.info("🚀 Starting SolCraft Test API...")
    uvicorn.run(
        "main_simple:app",
        host="0.0.0.0",
        port=port,
        reload=True,
        log_level="info"
    )

