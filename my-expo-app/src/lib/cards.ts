export const RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'] as const;
export const SUITS = ['s', 'h', 'd', 'c'] as const;

export type Rank = (typeof RANKS)[number];
export type Suit = (typeof SUITS)[number];

export type Card = { rank: Rank; suit: Suit };

/** Two-character shorthand for a card, e.g. `As`, `Th`, `7d`. */
export type CardCode = `${Rank}${Suit}`;

export type HoleCards = [Card, Card];
export type HoleCardCodes = [CardCode, CardCode];

export const SUIT_GLYPH: Record<Suit, string> = {
  s: '\u2660',
  h: '\u2665',
  d: '\u2666',
  c: '\u2663',
};

export const SUIT_NAME: Record<Suit, string> = {
  s: 'spades',
  h: 'hearts',
  d: 'diamonds',
  c: 'clubs',
};

/** Classic two-colour deck, matching the felt-and-smoke look of the table art. */
export const SUIT_COLOR: Record<Suit, string> = {
  s: '#111714',
  c: '#111714',
  h: '#A43E32',
  d: '#A43E32',
};

export function isRedSuit(suit: Suit): boolean {
  return suit === 'h' || suit === 'd';
}

const RANK_VALUE: Record<Rank, number> = {
  '2': 2,
  '3': 3,
  '4': 4,
  '5': 5,
  '6': 6,
  '7': 7,
  '8': 8,
  '9': 9,
  T: 10,
  J: 11,
  Q: 12,
  K: 13,
  A: 14,
};

function isRank(value: string): value is Rank {
  return (RANKS as readonly string[]).includes(value);
}

function isSuit(value: string): value is Suit {
  return (SUITS as readonly string[]).includes(value);
}

export function parseCard(code: string): Card {
  const rank = code.trim().slice(0, 1).toUpperCase();
  const suit = code.trim().slice(1, 2).toLowerCase();

  if (!isRank(rank) || !isSuit(suit)) {
    throw new Error(`Invalid card code: "${code}". Expected something like "As" or "Th".`);
  }

  return { rank, suit };
}

export function formatCard(card: Card): CardCode {
  return `${card.rank}${card.suit}`;
}

export function parseHoleCards(codes: HoleCardCodes): HoleCards {
  return [parseCard(codes[0]), parseCard(codes[1])];
}

export function sameCard(a: Card, b: Card): boolean {
  return a.rank === b.rank && a.suit === b.suit;
}

export function randomCard(): Card {
  return {
    rank: RANKS[Math.floor(Math.random() * RANKS.length)],
    suit: SUITS[Math.floor(Math.random() * SUITS.length)],
  };
}

export function randomHoleCards(): HoleCards {
  const first = randomCard();
  let second = randomCard();
  while (sameCard(first, second)) {
    second = randomCard();
  }
  return [first, second];
}

const RANK_PLURAL: Record<Rank, string> = {
  '2': 'Deuces',
  '3': 'Threes',
  '4': 'Fours',
  '5': 'Fives',
  '6': 'Sixes',
  '7': 'Sevens',
  '8': 'Eights',
  '9': 'Nines',
  T: 'Tens',
  J: 'Jacks',
  Q: 'Queens',
  K: 'Kings',
  A: 'Aces',
};

/** Human-readable label for a starting hand, e.g. `Pocket Aces`, `AKs`, `T7o`. */
export function describeHoleCards([a, b]: HoleCards): string {
  if (a.rank === b.rank) {
    return `Pocket ${RANK_PLURAL[a.rank]}`;
  }

  const [high, low] = RANK_VALUE[a.rank] >= RANK_VALUE[b.rank] ? [a, b] : [b, a];
  return `${high.rank}${low.rank}${a.suit === b.suit ? 's' : 'o'}`;
}
