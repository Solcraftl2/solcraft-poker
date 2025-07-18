import os
import pytest
from datetime import datetime, timedelta
from uuid import uuid4

# Ensure required env variables for service import
os.environ.setdefault("SUPABASE_URL", "http://localhost")
os.environ.setdefault("SUPABASE_SERVICE_ROLE_KEY", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ex.ex")

from api.services.tournament_service import TournamentService

class DummySupabase:
    def __init__(self):
        self.investments = []
        self.table_name = None
        self.data = None

    def table(self, name):
        self.table_name = name
        return self

    def insert(self, data):
        self.data = data
        return self

    def execute(self):
        if self.table_name == "tournament_investments":
            self.investments.append(self.data)
            return type("Resp", (), {"error": None, "data": [self.data]})()
        return type("Resp", (), {"error": None, "data": []})()

class DummyTournamentService(TournamentService):
    def __init__(self, tournaments):
        self.supabase = DummySupabase()
        self.tournaments = {t["id"]: t for t in tournaments}

    def get_tournament_by_id(self, tournament_id: str):
        return self.tournaments.get(tournament_id)

    def update_tournament(self, tournament_id: str, update_data):
        self.tournaments[tournament_id].update(update_data)
        return self.tournaments[tournament_id]

    def _create_notification(self, *args, **kwargs):
        pass


def sample_tournament(**kwargs):
    now = datetime.now().isoformat()
    data = {
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
        "current_pool_amount": 500.0,
        "total_winnings_from_tournament": None,
        "platform_winnings_fee_amount": None,
        "net_winnings_for_investors": None,
        "created_at": now,
        "updated_at": now,
    }
    data.update(kwargs)
    return data


def test_process_investment_success():
    tournament = sample_tournament()
    service = DummyTournamentService([tournament])
    result = service.process_investment(tournament["id"], "inv1", 100.0)
    assert result["current_pool_amount"] == pytest.approx(600.0)
    assert service.supabase.investments[0]["amount"] == 100.0
    assert result.get("status") == "funding_open"


def test_process_investment_pool_complete():
    tournament = sample_tournament(current_pool_amount=900.0)
    service = DummyTournamentService([tournament])
    result = service.process_investment(tournament["id"], "inv1", 100.0)
    assert result["status"] == "funding_complete"
    assert result["current_pool_amount"] == pytest.approx(1000.0)


def test_process_investment_exceed_target():
    tournament = sample_tournament(current_pool_amount=950.0)
    service = DummyTournamentService([tournament])
    with pytest.raises(Exception):
        service.process_investment(tournament["id"], "inv1", 100.0)


def test_process_investment_after_funding_end():
    past = datetime.now() - timedelta(days=1)
    tournament = sample_tournament(funding_end_time=past.isoformat())
    service = DummyTournamentService([tournament])
    with pytest.raises(Exception):
        service.process_investment(tournament["id"], "inv1", 50.0)
    assert service.tournaments[tournament["id"]]["status"] == "funding_failed"
