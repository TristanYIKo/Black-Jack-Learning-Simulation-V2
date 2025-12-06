export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
export type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';

export interface Card {
    id: string;
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

export type Phase = 'LOBBY' | 'BETTING' | 'DEALING' | 'INSURANCE' | 'PLAYER_TURN' | 'DEALER_TURN' | 'RESOLUTION';

export type ActionType = 'HIT' | 'STAND' | 'DOUBLE' | 'SPLIT';

export interface Feedback {
    correct: boolean;
    userAction: ActionType | 'INSURANCE_TAKE' | 'INSURANCE_DECLINE'; // Extended for insurance
    optimalAction: ActionType | 'INSURANCE_TAKE' | 'INSURANCE_DECLINE';
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
    lastBet: number; // For Rebet & Deal
    phase: Phase;
    lastDecisionFeedback?: Feedback;
    stats: Stats;
    insuranceBet: number; // Track insurance bet
}

export type GameAction =
    | { type: 'START_GAME' }
    | { type: 'RESET_BANKROLL' }
    | { type: 'PLACE_BET'; amount: number }
    | { type: 'CLEAR_BET' }
    | { type: 'DEAL' }
    | { type: 'REBET_AND_DEAL' }
    | { type: 'START_TURN' }
    | { type: 'TAKE_INSURANCE' }
    | { type: 'DECLINE_INSURANCE' }
    | { type: 'PLAYER_ACTION'; action: ActionType }
    | { type: 'RESOLVE_DEALER' } // Triggered to start dealer turn
    | { type: 'REVEAL_HIDDEN' }
    | { type: 'DEALER_HIT' }
    | { type: 'DEALER_STAND' }
    | { type: 'NEXT_HAND' } // For split hands
    | { type: 'NEW_ROUND' } // Back to betting
    | { type: 'BACK_TO_LOBBY' }
    | { type: 'RESTART_GAME' };
