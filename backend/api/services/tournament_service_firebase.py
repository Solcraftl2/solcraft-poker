"""
Tournament service for SolCraft L2 backend - Firebase Integration.
Implementato con PyCharm Professional per massima qualità.
"""
from typing import List, Optional, Dict, Any
from uuid import UUID
import logging
from datetime import datetime
from ..config.database import get_firestore_client, get_firebase_auth
from ..models.tournament_models import RANKING_CONFIG

logger = logging.getLogger(__name__)

class TournamentService:
    def __init__(self):
        self.db = get_firestore_client()
        self.auth = get_firebase_auth()

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
            now = datetime.now()
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
            
            # Insert tournament into Firestore
            doc_ref, doc_id = self.db.collection("tournaments").add(tournament_dict)
            tournament_dict["id"] = doc_id
            
            logger.info(f"Tournament created with ID: {doc_id}")
            return tournament_dict
            
        except Exception as e:
            logger.error(f"Error in create_tournament: {str(e)}")
            raise

    def get_tournaments(self, status: Optional[str] = None, creator_id: Optional[str] = None):
        """Get tournaments with optional filters."""
        try:
            query = self.db.collection("tournaments")
            
            if status:
                query = query.where("status", "==", status)
            
            if creator_id:
                query = query.where("creator_user_id", "==", creator_id)
            
            docs = query.order_by("created_at", direction="desc").get()
            
            tournaments = []
            for doc in docs:
                tournament_data = doc.to_dict()
                tournament_data["id"] = doc.id
                tournaments.append(tournament_data)
            
            return tournaments
            
        except Exception as e:
            logger.error(f"Error in get_tournaments: {str(e)}")
            raise

    def get_tournament_by_id(self, tournament_id: str):
        """Get a specific tournament by ID."""
        try:
            doc_ref = self.db.collection("tournaments").document(tournament_id)
            doc = doc_ref.get()
            
            if not doc.exists:
                return None
            
            tournament_data = doc.to_dict()
            tournament_data["id"] = doc.id
            return tournament_data
            
        except Exception as e:
            logger.error(f"Error in get_tournament_by_id: {str(e)}")
            raise

    def update_tournament(self, tournament_id: str, update_data: Dict[str, Any]):
        """Update a tournament."""
        try:
            update_data["updated_at"] = datetime.now()
            
            doc_ref = self.db.collection("tournaments").document(tournament_id)
            doc_ref.update(update_data)
            
            # Get updated document
            updated_doc = doc_ref.get()
            if updated_doc.exists:
                tournament_data = updated_doc.to_dict()
                tournament_data["id"] = updated_doc.id
                return tournament_data
            
            return None
            
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

    def _create_notification(self, user_id: str, notification_type: str, content: Dict[str, Any]):
        """Create a notification for a user."""
        try:
            notification_data = {
                "user_id": user_id,
                "type": notification_type,
                "content": content,
                "read": False,
                "created_at": datetime.now()
            }
            
            self.db.collection("notifications").add(notification_data)
            
        except Exception as e:
            logger.error(f"Error creating notification: {str(e)}")

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

