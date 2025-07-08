# Poker Engine

This directory contains a lightweight Texas Hold'em engine used by the backend.
It is intentionally small and focuses only on card management and hand
evaluation so that future API endpoints can interact with it.

## Running the Engine

The engine does not expose an HTTP API yet. It can be exercised from Python:

```bash
# install dependencies
pip install -r requirements.txt

# run a quick demo
python - <<'PY'
from poker.service import PokerService

service = PokerService(["Alice", "Bob"])
service.deal_hole_cards()
service.deal_flop()
service.deal_turn()
service.deal_river()
print(service.game_state())
print(service.get_player_hand("Alice"))
PY
```

## Extending

- Add new methods in `PokerService` to handle betting, folding and other game
  mechanics.
- Extend `PokerGame` for multiple rounds or tournament logic.
- Use these classes inside FastAPI routers to create API endpoints.
