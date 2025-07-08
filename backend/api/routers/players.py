from fastapi import APIRouter, HTTPException, Depends, status
import logging
from ..services.player_profile_service import PlayerProfileService
from ..config.database import get_supabase_client

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/players", tags=["players"])


def get_player_service() -> PlayerProfileService:
    return PlayerProfileService(get_supabase_client())


@router.get("/")
async def list_players(limit: int = 50, offset: int = 0, service: PlayerProfileService = Depends(get_player_service)):
    """List player profiles."""
    try:
        players = await service.list_players(limit=limit, offset=offset)
        return players
    except Exception as e:
        logger.error(f"Error listing players: {e}")
        raise HTTPException(status_code=500, detail="Unable to list players")


@router.get("/{user_id}")
async def get_player_profile(user_id: str, service: PlayerProfileService = Depends(get_player_service)):
    """Get a single player profile."""
    try:
        player = await service.get_player_profile_with_stats(user_id)
        if not player:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Player not found")
        return player
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrieving player {user_id}: {e}")
        raise HTTPException(status_code=500, detail="Unable to retrieve player")
