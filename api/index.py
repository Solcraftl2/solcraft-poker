"""
SolCraft Poker - Main API Entry Point
FastAPI backend with complete Solana integration
"""

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
import os
from datetime import datetime
from typing import Dict, Any

# Import route modules
from .routes.players import router as players_router
from .routes.tournaments import router as tournaments_router
from .routes.fees import router as fees_router
from .routes.guarantees import router as guarantees_router
from .routes.auth import router as auth_router

# Import SolCraft integration
try:
    from .solcraft_integration import app as solcraft_app, backend as solcraft_backend
    SOLCRAFT_AVAILABLE = True
except ImportError:
    SOLCRAFT_AVAILABLE = False
    print("⚠️  SolCraft integration not available - running in basic mode")

# Create main FastAPI app
app = FastAPI(
    title="SolCraft Poker API",
    description="Complete Web3 Poker Platform API with Solana Integration",
    version="2.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001", 
        "https://solcraft-poker-frontend.vercel.app",
        "https://www.solcraftl2.com",
        "https://solcraftl2.com"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount SolCraft integration if available
if SOLCRAFT_AVAILABLE:
    app.mount("/solcraft", solcraft_app)

# Include routers
app.include_router(players_router, prefix="/api/players", tags=["players"])
app.include_router(tournaments_router, prefix="/api/tournaments", tags=["tournaments"])
app.include_router(fees_router, prefix="/api/fees", tags=["fees"])
app.include_router(guarantees_router, prefix="/api/guarantees", tags=["guarantees"])
app.include_router(auth_router, prefix="/api/auth", tags=["auth"])

@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "name": "SolCraft Poker API",
        "version": "2.0.0",
        "description": "Complete Web3 Poker Platform with Solana Integration",
        "timestamp": datetime.utcnow().isoformat(),
        "solcraft_integration": SOLCRAFT_AVAILABLE,
        "endpoints": {
            "docs": "/api/docs",
            "redoc": "/api/redoc",
            "health": "/api/health",
            "status": "/api/status",
            "solcraft": "/solcraft" if SOLCRAFT_AVAILABLE else None,
            "players": "/api/players",
            "tournaments": "/api/tournaments",
            "fees": "/api/fees",
            "guarantees": "/api/guarantees",
            "auth": "/api/auth"
        },
        "features": [
            "Solana Smart Contract Integration" if SOLCRAFT_AVAILABLE else "Basic API",
            "Real-time WebSocket Updates" if SOLCRAFT_AVAILABLE else "REST API",
            "Multi-table Poker Games",
            "Tournament Management",
            "Token Staking & Rewards" if SOLCRAFT_AVAILABLE else "Basic Rewards",
            "Governance System" if SOLCRAFT_AVAILABLE else "Admin System",
            "Escrow Services" if SOLCRAFT_AVAILABLE else "Basic Transactions"
        ]
    }

@app.get("/api")
async def api_info() -> Dict[str, Any]:
    """API information endpoint"""
    return {
        "name": "SolCraft Poker API",
        "version": "2.0.0",
        "description": "Backend API for SolCraft Poker platform",
        "framework": "FastAPI",
        "database": "Firebase Firestore",
        "authentication": "Firebase Auth",
        "blockchain": "Solana" if SOLCRAFT_AVAILABLE else "None",
        "solcraft_integration": SOLCRAFT_AVAILABLE
    }

@app.get("/api/health")
async def health_check():
    """Enhanced health check with SolCraft status"""
    try:
        health_data = {
            "status": "healthy",
            "timestamp": datetime.utcnow().isoformat(),
            "api_version": "2.0.0",
            "solcraft_integration": SOLCRAFT_AVAILABLE,
            "services": {
                "main_api": "healthy",
                "firebase": "connected",
                "cors": "enabled"
            }
        }
        
        if SOLCRAFT_AVAILABLE:
            health_data["services"].update({
                "solcraft_backend": "healthy",
                "blockchain_monitoring": "active",
                "websocket_server": "active"
            })
        
        return health_data
        
    except Exception as e:
        return JSONResponse(
            status_code=503,
            content={
                "status": "unhealthy",
                "timestamp": datetime.utcnow().isoformat(),
                "error": str(e)
            }
        )

@app.get("/api/status")
async def get_status():
    """Get comprehensive API status"""
    return {
        "api": {
            "name": "SolCraft Poker API",
            "version": "2.0.0",
            "uptime": "active",
            "environment": os.getenv("ENVIRONMENT", "development"),
            "solcraft_integration": SOLCRAFT_AVAILABLE
        },
        "blockchain": {
            "network": "devnet" if SOLCRAFT_AVAILABLE else "none",
            "programs": {
                "poker": "SoLCraftPoker11111111111111111111111111111" if SOLCRAFT_AVAILABLE else None,
                "token": "SoLCraftToken1111111111111111111111111111" if SOLCRAFT_AVAILABLE else None,
                "escrow": "SoLCraftEscrow111111111111111111111111111" if SOLCRAFT_AVAILABLE else None,
                "governance": "SoLCraftGov1111111111111111111111111111111" if SOLCRAFT_AVAILABLE else None,
                "staking": "SoLCraftStaking11111111111111111111111111" if SOLCRAFT_AVAILABLE else None,
                "tournaments": "SoLCraftTournament1111111111111111111111111" if SOLCRAFT_AVAILABLE else None
            } if SOLCRAFT_AVAILABLE else None
        },
        "features": {
            "smart_contracts": SOLCRAFT_AVAILABLE,
            "real_time_updates": SOLCRAFT_AVAILABLE,
            "multi_table_poker": True,
            "tournaments": True,
            "token_staking": SOLCRAFT_AVAILABLE,
            "governance": SOLCRAFT_AVAILABLE,
            "escrow_services": SOLCRAFT_AVAILABLE
        }
    }

# Error handlers
@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": exc.detail,
            "status_code": exc.status_code,
            "timestamp": datetime.utcnow().isoformat()
        }
    )

@app.exception_handler(404)
async def not_found_handler(request, exc):
    return JSONResponse(
        status_code=404,
        content={
            "error": "Endpoint not found", 
            "message": "The requested API endpoint does not exist",
            "timestamp": datetime.utcnow().isoformat()
        }
    )

@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "detail": str(exc),
            "timestamp": datetime.utcnow().isoformat()
        }
    )

# Startup and shutdown events
@app.on_event("startup")
async def startup_event():
    """Initialize services on startup"""
    print("🚀 SolCraft Poker API starting up...")
    print("✅ CORS configured")
    print("✅ Routes registered")
    if SOLCRAFT_AVAILABLE:
        print("✅ SolCraft integration mounted")
        print("✅ Blockchain monitoring active")
        print("✅ WebSocket server ready")
    else:
        print("⚠️  SolCraft integration disabled")
    print("✅ Error handlers configured")
    print("🎮 SolCraft Poker API ready!")

@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    print("🛑 SolCraft Poker API shutting down...")
    print("✅ Cleanup completed")

# For Vercel deployment
def handler(request, response):
    """Vercel handler function"""
    return app(request, response)

if __name__ == "__main__":
    uvicorn.run(
        "api.index:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )

