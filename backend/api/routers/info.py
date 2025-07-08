from fastapi import APIRouter

router = APIRouter()

@router.get("/api")
def api_info():
    return {
        "status": "success",
        "message": "SolCraft API is running",
        "version": "1.0.0",
        "endpoints": [
            {"path": "/api/tournaments", "methods": ["GET", "POST"]},
            {"path": "/api/tournaments/{id}", "methods": ["GET"]},
            {"path": "/api/users/register", "methods": ["POST"]},
            {"path": "/api/users/login", "methods": ["POST"]},
            {"path": "/api/debug/env", "methods": ["GET"]},
            {"path": "/api/debug/connection", "methods": ["GET"]},
        ],
    }
