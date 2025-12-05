export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
export type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';

export interface Card {
    suit: Suit;
    rank: Rank;
    value: number; // 2-10, 10 for face cards, 11 for Ace (handled dynamically in calc)
    isHidden?: boolean;
}

export interface Hand {
    cards: Card[];
    bet: number;
    isActive: boolean; // For split hands
    isBust: boolean;
    isBlackjack: boolean;
    isDoubled: boolean;
    isStand: boolean;
}

export type Phase = 'LOBBY' | 'BETTING' | 'DEALING' | 'PLAYER_TURN' | 'DEALER_TURN' | 'RESOLUTION';

export type ActionType = 'HIT' | 'STAND' | 'DOUBLE' | 'SPLIT';

export interface Feedback {
    correct: boolean;
    userAction: ActionType;
    optimalAction: ActionType;
}

export interface Stats {
    decisions: number;
    correct: number;
}

export interface GameState {
    shoe: Card[];
    playerHands: Hand[];
    activeHandIndex: number;
    dealerHand: Hand;
    balance: number;
    currentBet: number;
    phase: Phase;
    lastDecisionFeedback?: Feedback;
    stats: Stats;
}

export type GameAction =
    | { type: 'START_GAME' }
    | { type: 'RESET_BANKROLL' }
    | { type: 'PLACE_BET'; amount: number }
    | { type: 'CLEAR_BET' }
    | { type: 'DEAL' }
    | { type: 'PLAYER_ACTION'; action: ActionType }
    | { type: 'RESOLVE_DEALER' } // Triggered after player stands/busts
    | { type: 'NEXT_HAND' } // For split hands
    | { type: 'NEW_ROUND' }; // Back to betting
