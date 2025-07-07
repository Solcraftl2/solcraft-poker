"""
Corrected tournament router for SolCraft L2 backend.
"""
from fastapi import APIRouter, HTTPException, Depends, status
from typing import List, Optional
import logging
from ..models.tournament_models import (
    TournamentCreate, 
    TournamentInDB, 
    TournamentResponse,
    InitialPaymentRequest,
    GuaranteePaymentRequest,
    ReportTournamentResultsRequest
)
from ..services.tournament_service import TournamentService
from ..services.player_profile_service import PlayerProfileService
from ..config.database import get_supabase_client
from ..utils.auth import get_current_user

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/tournaments", tags=["tournaments"])

# Dependency to get tournament service
def get_tournament_service() -> TournamentService:
    return TournamentService()

# Dependency to get player profile service
def get_player_service() -> PlayerProfileService:
    return PlayerProfileService(get_supabase_client())

@router.post("/", response_model=TournamentResponse)
async def create_tournament(
    tournament_data: TournamentCreate,
    current_user: dict = Depends(get_current_user),
    tournament_service: TournamentService = Depends(get_tournament_service),
    player_service: PlayerProfileService = Depends(get_player_service)
):
    """Create a new tournament."""
    try:
        # Get player profile to determine ranking
        player_profile = await player_service.get_player_by_user_id(current_user["id"])
        if not player_profile:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Player profile not found. Please create a profile first."
            )
        
        player_ranking = tournament_data.player_ranking or player_profile["ranking"]
        
        # Calculate fees based on ranking
        fees = tournament_service.calculate_fees_for_ranking(
            player_ranking, 
            tournament_data.target_pool_amount
        )
        
        # Create tournament
        tournament = tournament_service.create_tournament(
            tournament_data=tournament_data,
            creator_user_id=current_user["id"],
            player_ranking=player_ranking,
            initial_fee_pct=fees["initial_fee_pct"],
            initial_fee_amount=fees["initial_fee_amount"],
            guarantee_pct=fees["guarantee_pct"],
            guarantee_amount=fees["guarantee_amount"],
            winnings_fee_pct=fees["winnings_fee_pct"]
        )
        
        return TournamentResponse(success=True, tournament=tournament)
        
    except Exception as e:
        logger.error(f"Error creating tournament: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.get("/", response_model=List[TournamentInDB])
async def get_tournaments(
    status: Optional[str] = None,
    creator_id: Optional[str] = None,
    tournament_service: TournamentService = Depends(get_tournament_service)
):
    """Get tournaments with optional filters."""
    try:
        tournaments = tournament_service.get_tournaments(status=status, creator_id=creator_id)
        return tournaments
    except Exception as e:
        logger.error(f"Error getting tournaments: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.get("/open", response_model=List[TournamentInDB])
async def get_open_tournaments(
    tournament_service: TournamentService = Depends(get_tournament_service)
):
    """Get tournaments open for investment."""
    try:
        tournaments = tournament_service.get_tournaments(status="funding_open")
        return tournaments
    except Exception as e:
        logger.error(f"Error getting open tournaments: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.get("/my", response_model=List[TournamentInDB])
async def get_my_tournaments(
    current_user: dict = Depends(get_current_user),
    tournament_service: TournamentService = Depends(get_tournament_service)
):
    """Get tournaments created by the current user."""
    try:
        tournaments = tournament_service.get_tournaments(creator_id=current_user["id"])
        return tournaments
    except Exception as e:
        logger.error(f"Error getting user tournaments: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.get("/{tournament_id}", response_model=TournamentInDB)
async def get_tournament(
    tournament_id: str,
    tournament_service: TournamentService = Depends(get_tournament_service)
):
    """Get a specific tournament by ID."""
    try:
        tournament = tournament_service.get_tournament_by_id(tournament_id)
        if not tournament:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Tournament not found"
            )
        return tournament
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting tournament: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.post("/pay_initial_fee", response_model=TournamentResponse)
async def pay_initial_fee(
    payment_data: InitialPaymentRequest,
    current_user: dict = Depends(get_current_user),
    tournament_service: TournamentService = Depends(get_tournament_service)
):
    """Pay the initial platform fee for a tournament."""
    try:
        # Verify user owns the tournament
        tournament = tournament_service.get_tournament_by_id(str(payment_data.tournament_id))
        if not tournament:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Tournament not found"
            )
        
        if tournament["creator_user_id"] != current_user["id"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only pay fees for your own tournaments"
            )
        
        updated_tournament = tournament_service.pay_initial_fee(
            str(payment_data.tournament_id),
            payment_data.transaction_hash
        )
        
        return TournamentResponse(success=True, tournament=updated_tournament)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error paying initial fee: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.post("/pay_guarantee", response_model=TournamentResponse)
async def pay_guarantee(
    payment_data: GuaranteePaymentRequest,
    current_user: dict = Depends(get_current_user),
    tournament_service: TournamentService = Depends(get_tournament_service)
):
    """Pay the guarantee for a tournament."""
    try:
        # Verify user owns the tournament
        tournament = tournament_service.get_tournament_by_id(str(payment_data.tournament_id))
        if not tournament:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Tournament not found"
            )
        
        if tournament["creator_user_id"] != current_user["id"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only pay guarantee for your own tournaments"
            )
        
        updated_tournament = tournament_service.pay_guarantee(
            str(payment_data.tournament_id),
            payment_data.transaction_hash
        )
        
        return TournamentResponse(success=True, tournament=updated_tournament)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error paying guarantee: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.post("/{tournament_id}/invest", response_model=TournamentResponse)
async def invest_in_tournament(
    tournament_id: str,
    investment_data: dict,
    current_user: dict = Depends(get_current_user),
    tournament_service: TournamentService = Depends(get_tournament_service)
):
    """Invest in a tournament."""
    try:
        amount = investment_data.get("amount")
        if not amount or amount <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Investment amount must be greater than 0"
            )
        
        updated_tournament = tournament_service.process_investment(
            tournament_id,
            current_user["id"],
            amount
        )
        
        return TournamentResponse(success=True, tournament=updated_tournament)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error investing in tournament: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.post("/report_results", response_model=TournamentResponse)
async def report_tournament_results(
    results_data: ReportTournamentResultsRequest,
    current_user: dict = Depends(get_current_user),
    tournament_service: TournamentService = Depends(get_tournament_service)
):
    """Report the results of a tournament."""
    try:
        # Verify user owns the tournament
        tournament = tournament_service.get_tournament_by_id(str(results_data.tournament_id))
        if not tournament:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Tournament not found"
            )
        
        if tournament["creator_user_id"] != current_user["id"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only report results for your own tournaments"
            )
        
        updated_tournament = tournament_service.process_tournament_results(
            str(results_data.tournament_id),
            results_data.won,
            results_data.total_winnings,
            results_data.proof_url,
            results_data.notes
        )
        
        return TournamentResponse(success=True, tournament=updated_tournament)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error reporting tournament results: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.post("/{tournament_id}/cancel", response_model=TournamentResponse)
async def cancel_tournament(
    tournament_id: str,
    current_user: dict = Depends(get_current_user),
    tournament_service: TournamentService = Depends(get_tournament_service)
):
    """Cancel a tournament."""
    try:
        # Verify user owns the tournament
        tournament = tournament_service.get_tournament_by_id(tournament_id)
        if not tournament:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Tournament not found"
            )
        
        if tournament["creator_user_id"] != current_user["id"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only cancel your own tournaments"
            )
        
        # Check if tournament can be cancelled
        if tournament["status"] in ["completed_won", "completed_lost", "cancelled"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Tournament cannot be cancelled in its current state"
            )
        
        updated_tournament = tournament_service.update_tournament(
            tournament_id,
            {"status": "cancelled"}
        )
        
        return TournamentResponse(success=True, tournament=updated_tournament)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error cancelling tournament: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

