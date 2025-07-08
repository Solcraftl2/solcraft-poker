"""
SolCraft Poker - FastAPI Backend
Main application entry point for Vercel deployment
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import os
from typing import Dict, Any

# Import route modules
from .routes.tournaments import router as tournaments_router
from .routes.players import router as players_router
from .routes.fees import router as fees_router
from .routes.guarantees import router as guarantees_router
from .routes.auth import router as auth_router

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

# Include routers
app.include_router(tournaments_router, prefix="/api/tournaments", tags=["tournaments"])
app.include_router(players_router, prefix="/api/players", tags=["players"])
app.include_router(fees_router, prefix="/api/fees", tags=["fees"])
app.include_router(guarantees_router, prefix="/api/guarantees", tags=["guarantees"])
app.include_router(auth_router, prefix="/api/auth", tags=["authentication"])

@app.get("/")
async def root() -> Dict[str, Any]:
    """Root endpoint - API health check"""
    return {
        "message": "SolCraft Poker API",
        "status": "active",
        "version": "1.0.0",
        "endpoints": {
            "tournaments": "/api/tournaments",
            "players": "/api/players", 
            "fees": "/api/fees",
            "guarantees": "/api/guarantees",
            "auth": "/api/auth",
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

# Error handlers
@app.exception_handler(404)
async def not_found_handler(request, exc):
    return JSONResponse(
        status_code=404,
        content={"error": "Endpoint not found", "message": "The requested API endpoint does not exist"}
    )

@app.exception_handler(500)
async def internal_error_handler(request, exc):
    return JSONResponse(
        status_code=500,
        content={"error": "Internal server error", "message": "An unexpected error occurred"}
    )

# For Vercel deployment
def handler(request, response):
    """Vercel handler function"""
    return app(request, response)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

