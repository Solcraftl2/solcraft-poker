"""
Models for tournament management in SolCraft L2.
"""
from typing import Optional, List, Dict, Any, Union
from pydantic import BaseModel, Field, validator
from datetime import datetime
from uuid import UUID

# Configurazione ranking
RANKING_CONFIG = {
    "PLATINUM": {
        "minTournaments": 50,
        "minWinRate": 0.65,
        "guaranteePct": 0.20,
        "initialFeePct": 0.05,
        "winningsFeePct": 0.15
    },
    "GOLD": {
        "minTournaments": 30,
        "minWinRate": 0.55,
        "guaranteePct": 0.25,
        "initialFeePct": 0.07,
        "winningsFeePct": 0.17
    },
    "SILVER": {
        "minTournaments": 15,
        "minWinRate": 0.45,
        "guaranteePct": 0.30,
        "initialFeePct": 0.08,
        "winningsFeePct": 0.18
    },
    "BRONZE": {
        "minTournaments": 0,
        "minWinRate": 0,
        "guaranteePct": 0.40,
        "initialFeePct": 0.10,
        "winningsFeePct": 0.20
    }
}

class TournamentBase(BaseModel):
    """Base model for tournament data."""
    name: str
    description: Optional[str] = None
    game_type: str = "Poker"
    target_pool_amount: float
    tournament_buy_in: Optional[float] = None
    external_tournament_url: Optional[str] = None
    funding_end_time: Optional[datetime] = None

class TournamentCreate(TournamentBase):
    """Model for creating a new tournament."""
    player_ranking: Optional[str] = "BRONZE"

    @validator('player_ranking')
    def validate_ranking(cls, v):
        if v not in RANKING_CONFIG:
            raise ValueError(f"Invalid ranking: {v}. Must be one of {list(RANKING_CONFIG.keys())}")
        return v

class TournamentUpdate(BaseModel):
    """Model for updating tournament data."""
    name: Optional[str] = None
    description: Optional[str] = None
    game_type: Optional[str] = None
    external_tournament_url: Optional[str] = None
    funding_end_time: Optional[datetime] = None
    status: Optional[str] = None

class TournamentInDB(TournamentBase):
    """Model for tournament data as stored in the database."""
    id: UUID
    creator_user_id: UUID
    player_ranking_at_creation: str
    status: str
    initial_platform_fee_pct: float
    initial_platform_fee_amount: float
    initial_platform_fee_paid: bool
    player_guarantee_pct: float
    player_guarantee_amount_required: float
    player_guarantee_paid: bool
    winnings_platform_fee_pct: float
    current_pool_amount: float = 0
    total_winnings_from_tournament: Optional[float] = None
    platform_winnings_fee_amount: Optional[float] = None
    net_winnings_for_investors: Optional[float] = None
    created_at: datetime
    updated_at: datetime

class TournamentResponse(BaseModel):
    """Response model for tournament operations."""
    success: bool
    tournament: Optional[TournamentInDB] = None
    error: Optional[str] = None

class InitialPaymentRequest(BaseModel):
    """Request model for initial fee payment."""
    tournament_id: UUID
    transaction_hash: Optional[str] = None

class GuaranteePaymentRequest(BaseModel):
    """Request model for guarantee payment."""
    tournament_id: UUID
    transaction_hash: Optional[str] = None

class ReportTournamentResultsRequest(BaseModel):
    """Request model for reporting tournament results."""
    tournament_id: UUID
    won: bool
    total_winnings: Optional[float] = None
    proof_url: Optional[str] = None
    notes: Optional[str] = None
