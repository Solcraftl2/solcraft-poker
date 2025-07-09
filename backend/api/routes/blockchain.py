"""
API routes per integrazione blockchain SolCraft.
Implementato con PyCharm Professional per massima qualità.
"""
from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from typing import List, Optional, Dict, Any
import logging
from datetime import datetime

from ..services.blockchain_service import get_blockchain_service, SolanaBlockchainService
from ..services.tournament_service_firebase import TournamentService
from ..config.database import get_firestore_client
from pydantic import BaseModel, Field

logger = logging.getLogger(__name__)

# Pydantic models per API
class WalletBalanceResponse(BaseModel):
    wallet: str
    solp_balance: float
    sol_balance: float
    staked_amount: float
    pending_rewards: float
    last_updated: int

class TournamentCreateRequest(BaseModel):
    organizer_wallet: str
    buy_in: int
    max_players: int
    tournament_name: str
    start_time: int

class TournamentRegistrationRequest(BaseModel):
    tournament_id: int
    player_wallet: str

class StakingPoolCreateRequest(BaseModel):
    creator_wallet: str
    apy: float
    lock_period_days: int
    max_stake_amount: int

class StakeTokensRequest(BaseModel):
    pool_id: int
    staker_wallet: str
    amount: int

class GovernanceProposalRequest(BaseModel):
    proposer_wallet: str
    title: str
    description: str
    voting_period_days: int = 7

class VoteRequest(BaseModel):
    proposal_id: int
    voter_wallet: str
    vote: bool  # True = for, False = against
    voting_power: int = 1

class TokenTransferRequest(BaseModel):
    from_wallet: str
    to_wallet: str
    amount: float

# Router setup
router = APIRouter(prefix="/api/blockchain", tags=["blockchain"])

# ==================== HEALTH & STATUS ====================

