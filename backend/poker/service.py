from __future__ import annotations
from typing import List, Dict

from .game import PokerGame, Player


class PokerService:
    """Simple facade to interact with the PokerGame engine."""

    def __init__(self, player_names: List[str]) -> None:
        players = [Player(name) for name in player_names]
        self.game = PokerGame(players)

    def deal_hole_cards(self) -> None:
        self.game.deal_hole_cards()

    def deal_flop(self) -> None:
        self.game.deal_flop()

    def deal_turn(self) -> None:
        self.game.deal_turn()

    def deal_river(self) -> None:
        self.game.deal_river()

    def get_player_hand(self, player_name: str) -> Dict[str, str]:
        player = next(p for p in self.game.players if p.name == player_name)
        hand_name = self.game.player_best_hand_name(player)
        return {
            "hand": hand_name,
            "cards": [str(c) for c in player.hole_cards],
        }

    def game_state(self) -> Dict[str, List[str]]:
        return {
            "players": {p.name: [str(c) for c in p.hole_cards] for p in self.game.players},
            "community": [str(c) for c in self.game.community_cards],
        }
