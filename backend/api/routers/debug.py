from fastapi import APIRouter
import os
import logging
from datetime import datetime
from ..config.database import db_config

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/debug", tags=["debug"])

@router.get("/env")
def debug_env():
    env_vars = {
        "SUPABASE_URL": os.getenv("SUPABASE_URL"),
        "SUPABASE_SERVICE_ROLE_KEY": os.getenv("SUPABASE_SERVICE_ROLE_KEY"),
        "JWT_SECRET": os.getenv("JWT_SECRET"),
    }
    db_connected = db_config.test_connection()
    return {
        "status": "success",
        "environment_variables": env_vars,
        "database_connection": db_connected,
        "server_time": datetime.utcnow().isoformat(),
    }

@router.get("/connection")
def debug_connection():
    success = db_config.test_connection()
    return {"status": "success", "database_connection": success}
