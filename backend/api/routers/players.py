from fastapi import APIRouter, HTTPException, Depends, status
from typing import Optional, Dict, Any
import logging

from ..services.player_profile_service import PlayerProfileService
from ..config.database import get_supabase_client
from ..utils.auth import get_current_user
from pydantic import BaseModel

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/players", tags=["players"])


def get_player_service() -> PlayerProfileService:
    return PlayerProfileService(get_supabase_client())


class PlayerCreate(BaseModel):
    name: str
    avatar_url: Optional[str] = None
    bio: Optional[str] = None


class PlayerUpdate(BaseModel):
    name: Optional[str] = None
    avatar_url: Optional[str] = None
    bio: Optional[str] = None


@router.post("/", response_model=Dict[str, Any])
async def create_player_profile(
    player_data: PlayerCreate,
    current_user: Dict[str, Any] = Depends(get_current_user),
    service: PlayerProfileService = Depends(get_player_service),
):
    """Create a new player profile for the authenticated user."""
    try:
        player = await service.create_player_profile(
            current_user["id"], player_data.name, player_data.avatar_url, player_data.bio
        )
        return player
    except Exception as e:
        logger.error(f"Error creating player profile: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.get("/me", response_model=Dict[str, Any])
async def get_my_profile(
    current_user: Dict[str, Any] = Depends(get_current_user),
    service: PlayerProfileService = Depends(get_player_service),
):
    """Retrieve the authenticated user's player profile with stats."""
    try:
        profile = await service.get_player_profile_with_stats(current_user["id"])
        if not profile:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found")
        return profile
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching player profile: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.get("/{user_id}", response_model=Dict[str, Any])
async def get_player_profile(
    user_id: str,
    service: PlayerProfileService = Depends(get_player_service),
):
    """Retrieve a player profile with stats by user ID."""
    try:
        profile = await service.get_player_profile_with_stats(user_id)
        if not profile:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found")
        return profile
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching player profile: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.put("/me", response_model=Dict[str, Any])
async def update_my_profile(
    update_data: PlayerUpdate,
    current_user: Dict[str, Any] = Depends(get_current_user),
    service: PlayerProfileService = Depends(get_player_service),
):
    """Update the authenticated user's player profile."""
    try:
        update_dict = update_data.dict(exclude_unset=True)
        player = await service.update_player_profile(current_user["id"], update_dict)
        return player
    except Exception as e:
        logger.error(f"Error updating player profile: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
