import { Hand, Card, ActionType } from '../types';
import { calculateHandValue } from './hand';

// Basic Strategy Chart (H17 - Dealer Hits on Soft 17, 4-8 Decks)

// Helper to get dealer up card value (2-11)
const getDealerUpCardValue = (card: Card): number => {
    if (card.rank === 'A') return 11;
    if (['J', 'Q', 'K'].includes(card.rank)) return 10;
    return parseInt(card.rank);
};

export const getBasicStrategyAction = (
    playerHand: Hand,
    dealerUpCard: Card,
    canSplit: boolean = false,
    canDouble: boolean = false
): ActionType => {
    const { total, isSoft } = calculateHandValue(playerHand);
    const dealerVal = getDealerUpCardValue(dealerUpCard);

    // PAIRS (Splitting)
    if (canSplit && playerHand.cards.length === 2 && playerHand.cards[0].rank === playerHand.cards[1].rank) {
        const rank = playerHand.cards[0].rank;
        // Always split Aces and 8s
        if (rank === 'A' || rank === '8') return 'SPLIT';

        if (rank === '2' || rank === '3') {
            // Split 2,2 and 3,3 against 2-7
            if (dealerVal >= 2 && dealerVal <= 7) return 'SPLIT';
        }
        if (rank === '4') {
            // Split 4,4 only against 5 and 6
            if (dealerVal === 5 || dealerVal === 6) return 'SPLIT';
        }
        if (rank === '6') {
            // Split 6,6 against 2-6
            if (dealerVal >= 2 && dealerVal <= 6) return 'SPLIT';
        }
        if (rank === '7') {
            // Split 7,7 against 2-7
            if (dealerVal >= 2 && dealerVal <= 7) return 'SPLIT';
        }
        if (rank === '9') {
            // Split 9,9 against 2-6, 8-9 (Stand on 7, 10, A)
            if ((dealerVal >= 2 && dealerVal <= 6) || dealerVal === 8 || dealerVal === 9) return 'SPLIT';
        }
        // Never split 5s (treat as 10), 10s
    }

    // SOFT TOTALS
    if (isSoft) {
        // Soft 20 (A,9) - Always Stand
        if (total >= 20) return 'STAND';

        // Soft 19 (A,8) - Double vs 6, else Stand
        if (total === 19) {
            if (canDouble && dealerVal === 6) return 'DOUBLE';
            return 'STAND';
        }

        // Soft 18 (A,7) - Double vs 2-6, Stand vs 7-8, Hit vs 9-A
        if (total === 18) {
            if (canDouble && dealerVal >= 2 && dealerVal <= 6) return 'DOUBLE';
            if (dealerVal >= 2 && dealerVal <= 8) return 'STAND'; // Stand vs 2,7,8
            return 'HIT';
        }

        // Soft 17 (A,6) - Double vs 3-6, else Hit
        if (total === 17) {
            if (canDouble && dealerVal >= 3 && dealerVal <= 6) return 'DOUBLE';
            return 'HIT';
        }

        // Soft 15, 16 (A,4; A,5) - Double vs 4-6, else Hit
        if (total === 15 || total === 16) {
            if (canDouble && dealerVal >= 4 && dealerVal <= 6) return 'DOUBLE';
            return 'HIT';
        }

        // Soft 13, 14 (A,2; A,3) - Double vs 5-6, else Hit
        if (total === 13 || total === 14) {
            if (canDouble && dealerVal >= 5 && dealerVal <= 6) return 'DOUBLE';
            return 'HIT';
        }

        return 'HIT';
    }

    // HARD TOTALS
    if (total >= 17) return 'STAND';

    if (total === 16) {
        // Stand vs 2-6, Hit vs 7-A
        if (dealerVal >= 2 && dealerVal <= 6) return 'STAND';
        return 'HIT';
    }

    if (total === 15) {
        // Stand vs 2-6, Hit vs 7-A
        if (dealerVal >= 2 && dealerVal <= 6) return 'STAND';
        return 'HIT';
    }

    if (total === 13 || total === 14) {
        // Stand vs 2-6, Hit vs 7-A
        if (dealerVal >= 2 && dealerVal <= 6) return 'STAND';
        return 'HIT';
    }

    if (total === 12) {
        // Stand vs 4-6, Hit vs 2,3, 7-A
        if (dealerVal >= 4 && dealerVal <= 6) return 'STAND';
        return 'HIT';
    }

    if (total === 11) {
        // Always Double
        if (canDouble) return 'DOUBLE';
        return 'HIT';
    }

    if (total === 10) {
        // Double vs 2-9, Hit vs 10,A
        if (canDouble && dealerVal >= 2 && dealerVal <= 9) return 'DOUBLE';
        return 'HIT';
    }

    if (total === 9) {
        // Double vs 3-6, Hit vs 2, 7-A
        if (canDouble && dealerVal >= 3 && dealerVal <= 6) return 'DOUBLE';
        return 'HIT';
    }

    if (total <= 8) return 'HIT';

    return 'HIT';
};
