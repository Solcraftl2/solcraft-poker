"""
Corrected tournament service for SolCraft L2 backend.
"""
from typing import List, Optional, Dict, Any
from uuid import UUID
import logging
from datetime import datetime
from ..config.database import get_supabase_client
from ..models.tournament_models import RANKING_CONFIG

logger = logging.getLogger(__name__)

class TournamentService:
    def __init__(self):
        self.supabase = get_supabase_client()

    def create_tournament(
        self,
        tournament_data,
        creator_user_id: str,
        player_ranking: str,
        initial_fee_pct: float,
        initial_fee_amount: float,
        guarantee_pct: float,
        guarantee_amount: float,
        winnings_fee_pct: float
    ):
        """Create a new tournament."""
        try:
            # Prepare tournament data
            now = datetime.now().isoformat()
            tournament_dict = tournament_data.dict()
            tournament_dict.update({
                "creator_user_id": creator_user_id,
                "player_ranking_at_creation": player_ranking,
                "status": "pending_initial_payment",
                "initial_platform_fee_pct": initial_fee_pct,
                "initial_platform_fee_amount": initial_fee_amount,
                "initial_platform_fee_paid": False,
                "player_guarantee_pct": guarantee_pct,
                "player_guarantee_amount_required": guarantee_amount,
                "player_guarantee_paid": False,
                "winnings_platform_fee_pct": winnings_fee_pct,
                "current_pool_amount": 0,
                "created_at": now,
                "updated_at": now
            })
            
            # Insert tournament into database
            response = self.supabase.table("tournaments").insert(tournament_dict).execute()
            
            if response.error:
                raise Exception(f"Error creating tournament: {response.error}")
            
            return response.data[0]
        except Exception as e:
            logger.error(f"Error in create_tournament: {str(e)}")
            raise

    def get_tournaments(self, status: Optional[str] = None, creator_id: Optional[str] = None):
        """Get tournaments with optional filters."""
        try:
            query = self.supabase.table("tournaments").select("*")
            
            if status:
                query = query.eq("status", status)
            
            if creator_id:
                query = query.eq("creator_user_id", creator_id)
            
            response = query.order("created_at", desc=True).execute()
            
            if response.error:
                raise Exception(f"Error getting tournaments: {response.error}")
            
            return response.data
        except Exception as e:
            logger.error(f"Error in get_tournaments: {str(e)}")
            raise

    def get_tournament_by_id(self, tournament_id: str):
        """Get a specific tournament by ID."""
        try:
            response = self.supabase.table("tournaments").select("*").eq("id", tournament_id).single().execute()
            
            if response.error:
                raise Exception(f"Error getting tournament: {response.error}")
            
            return response.data
        except Exception as e:
            logger.error(f"Error in get_tournament_by_id: {str(e)}")
            raise

    def update_tournament(self, tournament_id: str, update_data: Dict[str, Any]):
        """Update a tournament."""
        try:
            update_data["updated_at"] = datetime.now().isoformat()
            
            response = self.supabase.table("tournaments").update(update_data).eq("id", tournament_id).execute()
            
            if response.error:
                raise Exception(f"Error updating tournament: {response.error}")
            
            return response.data[0] if response.data else None
        except Exception as e:
            logger.error(f"Error in update_tournament: {str(e)}")
            raise

    def pay_initial_fee(self, tournament_id: str, transaction_hash: Optional[str] = None):
        """Process initial fee payment for a tournament."""
        try:
            # Get tournament
            tournament = self.get_tournament_by_id(tournament_id)
            if not tournament:
                raise Exception("Tournament not found")
            
            # Verify tournament status
            if tournament["status"] != "pending_initial_payment":
                raise Exception(f"Tournament is not pending initial payment (current status: {tournament['status']})")
            
            # Update tournament
            update_data = {
                "initial_platform_fee_paid": True,
                "status": "pending_guarantee"
            }
            
            if transaction_hash:
                update_data["initial_fee_transaction_hash"] = transaction_hash
            
            updated_tournament = self.update_tournament(tournament_id, update_data)
            
            # Create notification
            self._create_notification(
                tournament["creator_user_id"],
                "initial_fee_paid",
                {
                    "tournament_id": tournament_id,
                    "tournament_name": tournament["name"],
                    "fee_amount": tournament["initial_platform_fee_amount"]
                }
            )
            
            return updated_tournament
        except Exception as e:
            logger.error(f"Error in pay_initial_fee: {str(e)}")
            raise

    def pay_guarantee(self, tournament_id: str, transaction_hash: Optional[str] = None):
        """Process guarantee payment for a tournament."""
        try:
            # Get tournament
            tournament = self.get_tournament_by_id(tournament_id)
            if not tournament:
                raise Exception("Tournament not found")
            
            # Verify tournament status
            if tournament["status"] != "pending_guarantee":
                raise Exception(f"Tournament is not pending guarantee (current status: {tournament['status']})")
            
            # Update tournament
            update_data = {
                "player_guarantee_paid": True,
                "status": "funding_open",
                "funding_start_time": datetime.now().isoformat()
            }
            
            if transaction_hash:
                update_data["guarantee_transaction_hash"] = transaction_hash
            
            updated_tournament = self.update_tournament(tournament_id, update_data)
            
            # Create notification
            self._create_notification(
                tournament["creator_user_id"],
                "guarantee_paid",
                {
                    "tournament_id": tournament_id,
                    "tournament_name": tournament["name"],
                    "guarantee_amount": tournament["player_guarantee_amount_required"]
                }
            )
            
            return updated_tournament
        except Exception as e:
            logger.error(f"Error in pay_guarantee: {str(e)}")
            raise

    def process_investment(self, tournament_id: str, investor_id: str, amount: float):
        """Process an investment in a tournament."""
        try:
            # Get tournament
            tournament = self.get_tournament_by_id(tournament_id)
            if not tournament:
                raise Exception("Tournament not found")
            
            # Verify tournament status
            if tournament["status"] != "funding_open":
                raise Exception(f"Tournament is not in funding phase (current status: {tournament['status']})")
            
            # Check if funding period has ended
            if tournament.get("funding_end_time"):
                funding_end = datetime.fromisoformat(tournament["funding_end_time"])
                if datetime.now() > funding_end:
                    # Update tournament status to funding_failed
                    self.update_tournament(tournament_id, {"status": "funding_failed"})
                    raise Exception("Funding period has ended")
            
            # Calculate percentage of pool
            percentage_of_pool = amount / tournament["target_pool_amount"]
            
            # Check if investment would exceed target
            new_pool_amount = tournament["current_pool_amount"] + amount
            if new_pool_amount > tournament["target_pool_amount"]:
                raise Exception("Investment would exceed target pool amount")
            
            # Insert investment
            now = datetime.now().isoformat()
            investment_data = {
                "tournament_id": tournament_id,
                "investor_id": investor_id,
                "amount": amount,
                "percentage_of_pool": percentage_of_pool,
                "status": "active",
                "created_at": now,
                "updated_at": now
            }
            
            response = self.supabase.table("tournament_investments").insert(investment_data).execute()
            
            if response.error:
                raise Exception(f"Error creating investment: {response.error}")
            
            # Update tournament pool amount
            update_data = {
                "current_pool_amount": new_pool_amount,
                "updated_at": now
            }
            
            # If pool is full, update tournament status
            if new_pool_amount >= tournament["target_pool_amount"]:
                update_data["status"] = "funding_complete"
            
            updated_tournament = self.update_tournament(tournament_id, update_data)
            
            # Create notifications
            self._create_notification(
                investor_id,
                "investment_confirmed",
                {
                    "tournament_id": tournament_id,
                    "tournament_name": tournament["name"],
                    "amount": amount,
                    "percentage_of_pool": percentage_of_pool
                }
            )
            
            # Notify creator if funding is complete
            if new_pool_amount >= tournament["target_pool_amount"]:
                self._create_notification(
                    tournament["creator_user_id"],
                    "funding_complete",
                    {
                        "tournament_id": tournament_id,
                        "tournament_name": tournament["name"],
                        "pool_amount": new_pool_amount
                    }
                )
            
            return updated_tournament
        except Exception as e:
            logger.error(f"Error in process_investment: {str(e)}")
            raise

    def process_tournament_results(
        self,
        tournament_id: str,
        won: bool,
        total_winnings: Optional[float] = None,
        proof_url: Optional[str] = None,
        notes: Optional[str] = None
    ):
        """Process the results of a tournament."""
        try:
            # Get tournament
            tournament = self.get_tournament_by_id(tournament_id)
            if not tournament:
                raise Exception("Tournament not found")
            
            # Verify tournament status
            if tournament["status"] != "awaiting_results":
                raise Exception(f"Tournament is not awaiting results (current status: {tournament['status']})")
            
            # Prepare update data
            now = datetime.now().isoformat()
            update_data = {
                "status": "completed_won" if won else "completed_lost",
                "updated_at": now
            }
            
            # If tournament was won, calculate winnings distribution
            if won and total_winnings:
                winnings_fee_pct = tournament["winnings_platform_fee_pct"]
                platform_fee_amount = total_winnings * winnings_fee_pct
                net_winnings = total_winnings - platform_fee_amount
                
                update_data.update({
                    "total_winnings_from_tournament": total_winnings,
                    "platform_winnings_fee_amount": platform_fee_amount,
                    "net_winnings_for_investors": net_winnings
                })
            
            # Update tournament
            updated_tournament = self.update_tournament(tournament_id, update_data)
            
            # Record tournament results
            results_data = {
                "tournament_id": tournament_id,
                "won": won,
                "total_winnings": total_winnings,
                "proof_url": proof_url,
                "notes": notes,
                "created_at": now
            }
            
            self.supabase.table("tournament_results").insert(results_data).execute()
            
            # Notify all investors
            self._notify_investors_of_results(tournament_id, tournament["name"], won, total_winnings)
            
            return updated_tournament
        except Exception as e:
            logger.error(f"Error in process_tournament_results: {str(e)}")
            raise

    def _create_notification(self, user_id: str, notification_type: str, content: Dict[str, Any]):
        """Create a notification for a user."""
        try:
            notification_data = {
                "user_id": user_id,
                "type": notification_type,
                "content": content,
                "read": False,
                "created_at": datetime.now().isoformat()
            }
            
            self.supabase.table("notifications").insert(notification_data).execute()
        except Exception as e:
            logger.error(f"Error creating notification: {str(e)}")

    def _notify_investors_of_results(self, tournament_id: str, tournament_name: str, won: bool, total_winnings: Optional[float]):
        """Notify all investors of tournament results."""
        try:
            # Get all investments for this tournament
            response = self.supabase.table("tournament_investments").select("investor_id").eq("tournament_id", tournament_id).execute()
            
            if response.error:
                logger.error(f"Error getting investments for notifications: {response.error}")
                return
            
            investments = response.data
            
            for investment in investments:
                self._create_notification(
                    investment["investor_id"],
                    "tournament_results_submitted",
                    {
                        "tournament_id": tournament_id,
                        "tournament_name": tournament_name,
                        "won": won,
                        "total_winnings": total_winnings if won else None
                    }
                )
        except Exception as e:
            logger.error(f"Error notifying investors: {str(e)}")

    def calculate_fees_for_ranking(self, player_ranking: str, target_pool_amount: float):
        """Calculate fees based on player ranking."""
        try:
            if player_ranking not in RANKING_CONFIG:
                raise ValueError(f"Invalid player ranking: {player_ranking}")
            
            config = RANKING_CONFIG[player_ranking]
            
            initial_fee_pct = config["initialFeePct"]
            initial_fee_amount = target_pool_amount * initial_fee_pct
            
            guarantee_pct = config["guaranteePct"]
            guarantee_amount = target_pool_amount * guarantee_pct
            
            winnings_fee_pct = config["winningsFeePct"]
            
            return {
                "initial_fee_pct": initial_fee_pct,
                "initial_fee_amount": initial_fee_amount,
                "guarantee_pct": guarantee_pct,
                "guarantee_amount": guarantee_amount,
                "winnings_fee_pct": winnings_fee_pct
            }
        except Exception as e:
            logger.error(f"Error calculating fees: {str(e)}")
            raise

