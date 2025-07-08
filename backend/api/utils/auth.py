"""
Corrected authentication utilities for SolCraft L2 backend.
"""
from fastapi import HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional, Dict, Any
import os
import jwt
import logging
from ..config.database import get_db_connection

logger = logging.getLogger(__name__)
security = HTTPBearer()

class AuthService:
    def __init__(self):
        # Initialize a standard database connection
        self.db = get_db_connection()
    
    def verify_token(self, token: str) -> Optional[Dict[str, Any]]:
        """Verify JWT token and return user data."""
        try:
            # Decode JWT token using shared secret
            secret = os.getenv("JWT_SECRET", "your-secret-key")
            payload = jwt.decode(token, secret, algorithms=["HS256"])
            return {
                "id": payload.get("sub"),
                "email": payload.get("email"),
                "user_metadata": payload.get("user_metadata")
            }
        except Exception as e:
            logger.error(f"Token verification failed: {str(e)}")
            return None
    
    def get_user_from_token(self, token: str) -> Optional[Dict[str, Any]]:
        """Get user information from token."""
        try:
            # Verify token and get user payload
            user_data = self.verify_token(token)
            if not user_data:
                return None

            # Fetch additional user profile data from database
            with self.db.cursor() as cur:
                cur.execute(
                    "SELECT * FROM user_profiles WHERE user_id = %s LIMIT 1",
                    (user_data["id"],),
                )
                profile = cur.fetchone()

            if profile:
                user_data.update(profile)

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

