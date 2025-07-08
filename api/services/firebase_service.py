"""
Firebase Service - Simplified for testing
"""

class FirebaseService:
    def __init__(self):
        pass
    
    async def get_players(self, page=1, per_page=20, tier=None, status=None, search=None):
        # Mock data for testing
        return {
            "players": [
                {"id": "1", "username": "player1", "tier": "bronze"},
                {"id": "2", "username": "player2", "tier": "silver"}
            ],
            "total": 2,
            "page": page,
            "per_page": per_page
        }
    
    async def get_player(self, player_id):
        # Mock data for testing
        return {
            "id": player_id,
            "username": f"player_{player_id}",
            "tier": "bronze",
            "stats": {"games_played": 10, "wins": 5}
        }

