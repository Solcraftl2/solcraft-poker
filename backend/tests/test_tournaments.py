import os
import sys
import pathlib
sys.path.append(str(pathlib.Path(__file__).resolve().parents[1]))
import types
if "jwt" not in sys.modules:
    sys.modules["jwt"] = types.ModuleType("jwt")
from fastapi.testclient import TestClient

# Provide stub supabase module before importing app
if 'supabase' not in sys.modules:
    dummy = types.ModuleType('supabase')
    class DummyClient:
        def table(self, *a, **kw):
            return self
        def select(self, *a, **kw):
            return self
        def limit(self, *a, **kw):
            return self
        def execute(self):
            return types.SimpleNamespace(data=[], error=None)
    def create_client(url, key):
        return DummyClient()
    dummy.create_client = create_client
    dummy.Client = DummyClient
    sys.modules['supabase'] = dummy

os.environ.setdefault('SUPABASE_URL', 'http://localhost')
os.environ.setdefault('SUPABASE_SERVICE_ROLE_KEY', 'dummy')

from main import app
from api.routers.tournaments import get_tournament_service

class DummyService:
    def get_tournaments(self, status=None, creator_id=None):
        return []

def override_service():
    return DummyService()

app.dependency_overrides[get_tournament_service] = override_service
client = TestClient(app)


def test_get_tournaments_returns_empty_list():
    response = client.get('/api/tournaments')
    assert response.status_code == 200
    assert response.json() == []
