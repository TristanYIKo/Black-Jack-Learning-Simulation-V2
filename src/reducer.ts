import { GameState, GameAction, Hand } from './types';
import { createShoe } from './utils/deck';
import { calculateHandValue } from './utils/hand';
import { getBasicStrategyAction } from './utils/basicStrategy';

const INITIAL_BANKROLL = 100;
const MIN_BET = 1;

const createInitialState = (): GameState => ({
    shoe: createShoe(6),
    playerHands: [],
    activeHandIndex: -1,
    dealerHand: { cards: [], bet: 0, isActive: false, isBust: false, isBlackjack: false, isDoubled: false, isStand: false },
    balance: INITIAL_BANKROLL,
    currentBet: 0,
    phase: 'LOBBY',
    stats: { decisions: 0, correct: 0 },
});

export const gameReducer = (state: GameState, action: GameAction): GameState => {
    switch (action.type) {
        case 'START_GAME':
            return {
                ...state,
                phase: 'BETTING',
                currentBet: 0,
                playerHands: [],
                dealerHand: { cards: [], bet: 0, isActive: false, isBust: false, isBlackjack: false, isDoubled: false, isStand: false },
            };

        case 'RESET_BANKROLL':
            return {
                ...state,
                balance: INITIAL_BANKROLL,
            };

        case 'PLACE_BET':
            if (state.balance >= action.amount) {
                return {
                    ...state,
                    balance: state.balance - action.amount,
                    currentBet: state.currentBet + action.amount,
                };
            }
            return state;

        case 'CLEAR_BET':
            return {
                ...state,
                balance: state.balance + state.currentBet,
                currentBet: 0,
            };

        case 'DEAL': {
            if (state.currentBet < MIN_BET) return state;

            let shoe = [...state.shoe];
            if (shoe.length < 20) {
                shoe = createShoe(6);
            }

            const pCard1 = shoe.pop()!;
            const dCard1 = shoe.pop()!;
            const pCard2 = shoe.pop()!;
            const dCard2 = shoe.pop()!; // Hidden

            // Hide second dealer card
            const dealerHandCards = [dCard1, { ...dCard2, isHidden: true }];

            const playerHand: Hand = {
                cards: [pCard1, pCard2],
                bet: state.currentBet,
                isActive: true,
                isBust: false,
                isBlackjack: false,
                isDoubled: false,
                isStand: false,
            };

            const { total: pTotal } = calculateHandValue(playerHand);
            if (pTotal === 21) {
                playerHand.isBlackjack = true;
                playerHand.isStand = true; // Auto stand on BJ
            }

            return {
                ...state,
                shoe,
                playerHands: [playerHand],
                activeHandIndex: 0,
                dealerHand: {
                    cards: dealerHandCards,
                    bet: 0,
                    isActive: true,
                    isBust: false,
                    isBlackjack: false,
                    isDoubled: false,
                    isStand: false
                },
                phase: playerHand.isBlackjack ? 'RESOLUTION' : 'PLAYER_TURN',
                lastDecisionFeedback: undefined,
            };
        }

        case 'PLAYER_ACTION': {
            const { action: playerAction } = action;
            const activeHand = state.playerHands[state.activeHandIndex];
            const dealerUpCard = state.dealerHand.cards[0];

            // Training Feedback
            const optimalAction = getBasicStrategyAction(
                activeHand,
                dealerUpCard,
                state.playerHands.length < 4 && activeHand.cards.length === 2 && activeHand.cards[0].rank === activeHand.cards[1].rank, // Can Split?
                activeHand.cards.length === 2 // Can Double?
            );

            const isCorrect = playerAction === optimalAction;
            const newStats = {
                decisions: state.stats.decisions + 1,
                correct: state.stats.correct + (isCorrect ? 1 : 0),
            };

            let newState = {
                ...state,
                stats: newStats,
                lastDecisionFeedback: {
                    correct: isCorrect,
                    userAction: playerAction,
                    optimalAction,
                },
            };

            // Apply Action
            const shoe = [...state.shoe];
            const newPlayerHands = [...state.playerHands];
            const currentHand = { ...newPlayerHands[state.activeHandIndex] };

            if (playerAction === 'HIT') {
                const card = shoe.pop()!;
                currentHand.cards = [...currentHand.cards, card];
                const { total } = calculateHandValue(currentHand);
                if (total > 21) {
                    currentHand.isBust = true;
                    currentHand.isActive = false;
                    currentHand.isStand = true; // Turn ends
                }
            } else if (playerAction === 'STAND') {
                currentHand.isStand = true;
                currentHand.isActive = false;
            } else if (playerAction === 'DOUBLE') {
                if (state.balance >= currentHand.bet) {
                    newState.balance -= currentHand.bet;
                    currentHand.bet *= 2;
                    currentHand.isDoubled = true;
                    const card = shoe.pop()!;
                    currentHand.cards = [...currentHand.cards, card];
                    const { total } = calculateHandValue(currentHand);
                    if (total > 21) currentHand.isBust = true;
                    currentHand.isStand = true; // Double ends turn
                    currentHand.isActive = false;
                }
            } else if (playerAction === 'SPLIT') {
                if (state.balance >= currentHand.bet) {
                    newState.balance -= currentHand.bet;
                    const splitCard = currentHand.cards.pop()!;

                    // Hand 1
                    const card1 = shoe.pop()!;
                    currentHand.cards = [currentHand.cards[0], card1];

                    // Hand 2
                    const card2 = shoe.pop()!;
                    const newHand: Hand = {
                        cards: [splitCard, card2],
                        bet: currentHand.bet,
                        isActive: false,
                        isBust: false,
                        isBlackjack: false,
                        isDoubled: false,
                        isStand: false,
                    };

                    newPlayerHands.splice(state.activeHandIndex + 1, 0, newHand);
                }
            }

            newPlayerHands[state.activeHandIndex] = currentHand;
            newState.shoe = shoe;
            newState.playerHands = newPlayerHands;

            // Check if current hand is done
            if (currentHand.isStand || currentHand.isBust) {
                // Move to next hand or dealer
                const nextHandIndex = state.activeHandIndex + 1;
                if (nextHandIndex < newPlayerHands.length) {
                    newState.activeHandIndex = nextHandIndex;
                    newPlayerHands[nextHandIndex].isActive = true;
                } else {
                    // All hands done
                    newState.phase = 'DEALER_TURN';
                }
            }

            return newState;
        }

        case 'RESOLVE_DEALER': {
            // Reveal hidden card
            let dealerHand = { ...state.dealerHand };
            dealerHand.cards = dealerHand.cards.map(c => ({ ...c, isHidden: false }));

            let shoe = [...state.shoe];
            let { total } = calculateHandValue(dealerHand);

            // Dealer hits on soft 17
            while (total < 17 || (total === 17 && calculateHandValue(dealerHand).isSoft)) {
                const card = shoe.pop()!;
                dealerHand.cards = [...dealerHand.cards, card];
                total = calculateHandValue(dealerHand).total;
            }

            dealerHand.isBust = total > 21;
            dealerHand.isStand = true;

            // Calculate Winnings
            let newBalance = state.balance;
            state.playerHands.forEach(hand => {
                if (hand.isBust) return; // Lose bet (already deducted)

                const pVal = calculateHandValue(hand).total;
                const dVal = total;

                if (hand.isBlackjack) {
                    // BJ pays 3:2
                    const dealerHasBJ = dealerHand.cards.length === 2 && dVal === 21;
                    if (dealerHasBJ) {
                        newBalance += hand.bet; // Push
                    } else {
                        newBalance += hand.bet + (hand.bet * 1.5);
                    }
                } else if (dealerHand.isBust) {
                    newBalance += hand.bet * 2;
                } else if (pVal > dVal) {
                    newBalance += hand.bet * 2;
                } else if (pVal === dVal) {
                    newBalance += hand.bet; // Push
                }
            });

            return {
                ...state,
                shoe,
                dealerHand,
                balance: newBalance,
                phase: 'RESOLUTION',
            };
        }

        case 'NEW_ROUND':
            return {
                ...state,
                phase: 'BETTING',
                currentBet: 0,
                playerHands: [],
                dealerHand: { cards: [], bet: 0, isActive: false, isBust: false, isBlackjack: false, isDoubled: false, isStand: false },
                lastDecisionFeedback: undefined,
            };

        default:
            return state;
    }
};

export { createInitialState };
