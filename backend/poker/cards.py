from dataclasses import dataclass
from enum import Enum
import random

class Suit(str, Enum):
    CLUBS = "C"
    DIAMONDS = "D"
    HEARTS = "H"
    SPADES = "S"

class Rank(str, Enum):
    TWO = "2"
    THREE = "3"
    FOUR = "4"
    FIVE = "5"
    SIX = "6"
    SEVEN = "7"
    EIGHT = "8"
    NINE = "9"
    TEN = "T"
    JACK = "J"
    QUEEN = "Q"
    KING = "K"
    ACE = "A"

RANK_ORDER = {
    Rank.TWO: 2,
    Rank.THREE: 3,
    Rank.FOUR: 4,
    Rank.FIVE: 5,
    Rank.SIX: 6,
    Rank.SEVEN: 7,
    Rank.EIGHT: 8,
    Rank.NINE: 9,
    Rank.TEN: 10,
    Rank.JACK: 11,
    Rank.QUEEN: 12,
    Rank.KING: 13,
    Rank.ACE: 14,
}

@dataclass(frozen=True)
class Card:
    rank: Rank
    suit: Suit

    def __str__(self) -> str:
        return f"{self.rank.value}{self.suit.value}"


def build_deck() -> list[Card]:
    return [Card(rank, suit) for suit in Suit for rank in Rank]


class Deck:
    def __init__(self) -> None:
        self.cards = build_deck()
        self.shuffle()

    def shuffle(self) -> None:
        random.shuffle(self.cards)

    def deal(self, n: int) -> list[Card]:
        dealt = self.cards[:n]
        self.cards = self.cards[n:]
        return dealt
