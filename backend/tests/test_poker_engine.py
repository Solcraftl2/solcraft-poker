import pytest

from poker.service import PokerService
from poker.cards import Deck


def test_deck_unique_cards():
    deck = Deck()
    dealt = deck.deal(52)
    assert len(set(str(c) for c in dealt)) == 52


def test_service_flow():
    service = PokerService(["Alice", "Bob"])
    service.deal_hole_cards()
    service.deal_flop()
    service.deal_turn()
    service.deal_river()
    state = service.game_state()
    assert len(state["community"]) == 5
    for cards in state["players"].values():
        assert len(cards) == 2
    hand_info = service.get_player_hand("Alice")
    assert "hand" in hand_info
