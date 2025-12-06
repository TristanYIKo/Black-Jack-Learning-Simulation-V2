import { GameState, GameAction, Hand, Card, ActionType, Feedback } from './types';
import { createShoe, shuffle } from './utils/deck';
import { calculateHandValue } from './utils/hand';
import { getBasicStrategyAction } from './utils/basicStrategy';

const INITIAL_BALANCE = 1000;
const MIN_BET = 10;

export const createInitialState = (): GameState => ({
    shoe: createShoe(6),
    playerHands: [],
    activeHandIndex: 0,
    dealerHand: { cards: [], bet: 0, isActive: false, isBust: false, isBlackjack: false, isDoubled: false, isStand: false },
    balance: INITIAL_BALANCE,
    currentBet: 0,
    lastBet: 0,
    phase: 'LOBBY',
    stats: { decisions: 0, correct: 0 },
    insuranceBet: 0,
});

const createHand = (bet: number): Hand => ({
    cards: [],
    bet,
    isActive: true,
    isBust: false,
    isBlackjack: false,
    isDoubled: false,
    isStand: false,
});

const dealCard = (shoe: Card[], hand: Hand, isHidden: boolean = false): { newShoe: Card[], newHand: Hand } => {
    const newShoe = [...shoe];
    if (newShoe.length === 0) {
        // Reshuffle if empty (simplified)
        newShoe.push(...createShoe(6));
    }
    const card = newShoe.pop()!;
    const newCard = { ...card, isHidden };
    const newHand = { ...hand, cards: [...hand.cards, newCard] };
    return { newShoe, newHand };
};

const evaluateFeedback = (state: GameState, action: ActionType | 'INSURANCE_TAKE' | 'INSURANCE_DECLINE'): Feedback => {
    const activeHand = state.playerHands[state.activeHandIndex];
    const dealerUpCard = state.dealerHand.cards.find(c => !c.isHidden)!;

    let optimal: ActionType | 'INSURANCE_TAKE' | 'INSURANCE_DECLINE';

    if (action === 'INSURANCE_TAKE' || action === 'INSURANCE_DECLINE') {
        // Basic strategy says never take insurance unless counting cards (which we aren't simulating fully here for user)
        // Standard advice: Never take insurance.
        optimal = 'INSURANCE_DECLINE';
    } else {
        const canSplit = state.playerHands.length < 4 && activeHand.cards.length === 2 && activeHand.cards[0].rank === activeHand.cards[1].rank;
        const canDouble = activeHand.cards.length === 2;
        optimal = getBasicStrategyAction(activeHand, dealerUpCard, canSplit, canDouble);
    }

    return {
        correct: action === optimal,
        userAction: action,
        optimalAction: optimal,
    };
};

