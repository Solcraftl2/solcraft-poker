"""
Corrected authentication utilities for SolCraft L2 backend.
"""
from fastapi import HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional, Dict, Any
import jwt
import logging
import os
from ..config.database import db_config

logger = logging.getLogger(__name__)
security = HTTPBearer()

class AuthService:
    def __init__(self):
        # Initialize Supabase client using the shared database configuration
        self.supabase = db_config.client
        # JWT secret used for token verification
        self.jwt_secret = os.getenv("JWT_SECRET", "your-secret-key")
    
    def verify_token(self, token: str) -> Optional[Dict[str, Any]]:
        """Verify a JWT locally and return its payload."""
        try:
            payload = jwt.decode(token, self.jwt_secret, algorithms=["HS256"])
            return payload
        except jwt.ExpiredSignatureError:
            logger.error("Token has expired")
            return None
        except jwt.InvalidTokenError as e:
            logger.error(f"Invalid token: {str(e)}")
            return None
    
    def get_user_from_token(self, token: str) -> Optional[Dict[str, Any]]:
        """Decode the JWT and fetch the associated user profile."""
        try:
            payload = self.verify_token(token)
            if not payload:
                return None

            user_id = payload.get("sub") or payload.get("user_id") or payload.get("id")
            if not user_id:
                logger.error("User ID not found in token payload")
                return None

            # Fetch additional profile information from the database
            response = self.supabase.table("user_profiles").select("*").eq("user_id", user_id).single().execute()
            user_data = {"id": user_id, "email": payload.get("email")}

            if response.data:
                user_data.update(response.data)

            return user_data
        except Exception as e:
            logger.error(f"Error getting user from token: {str(e)}")
            return None

# Global auth service instance
auth_service = AuthService()

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> Dict[str, Any]:
    """Dependency to get current authenticated user."""
    try:
        token = credentials.credentials
        user = auth_service.get_user_from_token(token)
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        return user
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Authentication error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication failed",
            headers={"WWW-Authenticate": "Bearer"},
        )

async def get_current_user_optional(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)) -> Optional[Dict[str, Any]]:
    """Dependency to get current user if authenticated, None otherwise."""
    try:
        if not credentials:
            return None
        
        token = credentials.credentials
        user = auth_service.get_user_from_token(token)
        return user
    except Exception as e:
        logger.error(f"Optional authentication error: {str(e)}")
        return None

def require_admin(current_user: Dict[str, Any] = Depends(get_current_user)) -> Dict[str, Any]:
    """Dependency to require admin privileges."""
    if not current_user.get("is_admin", False):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required"
        )
    return current_user

def require_verified_email(current_user: Dict[str, Any] = Depends(get_current_user)) -> Dict[str, Any]:
    """Dependency to require verified email."""
    if not current_user.get("email_verified", False):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Email verification required"
        )
    return current_user

