import os
os.environ.setdefault("SUPABASE_URL", "http://localhost")
os.environ.setdefault("SUPABASE_SERVICE_ROLE_KEY", "a.b.c")

from fastapi.testclient import TestClient
from main import app
from api.routers.tournaments import get_tournament_service

class FakeTournamentService:
    def get_tournaments(self, status=None, creator_id=None):
        return [
            {
                "id": "11111111-1111-1111-1111-111111111111",
                "creator_user_id": "22222222-2222-2222-2222-222222222222",
                "name": "Test Tourney",
                "description": None,
                "game_type": "Poker",
                "target_pool_amount": 1000.0,
                "tournament_buy_in": 100.0,
                "external_tournament_url": None,
                "funding_end_time": None,
                "player_ranking_at_creation": "BRONZE",
                "status": "funding_open",
                "initial_platform_fee_pct": 0.1,
                "initial_platform_fee_amount": 10.0,
                "initial_platform_fee_paid": False,
                "player_guarantee_pct": 0.4,
                "player_guarantee_amount_required": 400.0,
                "player_guarantee_paid": False,
                "winnings_platform_fee_pct": 0.2,
                "current_pool_amount": 0.0,
                "total_winnings_from_tournament": None,
                "platform_winnings_fee_amount": None,
                "net_winnings_for_investors": None,
                "created_at": "2024-01-01T00:00:00",
                "updated_at": "2024-01-01T00:00:00",
            }
        ]


def test_get_tournaments():
    app.dependency_overrides[get_tournament_service] = lambda: FakeTournamentService()
    client = TestClient(app)
    response = client.get("/api/tournaments")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert data[0]["name"] == "Test Tourney"
    app.dependency_overrides.clear()
