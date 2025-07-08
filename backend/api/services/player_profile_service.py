"""
Player profile service for SolCraft L2.
"""
from typing import Dict, Any, Optional
from uuid import UUID
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

class PlayerProfileService:
    def __init__(self, supabase):
        self.supabase = supabase

    async def get_player_by_user_id(self, user_id: str):
        """Get a player profile by user ID."""
        try:
            response = self.supabase.table("players").select("*").eq("user_id", user_id).single().execute()
            
            if "error" in response:
                return None
            
            return response["data"]
        except Exception as e:
            logger.error(f"Error in get_player_by_user_id: {str(e)}")
            raise

    async def create_player_profile(self, user_id: str, name: str, avatar_url: Optional[str] = None, bio: Optional[str] = None):
        """Create a new player profile."""
        try:
            now = datetime.now().isoformat()
            player_data = {
                "user_id": user_id,
                "name": name,
                "avatar_url": avatar_url,
                "bio": bio,
                "ranking": "BRONZE",
                "tournaments_played": 0,
                "tournaments_won": 0,
                "win_rate": 0,
                "created_at": now,
                "updated_at": now
            }
            
            response = self.supabase.table("players").insert(player_data).execute()
            
            if "error" in response:
                raise Exception(f"Error creating player profile: {response['error']}")
            
            return response["data"][0]
        except Exception as e:
            logger.error(f"Error in create_player_profile: {str(e)}")
            raise

    async def update_player_profile(self, user_id: str, update_data: Dict[str, Any]):
        """Update a player profile."""
        try:
            update_data["updated_at"] = datetime.now().isoformat()
            
            response = self.supabase.table("players").update(update_data).eq("user_id", user_id).execute()
            
            if "error" in response:
                raise Exception(f"Error updating player profile: {response['error']}")
            
            return response["data"][0]
        except Exception as e:
            logger.error(f"Error in update_player_profile: {str(e)}")
            raise

    async def update_player_stats(self, user_id: str, won: bool):
        """Update player statistics after a tournament."""
        try:
            # Recupera il profilo del giocatore
            player = await self.get_player_by_user_id(user_id)
            if not player:
                raise Exception("Player profile not found")
            
            # Aggiorna le statistiche
            tournaments_played = player["tournaments_played"] + 1
            tournaments_won = player["tournaments_won"] + (1 if won else 0)
            win_rate = tournaments_won / tournaments_played if tournaments_played > 0 else 0
            
            # Calcola il nuovo ranking
            new_ranking = self.calculate_ranking(tournaments_played, win_rate)
            
            # Aggiorna il profilo
            update_data = {
                "tournaments_played": tournaments_played,
                "tournaments_won": tournaments_won,
                "win_rate": win_rate,
                "ranking": new_ranking
            }
            
            updated_player = await self.update_player_profile(user_id, update_data)
            
            return updated_player
        except Exception as e:
            logger.error(f"Error in update_player_stats: {str(e)}")
            raise

    def calculate_ranking(self, tournaments_played: int, win_rate: float):
        """Calculate player ranking based on tournaments played and win rate."""
        # Configurazione ranking
        RANKING_CONFIG = {
            "PLATINUM": {
                "minTournaments": 50,
                "minWinRate": 0.65
            },
            "GOLD": {
                "minTournaments": 30,
                "minWinRate": 0.55
            },
            "SILVER": {
                "minTournaments": 15,
                "minWinRate": 0.45
            },
            "BRONZE": {
                "minTournaments": 0,
                "minWinRate": 0
            }
        }
        
        if tournaments_played >= RANKING_CONFIG["PLATINUM"]["minTournaments"] and win_rate >= RANKING_CONFIG["PLATINUM"]["minWinRate"]:
            return "PLATINUM"
        elif tournaments_played >= RANKING_CONFIG["GOLD"]["minTournaments"] and win_rate >= RANKING_CONFIG["GOLD"]["minWinRate"]:
            return "GOLD"
        elif tournaments_played >= RANKING_CONFIG["SILVER"]["minTournaments"] and win_rate >= RANKING_CONFIG["SILVER"]["minWinRate"]:
            return "SILVER"
        else:
            return "BRONZE"

    async def get_player_profile_with_stats(self, user_id: str):
        """Get player profile with additional statistics."""
        try:
            # Recupera il profilo base del giocatore
            player = await self.get_player_by_user_id(user_id)
            if not player:
                return None
            
            # Recupera i tornei attivi
            active_tournaments_response = self.supabase.table("tournaments").select("id").eq("creator_user_id", user_id).in_("status", ["funding_open", "funding_complete", "funds_transferred_to_player", "in_progress", "awaiting_results"]).execute()
            
            # Recupera i tornei completati
            completed_tournaments_response = self.supabase.table("tournaments").select("id").eq("creator_user_id", user_id).in_("status", ["completed_won", "completed_lost"]).execute()
            
            # Calcola i guadagni totali
            earnings_response = self.supabase.table("tournaments").select("total_winnings_from_tournament").eq("creator_user_id", user_id).eq("status", "completed_won").execute()
            
            if "error" not in active_tournaments_response and "error" not in completed_tournaments_response and "error" not in earnings_response:
                active_tournaments = active_tournaments_response["data"]
                completed_tournaments = completed_tournaments_response["data"]
                earnings = earnings_response["data"]
                
                total_earnings = sum(tournament.get("total_winnings_from_tournament", 0) for tournament in earnings)
                
                # Aggiungi le statistiche al profilo
                player["active_tournaments"] = len(active_tournaments)
                player["completed_tournaments"] = len(completed_tournaments)
                player["total_earnings"] = total_earnings
            
            return player
        except Exception as e:
            logger.error(f"Error in get_player_profile_with_stats: {str(e)}")
            raise

    async def list_players(self, limit: int = 50, offset: int = 0):
        """Retrieve a list of player profiles."""
        try:
            response = (
                self.supabase
                .table("players")
                .select("*")
                .range(offset, offset + limit - 1)
                .execute()
            )

            if "error" in response:
                raise Exception(f"Error listing players: {response['error']}")

            return response["data"]
        except Exception as e:
            logger.error(f"Error in list_players: {str(e)}")
            raise
