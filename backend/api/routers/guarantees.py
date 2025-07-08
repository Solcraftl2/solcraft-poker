from fastapi import APIRouter, HTTPException, Depends, status
from typing import Optional, Dict, Any
import logging

from ..services.guarantee_service import GuaranteeService
from ..config.database import get_supabase_client
from ..utils.auth import get_current_user
from pydantic import BaseModel

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/guarantees", tags=["guarantees"])


def get_guarantee_service() -> GuaranteeService:
    return GuaranteeService(get_supabase_client())


class GuaranteePayment(BaseModel):
    tournament_id: str
    transaction_hash: Optional[str] = None


class ReturnRequest(BaseModel):
    tournament_id: str


class ForfeitRequest(BaseModel):
    tournament_id: str
    reason: str


@router.post("/pay", response_model=Dict[str, Any])
async def pay_guarantee(
    data: GuaranteePayment,
    current_user: Dict[str, Any] = Depends(get_current_user),
    service: GuaranteeService = Depends(get_guarantee_service),
):
    """Process payment of the player's guarantee."""
    try:
        result = await service.process_guarantee_payment(data.tournament_id, current_user["id"], data.transaction_hash)
        return result
    except Exception as e:
        logger.error(f"Error processing guarantee payment: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.post("/return", response_model=Dict[str, Any])
async def return_guarantee(
    data: ReturnRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
    service: GuaranteeService = Depends(get_guarantee_service),
):
    """Return the guarantee to the player."""
    try:
        result = await service.return_guarantee(data.tournament_id, current_user["id"])
        return result
    except Exception as e:
        logger.error(f"Error returning guarantee: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.post("/forfeit", response_model=Dict[str, Any])
async def forfeit_guarantee(
    data: ForfeitRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
    service: GuaranteeService = Depends(get_guarantee_service),
):
    """Forfeit a player's guarantee."""
    try:
        result = await service.forfeit_guarantee(data.tournament_id, current_user["id"], data.reason)
        return result
    except Exception as e:
        logger.error(f"Error forfeiting guarantee: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.get("/player/{player_id}", response_model=Any)
async def list_guarantees_for_player(
    player_id: str,
    status: Optional[str] = None,
    service: GuaranteeService = Depends(get_guarantee_service),
):
    """Retrieve guarantees for a player."""
    try:
        guarantees = await service.get_player_guarantees(player_id, status)
        return guarantees
    except Exception as e:
        logger.error(f"Error getting guarantees: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.get("/tournament/{tournament_id}", response_model=Any)
async def get_tournament_guarantee(
    tournament_id: str,
    service: GuaranteeService = Depends(get_guarantee_service),
):
    """Retrieve the guarantee for a specific tournament."""
    try:
        guarantee = await service.get_tournament_guarantee(tournament_id)
        if not guarantee:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Guarantee not found")
        return guarantee
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting tournament guarantee: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