@router.get("/health")
async def health_check(
    blockchain_service: SolanaBlockchainService = Depends(get_blockchain_service)
):
    """Verifica salute servizio blockchain."""
    try:
        health_data = await blockchain_service.health_check()
        return health_data
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/network-stats")
async def get_network_stats(
    blockchain_service: SolanaBlockchainService = Depends(get_blockchain_service)
):
    """Ottiene statistiche rete Solana."""
    try:
        stats = await blockchain_service.get_network_stats()
        return stats
    except Exception as e:
        logger.error(f"Error getting network stats: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# ==================== WALLET MANAGEMENT ====================

@router.get("/wallet/{wallet_address}", response_model=Dict[str, Any])
async def get_wallet_info(
    wallet_address: str,
    blockchain_service: SolanaBlockchainService = Depends(get_blockchain_service)
):
    """Ottiene informazioni wallet e bilanci."""
    try:
        balance_result = await blockchain_service.get_token_balance(wallet_address)
        
        if not balance_result["success"]:
            raise HTTPException(status_code=400, detail=balance_result["error"])
        
        return {
            "success": True,
            "wallet_info": balance_result["data"]
        }
        
    except Exception as e:
        logger.error(f"Error getting wallet info: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# ==================== TOURNAMENTS ====================

@router.post("/tournaments/create")
async def create_tournament(
    request: TournamentCreateRequest,
    blockchain_service: SolanaBlockchainService = Depends(get_blockchain_service)
):
    """Crea nuovo torneo sulla blockchain."""
    try:
        result = await blockchain_service.create_tournament(
            organizer_wallet=request.organizer_wallet,
            buy_in=request.buy_in,
            max_players=request.max_players,
            tournament_name=request.tournament_name,
            start_time=request.start_time
        )
        
        if not result["success"]:
            raise HTTPException(status_code=400, detail=result["error"])
        
        return result
        
    except Exception as e:
        logger.error(f"Error creating tournament: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/tournaments/register")
async def register_for_tournament(
    request: TournamentRegistrationRequest,
    blockchain_service: SolanaBlockchainService = Depends(get_blockchain_service)
):
    """Registra giocatore a torneo."""
    try:
        result = await blockchain_service.register_for_tournament(
            tournament_id=request.tournament_id,
            player_wallet=request.player_wallet
        )
        
        if not result["success"]:
            raise HTTPException(status_code=400, detail=result["error"])
        
        return result
        
    except Exception as e:
        logger.error(f"Error registering for tournament: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/tournaments")
async def get_all_tournaments(
    blockchain_service: SolanaBlockchainService = Depends(get_blockchain_service)
):
    """Ottiene tutti i tornei dalla blockchain."""
    try:
        tournaments = await blockchain_service.get_all_tournaments()
        return {
            "success": True,
            "tournaments": tournaments,
            "count": len(tournaments)
        }
        
    except Exception as e:
        logger.error(f"Error getting tournaments: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/tournaments/{tournament_id}")
async def get_tournament_by_id(
    tournament_id: int,
    blockchain_service: SolanaBlockchainService = Depends(get_blockchain_service)
):
    """Ottiene torneo specifico per ID."""
    try:
        tournament = await blockchain_service.get_tournament_by_id(tournament_id)
        
        if not tournament:
            raise HTTPException(status_code=404, detail="Tournament not found")
        
        return {
            "success": True,
            "tournament": tournament
        }
        
    except Exception as e:
        logger.error(f"Error getting tournament: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# ==================== STAKING ====================

@router.post("/staking/pools/create")
async def create_staking_pool(
    request: StakingPoolCreateRequest,
    blockchain_service: SolanaBlockchainService = Depends(get_blockchain_service)
):
    """Crea nuovo pool di staking."""
    try:
        result = await blockchain_service.create_staking_pool(
            creator_wallet=request.creator_wallet,
            apy=request.apy,
            lock_period_days=request.lock_period_days,
            max_stake_amount=request.max_stake_amount
        )
        
        if not result["success"]:
            raise HTTPException(status_code=400, detail=result["error"])
        
        return result
        
    except Exception as e:
        logger.error(f"Error creating staking pool: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/staking/stake")
async def stake_tokens(
    request: StakeTokensRequest,
    blockchain_service: SolanaBlockchainService = Depends(get_blockchain_service)
):
    """Stake token in pool."""
    try:
        result = await blockchain_service.stake_tokens(
            pool_id=request.pool_id,
            staker_wallet=request.staker_wallet,
            amount=request.amount
        )
        
        if not result["success"]:
            raise HTTPException(status_code=400, detail=result["error"])
        
        return result
        
    except Exception as e:
        logger.error(f"Error staking tokens: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/staking/pools")
async def get_all_staking_pools(
    blockchain_service: SolanaBlockchainService = Depends(get_blockchain_service)
):
    """Ottiene tutti i pool di staking."""
    try:
        pools = await blockchain_service.get_all_staking_pools()
        return {
            "success": True,
            "pools": pools,
            "count": len(pools)
        }
        
    except Exception as e:
        logger.error(f"Error getting staking pools: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/staking/pools/{pool_id}")
async def get_staking_pool_by_id(
    pool_id: int,
    blockchain_service: SolanaBlockchainService = Depends(get_blockchain_service)
):
    """Ottiene pool di staking specifico."""
    try:
        pool = await blockchain_service.get_staking_pool_by_id(pool_id)
        
        if not pool:
            raise HTTPException(status_code=404, detail="Staking pool not found")
        
        return {
            "success": True,
            "pool": pool
        }
        
    except Exception as e:
        logger.error(f"Error getting staking pool: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# ==================== GOVERNANCE ====================

@router.post("/governance/proposals/create")
async def create_governance_proposal(
    request: GovernanceProposalRequest,
    blockchain_service: SolanaBlockchainService = Depends(get_blockchain_service)
):
    """Crea nuova proposta governance."""
    try:
        result = await blockchain_service.create_proposal(
            proposer_wallet=request.proposer_wallet,
            title=request.title,
            description=request.description,
            voting_period_days=request.voting_period_days
        )
        
        if not result["success"]:
            raise HTTPException(status_code=400, detail=result["error"])
        
        return result
        
    except Exception as e:
        logger.error(f"Error creating proposal: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/governance/proposals/vote")
async def vote_on_proposal(
    request: VoteRequest,
    blockchain_service: SolanaBlockchainService = Depends(get_blockchain_service)
):
    """Vota su proposta governance."""
    try:
        result = await blockchain_service.vote_on_proposal(
            proposal_id=request.proposal_id,
            voter_wallet=request.voter_wallet,
            vote=request.vote,
            voting_power=request.voting_power
        )
        
        if not result["success"]:
            raise HTTPException(status_code=400, detail=result["error"])
        
        return result
        
    except Exception as e:
        logger.error(f"Error voting on proposal: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/governance/proposals")
async def get_all_proposals(
    blockchain_service: SolanaBlockchainService = Depends(get_blockchain_service)
):
    """Ottiene tutte le proposte governance."""
    try:
        proposals = await blockchain_service.get_all_proposals()
        return {
            "success": True,
            "proposals": proposals,
            "count": len(proposals)
        }
        
    except Exception as e:
        logger.error(f"Error getting proposals: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/governance/proposals/{proposal_id}")
async def get_proposal_by_id(
    proposal_id: int,
    blockchain_service: SolanaBlockchainService = Depends(get_blockchain_service)
):
    """Ottiene proposta specifica per ID."""
    try:
        proposal = await blockchain_service.get_proposal_by_id(proposal_id)
        
        if not proposal:
            raise HTTPException(status_code=404, detail="Proposal not found")
        
        return {
            "success": True,
            "proposal": proposal
        }
        
    except Exception as e:
        logger.error(f"Error getting proposal: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# ==================== TOKEN OPERATIONS ====================

@router.post("/tokens/transfer")
async def transfer_tokens(
    request: TokenTransferRequest,
    blockchain_service: SolanaBlockchainService = Depends(get_blockchain_service)
):
    """Trasferisce token SOLP."""
    try:
        result = await blockchain_service.transfer_tokens(
            from_wallet=request.from_wallet,
            to_wallet=request.to_wallet,
            amount=request.amount
        )
        
        if not result["success"]:
            raise HTTPException(status_code=400, detail=result["error"])
        
        return result
        
    except Exception as e:
        logger.error(f"Error transferring tokens: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# ==================== ANALYTICS ====================

@router.get("/analytics/summary")
async def get_platform_analytics(
    blockchain_service: SolanaBlockchainService = Depends(get_blockchain_service)
):
    """Ottiene analytics piattaforma."""
    try:
        # Ottieni dati da tutti i contratti
        tournaments = await blockchain_service.get_all_tournaments()
        staking_pools = await blockchain_service.get_all_staking_pools()
        proposals = await blockchain_service.get_all_proposals()
        
        # Calcola statistiche
        total_tournaments = len(tournaments)
        active_tournaments = len([t for t in tournaments if t["status"] == "registration_open"])
        total_prize_pool = sum(t["prize_pool"] for t in tournaments)
        
        total_staking_pools = len(staking_pools)
        total_staked = sum(p["total_staked"] for p in staking_pools)
        active_stakers = sum(p["active_stakers"] for p in staking_pools)
        
        total_proposals = len(proposals)
        active_proposals = len([p for p in proposals if p["status"] == "active"])
        
        analytics = {
            "tournaments": {
                "total": total_tournaments,
                "active": active_tournaments,
                "total_prize_pool": total_prize_pool
            },
            "staking": {
                "total_pools": total_staking_pools,
                "total_staked": total_staked,
                "active_stakers": active_stakers
            },
            "governance": {
                "total_proposals": total_proposals,
                "active_proposals": active_proposals
            },
            "last_updated": int(datetime.now().timestamp())
        }
        
        return {
            "success": True,
            "analytics": analytics
        }
        
    except Exception as e:
        logger.error(f"Error getting analytics: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# ==================== CACHE MANAGEMENT ====================

@router.post("/cache/clear")
async def clear_cache(
    blockchain_service: SolanaBlockchainService = Depends(get_blockchain_service)
):
    """Pulisce cache servizio blockchain."""
    try:
        await blockchain_service.clear_cache()
        return {
            "success": True,
            "message": "Cache cleared successfully"
        }
        
    except Exception as e:
        logger.error(f"Error clearing cache: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

