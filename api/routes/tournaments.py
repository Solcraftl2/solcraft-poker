"""
Tournaments API routes for SolCraft Poker
"""

from fastapi import APIRouter, HTTPException, Depends, Query
from typing import List, Optional
from datetime import datetime, timedelta
from enum import Enum

from models.tournament import (
    Tournament, TournamentCreate, TournamentUpdate, TournamentResponse,
    TournamentListResponse, TournamentStatus, TournamentType
)
from services.firebase_service import FirebaseService
from services.auth_service import get_current_user

router = APIRouter()
firebase_service = FirebaseService()

@router.get("/", response_model=TournamentListResponse)
async def get_tournaments(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    status: Optional[TournamentStatus] = None,
    tournament_type: Optional[TournamentType] = None,
    min_buy_in: Optional[float] = None,
    max_buy_in: Optional[float] = None,
    upcoming_only: bool = False
):
    """Get list of tournaments with pagination and filters"""
    try:
        tournaments_data = await firebase_service.get_tournaments(
            page=page,
            per_page=per_page,
            status=status,
            tournament_type=tournament_type,
            min_buy_in=min_buy_in,
            max_buy_in=max_buy_in,
            upcoming_only=upcoming_only
        )
        return tournaments_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch tournaments: {str(e)}")

@router.get("/{tournament_id}", response_model=TournamentResponse)
async def get_tournament(tournament_id: str):
    """Get tournament by ID"""
    try:
        tournament = await firebase_service.get_tournament(tournament_id)
        if not tournament:
            raise HTTPException(status_code=404, detail="Tournament not found")
        return tournament
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch tournament: {str(e)}")

@router.post("/", response_model=TournamentResponse)
async def create_tournament(
    tournament_data: TournamentCreate,
    current_user: dict = Depends(get_current_user)
):
    """Create a new tournament (admin only)"""
    try:
        # Check if user has admin privileges
        if not await firebase_service.is_admin(current_user["uid"]):
            raise HTTPException(status_code=403, detail="Admin privileges required")
        
        # Create tournament
        tournament = await firebase_service.create_tournament(tournament_data, current_user["uid"])
        return tournament
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create tournament: {str(e)}")

@router.put("/{tournament_id}", response_model=TournamentResponse)
async def update_tournament(
    tournament_id: str,
    tournament_data: TournamentUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Update tournament information (admin only)"""
    try:
        # Check if user has admin privileges
        if not await firebase_service.is_admin(current_user["uid"]):
            raise HTTPException(status_code=403, detail="Admin privileges required")
        
        # Check if tournament exists
        existing_tournament = await firebase_service.get_tournament(tournament_id)
        if not existing_tournament:
            raise HTTPException(status_code=404, detail="Tournament not found")
        
        # Update tournament
        updated_tournament = await firebase_service.update_tournament(tournament_id, tournament_data)
        return updated_tournament
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update tournament: {str(e)}")

@router.delete("/{tournament_id}")
async def cancel_tournament(
    tournament_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Cancel a tournament (admin only)"""
    try:
        # Check if user has admin privileges
        if not await firebase_service.is_admin(current_user["uid"]):
            raise HTTPException(status_code=403, detail="Admin privileges required")
        
        # Cancel tournament
        await firebase_service.cancel_tournament(tournament_id)
        return {"message": "Tournament cancelled successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to cancel tournament: {str(e)}")

@router.post("/{tournament_id}/register")
async def register_for_tournament(
    tournament_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Register player for tournament"""
    try:
        # Get player info
        player = await firebase_service.get_player_by_firebase_uid(current_user["uid"])
        if not player:
            raise HTTPException(status_code=404, detail="Player profile not found")
        
        # Register for tournament
        registration = await firebase_service.register_for_tournament(tournament_id, player.id)
        return {"message": "Successfully registered for tournament", "registration": registration}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to register for tournament: {str(e)}")

@router.delete("/{tournament_id}/register")
async def unregister_from_tournament(
    tournament_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Unregister player from tournament"""
    try:
        # Get player info
        player = await firebase_service.get_player_by_firebase_uid(current_user["uid"])
        if not player:
            raise HTTPException(status_code=404, detail="Player profile not found")
        
        # Unregister from tournament
        await firebase_service.unregister_from_tournament(tournament_id, player.id)
        return {"message": "Successfully unregistered from tournament"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to unregister from tournament: {str(e)}")

@router.get("/{tournament_id}/players")
async def get_tournament_players(tournament_id: str):
    """Get list of registered players for tournament"""
    try:
        players = await firebase_service.get_tournament_players(tournament_id)
        return {"tournament_id": tournament_id, "players": players, "count": len(players)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch tournament players: {str(e)}")

@router.get("/{tournament_id}/results")
async def get_tournament_results(tournament_id: str):
    """Get tournament results"""
    try:
        results = await firebase_service.get_tournament_results(tournament_id)
        if not results:
            raise HTTPException(status_code=404, detail="Tournament results not found")
        return results
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch tournament results: {str(e)}")

@router.post("/{tournament_id}/start")
async def start_tournament(
    tournament_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Start a tournament (admin only)"""
    try:
        # Check if user has admin privileges
        if not await firebase_service.is_admin(current_user["uid"]):
            raise HTTPException(status_code=403, detail="Admin privileges required")
        
        # Start tournament
        await firebase_service.start_tournament(tournament_id)
        return {"message": "Tournament started successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to start tournament: {str(e)}")

@router.post("/{tournament_id}/finish")
async def finish_tournament(
    tournament_id: str,
    results: dict,
    current_user: dict = Depends(get_current_user)
):
    """Finish a tournament and record results (admin only)"""
    try:
        # Check if user has admin privileges
        if not await firebase_service.is_admin(current_user["uid"]):
            raise HTTPException(status_code=403, detail="Admin privileges required")
        
        # Finish tournament
        await firebase_service.finish_tournament(tournament_id, results)
        return {"message": "Tournament finished successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to finish tournament: {str(e)}")

@router.get("/upcoming/featured")
async def get_featured_tournaments(limit: int = Query(5, ge=1, le=20)):
    """Get featured upcoming tournaments"""
    try:
        tournaments = await firebase_service.get_featured_tournaments(limit)
        return {"tournaments": tournaments}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch featured tournaments: {str(e)}")

@router.get("/player/{player_id}/history")
async def get_player_tournament_history(
    player_id: str,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100)
):
    """Get player's tournament history"""
    try:
        history = await firebase_service.get_player_tournament_history(player_id, page, per_page)
        return history
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch tournament history: {str(e)}")

@router.get("/stats/summary")
async def get_tournament_stats():
    """Get overall tournament statistics"""
    try:
        stats = await firebase_service.get_tournament_stats()
        return stats
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch tournament stats: {str(e)}")

