from __future__ import annotations
from dataclasses import dataclass, field
from typing import List

from .cards import Card, Deck
from .hand_evaluator import evaluate, describe


@dataclass
class Player:
    name: str
    hole_cards: List[Card] = field(default_factory=list)


@dataclass
class PokerGame:
    players: List[Player]
    deck: Deck = field(default_factory=Deck)
    community_cards: List[Card] = field(default_factory=list)

    def deal_hole_cards(self) -> None:
        for player in self.players:
            player.hole_cards = self.deck.deal(2)

    def deal_flop(self) -> None:
        self.community_cards.extend(self.deck.deal(3))

    def deal_turn(self) -> None:
        self.community_cards.extend(self.deck.deal(1))

    def deal_river(self) -> None:
        self.community_cards.extend(self.deck.deal(1))

    def player_best_score(self, player: Player) -> int:
        cards = player.hole_cards + self.community_cards
        if len(cards) < 7:
            raise ValueError("Not enough cards to evaluate")
        return evaluate(cards)

    def player_best_hand_name(self, player: Player) -> str:
        cards = player.hole_cards + self.community_cards
        if len(cards) < 7:
            raise ValueError("Not enough cards to evaluate")
        return describe(cards)