export const gameReducer = (state: GameState, action: GameAction): GameState => {
    switch (action.type) {
        case 'START_GAME':
            return { ...createInitialState(), balance: state.balance, phase: 'BETTING' }; // Keep balance if not reset, start betting

        case 'RESET_BANKROLL':
            return createInitialState();

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
            if (shoe.length < 20) shoe = createShoe(6); // Reshuffle threshold

            let playerHand = createHand(state.currentBet);
            let dealerHand = createHand(0);

            // Deal 2 cards each
            let res = dealCard(shoe, playerHand);
            shoe = res.newShoe; playerHand = res.newHand;

            res = dealCard(shoe, dealerHand, true); // Hidden
            shoe = res.newShoe; dealerHand = res.newHand;

            res = dealCard(shoe, playerHand);
            shoe = res.newShoe; playerHand = res.newHand;

            res = dealCard(shoe, dealerHand);
            shoe = res.newShoe; dealerHand = res.newHand;

            // Check for Player Blackjack
            const { total: pTotal } = calculateHandValue(playerHand);
            if (pTotal === 21) {
                playerHand.isBlackjack = true;
                playerHand.isStand = true;
            }

            return {
                ...state,
                shoe,
                playerHands: [playerHand],
                dealerHand,
                activeHandIndex: 0,
                lastBet: state.currentBet,
                currentBet: 0, // Bet is moved to hand
                phase: 'DEALING',
                lastDecisionFeedback: undefined,
            };
        }

        case 'START_TURN': {
            // Logic to transition from DEALING to actual phase
            const playerHand = state.playerHands[0];
            const dealerHand = state.dealerHand;
            const dealerUpCard = dealerHand.cards[1];
            const { total: dTotal } = calculateHandValue(dealerHand, true);
            const dealerHasBJ = dTotal === 21;

            let nextPhase: GameState['phase'] = 'PLAYER_TURN';

            if (dealerUpCard.rank === 'A') {
                nextPhase = 'INSURANCE';
            } else if (dealerHasBJ) {
                nextPhase = 'DEALER_TURN';
            } else if (getBasicStrategyAction(playerHand, dealerUpCard) === 'STAND' && playerHand.isBlackjack) {
                nextPhase = 'DEALER_TURN';
            }

            return { ...state, phase: nextPhase };
        }

        case 'REBET_AND_DEAL':
            // Logic handled by dispatching PLACE_BET then DEAL in component? 
            // Or we handle it here atomically.
            if (state.balance >= state.lastBet) {
                // Re-use DEAL logic but set bet first
                const betState = gameReducer(state, { type: 'PLACE_BET', amount: state.lastBet });
                return gameReducer(betState, { type: 'DEAL' });
            }
            return state;

        case 'TAKE_INSURANCE': {
            const cost = state.playerHands[0].bet / 2;
            if (state.balance < cost) return state;

            const feedback = evaluateFeedback(state, 'INSURANCE_TAKE');

            // Check dealer BJ immediately
            const { total: dTotal } = calculateHandValue(state.dealerHand, true);
            const dealerHasBJ = dTotal === 21;

            let newState = {
                ...state,
                balance: state.balance - cost,
                insuranceBet: cost,
                stats: {
                    decisions: state.stats.decisions + 1,
                    correct: state.stats.correct + (feedback.correct ? 1 : 0),
                },
                lastDecisionFeedback: feedback,
            };

            if (dealerHasBJ) {
                // Insurance pays 2:1
                newState.balance += cost * 3; // Return stake + win
                newState.phase = 'DEALER_TURN'; // Proceed to reveal
            } else {
                newState.insuranceBet = 0; // Lost insurance
                // Check if player has BJ, if so, they are done
                if (state.playerHands[0].isBlackjack) {
                    newState.phase = 'DEALER_TURN';
                } else {
                    newState.phase = 'PLAYER_TURN';
                }
            }
            return newState;
        }

        case 'DECLINE_INSURANCE': {
            const feedback = evaluateFeedback(state, 'INSURANCE_DECLINE');
            const { total: dTotal } = calculateHandValue(state.dealerHand, true);

            let nextPhase: GameState['phase'] = 'PLAYER_TURN';
            if (dTotal === 21 || state.playerHands[0].isBlackjack) {
                nextPhase = 'DEALER_TURN';
            }

            return {
                ...state,
                phase: nextPhase,
                stats: {
                    decisions: state.stats.decisions + 1,
                    correct: state.stats.correct + (feedback.correct ? 1 : 0),
                },
                lastDecisionFeedback: feedback,
            };
        }

        case 'PLAYER_ACTION': {
            const playerAction = action.action;
            const activeHandIdx = state.activeHandIndex;
            const activeHand = state.playerHands[activeHandIdx];

            const feedback = evaluateFeedback(state, playerAction);
            const newStats = {
                decisions: state.stats.decisions + 1,
                correct: state.stats.correct + (feedback.correct ? 1 : 0),
            };

            let newState = { ...state, stats: newStats, lastDecisionFeedback: feedback };
            let currentHand = { ...activeHand };
            let shoe = [...state.shoe];

            if (playerAction === 'HIT') {
                const res = dealCard(shoe, currentHand);
                shoe = res.newShoe;
                currentHand = res.newHand;

                const { total } = calculateHandValue(currentHand);
                if (total > 21) {
                    currentHand.isBust = true;
                    currentHand.isStand = true;
                    // Move to next hand
                    return gameReducer({
                        ...newState,
                        shoe,
                        playerHands: newState.playerHands.map((h, i) => i === activeHandIdx ? currentHand : h),
                    }, { type: 'NEXT_HAND' });
                }
                // If 21, auto stand? Usually yes for speed.
                if (total === 21) {
                    currentHand.isStand = true;
                    return gameReducer({
                        ...newState,
                        shoe,
                        playerHands: newState.playerHands.map((h, i) => i === activeHandIdx ? currentHand : h),
                    }, { type: 'NEXT_HAND' });
                }
            } else if (playerAction === 'STAND') {
                currentHand.isStand = true;
                return gameReducer({
                    ...newState,
                    playerHands: newState.playerHands.map((h, i) => i === activeHandIdx ? currentHand : h),
                }, { type: 'NEXT_HAND' });
            } else if (playerAction === 'DOUBLE') {
                if (state.balance < currentHand.bet) return state; // Should be disabled in UI

                newState.balance -= currentHand.bet;
                currentHand.bet *= 2;
                currentHand.isDoubled = true;

                const { total: preDoubleTotal } = calculateHandValue(currentHand);
                const dealHidden = preDoubleTotal <= 11; // Hide only if 11 or under. Show if > 11 (bust risk).
                const res = dealCard(shoe, currentHand, dealHidden);
                shoe = res.newShoe;
                currentHand = res.newHand;

                const { total } = calculateHandValue(currentHand);
                if (total > 21) currentHand.isBust = true;
                currentHand.isStand = true;

                return gameReducer({
                    ...newState,
                    shoe,
                    playerHands: newState.playerHands.map((h, i) => i === activeHandIdx ? currentHand : h),
                }, { type: 'NEXT_HAND' });

            } else if (playerAction === 'SPLIT') {
                if (state.balance < currentHand.bet) return state;

                newState.balance -= currentHand.bet;

                // Create two new hands
                const card1 = currentHand.cards[0];
                const card2 = currentHand.cards[1];

                let hand1 = createHand(currentHand.bet);
                hand1.cards = [card1];
                let res1 = dealCard(shoe, hand1);
                shoe = res1.newShoe;
                hand1 = res1.newHand;

                let hand2 = createHand(currentHand.bet);
                hand2.cards = [card2];
                let res2 = dealCard(shoe, hand2);
                shoe = res2.newShoe;
                hand2 = res2.newHand;

                // Insert into hands array
                const newHands = [...state.playerHands];
                newHands.splice(activeHandIdx, 1, hand1, hand2);

                // Check for Split Aces rule (usually one card only)
                if (card1.rank === 'A') {
                    hand1.isStand = true;
                    hand2.isStand = true;
                    // Move to dealer immediately after this update if both stand?
                    // We'll let NEXT_HAND handle it.
                }

                return gameReducer({
                    ...newState,
                    shoe,
                    playerHands: newHands,
                    // Active index stays same (points to hand1), NEXT_HAND will move it if hand1 is done
                }, { type: 'NEXT_HAND' }); // Check if hand1 is done (e.g. split aces)
            }

            return {
                ...newState,
                shoe,
                playerHands: newState.playerHands.map((h, i) => i === activeHandIdx ? currentHand : h),
            };
        }

        case 'NEXT_HAND': {
            const currentIdx = state.activeHandIndex;
            const currentHand = state.playerHands[currentIdx];

            // If current hand is not done, stay
            if (!currentHand.isStand && !currentHand.isBust) return state;

            // Move to next
            if (currentIdx < state.playerHands.length - 1) {
                return { ...state, activeHandIndex: currentIdx + 1, phase: 'PLAYER_TURN' };
            } else {
                // All hands done
                return { ...state, phase: 'DEALER_TURN' };
            }
        }

        case 'REVEAL_HIDDEN': {
            const dealerHand = { ...state.dealerHand };
            dealerHand.cards = dealerHand.cards.map(c => ({ ...c, isHidden: false }));
            return { ...state, dealerHand };
        }

        case 'DEALER_HIT': {
            let shoe = [...state.shoe];
            let dealerHand = { ...state.dealerHand };
            const res = dealCard(shoe, dealerHand);
            return { ...state, shoe: res.newShoe, dealerHand: res.newHand };
        }

        case 'DEALER_STAND': {
            const dealerHand = { ...state.dealerHand, isStand: true };
            return gameReducer({ ...state, dealerHand }, { type: 'RESOLVE_DEALER' });
        }

        case 'RESOLVE_DEALER': {
            // Compare hands and pay out
            let balance = state.balance;
            const { total: dTotal, isBust: dBust } = calculateHandValue(state.dealerHand); // Re-calc to be sure

            // Check for actual blackjack property on dealer hand if we set it? 
            // We didn't set isBlackjack on dealer explicitly in DEAL, so rely on calc.
            // But wait, isBlackjack implies first 2 cards.
            const dealerHasBJ = state.dealerHand.cards.length === 2 && dTotal === 21;

            const newHands = state.playerHands.map(hand => {
                // Reveal any hidden cards (e.g. from Double Down)
                let currentHand = hand;
                if (currentHand.cards.some(c => c.isHidden)) {
                    currentHand = { ...currentHand, cards: currentHand.cards.map(c => ({ ...c, isHidden: false })) };
                }

                // Already settled insurance
                if (currentHand.isBust) return currentHand; // Lose bet (already deducted)

                const { total: pTotal } = calculateHandValue(currentHand);

                if (currentHand.isBlackjack) {
                    if (dealerHasBJ) {
                        balance += currentHand.bet; // Push
                    } else {
                        balance += currentHand.bet + (currentHand.bet * 1.5); // 3:2
                    }
                } else if (dBust) {
                    balance += currentHand.bet * 2; // Win 1:1
                } else if (dealerHasBJ) {
                    // Player not BJ (checked above), Player loses
                } else if (pTotal > dTotal) {
                    balance += currentHand.bet * 2;
                } else if (pTotal === dTotal) {
                    balance += currentHand.bet; // Push
                }
                // else Player loses
                return currentHand;
            });

            return {
                ...state,
                balance,
                playerHands: newHands,
                phase: 'RESOLUTION',
            };
        }

        case 'NEW_ROUND':
            return {
                ...state,
                playerHands: [],
                dealerHand: { cards: [], bet: 0, isActive: false, isBust: false, isBlackjack: false, isDoubled: false, isStand: false },
                currentBet: 0,
                phase: 'BETTING',
                lastDecisionFeedback: undefined,
            };

        case 'BACK_TO_LOBBY':
            return { ...state, phase: 'LOBBY' };

        case 'RESTART_GAME':
            return createInitialState();

        default:
            return state;
    }
};
