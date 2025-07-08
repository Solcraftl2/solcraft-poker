"""
Player models for SolCraft Poker - Simplified for testing
"""

from pydantic import BaseModel
from typing import Optional, List
from enum import Enum

class PlayerTier(str, Enum):
    bronze = "bronze"
    silver = "silver"
    gold = "gold"
    platinum = "platinum"

class Player(BaseModel):
    id: str
    username: str
    tier: PlayerTier

class PlayerCreate(BaseModel):
    username: str
    tier: PlayerTier = PlayerTier.bronze

class PlayerUpdate(BaseModel):
    username: Optional[str] = None
    tier: Optional[PlayerTier] = None

class PlayerStats(BaseModel):
    games_played: int = 0
    wins: int = 0

class PlayerResponse(BaseModel):
    id: str
    username: str
    tier: PlayerTier
    stats: PlayerStats

class PlayerListResponse(BaseModel):
    players: List[Player]
    total: int
    page: int
    per_page: int

