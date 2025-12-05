import { Hand } from '../types';

export const calculateHandValue = (hand: Hand): { total: number; isSoft: boolean; isBust: boolean } => {
    let total = 0;
    let aces = 0;

    for (const card of hand.cards) {
        if (card.isHidden) continue; // Don't count hidden cards
        total += card.value;
        if (card.rank === 'A') {
            aces += 1;
        }
    }

    // Adjust for aces
    while (total > 21 && aces > 0) {
        total -= 10;
        aces -= 1;
    }

    // isSoft if we have an ace counted as 11
    const isSoft = aces > 0;

    return {
        total,
        isSoft,
        isBust: total > 21,
    };
};
