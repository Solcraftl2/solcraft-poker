"""
Guarantee service for SolCraft L2.
"""
from typing import Dict, Any, Optional
from uuid import UUID
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

class GuaranteeService:
    def __init__(self, supabase):
        self.supabase = supabase

    async def process_guarantee_payment(self, tournament_id: UUID, player_id: str, transaction_hash: Optional[str] = None):
        """Process the payment of the player guarantee."""
        try:
            # Recupera il torneo
            response = self.supabase.table("tournaments").select("*").eq("id", str(tournament_id)).single().execute()
            
            if "error" in response:
                raise Exception(f"Error getting tournament: {response['error']}")
            
            tournament = response["data"]
            
            # Verifica che il torneo sia in attesa di garanzia
            if tournament["status"] != "pending_guarantee":
                raise Exception(f"Tournament is not pending guarantee (current status: {tournament['status']})")
            
            # Verifica che la garanzia non sia già stata pagata
            if tournament["player_guarantee_paid"]:
                raise Exception("Guarantee has already been paid")
            
            # Registra il pagamento della garanzia
            now = datetime.now().isoformat()
            guarantee_data = {
                "tournament_id": str(tournament_id),
                "player_id": player_id,
                "amount": tournament["player_guarantee_amount_required"],
                "percentage": tournament["player_guarantee_pct"],
                "status": "active",
                "transaction_hash": transaction_hash,
                "created_at": now,
                "updated_at": now
            }
            
            guarantee_response = self.supabase.table("player_guarantees").insert(guarantee_data).execute()
            
            if "error" in guarantee_response:
                raise Exception(f"Error creating guarantee record: {guarantee_response['error']}")
            
            # Aggiorna lo stato del torneo
            update_data = {
                "player_guarantee_paid": True,
                "status": "funding_open",
                "updated_at": now
            }
            
            update_response = self.supabase.table("tournaments").update(update_data).eq("id", str(tournament_id)).execute()
            
            if "error" in update_response:
                raise Exception(f"Error updating tournament: {update_response['error']}")
            
            updated_tournament = update_response["data"][0]
            
            # Crea una notifica per il creatore del torneo
            notification_data = {
                "user_id": player_id,
                "type": "guarantee_paid",
                "content": {
                    "tournament_id": str(tournament_id),
                    "tournament_name": tournament["name"],
                    "guarantee_amount": tournament["player_guarantee_amount_required"],
                    "guarantee_percentage": tournament["player_guarantee_pct"]
                },
                "read": False,
                "created_at": now
            }
            
            self.supabase.table("notifications").insert(notification_data).execute()
            
            # Crea una notifica per l'inizio della raccolta fondi
            funding_notification_data = {
                "user_id": player_id,
                "type": "funding_started",
                "content": {
                    "tournament_id": str(tournament_id),
                    "tournament_name": tournament["name"],
                    "target_pool_amount": tournament["target_pool_amount"]
                },
                "read": False,
                "created_at": now
            }
            
            self.supabase.table("notifications").insert(funding_notification_data).execute()
            
            return updated_tournament
        except Exception as e:
            logger.error(f"Error in process_guarantee_payment: {str(e)}")
            raise

    async def return_guarantee(self, tournament_id: UUID, player_id: str):
        """Return the guarantee to the player."""
        try:
            # Recupera la garanzia
            response = self.supabase.table("player_guarantees").select("*").eq("tournament_id", str(tournament_id)).eq("player_id", player_id).single().execute()
            
            if "error" in response:
                raise Exception(f"Error getting guarantee: {response['error']}")
            
            guarantee = response["data"]
            
            # Verifica che la garanzia sia attiva
            if guarantee["status"] != "active":
                raise Exception(f"Guarantee is not active (current status: {guarantee['status']})")
            
            # Aggiorna lo stato della garanzia
            now = datetime.now().isoformat()
            update_data = {
                "status": "returned",
                "updated_at": now
            }
            
            update_response = self.supabase.table("player_guarantees").update(update_data).eq("id", guarantee["id"]).execute()
            
            if "error" in update_response:
                raise Exception(f"Error updating guarantee: {update_response['error']}")
            
            updated_guarantee = update_response["data"][0]
            
            # Crea una notifica per il giocatore
            notification_data = {
                "user_id": player_id,
                "type": "guarantee_returned",
                "content": {
                    "tournament_id": str(tournament_id),
                    "guarantee_amount": guarantee["amount"],
                    "guarantee_percentage": guarantee["percentage"]
                },
                "read": False,
                "created_at": now
            }
            
            self.supabase.table("notifications").insert(notification_data).execute()
            
            return updated_guarantee
        except Exception as e:
            logger.error(f"Error in return_guarantee: {str(e)}")
            raise

    async def forfeit_guarantee(self, tournament_id: UUID, player_id: str, reason: str):
        """Forfeit the player's guarantee."""
        try:
            # Recupera la garanzia
            response = self.supabase.table("player_guarantees").select("*").eq("tournament_id", str(tournament_id)).eq("player_id", player_id).single().execute()
            
            if "error" in response:
                raise Exception(f"Error getting guarantee: {response['error']}")
            
            guarantee = response["data"]
            
            # Verifica che la garanzia sia attiva
            if guarantee["status"] != "active":
                raise Exception(f"Guarantee is not active (current status: {guarantee['status']})")
            
            # Aggiorna lo stato della garanzia
            now = datetime.now().isoformat()
            update_data = {
                "status": "forfeited",
                "updated_at": now
            }
            
            update_response = self.supabase.table("player_guarantees").update(update_data).eq("id", guarantee["id"]).execute()
            
            if "error" in update_response:
                raise Exception(f"Error updating guarantee: {update_response['error']}")
            
            updated_guarantee = update_response["data"][0]
            
            # Registra il motivo dell'escussione
            forfeit_data = {
                "guarantee_id": guarantee["id"],
                "tournament_id": str(tournament_id),
                "player_id": player_id,
                "reason": reason,
                "created_at": now
            }
            
            self.supabase.table("guarantee_forfeits").insert(forfeit_data).execute()
            
            # Crea una notifica per il giocatore
            notification_data = {
                "user_id": player_id,
                "type": "guarantee_forfeited",
                "content": {
                    "tournament_id": str(tournament_id),
                    "guarantee_amount": guarantee["amount"],
                    "guarantee_percentage": guarantee["percentage"],
                    "reason": reason
                },
                "read": False,
                "created_at": now
            }
            
            self.supabase.table("notifications").insert(notification_data).execute()
            
            return updated_guarantee
        except Exception as e:
            logger.error(f"Error in forfeit_guarantee: {str(e)}")
            raise

    async def get_player_guarantees(self, player_id: str, status: Optional[str] = None):
        """Get guarantees for a player with optional status filter."""
        try:
            query = self.supabase.table("player_guarantees").select("*").eq("player_id", player_id)
            
            if status:
                query = query.eq("status", status)
            
            response = query.order("created_at", desc=True).execute()
            
            if "error" in response:
                raise Exception(f"Error getting guarantees: {response['error']}")
            
            return response["data"]
        except Exception as e:
            logger.error(f"Error in get_player_guarantees: {str(e)}")
            raise

    async def get_tournament_guarantee(self, tournament_id: UUID):
        """Get the guarantee for a specific tournament."""
        try:
            response = self.supabase.table("player_guarantees").select("*").eq("tournament_id", str(tournament_id)).single().execute()
            
            if "error" in response:
                return None
            
            return response["data"]
        except Exception as e:
            logger.error(f"Error in get_tournament_guarantee: {str(e)}")
            raise
