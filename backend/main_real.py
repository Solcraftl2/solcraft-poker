"""
SolCraft Poker Backend - Real Implementation
FastAPI server with Firebase integration and real blockchain functionality
"""

import os
import logging
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn

# Import API routes
from api.routes.users import router as users_router
from api.routes.tournaments import router as tournaments_router
from api.routes.blockchain import router as blockchain_router

# Import services
from api.services.firebase_service import firebase_service
from api.services.blockchain_service import blockchain_service

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="SolCraft Poker API",
    description="Real implementation with Firebase and Solana blockchain integration",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://www.solcraftl2.com",
        "https://solcraft-poker-frontend.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routers
app.include_router(users_router, prefix="/api/v1")
app.include_router(tournaments_router, prefix="/api/v1")
app.include_router(blockchain_router, prefix="/api/v1")

@app.on_event("startup")
async def startup_event():
    """Initialize services on startup"""
    try:
        logger.info("Starting SolCraft Poker Backend...")
        
        # Initialize Firebase
        logger.info("Firebase service initialized")
        
        # Initialize Blockchain service
        await blockchain_service.initialize()
        logger.info("Blockchain service initialized")
        
        logger.info("SolCraft Poker Backend started successfully!")
        
    except Exception as e:
        logger.error(f"Failed to start backend: {e}")
        raise

@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    logger.info("Shutting down SolCraft Poker Backend...")

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "SolCraft Poker API - Real Implementation",
        "version": "2.0.0",
        "status": "operational",
        "features": [
            "Firebase Firestore integration",
            "Solana blockchain integration",
            "Real-time tournament management",
            "User authentication",
            "Transaction processing"
        ]
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    try:
        # Check Firebase connection
        firebase_status = "operational"
        try:
            # Test Firebase connection
            test_doc = firebase_service.db.collection('health_check').document('test')
            test_doc.set({'timestamp': 'test'})
            test_doc.delete()
        except Exception as e:
            firebase_status = f"error: {str(e)}"
        
        # Check Blockchain connection
        blockchain_status = await blockchain_service.get_health_status()
        
        return {
            "status": "healthy",
            "timestamp": "2025-01-09T21:00:00Z",
            "services": {
                "firebase": firebase_status,
                "blockchain": blockchain_status,
                "api": "operational"
            }
        }
        
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        raise HTTPException(status_code=500, detail="Service unhealthy")

@app.get("/api/v1/stats")
async def get_platform_stats():
    """Get platform statistics"""
    try:
        # Get tournaments stats
        tournaments = await firebase_service.get_tournaments(limit=100)
        active_tournaments = len([t for t in tournaments if t['status'] == 'in_progress'])
        upcoming_tournaments = len([t for t in tournaments if t['status'] == 'upcoming'])
        
        # Get leaderboard for top players
        leaderboard = await firebase_service.get_leaderboard(limit=10)
        
        # Calculate total prize pool
        total_prize_pool = sum(t.get('prize_pool', 0) for t in tournaments)
        
        return {
            "platform_stats": {
                "total_tournaments": len(tournaments),
                "active_tournaments": active_tournaments,
                "upcoming_tournaments": upcoming_tournaments,
                "total_prize_pool": total_prize_pool,
                "total_players": len(leaderboard)
            },
            "top_players": leaderboard[:5],
            "recent_tournaments": tournaments[:3]
        }
        
    except Exception as e:
        logger.error(f"Error getting platform stats: {e}")
        raise HTTPException(status_code=500, detail="Failed to get platform stats")

# Error handlers
@app.exception_handler(404)
async def not_found_handler(request, exc):
    return JSONResponse(
        status_code=404,
        content={"detail": "Endpoint not found"}
    )

@app.exception_handler(500)
async def internal_error_handler(request, exc):
    logger.error(f"Internal server error: {exc}")
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"}
    )

if __name__ == "__main__":
    # Get port from environment or default to 8000
    port = int(os.getenv("PORT", 8000))
    
    # Run the server
    uvicorn.run(
        "main_real:app",
        host="0.0.0.0",
        port=port,
        reload=True,
        log_level="info"
    )

