from fastapi import APIRouter, HTTPException, Depends, status
from typing import Optional, Dict, Any
import logging

from ..services.fee_service import FeeService
from ..config.database import get_supabase_client
from pydantic import BaseModel

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/fees", tags=["fees"])


def get_fee_service() -> FeeService:
    return FeeService(get_supabase_client())


class InitialFeePayment(BaseModel):
    tournament_id: str
    transaction_hash: Optional[str] = None


class WinningsFeePayment(BaseModel):
    tournament_id: str
    amount: float
    transaction_hash: Optional[str] = None


@router.post("/initial", response_model=Dict[str, Any])
async def pay_initial_fee(
    data: InitialFeePayment,
    service: FeeService = Depends(get_fee_service),
):
    """Record payment of the initial platform fee."""
    try:
        result = await service.process_initial_fee_payment(data.tournament_id, data.transaction_hash)
        return result
    except Exception as e:
        logger.error(f"Error processing initial fee: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.post("/winnings", response_model=Dict[str, Any])
async def pay_winnings_fee(
    data: WinningsFeePayment,
    service: FeeService = Depends(get_fee_service),
):
    """Record payment of the platform fee on winnings."""
    try:
        result = await service.process_winnings_fee_payment(data.tournament_id, data.amount, data.transaction_hash)
        return result
    except Exception as e:
        logger.error(f"Error processing winnings fee: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.get("/", response_model=Any)
async def list_fees(
    tournament_id: Optional[str] = None,
    fee_type: Optional[str] = None,
    service: FeeService = Depends(get_fee_service),
):
    """Retrieve platform fees with optional filters."""
    try:
        fees = await service.get_platform_fees(tournament_id=tournament_id, fee_type=fee_type)
        return fees
    except Exception as e:
        logger.error(f"Error getting fees: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.get("/stats", response_model=Any)
async def fee_statistics(service: FeeService = Depends(get_fee_service)):
    """Retrieve aggregated statistics about fees."""
    try:
        stats = await service.get_fee_statistics()
        return stats
    except Exception as e:
        logger.error(f"Error getting fee statistics: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
