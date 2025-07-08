import pytest
import sys
import types
import os

# Provide a dummy 'supabase' module so importing TournamentService does not fail
sys.modules.setdefault('supabase', types.ModuleType('supabase'))
sys.modules['supabase'].create_client = lambda *args, **kwargs: None
sys.modules['supabase'].Client = object

# Minimal stub for pydantic to allow importing tournament models
pydantic_stub = types.ModuleType('pydantic')
pydantic_stub.BaseModel = object
pydantic_stub.Field = lambda *a, **k: None
def validator(*d, **k):
    def wrapper(fn):
        return fn
    return wrapper
pydantic_stub.validator = validator
sys.modules.setdefault('pydantic', pydantic_stub)

# Ensure repository root is on sys.path so 'backend' can be imported
from pathlib import Path
ROOT = Path(__file__).resolve().parents[2]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

os.environ.setdefault('SUPABASE_URL', 'http://localhost')
os.environ.setdefault('SUPABASE_SERVICE_ROLE_KEY', 'dummy')

from backend.api.services.tournament_service import TournamentService


def create_service():
    # Bypass __init__ to avoid external dependencies
    service = TournamentService.__new__(TournamentService)
    return service


def test_calculate_fees_valid_ranking():
    service = create_service()
    fees = service.calculate_fees_for_ranking('PLATINUM', 1000)
    assert fees['initial_fee_pct'] == 0.05
    assert fees['initial_fee_amount'] == pytest.approx(50)
    assert fees['guarantee_pct'] == 0.20
    assert fees['guarantee_amount'] == pytest.approx(200)
    assert fees['winnings_fee_pct'] == 0.15


def test_calculate_fees_invalid_ranking():
    service = create_service()
    with pytest.raises(ValueError):
        service.calculate_fees_for_ranking('INVALID', 1000)
