import { GameState, GameAction, Hand, Phase } from './types';
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
    lastBet: 0,
    phase: 'LOBBY',
    stats: { decisions: 0, correct: 0 },
    insuranceBet: 0,
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
                insuranceBet: 0,
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

        case 'REBET_AND_DEAL': {
            if (state.lastBet === 0 || state.balance < state.lastBet) return state;

            // Trigger DEAL logic with lastBet
            const betAmount = state.lastBet;
            const newState = {
                ...state,
                balance: state.balance - betAmount,
                currentBet: betAmount,
            };
            // Call DEAL logic (duplicated here for simplicity or we could dispatch DEAL next, but reducer must be pure)
            // We'll just copy the DEAL logic below but use the new state
            return gameReducer(newState, { type: 'DEAL' });
        }

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
            }

            // Check for Dealer Ace (Insurance)
            let phase: Phase = 'PLAYER_TURN';
            if (dCard1.rank === 'A') {
                phase = 'INSURANCE';
            } else if (calculateHandValue({ cards: [dCard1], bet: 0, isActive: false, isBust: false, isBlackjack: false, isDoubled: false, isStand: false }).total === 10) {
                // Dealer shows 10, check for BJ immediately (Peek)
                // If hidden card makes BJ
                const dTotal = calculateHandValue({ cards: [dCard1, dCard2], bet: 0, isActive: false, isBust: false, isBlackjack: false, isDoubled: false, isStand: false }).total;
                if (dTotal === 21) {
                    // Dealer has BJ
                    // Reveal immediately
                    dealerHandCards[1].isHidden = false;
                    phase = 'RESOLUTION';
                    // Player BJ is handled in resolution
                }
            }

            if (playerHand.isBlackjack && phase !== 'INSURANCE' && phase !== 'RESOLUTION') {
                // Player has BJ and Dealer doesn't show Ace or 10 (or didn't peek yet)
                // Actually if dealer shows 10 and no BJ, we go to player turn (or resolution if player has BJ)
                // If player has BJ, they stand automatically.
                playerHand.isStand = true;
                phase = 'RESOLUTION';
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
                    isStand: phase === 'RESOLUTION', // Dealer stands if round over
                },
                phase,
                lastDecisionFeedback: undefined,
                lastBet: state.currentBet, // Store for rebet
                insuranceBet: 0,
            };
        }

        case 'TAKE_INSURANCE': {
            const insuranceCost = state.currentBet / 2;
            if (state.balance < insuranceCost) return state; // Should be handled in UI

            let newState = {
                ...state,
                balance: state.balance - insuranceCost,
                insuranceBet: insuranceCost,
                phase: 'PLAYER_TURN' as Phase, // Default next phase
            };

            // Check Dealer BJ
            const dHand = state.dealerHand;
            const fullDHand = { ...dHand, cards: dHand.cards.map(c => ({ ...c, isHidden: false })) };
            const { total } = calculateHandValue(fullDHand);

            if (total === 21) {
                // Dealer has BJ
                // Pay insurance 2:1
                newState.balance += insuranceCost * 3; // Return stake + winnings
                newState.dealerHand = fullDHand; // Reveal
                newState.phase = 'RESOLUTION';
            } else {
                // No BJ, lose insurance
                // Check if player has BJ
                if (state.playerHands[0].isBlackjack) {
                    state.playerHands[0].isStand = true;
                    newState.phase = 'RESOLUTION';
                }
            }
            return newState;
        }

        case 'DECLINE_INSURANCE': {
            let newState = { ...state, phase: 'PLAYER_TURN' as Phase };
            // Check Dealer BJ
            const dHand = state.dealerHand;
            const fullDHand = { ...dHand, cards: dHand.cards.map(c => ({ ...c, isHidden: false })) };
            const { total } = calculateHandValue(fullDHand);

            if (total === 21) {
                newState.dealerHand = fullDHand; // Reveal
                newState.phase = 'RESOLUTION';
            } else {
                if (state.playerHands[0].isBlackjack) {
                    state.playerHands[0].isStand = true;
                    newState.phase = 'RESOLUTION';
                }
            }
            return newState;
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

            // Handle Insufficient Funds for Double/Split
            if ((playerAction === 'DOUBLE' || playerAction === 'SPLIT') && state.balance < activeHand.bet) {
                // Just give feedback, don't execute
                return {
                    ...state,
                    lastDecisionFeedback: {
                        correct: isCorrect,
                        userAction: playerAction,
                        optimalAction,
                    },
                    // Stats update? Yes, user made a decision.
                    stats: {
                        decisions: state.stats.decisions + 1,
                        correct: state.stats.correct + (isCorrect ? 1 : 0),
                    }
                };
            }

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
            // Just start the dealer phase, actual actions happen via effects
            return {
                ...state,
                phase: 'DEALER_TURN',
            };
        }

        case 'REVEAL_HIDDEN': {
            let dealerHand = { ...state.dealerHand };
            dealerHand.cards = dealerHand.cards.map(c => ({ ...c, isHidden: false }));
            return {
                ...state,
                dealerHand,
            };
        }

        case 'DEALER_HIT': {
            let shoe = [...state.shoe];
            let dealerHand = { ...state.dealerHand };
            const card = shoe.pop()!;
            dealerHand.cards = [...dealerHand.cards, card];

            const { total } = calculateHandValue(dealerHand);
            if (total > 21) {
                dealerHand.isBust = true;
            }

            return {
                ...state,
                shoe,
                dealerHand,
            };
        }

        case 'DEALER_STAND': {
            let dealerHand = { ...state.dealerHand };
            dealerHand.isStand = true;

            const { total } = calculateHandValue(dealerHand);

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
                insuranceBet: 0,
            };

        case 'BACK_TO_LOBBY':
            return {
                ...state,
                phase: 'LOBBY',
                currentBet: 0,
                playerHands: [],
                dealerHand: { cards: [], bet: 0, isActive: false, isBust: false, isBlackjack: false, isDoubled: false, isStand: false },
                lastDecisionFeedback: undefined,
                insuranceBet: 0,
            };

        case 'RESTART_GAME':
            return {
                ...state,
                phase: 'BETTING',
                balance: INITIAL_BANKROLL,
                currentBet: 0,
                playerHands: [],
                dealerHand: { cards: [], bet: 0, isActive: false, isBust: false, isBlackjack: false, isDoubled: false, isStand: false },
                lastDecisionFeedback: undefined,
                stats: { decisions: 0, correct: 0 },
                insuranceBet: 0,
            };

        default:
            return state;
    }
};

export { createInitialState };
