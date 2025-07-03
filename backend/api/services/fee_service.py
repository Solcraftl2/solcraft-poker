"""
Fee service for SolCraft L2.
"""
from typing import Dict, Any, Optional
from uuid import UUID
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

class FeeService:
    def __init__(self, supabase):
        self.supabase = supabase

    async def process_initial_fee_payment(self, tournament_id: UUID, transaction_hash: Optional[str] = None):
        """Process the payment of the initial platform fee."""
        try:
            # Recupera il torneo
            response = self.supabase.table("tournaments").select("*").eq("id", str(tournament_id)).single().execute()
            
            if "error" in response:
                raise Exception(f"Error getting tournament: {response['error']}")
            
            tournament = response["data"]
            
            # Verifica che il torneo sia in attesa di pagamento della commissione iniziale
            if tournament["status"] != "pending_initial_payment":
                raise Exception(f"Tournament is not pending initial payment (current status: {tournament['status']})")
            
            # Verifica che la commissione non sia già stata pagata
            if tournament["initial_platform_fee_paid"]:
                raise Exception("Initial fee has already been paid")
            
            # Registra il pagamento della commissione
            now = datetime.now().isoformat()
            fee_data = {
                "tournament_id": str(tournament_id),
                "fee_type": "initial",
                "amount": tournament["initial_platform_fee_amount"],
                "percentage": tournament["initial_platform_fee_pct"],
                "status": "paid",
                "transaction_hash": transaction_hash,
                "created_at": now,
                "updated_at": now
            }
            
            fee_response = self.supabase.table("platform_fees").insert(fee_data).execute()
            
            if "error" in fee_response:
                raise Exception(f"Error creating fee record: {fee_response['error']}")
            
            # Aggiorna lo stato del torneo
            update_data = {
                "initial_platform_fee_paid": True,
                "status": "pending_guarantee",
                "updated_at": now
            }
            
            update_response = self.supabase.table("tournaments").update(update_data).eq("id", str(tournament_id)).execute()
            
            if "error" in update_response:
                raise Exception(f"Error updating tournament: {update_response['error']}")
            
            updated_tournament = update_response["data"][0]
            
            # Crea una notifica per il creatore del torneo
            notification_data = {
                "user_id": tournament["creator_user_id"],
                "type": "initial_fee_paid",
                "content": {
                    "tournament_id": str(tournament_id),
                    "tournament_name": tournament["name"],
                    "fee_amount": tournament["initial_platform_fee_amount"],
                    "fee_percentage": tournament["initial_platform_fee_pct"]
                },
                "read": False,
                "created_at": now
            }
            
            self.supabase.table("notifications").insert(notification_data).execute()
            
            # Crea una notifica per richiedere il deposito della garanzia
            guarantee_notification_data = {
                "user_id": tournament["creator_user_id"],
                "type": "guarantee_required",
                "content": {
                    "tournament_id": str(tournament_id),
                    "tournament_name": tournament["name"],
                    "guarantee_amount": tournament["player_guarantee_amount_required"],
                    "guarantee_percentage": tournament["player_guarantee_pct"]
                },
                "read": False,
                "created_at": now
            }
            
            self.supabase.table("notifications").insert(guarantee_notification_data).execute()
            
            return updated_tournament
        except Exception as e:
            logger.error(f"Error in process_initial_fee_payment: {str(e)}")
            raise

    async def process_winnings_fee_payment(self, tournament_id: UUID, amount: float, transaction_hash: Optional[str] = None):
        """Process the payment of the platform fee on winnings."""
        try:
            # Recupera il torneo
            response = self.supabase.table("tournaments").select("*").eq("id", str(tournament_id)).single().execute()
            
            if "error" in response:
                raise Exception(f"Error getting tournament: {response['error']}")
            
            tournament = response["data"]
            
            # Verifica che il torneo sia completato con vincita
            if tournament["status"] != "completed_won":
                raise Exception(f"Tournament is not completed with win (current status: {tournament['status']})")
            
            # Verifica che l'importo sia corretto
            expected_fee = tournament.get("platform_winnings_fee_amount")
            if expected_fee and abs(amount - expected_fee) > 0.001:  # Tolleranza per errori di arrotondamento
                raise Exception(f"Incorrect fee amount. Expected: {expected_fee}, Got: {amount}")
            
            # Registra il pagamento della commissione
            now = datetime.now().isoformat()
            fee_data = {
                "tournament_id": str(tournament_id),
                "fee_type": "winnings",
                "amount": amount,
                "percentage": tournament["winnings_platform_fee_pct"],
                "status": "paid",
                "transaction_hash": transaction_hash,
                "created_at": now,
                "updated_at": now
            }
            
            fee_response = self.supabase.table("platform_fees").insert(fee_data).execute()
            
            if "error" in fee_response:
                raise Exception(f"Error creating fee record: {fee_response['error']}")
            
            # Aggiorna il torneo (nessun cambio di stato, solo aggiornamento timestamp)
            update_data = {
                "updated_at": now
            }
            
            update_response = self.supabase.table("tournaments").update(update_data).eq("id", str(tournament_id)).execute()
            
            if "error" in update_response:
                raise Exception(f"Error updating tournament: {update_response['error']}")
            
            updated_tournament = update_response["data"][0]
            
            # Crea una notifica per il creatore del torneo
            notification_data = {
                "user_id": tournament["creator_user_id"],
                "type": "winnings_fee_paid",
                "content": {
                    "tournament_id": str(tournament_id),
                    "tournament_name": tournament["name"],
                    "fee_amount": amount,
                    "fee_percentage": tournament["winnings_platform_fee_pct"]
                },
                "read": False,
                "created_at": now
            }
            
            self.supabase.table("notifications").insert(notification_data).execute()
            
            return updated_tournament
        except Exception as e:
            logger.error(f"Error in process_winnings_fee_payment: {str(e)}")
            raise

    async def get_platform_fees(self, tournament_id: Optional[UUID] = None, fee_type: Optional[str] = None):
        """Get platform fees with optional filters."""
        try:
            query = self.supabase.table("platform_fees")
            
            if tournament_id:
                query = query.eq("tournament_id", str(tournament_id))
            
            if fee_type:
                query = query.eq("fee_type", fee_type)
            
            response = query.order("created_at", desc=True).execute()
            
            if "error" in response:
                raise Exception(f"Error getting fees: {response['error']}")
            
            return response["data"]
        except Exception as e:
            logger.error(f"Error in get_platform_fees: {str(e)}")
            raise

    async def get_fee_statistics(self):
        """Get statistics about platform fees."""
        try:
            # Recupera tutte le commissioni pagate
            response = self.supabase.table("platform_fees").select("*").eq("status", "paid").execute()
            
            if "error" in response:
                raise Exception(f"Error getting fees: {response['error']}")
            
            fees = response["data"]
            
            # Calcola le statistiche
            initial_fees = [fee for fee in fees if fee["fee_type"] == "initial"]
            winnings_fees = [fee for fee in fees if fee["fee_type"] == "winnings"]
            
            total_initial_fees = sum(fee["amount"] for fee in initial_fees)
            total_winnings_fees = sum(fee["amount"] for fee in winnings_fees)
            total_fees = total_initial_fees + total_winnings_fees
            
            # Raggruppa per mese
            fees_by_month = {}
            for fee in fees:
                date = datetime.fromisoformat(fee["created_at"].replace("Z", "+00:00"))
                month_key = f"{date.year}-{date.month:02d}"
                
                if month_key not in fees_by_month:
                    fees_by_month[month_key] = 0
                
                fees_by_month[month_key] += fee["amount"]
            
            # Converti in lista di dizionari
            fees_by_month_list = [{"month": k, "amount": v} for k, v in fees_by_month.items()]
            fees_by_month_list.sort(key=lambda x: x["month"])
            
            return {
                "totalInitialFees": total_initial_fees,
                "totalWinningsFees": total_winnings_fees,
                "totalFees": total_fees,
                "feesByMonth": fees_by_month_list
            }
        except Exception as e:
            logger.error(f"Error in get_fee_statistics: {str(e)}")
            raise
