"""
Players API routes for SolCraft Poker
"""

from fastapi import APIRouter, HTTPException, Depends, Query
from typing import List, Optional
from datetime import datetime

from models.player import (
    Player, PlayerCreate, PlayerUpdate, PlayerResponse, 
    PlayerListResponse, PlayerStats, PlayerTier
)
from services.firebase_service import FirebaseService
from services.auth_service import get_current_user

router = APIRouter()
firebase_service = FirebaseService()

@router.get("/", response_model=PlayerListResponse)
async def get_players(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    tier: Optional[PlayerTier] = None,
    status: Optional[str] = None,
    search: Optional[str] = None
):
    """Get list of players with pagination and filters"""
    try:
        players_data = await firebase_service.get_players(
            page=page,
            per_page=per_page,
            tier=tier,
            status=status,
            search=search
        )
        return players_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch players: {str(e)}")

@router.get("/{player_id}", response_model=PlayerResponse)
async def get_player(player_id: str):
    """Get player by ID"""
    try:
        player = await firebase_service.get_player(player_id)
        if not player:
            raise HTTPException(status_code=404, detail="Player not found")
        return player
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch player: {str(e)}")

@router.post("/", response_model=PlayerResponse)
async def create_player(player_data: PlayerCreate):
    """Create a new player"""
    try:
        # Check if player already exists
        existing_player = await firebase_service.get_player_by_firebase_uid(player_data.firebase_uid)
        if existing_player:
            raise HTTPException(status_code=400, detail="Player already exists")
        
        # Check if username is taken
        username_taken = await firebase_service.is_username_taken(player_data.username)
        if username_taken:
            raise HTTPException(status_code=400, detail="Username already taken")
        
        # Create new player
        player = await firebase_service.create_player(player_data)
        return player
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create player: {str(e)}")

@router.put("/{player_id}", response_model=PlayerResponse)
async def update_player(
    player_id: str, 
    player_data: PlayerUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Update player information"""
    try:
        # Check if player exists
        existing_player = await firebase_service.get_player(player_id)
        if not existing_player:
            raise HTTPException(status_code=404, detail="Player not found")
        
        # Check authorization (player can only update their own profile)
        if existing_player.firebase_uid != current_user["uid"]:
            raise HTTPException(status_code=403, detail="Not authorized to update this player")
        
        # Update player
        updated_player = await firebase_service.update_player(player_id, player_data)
        return updated_player
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update player: {str(e)}")

@router.delete("/{player_id}")
async def delete_player(
    player_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Delete player (soft delete - set status to inactive)"""
    try:
        # Check if player exists
        existing_player = await firebase_service.get_player(player_id)
        if not existing_player:
            raise HTTPException(status_code=404, detail="Player not found")
        
        # Check authorization
        if existing_player.firebase_uid != current_user["uid"]:
            raise HTTPException(status_code=403, detail="Not authorized to delete this player")
        
        # Soft delete player
        await firebase_service.deactivate_player(player_id)
        return {"message": "Player deactivated successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete player: {str(e)}")

@router.get("/{player_id}/stats", response_model=PlayerStats)
async def get_player_stats(player_id: str):
    """Get detailed player statistics"""
    try:
        stats = await firebase_service.get_player_stats(player_id)
        if not stats:
            raise HTTPException(status_code=404, detail="Player stats not found")
        return stats
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch player stats: {str(e)}")

@router.post("/{player_id}/stats/update")
async def update_player_stats(
    player_id: str,
    game_result: dict,
    current_user: dict = Depends(get_current_user)
):
    """Update player statistics after a game"""
    try:
        # Verify player exists and user is authorized
        player = await firebase_service.get_player(player_id)
        if not player:
            raise HTTPException(status_code=404, detail="Player not found")
        
        if player.firebase_uid != current_user["uid"]:
            raise HTTPException(status_code=403, detail="Not authorized")
        
        # Update stats
        updated_stats = await firebase_service.update_player_stats(player_id, game_result)
        return {"message": "Stats updated successfully", "stats": updated_stats}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update stats: {str(e)}")

@router.get("/{player_id}/friends", response_model=List[PlayerResponse])
async def get_player_friends(player_id: str):
    """Get player's friends list"""
    try:
        friends = await firebase_service.get_player_friends(player_id)
        return friends
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch friends: {str(e)}")

@router.post("/{player_id}/friends/{friend_id}")
async def add_friend(
    player_id: str,
    friend_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Add a friend"""
    try:
        # Verify authorization
        player = await firebase_service.get_player(player_id)
        if not player or player.firebase_uid != current_user["uid"]:
            raise HTTPException(status_code=403, detail="Not authorized")
        
        # Add friend
        await firebase_service.add_friend(player_id, friend_id)
        return {"message": "Friend added successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to add friend: {str(e)}")

@router.delete("/{player_id}/friends/{friend_id}")
async def remove_friend(
    player_id: str,
    friend_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Remove a friend"""
    try:
        # Verify authorization
        player = await firebase_service.get_player(player_id)
        if not player or player.firebase_uid != current_user["uid"]:
            raise HTTPException(status_code=403, detail="Not authorized")
        
        # Remove friend
        await firebase_service.remove_friend(player_id, friend_id)
        return {"message": "Friend removed successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to remove friend: {str(e)}")

@router.get("/search/{username}")
async def search_player_by_username(username: str):
    """Search player by username"""
    try:
        player = await firebase_service.get_player_by_username(username)
        if not player:
            raise HTTPException(status_code=404, detail="Player not found")
        return player
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to search player: {str(e)}")

@router.get("/leaderboard/{category}")
async def get_leaderboard(
    category: str = "winnings",  # winnings, games_won, roi, etc.
    limit: int = Query(50, ge=1, le=100)
):
    """Get player leaderboard"""
    try:
        leaderboard = await firebase_service.get_leaderboard(category, limit)
        return leaderboard
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch leaderboard: {str(e)}")

