from __future__ import annotations
from treys import Card as TCard, Evaluator
from .cards import Card, Suit


def card_to_int(card: Card) -> int:
    # Map our Card to treys Card integer representation
    rank_str = card.rank.value
    suit_map = {
        Suit.SPADES: "s",
        Suit.HEARTS: "h",
        Suit.DIAMONDS: "d",
        Suit.CLUBS: "c",
    }
    suit_str = suit_map[card.suit]
    treys_str = rank_str + suit_str
    return TCard.new(treys_str)


def evaluate(seven_cards: list[Card]) -> int:
    """Return hand strength score; lower is better in treys."""
    evaluator = Evaluator()
    ints = [card_to_int(c) for c in seven_cards]
    return evaluator.evaluate(ints[:2], ints[2:])


def describe(seven_cards: list[Card]) -> str:
    evaluator = Evaluator()
    ints = [card_to_int(c) for c in seven_cards]
    score = evaluator.evaluate(ints[:2], ints[2:])
    return evaluator.class_to_string(evaluator.get_rank_class(score))
