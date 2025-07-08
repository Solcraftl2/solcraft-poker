"""
SolCraft Poker - FastAPI Backend (Simplified for testing)
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from typing import Dict, Any

# Initialize FastAPI app
app = FastAPI(
    title="SolCraft Poker API",
    description="Backend API for SolCraft Poker platform",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://solcraft-poker-frontend.vercel.app",
        "https://solcraftl2.com",
        "https://www.solcraftl2.com"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root() -> Dict[str, Any]:
    """Root endpoint - API health check"""
    return {
        "message": "SolCraft Poker API",
        "status": "active",
        "version": "1.0.0",
        "endpoints": {
            "health": "/api/health",
            "docs": "/api/docs"
        }
    }

@app.get("/api")
async def api_info() -> Dict[str, Any]:
    """API information endpoint"""
    return {
        "name": "SolCraft Poker API",
        "version": "1.0.0",
        "description": "Backend API for SolCraft Poker platform",
        "framework": "FastAPI",
        "database": "Firebase Firestore",
        "authentication": "Firebase Auth"
    }

@app.get("/api/health")
async def health_check() -> Dict[str, str]:
    """Health check endpoint"""
    return {"status": "healthy", "service": "solcraft-poker-api"}

@app.get("/api/players")
async def get_players():
    """Mock players endpoint"""
    return {
        "players": [
            {"id": "1", "username": "player1", "tier": "bronze"},
            {"id": "2", "username": "player2", "tier": "silver"}
        ],
        "total": 2
    }

@app.get("/api/tournaments")
async def get_tournaments():
    """Mock tournaments endpoint"""
    return {
        "tournaments": [
            {"id": "1", "name": "Daily Tournament", "buy_in": 10},
            {"id": "2", "name": "Weekly Championship", "buy_in": 50}
        ],
        "total": 2
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

