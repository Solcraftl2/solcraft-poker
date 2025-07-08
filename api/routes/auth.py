"""
Authentication API routes for SolCraft Poker
"""

from fastapi import APIRouter, HTTPException, Depends
from typing import Dict, Any, Optional
from datetime import datetime, timedelta

from services.firebase_service import FirebaseService
from services.auth_service import get_current_user, verify_firebase_token

router = APIRouter()
firebase_service = FirebaseService()

@router.post("/verify-token")
async def verify_token(token: str):
    """Verify Firebase authentication token"""
    try:
        decoded_token = await verify_firebase_token(token)
        return {
            "valid": True,
            "user_id": decoded_token["uid"],
            "email": decoded_token.get("email"),
            "email_verified": decoded_token.get("email_verified", False)
        }
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")

@router.get("/me")
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    """Get current authenticated user information"""
    try:
        # Get player profile if exists
        player = await firebase_service.get_player_by_firebase_uid(current_user["uid"])
        
        user_info = {
            "firebase_uid": current_user["uid"],
            "email": current_user.get("email"),
            "email_verified": current_user.get("email_verified", False),
            "has_player_profile": player is not None
        }
        
        if player:
            user_info["player"] = {
                "id": player.id,
                "username": player.username,
                "display_name": player.display_name,
                "avatar_url": player.avatar_url,
                "tier": player.tier,
                "status": player.status,
                "created_at": player.created_at,
                "last_activity": player.last_activity
            }
        
        return user_info
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch user info: {str(e)}")

@router.post("/refresh")
async def refresh_session(current_user: dict = Depends(get_current_user)):
    """Refresh user session and update last activity"""
    try:
        # Update last activity if player profile exists
        player = await firebase_service.get_player_by_firebase_uid(current_user["uid"])
        if player:
            await firebase_service.update_player_activity(player.id)
        
        return {
            "message": "Session refreshed successfully",
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to refresh session: {str(e)}")

@router.post("/logout")
async def logout(current_user: dict = Depends(get_current_user)):
    """Logout user and update last activity"""
    try:
        # Update last activity if player profile exists
        player = await firebase_service.get_player_by_firebase_uid(current_user["uid"])
        if player:
            await firebase_service.update_player_activity(player.id)
        
        return {"message": "Logged out successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to logout: {str(e)}")

@router.get("/permissions")
async def get_user_permissions(current_user: dict = Depends(get_current_user)):
    """Get user permissions and roles"""
    try:
        permissions = await firebase_service.get_user_permissions(current_user["uid"])
        return permissions
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch permissions: {str(e)}")

@router.post("/change-password")
async def change_password(
    current_password: str,
    new_password: str,
    current_user: dict = Depends(get_current_user)
):
    """Change user password"""
    try:
        # Note: Password changes should be handled on the client side with Firebase Auth
        # This endpoint is for additional server-side validation if needed
        return {"message": "Password change should be handled on the client side with Firebase Auth"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to change password: {str(e)}")

@router.post("/update-email")
async def update_email(
    new_email: str,
    current_user: dict = Depends(get_current_user)
):
    """Update user email"""
    try:
        # Note: Email updates should be handled on the client side with Firebase Auth
        # This endpoint is for additional server-side validation if needed
        return {"message": "Email update should be handled on the client side with Firebase Auth"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update email: {str(e)}")

@router.post("/enable-2fa")
async def enable_two_factor_auth(current_user: dict = Depends(get_current_user)):
    """Enable two-factor authentication"""
    try:
        # Get player profile
        player = await firebase_service.get_player_by_firebase_uid(current_user["uid"])
        if not player:
            raise HTTPException(status_code=404, detail="Player profile not found")
        
        # Enable 2FA
        result = await firebase_service.enable_two_factor_auth(player.id)
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to enable 2FA: {str(e)}")

@router.post("/disable-2fa")
async def disable_two_factor_auth(current_user: dict = Depends(get_current_user)):
    """Disable two-factor authentication"""
    try:
        # Get player profile
        player = await firebase_service.get_player_by_firebase_uid(current_user["uid"])
        if not player:
            raise HTTPException(status_code=404, detail="Player profile not found")
        
        # Disable 2FA
        await firebase_service.disable_two_factor_auth(player.id)
        return {"message": "Two-factor authentication disabled successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to disable 2FA: {str(e)}")

@router.get("/sessions")
async def get_user_sessions(current_user: dict = Depends(get_current_user)):
    """Get user's active sessions"""
    try:
        sessions = await firebase_service.get_user_sessions(current_user["uid"])
        return {"sessions": sessions}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch sessions: {str(e)}")

@router.delete("/sessions/{session_id}")
async def revoke_session(
    session_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Revoke a specific session"""
    try:
        await firebase_service.revoke_session(current_user["uid"], session_id)
        return {"message": "Session revoked successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to revoke session: {str(e)}")

@router.delete("/sessions")
async def revoke_all_sessions(current_user: dict = Depends(get_current_user)):
    """Revoke all user sessions except current"""
    try:
        await firebase_service.revoke_all_sessions(current_user["uid"])
        return {"message": "All sessions revoked successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to revoke sessions: {str(e)}")

@router.get("/security-log")
async def get_security_log(
    limit: int = 50,
    current_user: dict = Depends(get_current_user)
):
    """Get user's security activity log"""
    try:
        log = await firebase_service.get_user_security_log(current_user["uid"], limit)
        return {"security_log": log}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch security log: {str(e)}")

@router.post("/verify-identity")
async def verify_identity(
    verification_data: Dict[str, Any],
    current_user: dict = Depends(get_current_user)
):
    """Verify user identity for sensitive operations"""
    try:
        # Get player profile
        player = await firebase_service.get_player_by_firebase_uid(current_user["uid"])
        if not player:
            raise HTTPException(status_code=404, detail="Player profile not found")
        
        # Verify identity
        result = await firebase_service.verify_user_identity(player.id, verification_data)
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to verify identity: {str(e)}")

@router.get("/account-status")
async def get_account_status(current_user: dict = Depends(get_current_user)):
    """Get comprehensive account status"""
    try:
        # Get player profile
        player = await firebase_service.get_player_by_firebase_uid(current_user["uid"])
        
        status = {
            "firebase_account": {
                "uid": current_user["uid"],
                "email": current_user.get("email"),
                "email_verified": current_user.get("email_verified", False),
                "created_at": current_user.get("auth_time")
            },
            "player_profile": None,
            "security": {
                "two_factor_enabled": False,
                "last_password_change": None,
                "active_sessions": 0
            },
            "verification": {
                "kyc_status": "pending",
                "identity_verified": False
            }
        }
        
        if player:
            status["player_profile"] = {
                "id": player.id,
                "username": player.username,
                "status": player.status,
                "tier": player.tier,
                "created_at": player.created_at,
                "last_activity": player.last_activity
            }
            status["security"]["two_factor_enabled"] = player.two_factor_enabled
            status["verification"]["kyc_status"] = player.kyc_status
            status["verification"]["identity_verified"] = player.is_verified
        
        return status
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch account status: {str(e)}")

