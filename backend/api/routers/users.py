from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, EmailStr
import hashlib
import logging
from datetime import datetime, timedelta
import os
import jwt
from ..config.database import get_supabase_client

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/users", tags=["users"])

class RegisterRequest(BaseModel):
    username: str
    email: EmailStr
    password: str
    wallet_address: str | None = None

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def generate_token(user_id: str) -> str:
    secret = os.getenv("JWT_SECRET", "change-me")
    payload = {"user_id": user_id, "exp": datetime.utcnow() + timedelta(days=7)}
    return jwt.encode(payload, secret, algorithm="HS256")

@router.post("/register")
def register_user(data: RegisterRequest):
    supabase = get_supabase_client()
    try:
        existing = supabase.table("users").select("id").or_(f"email.eq.{data.email},username.eq.{data.username}").maybe_single().execute()
        if existing.data:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="User with this email or username already exists")
        password_hash = hash_password(data.password)
        now = datetime.utcnow().isoformat()
        response = supabase.table("users").insert({
            "username": data.username,
            "email": data.email,
            "password_hash": password_hash,
            "wallet_address": data.wallet_address,
            "created_at": now,
            "is_active": True,
            "is_verified": False,
        }).execute()
        if response.error:
            raise Exception(response.error)
        user = response.data[0]
        token = generate_token(user["id"])
        return {"status": "success", "message": "User registered successfully", "data": {"user": user, "token": token}}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error registering user: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/login")
def login_user(data: LoginRequest):
    supabase = get_supabase_client()
    try:
        password_hash = hash_password(data.password)
        response = supabase.table("users").select("*").eq("email", data.email).eq("password_hash", password_hash).maybe_single().execute()
        user = response.data
        if not user:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")
        supabase.table("users").update({"last_login": datetime.utcnow().isoformat()}).eq("id", user["id"]).execute()
        token = generate_token(user["id"])
        return {"status": "success", "message": "Login successful", "data": {"user": user, "token": token}}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error logging in user: {e}")
        raise HTTPException(status_code=500, detail=str(e))
