import { Card, Rank, Suit } from '../types';

const SUITS: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];
const RANKS: Rank[] = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

const getRankValue = (rank: Rank): number => {
    if (['J', 'Q', 'K'].includes(rank)) return 10;
    if (rank === 'A') return 11;
    return parseInt(rank);
};

export const shuffle = (cards: Card[]): Card[] => {
    const newCards = [...cards];
    for (let i = newCards.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newCards[i], newCards[j]] = [newCards[j], newCards[i]];
    }
    return newCards;
};

export const createShoe = (numDecks: number = 6): Card[] => {
    const shoe: Card[] = [];
    for (let i = 0; i < numDecks; i++) {
        for (const suit of SUITS) {
            for (const rank of RANKS) {
                shoe.push({
                    suit,
                    rank,
                    value: getRankValue(rank),
                });
            }
        }
    }
    return shuffle(shoe);
};
