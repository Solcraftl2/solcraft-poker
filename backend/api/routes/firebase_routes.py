"""
Firebase API Routes for SolCraft Poker
Handles all database operations through Firebase Firestore
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime
import logging

# Import Firebase service
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from firebase_admin import (
    firebase_service,
    get_user,
    create_user,
    get_tournaments,
    create_tournament,
    join_tournament,
    get_platform_analytics,
    update_analytics,
    User,
    Tournament
)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create router
router = APIRouter(prefix="/api/firebase", tags=["firebase"])

# Pydantic models for request/response
class UserCreate(BaseModel):
    wallet_address: str
    username: str
    email: Optional[str] = None

class UserResponse(BaseModel):
    user_id: str
    wallet_address: str
    username: str
    email: Optional[str]
    created_at: Optional[datetime]
    profile: Optional[Dict]
    stats: Optional[Dict]

class TournamentCreate(BaseModel):
    organizer: str
    name: str
    description: str
    buy_in: float
    max_players: int
    start_time: datetime
    prize_pool: float
    metadata: Optional[Dict] = None

class TournamentResponse(BaseModel):
    tournament_id: str
    organizer: str
    name: str
    description: str
    buy_in: float
    max_players: int
    current_players: int
    start_time: datetime
    status: str
    prize_pool: float
    metadata: Optional[Dict]

class JoinTournamentRequest(BaseModel):
    user_id: str
    wallet_address: str
    investment_amount: float

# Health check
@router.get("/health")
async def firebase_health():
    """Check Firebase connection status"""
    try:
        is_connected = firebase_service.is_connected()
        return {
            "status": "healthy" if is_connected else "degraded",
            "firebase_connected": is_connected,
            "timestamp": datetime.now().isoformat(),
            "message": "Firebase service operational" if is_connected else "Firebase service using mock data"
        }
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        raise HTTPException(status_code=500, detail=f"Health check failed: {str(e)}")

# User endpoints
@router.post("/users", response_model=Dict[str, Any])
async def create_user_endpoint(user_data: UserCreate):
    """Create a new user"""
    try:
        # Generate user ID (in production, this would be from authentication)
        user_id = f"user_{int(datetime.now().timestamp())}"
        
        user = User(
            user_id=user_id,
            wallet_address=user_data.wallet_address,
            username=user_data.username,
            email=user_data.email,
            created_at=datetime.now()
        )
        
        success = await create_user(user)
        
        if success:
            return {
                "success": True,
                "user_id": user_id,
                "message": "User created successfully"
            }
        else:
            raise HTTPException(status_code=500, detail="Failed to create user")
            
    except Exception as e:
        logger.error(f"Error creating user: {e}")
        raise HTTPException(status_code=500, detail=f"Error creating user: {str(e)}")

@router.get("/users/{user_id}", response_model=Dict[str, Any])
async def get_user_endpoint(user_id: str):
    """Get user by ID"""
    try:
        user_data = await get_user(user_id)
        
        if user_data:
            return {
                "success": True,
                "user": user_data
            }
        else:
            raise HTTPException(status_code=404, detail="User not found")
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting user: {e}")
        raise HTTPException(status_code=500, detail=f"Error getting user: {str(e)}")

# Tournament endpoints
@router.get("/tournaments", response_model=Dict[str, Any])
async def get_tournaments_endpoint(
    status: Optional[str] = None,
    limit: int = 50
):
    """Get tournaments with optional filters"""
    try:
        tournaments = await get_tournaments(status=status, limit=limit)
        
        return {
            "success": True,
            "tournaments": tournaments,
            "count": len(tournaments),
            "filters": {
                "status": status,
                "limit": limit
            }
        }
        
    except Exception as e:
        logger.error(f"Error getting tournaments: {e}")
        raise HTTPException(status_code=500, detail=f"Error getting tournaments: {str(e)}")

@router.post("/tournaments", response_model=Dict[str, Any])
async def create_tournament_endpoint(tournament_data: TournamentCreate):
    """Create a new tournament"""
    try:
        # Generate tournament ID
        tournament_id = f"tournament_{int(datetime.now().timestamp())}"
        
        tournament = Tournament(
            tournament_id=tournament_id,
            organizer=tournament_data.organizer,
            name=tournament_data.name,
            description=tournament_data.description,
            buy_in=tournament_data.buy_in,
            max_players=tournament_data.max_players,
            current_players=0,
            start_time=tournament_data.start_time,
            status="registration_open",
            prize_pool=tournament_data.prize_pool,
            created_at=datetime.now(),
            metadata=tournament_data.metadata
        )
        
        success = await create_tournament(tournament)
        
        if success:
            return {
                "success": True,
                "tournament_id": tournament_id,
                "message": "Tournament created successfully"
            }
        else:
            raise HTTPException(status_code=500, detail="Failed to create tournament")
            
    except Exception as e:
        logger.error(f"Error creating tournament: {e}")
        raise HTTPException(status_code=500, detail=f"Error creating tournament: {str(e)}")

@router.post("/tournaments/{tournament_id}/join", response_model=Dict[str, Any])
async def join_tournament_endpoint(tournament_id: str, join_data: JoinTournamentRequest):
    """Join a tournament"""
    try:
        success = await join_tournament(
            tournament_id=tournament_id,
            user_id=join_data.user_id,
            wallet_address=join_data.wallet_address,
            investment_amount=join_data.investment_amount
        )
        
        if success:
            return {
                "success": True,
                "message": "Successfully joined tournament",
                "tournament_id": tournament_id,
                "user_id": join_data.user_id
            }
        else:
            raise HTTPException(status_code=500, detail="Failed to join tournament")
            
    except Exception as e:
        logger.error(f"Error joining tournament: {e}")
        raise HTTPException(status_code=500, detail=f"Error joining tournament: {str(e)}")

# Analytics endpoints
@router.get("/analytics", response_model=Dict[str, Any])
async def get_analytics_endpoint():
    """Get platform analytics"""
    try:
        analytics = await get_platform_analytics()
        
        return {
            "success": True,
            "analytics": analytics
        }
        
    except Exception as e:
        logger.error(f"Error getting analytics: {e}")
        raise HTTPException(status_code=500, detail=f"Error getting analytics: {str(e)}")

@router.post("/analytics", response_model=Dict[str, Any])
async def update_analytics_endpoint(analytics_data: Dict[str, Any]):
    """Update platform analytics"""
    try:
        success = await update_analytics(analytics_data)
        
        if success:
            return {
                "success": True,
                "message": "Analytics updated successfully"
            }
        else:
            raise HTTPException(status_code=500, detail="Failed to update analytics")
            
    except Exception as e:
        logger.error(f"Error updating analytics: {e}")
        raise HTTPException(status_code=500, detail=f"Error updating analytics: {str(e)}")

# Database status endpoint
@router.get("/status", response_model=Dict[str, Any])
async def database_status():
    """Get database connection and status information"""
    try:
        is_connected = firebase_service.is_connected()
        
        # Get some basic stats
        tournaments = await get_tournaments(limit=10)
        analytics = await get_platform_analytics()
        
        return {
            "success": True,
            "database": {
                "type": "Firebase Firestore",
                "connected": is_connected,
                "mode": "production" if is_connected else "mock"
            },
            "stats": {
                "tournaments_count": len(tournaments),
                "last_analytics_update": analytics.get('last_updated'),
                "collections": [
                    "users",
                    "tournaments", 
                    "tournament_participants",
                    "investments",
                    "staking_pools",
                    "user_stakes",
                    "governance_proposals",
                    "user_votes",
                    "transactions",
                    "platform_analytics"
                ]
            },
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error getting database status: {e}")
        raise HTTPException(status_code=500, detail=f"Error getting database status: {str(e)}")

# Initialize collections endpoint (for setup)
@router.post("/initialize", response_model=Dict[str, Any])
async def initialize_database():
    """Initialize database with sample data"""
    try:
        if not firebase_service.is_connected():
            return {
                "success": True,
                "message": "Database initialization skipped - using mock mode",
                "mode": "mock"
            }
        
        # Create sample tournaments
        sample_tournaments = [
            Tournament(
                tournament_id="sample_1",
                organizer="Solana Poker Club",
                name="Solana Summer Showdown",
                description="Join the biggest Texas Hold'em tournament on Solana this summer!",
                buy_in=100,
                max_players=200,
                current_players=50,
                start_time=datetime.now(),
                status="registration_open",
                prize_pool=10000,
                metadata={"ai_risk_level": "Medium", "game_type": "Texas Hold'em"}
            ),
            Tournament(
                tournament_id="sample_2",
                organizer="Decentralized Poker Arena",
                name="Crypto Poker Masters",
                description="High stakes, high rewards. Only for serious poker players.",
                buy_in=500,
                max_players=100,
                current_players=20,
                start_time=datetime.now(),
                status="registration_open",
                prize_pool=50000,
                metadata={"ai_risk_level": "High", "game_type": "Texas Hold'em"}
            )
        ]
        
        # Create tournaments
        created_count = 0
        for tournament in sample_tournaments:
            success = await create_tournament(tournament)
            if success:
                created_count += 1
        
        # Update analytics
        analytics_data = {
            "tournaments": {
                "total": created_count,
                "active": created_count,
                "total_prize_pool": sum(t.prize_pool for t in sample_tournaments)
            },
            "staking": {
                "total_pools": 3,
                "total_staked": 21000,
                "active_stakers": 225
            },
            "governance": {
                "total_proposals": 4,
                "active_proposals": 2
            }
        }
        
        await update_analytics(analytics_data)
        
        return {
            "success": True,
            "message": "Database initialized successfully",
            "created": {
                "tournaments": created_count,
                "analytics": True
            }
        }
        
    except Exception as e:
        logger.error(f"Error initializing database: {e}")
        raise HTTPException(status_code=500, detail=f"Error initializing database: {str(e)}")

