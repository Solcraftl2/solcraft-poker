"""
Enhanced FastAPI backend for SolCraft Poker
Includes blockchain API and Firebase integration
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import logging
from datetime import datetime

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="SolCraft Poker API v2.0",
    description="Backend API for SolCraft Poker platform with blockchain and Firebase integration",
    version="2.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Import and include Firebase routes
try:
    from api.routes.firebase_routes import router as firebase_router
    app.include_router(firebase_router)
    logger.info("Firebase routes loaded successfully")
except ImportError as e:
    logger.warning(f"Firebase routes not available: {e}")

# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "service": "SolCraft Poker API",
        "version": "2.0.0",
        "features": ["blockchain", "firebase", "tournaments", "staking", "governance"]
    }

# Existing blockchain endpoints
@app.get("/api/blockchain/tournaments")
async def get_blockchain_tournaments():
    """Get tournaments from blockchain"""
    tournaments = [
        {
            "tournament_id": 1,
            "organizer": "Solana Poker Club",
            "name": "Solana Summer Showdown",
            "description": "Join the biggest Texas Hold'em tournament on Solana this summer!",
            "buy_in": 100,
            "max_players": 200,
            "current_players": 50,
            "start_time": int(datetime.now().timestamp()) + 3600,
            "status": "registration_open",
            "prize_pool": 10000,
            "created_at": int(datetime.now().timestamp()),
            "metadata": {"ai_risk_level": "Medium", "game_type": "Texas Hold'em"}
        },
        {
            "tournament_id": 2,
            "organizer": "Decentralized Poker Arena",
            "name": "Crypto Poker Masters",
            "description": "High stakes, high rewards. Only for serious poker players.",
            "buy_in": 500,
            "max_players": 100,
            "current_players": 20,
            "start_time": int(datetime.now().timestamp()) + 7200,
            "status": "registration_open",
            "prize_pool": 50000,
            "created_at": int(datetime.now().timestamp()) - 1800,
            "metadata": {"ai_risk_level": "High", "game_type": "Texas Hold'em"}
        },
        {
            "tournament_id": 3,
            "organizer": "Community Poker Platform",
            "name": "Weekly Wednesday Freeroll",
            "description": "Our popular weekly freeroll. Great for practice and winning some starting capital.",
            "buy_in": 0,
            "max_players": 300,
            "current_players": 300,
            "start_time": int(datetime.now().timestamp()) - 3600,
            "status": "completed_won",
            "prize_pool": 1000,
            "created_at": int(datetime.now().timestamp()) - 7200,
            "metadata": {"ai_risk_level": "Low", "game_type": "Texas Hold'em"}
        },
        {
            "tournament_id": 4,
            "organizer": "Speed Poker Online",
            "name": "Nightly Turbo Challenge",
            "description": "Fast-paced turbo tournament. Quick games, quick wins!",
            "buy_in": 50,
            "max_players": 150,
            "current_players": 80,
            "start_time": int(datetime.now().timestamp()),
            "status": "in_progress",
            "prize_pool": 2000,
            "created_at": int(datetime.now().timestamp()) - 1800,
            "metadata": {"ai_risk_level": "Medium", "game_type": "Texas Hold'em"}
        },
        {
            "tournament_id": 5,
            "organizer": "Elite Poker Series",
            "name": "Sunday Million",
            "description": "The biggest tournament of the week with guaranteed million-dollar prize pool.",
            "buy_in": 1000,
            "max_players": 1000,
            "current_players": 150,
            "start_time": int(datetime.now().timestamp()) + 86400,
            "status": "registration_open",
            "prize_pool": 1000000,
            "created_at": int(datetime.now().timestamp()),
            "metadata": {"ai_risk_level": "High", "game_type": "Texas Hold'em"}
        }
    ]
    
    return {
        "success": True,
        "tournaments": tournaments,
        "count": len(tournaments)
    }

@app.get("/api/blockchain/analytics/summary")
async def get_analytics_summary():
    """Get platform analytics summary"""
    return {
        "success": True,
        "analytics": {
            "tournaments": {
                "total": 5,
                "active": 4,
                "total_prize_pool": 1063000
            },
            "staking": {
                "total_pools": 3,
                "total_staked": 21000,
                "active_stakers": 225
            },
            "governance": {
                "total_proposals": 4,
                "active_proposals": 2
            },
            "users": {
                "total_registered": 1250,
                "active_24h": 320,
                "active_7d": 890
            },
            "last_updated": int(datetime.now().timestamp())
        }
    }

# Root endpoint
@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "SolCraft Poker API v2.0.0",
        "status": "operational",
        "features": ["blockchain", "firebase", "tournaments", "staking", "governance"],
        "endpoints": {
            "health": "/health",
            "blockchain": "/api/blockchain/*",
            "firebase": "/api/firebase/*",
            "docs": "/docs"
        }
    }

if __name__ == "__main__":
    uvicorn.run(
        "main_firebase:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )

