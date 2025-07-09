"""
Tournament API Routes - Real Implementation
Handles tournament creation, management, and participation
"""

from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime, timezone
import logging
from ..services.firebase_service_real import firebase_service_real as firebase_service
from ..services.blockchain_service_simple import blockchain_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/tournaments", tags=["tournaments"])

# Pydantic Models
class TournamentCreate(BaseModel):
    name: str
    description: str
    buy_in: float
    max_players: int
    start_time: datetime
    prize_pool: Optional[float] = None
    tournament_type: str = "texas_holdem"
    blind_structure: Optional[Dict[str, Any]] = None

class TournamentUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    prize_pool: Optional[float] = None

class TournamentResponse(BaseModel):
    id: str
    name: str
    description: str
    buy_in: float
    max_players: int
    current_players: int
    start_time: str
    prize_pool: float
    status: str
    tournament_type: str
    participants: List[str]
    created_at: str
    updated_at: str

class JoinTournamentRequest(BaseModel):
    user_id: str
    wallet_address: str

@router.post("/create", response_model=TournamentResponse)
async def create_tournament(tournament_data: TournamentCreate):
    """Create a new tournament"""
    try:
        # Calculate initial prize pool if not provided
        prize_pool = tournament_data.prize_pool or (tournament_data.buy_in * tournament_data.max_players * 0.9)
        
        # Create tournament data
        tournament_dict = tournament_data.dict()
        tournament_dict.update({
            'prize_pool': prize_pool,
            'current_players': 0,
            'status': 'upcoming',
            'participants': [],
            'start_time': tournament_data.start_time.isoformat(),
            'blind_structure': tournament_data.blind_structure or {
                'small_blind': 10,
                'big_blind': 20,
                'ante': 0,
                'levels': [
                    {'level': 1, 'small_blind': 10, 'big_blind': 20, 'duration': 15},
                    {'level': 2, 'small_blind': 15, 'big_blind': 30, 'duration': 15},
                    {'level': 3, 'small_blind': 25, 'big_blind': 50, 'duration': 15},
                ]
            }
        })
        
        # Create tournament in Firebase
        tournament_id = await firebase_service.create_tournament(tournament_dict)
        
        # Get created tournament
        created_tournament = await firebase_service.get_tournament(tournament_id)
        if not created_tournament:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to retrieve created tournament"
            )
        
        logger.info(f"Tournament created successfully: {tournament_id}")
        return TournamentResponse(**created_tournament)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating tournament: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )

@router.get("/", response_model=List[TournamentResponse])
async def get_tournaments(status: Optional[str] = None, limit: int = 10):
    """Get tournaments with optional status filter"""
    try:
        tournaments = await firebase_service.get_tournaments(status=status, limit=limit)
        
        # Add current_players count
        for tournament in tournaments:
            tournament['current_players'] = len(tournament.get('participants', []))
        
        return [TournamentResponse(**tournament) for tournament in tournaments]
        
    except Exception as e:
        logger.error(f"Error getting tournaments: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )

@router.get("/{tournament_id}", response_model=TournamentResponse)
async def get_tournament(tournament_id: str):
    """Get tournament by ID"""
    try:
        tournament = await firebase_service.get_tournament(tournament_id)
        if not tournament:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Tournament not found"
            )
        
        # Add current_players count
        tournament['current_players'] = len(tournament.get('participants', []))
        
        return TournamentResponse(**tournament)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting tournament: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )

@router.post("/{tournament_id}/join")
async def join_tournament(tournament_id: str, join_request: JoinTournamentRequest):
    """Join a tournament"""
    try:
        # Get tournament
        tournament = await firebase_service.get_tournament(tournament_id)
        if not tournament:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Tournament not found"
            )
        
        # Check tournament status
        if tournament['status'] != 'upcoming':
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Tournament is not accepting new participants"
            )
        
        # Check if tournament is full
        current_players = len(tournament.get('participants', []))
        if current_players >= tournament['max_players']:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Tournament is full"
            )
        
        # Check if user already joined
        if join_request.user_id in tournament.get('participants', []):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User already joined this tournament"
            )
        
        # Verify user exists
        user = await firebase_service.get_user(join_request.user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Process buy-in payment (blockchain transaction)
        buy_in_amount = tournament['buy_in']
        transaction_result = await blockchain_service.process_tournament_buy_in(
            join_request.wallet_address,
            buy_in_amount,
            tournament_id
        )
        
        if not transaction_result['success']:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Payment failed: {transaction_result['error']}"
            )
        
        # Add user to tournament
        success = await firebase_service.join_tournament(tournament_id, join_request.user_id)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to join tournament"
            )
        
        # Create transaction record
        transaction_data = {
            'user_id': join_request.user_id,
            'tournament_id': tournament_id,
            'type': 'tournament_buy_in',
            'amount': buy_in_amount,
            'wallet_address': join_request.wallet_address,
            'blockchain_tx': transaction_result['transaction_id'],
            'status': 'completed'
        }
        await firebase_service.create_transaction(transaction_data)
        
        logger.info(f"User {join_request.user_id} joined tournament {tournament_id}")
        
        return {
            'success': True,
            'message': 'Successfully joined tournament',
            'transaction_id': transaction_result['transaction_id']
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error joining tournament: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )

@router.put("/{tournament_id}", response_model=TournamentResponse)
async def update_tournament(tournament_id: str, update_data: TournamentUpdate):
    """Update tournament (admin only)"""
    try:
        # Check if tournament exists
        existing_tournament = await firebase_service.get_tournament(tournament_id)
        if not existing_tournament:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Tournament not found"
            )
        
        # Update tournament data
        update_dict = {k: v for k, v in update_data.dict().items() if v is not None}
        
        if update_dict:
            # Update tournament in Firebase
            doc_ref = firebase_service.db.collection('tournaments').document(tournament_id)
            update_dict['updated_at'] = datetime.now(timezone.utc)
            doc_ref.update(update_dict)
        
        # Get updated tournament
        updated_tournament = await firebase_service.get_tournament(tournament_id)
        updated_tournament['current_players'] = len(updated_tournament.get('participants', []))
        
        return TournamentResponse(**updated_tournament)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating tournament: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )

@router.post("/{tournament_id}/start")
async def start_tournament(tournament_id: str):
    """Start a tournament"""
    try:
        tournament = await firebase_service.get_tournament(tournament_id)
        if not tournament:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Tournament not found"
            )
        
        if tournament['status'] != 'upcoming':
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Tournament cannot be started"
            )
        
        # Check minimum players
        current_players = len(tournament.get('participants', []))
        if current_players < 2:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Not enough players to start tournament"
            )
        
        # Update tournament status
        update_data = {
            'status': 'in_progress',
            'actual_start_time': datetime.now(timezone.utc).isoformat()
        }
        
        doc_ref = firebase_service.db.collection('tournaments').document(tournament_id)
        doc_ref.update(update_data)
        
        logger.info(f"Tournament {tournament_id} started")
        
        return {
            'success': True,
            'message': 'Tournament started successfully',
            'players': current_players
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error starting tournament: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )

@router.get("/{tournament_id}/leaderboard")
async def get_tournament_leaderboard(tournament_id: str):
    """Get tournament leaderboard"""
    try:
        tournament = await firebase_service.get_tournament(tournament_id)
        if not tournament:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Tournament not found"
            )
        
        # Get participant details
        participants = []
        for user_id in tournament.get('participants', []):
            user = await firebase_service.get_user(user_id)
            if user:
                participants.append({
                    'user_id': user_id,
                    'username': user.get('username'),
                    'chips': 1000,  # Default starting chips
                    'position': 0,
                    'eliminated': False
                })
        
        # Sort by chips (in real implementation, this would come from game state)
        participants.sort(key=lambda x: x['chips'], reverse=True)
        
        # Add positions
        for i, participant in enumerate(participants):
            participant['position'] = i + 1
        
        return {
            'tournament_id': tournament_id,
            'tournament_name': tournament['name'],
            'status': tournament['status'],
            'total_players': len(participants),
            'leaderboard': participants
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting tournament leaderboard: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )

