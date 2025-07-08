from fastapi.testclient import TestClient
from uuid import uuid4
import os
os.environ.setdefault("SUPABASE_URL", "http://localhost")
os.environ.setdefault("SUPABASE_SERVICE_ROLE_KEY", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ex.ex")
from main import app
from api.routers.tournaments import get_tournament_service
from api.utils.auth import get_current_user


def sample_tournament():
    return {
        "id": str(uuid4()),
        "name": "Test",
        "description": "desc",
        "game_type": "Poker",
        "target_pool_amount": 1000.0,
        "tournament_buy_in": None,
        "external_tournament_url": None,
        "funding_end_time": None,
        "creator_user_id": str(uuid4()),
        "player_ranking_at_creation": "BRONZE",
        "status": "funding_open",
        "initial_platform_fee_pct": 0.1,
        "initial_platform_fee_amount": 100.0,
        "initial_platform_fee_paid": True,
        "player_guarantee_pct": 0.2,
        "player_guarantee_amount_required": 200.0,
        "player_guarantee_paid": True,
        "winnings_platform_fee_pct": 0.2,
        "current_pool_amount": 0.0,
        "total_winnings_from_tournament": None,
        "platform_winnings_fee_amount": None,
        "net_winnings_for_investors": None,
        "created_at": "2023-01-01T00:00:00",
        "updated_at": "2023-01-01T00:00:00",
    }


class DummyService:
    def __init__(self, tournament):
        self.tournament = tournament
        self.called = None

    def get_tournaments(self, status=None, creator_id=None):
        assert status == "funding_open"
        return [self.tournament]

    def process_investment(self, tournament_id, user_id, amount):
        self.called = (tournament_id, user_id, amount)
        return self.tournament


def override_user():
    return {"id": "user1"}


def test_get_open_tournaments():
    t = sample_tournament()
    service = DummyService(t)
    app.dependency_overrides[get_tournament_service] = lambda: service
    client = TestClient(app)
    resp = client.get("/api/tournaments/open")
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) == 1
    assert data[0]["id"] == t["id"]
    app.dependency_overrides.clear()


def test_invest_in_tournament_endpoint():
    t = sample_tournament()
    service = DummyService(t)
    app.dependency_overrides[get_tournament_service] = lambda: service
    app.dependency_overrides[get_current_user] = override_user
    client = TestClient(app)
    resp = client.post(f"/api/tournaments/{t['id']}/invest", json={"amount": 50})
    assert resp.status_code == 200
    assert service.called == (t["id"], "user1", 50)
    app.dependency_overrides.clear()


def test_invest_invalid_amount():
    t = sample_tournament()
    service = DummyService(t)
    app.dependency_overrides[get_tournament_service] = lambda: service
    app.dependency_overrides[get_current_user] = override_user
    client = TestClient(app)
    resp = client.post(f"/api/tournaments/{t['id']}/invest", json={"amount": 0})
    assert resp.status_code == 400
    app.dependency_overrides.clear()
