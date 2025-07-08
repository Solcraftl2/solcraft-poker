"""
Player data models for SolCraft Poker
"""

from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum

class PlayerStatus(str, Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    SUSPENDED = "suspended"
    BANNED = "banned"

class PlayerTier(str, Enum):
    BRONZE = "bronze"
    SILVER = "silver"
    GOLD = "gold"
    PLATINUM = "platinum"
    DIAMOND = "diamond"

class PlayerStats(BaseModel):
    """Player statistics model"""
    total_games: int = 0
    games_won: int = 0
    games_lost: int = 0
    total_winnings: float = 0.0
    total_losses: float = 0.0
    biggest_win: float = 0.0
    biggest_loss: float = 0.0
    win_rate: float = 0.0
    roi: float = 0.0  # Return on Investment
    avg_session_time: int = 0  # in minutes
    tournaments_played: int = 0
    tournaments_won: int = 0
    cash_games_played: int = 0
    
class WalletInfo(BaseModel):
    """Player wallet information"""
    solana_address: Optional[str] = None
    ethereum_address: Optional[str] = None
    balance_sol: float = 0.0
    balance_usdc: float = 0.0
    balance_chips: int = 0
    is_verified: bool = False
    last_transaction: Optional[datetime] = None

class PlayerPreferences(BaseModel):
    """Player preferences and settings"""
    auto_rebuy: bool = False
    auto_muck: bool = True
    show_cards: bool = False
    chat_enabled: bool = True
    sound_enabled: bool = True
    notifications_enabled: bool = True
    preferred_table_size: int = 6
    preferred_game_type: str = "texas_holdem"

class Player(BaseModel):
    """Main Player model"""
    id: Optional[str] = None
    firebase_uid: str = Field(..., description="Firebase user ID")
    username: str = Field(..., min_length=3, max_length=20)
    email: EmailStr
    display_name: Optional[str] = None
    avatar_url: Optional[str] = None
    
    # Status and tier
    status: PlayerStatus = PlayerStatus.ACTIVE
    tier: PlayerTier = PlayerTier.BRONZE
    
    # Profile information
    bio: Optional[str] = Field(None, max_length=500)
    country: Optional[str] = None
    timezone: Optional[str] = None
    date_of_birth: Optional[datetime] = None
    
    # Game-related data
    stats: PlayerStats = Field(default_factory=PlayerStats)
    wallet: WalletInfo = Field(default_factory=WalletInfo)
    preferences: PlayerPreferences = Field(default_factory=PlayerPreferences)
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    last_login: Optional[datetime] = None
    last_activity: Optional[datetime] = None
    
    # Verification and security
    is_verified: bool = False
    kyc_status: str = "pending"  # pending, approved, rejected
    two_factor_enabled: bool = False
    
    # Social features
    friends: List[str] = Field(default_factory=list)  # List of player IDs
    blocked_players: List[str] = Field(default_factory=list)
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class PlayerCreate(BaseModel):
    """Model for creating a new player"""
    firebase_uid: str
    username: str = Field(..., min_length=3, max_length=20)
    email: EmailStr
    display_name: Optional[str] = None
    country: Optional[str] = None
    timezone: Optional[str] = None

class PlayerUpdate(BaseModel):
    """Model for updating player information"""
    display_name: Optional[str] = None
    bio: Optional[str] = Field(None, max_length=500)
    avatar_url: Optional[str] = None
    country: Optional[str] = None
    timezone: Optional[str] = None
    preferences: Optional[PlayerPreferences] = None

class PlayerResponse(BaseModel):
    """Response model for player data"""
    id: str
    username: str
    display_name: Optional[str]
    avatar_url: Optional[str]
    tier: PlayerTier
    status: PlayerStatus
    stats: PlayerStats
    created_at: datetime
    last_activity: Optional[datetime]
    is_verified: bool

class PlayerListResponse(BaseModel):
    """Response model for player list"""
    players: List[PlayerResponse]
    total: int
    page: int
    per_page: int
    has_next: bool
    has_prev: bool

