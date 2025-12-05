import React, { useReducer, useEffect } from 'react';
import { gameReducer, createInitialState } from '../reducer';
import DealerArea from './DealerArea';
import PlayerArea from './PlayerArea';
import BettingControls from './BettingControls';
import ActionButtons from './ActionButtons';
import TrainerPanel from './TrainerPanel';
import RoundSummaryModal from './RoundSummaryModal';
import LobbyScreen from './LobbyScreen';
import { calculateHandValue } from '../utils/hand';

const BlackjackTable: React.FC = () => {
    const [state, dispatch] = useReducer(gameReducer, createInitialState());

    // Effect to handle Dealer Turn with delays
    useEffect(() => {
        if (state.phase === 'DEALER_TURN') {
            const dealerHand = state.dealerHand;
            const hasHidden = dealerHand.cards.some(c => c.isHidden);

            let timer: NodeJS.Timeout;

            if (hasHidden) {
                // Step 1: Reveal Hidden Card
                timer = setTimeout(() => {
                    dispatch({ type: 'REVEAL_HIDDEN' });
                }, 1000);
            } else {
                // Step 2: Hit or Stand
                const { total, isSoft } = calculateHandValue(dealerHand);
                // Dealer hits on soft 17
                const shouldHit = total < 17 || (total === 17 && isSoft);

                if (shouldHit) {
                    timer = setTimeout(() => {
                        dispatch({ type: 'DEALER_HIT' });
                    }, 1500); // Slower speed
                } else if (!dealerHand.isStand) {
                    timer = setTimeout(() => {
                        dispatch({ type: 'DEALER_STAND' });
                    }, 1000);
                }
            }
            return () => clearTimeout(timer);
        }
    }, [state.phase, state.dealerHand]);

    if (state.phase === 'LOBBY') {
        return (
            <LobbyScreen
                onStart={() => dispatch({ type: 'START_GAME' })}
                balance={state.balance}
                onReset={() => dispatch({ type: 'RESET_BANKROLL' })}
            />
        );
    }

    const activeHand = state.playerHands[state.activeHandIndex];

    // Determine allowed actions
    const canHit = state.phase === 'PLAYER_TURN' && !!activeHand && !activeHand.isStand && !activeHand.isBust && !activeHand.isDoubled;
    const canStand = canHit;
    const canDouble = canHit && activeHand.cards.length === 2 && state.balance >= activeHand.bet;
    const canSplit = canHit && state.playerHands.length < 4 && activeHand.cards.length === 2 && activeHand.cards[0].rank === activeHand.cards[1].rank && state.balance >= activeHand.bet;

    return (
        <div className="min-h-screen bg-[#0f380f] flex flex-col items-center py-8 relative overflow-hidden">
            {/* Table Felt Texture/Gradient */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-green-800 to-[#0f380f] opacity-50 pointer-events-none" />

            {/* Header / Stats */}
            <div className="z-10 w-full max-w-6xl flex justify-between items-start px-4 mb-4">
                <div className="text-white/50 font-bold text-xl tracking-widest">BLACKJACK TRAINER</div>
                <div className="flex flex-col items-end space-y-2">
                    <div className="text-white font-mono text-xl">Bankroll: <span className={state.balance < 20 ? 'text-red-400' : 'text-green-400'}>${state.balance}</span></div>
                    <div className="flex space-x-4">
                        <button onClick={() => dispatch({ type: 'NEW_ROUND' })} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm font-bold transition-colors">
                            Restart Game
                        </button>
                        <button onClick={() => dispatch({ type: 'START_GAME' })} className="px-8 py-3 bg-red-800 hover:bg-red-700 text-white rounded-lg text-lg font-bold transition-colors shadow-md">
                            Back to Lobby
                        </button>
                    </div>
                </div>
            </div>

            <TrainerPanel feedback={state.lastDecisionFeedback} stats={state.stats} />

            {/* Game Area */}
            <div className="z-10 flex-1 flex flex-col justify-center w-full max-w-5xl">
                <DealerArea hand={state.dealerHand} />

                <div className="flex-1 flex items-center justify-center min-h-[300px]">
                    {state.phase === 'BETTING' ? (
                        <div className="text-white/30 text-2xl font-light italic">Place your bets to begin...</div>
                    ) : (
                        <PlayerArea hands={state.playerHands} activeHandIndex={state.activeHandIndex} />
                    )}
                </div>
            </div>

            {/* Controls */}
            <div className="z-20 w-full max-w-4xl px-4 mt-auto">
                {state.phase === 'BETTING' ? (
                    <BettingControls
                        balance={state.balance}
                        currentBet={state.currentBet}
                        onBet={(amount) => dispatch({ type: 'PLACE_BET', amount })}
                        onClear={() => dispatch({ type: 'CLEAR_BET' })}
                        onDeal={() => dispatch({ type: 'DEAL' })}
                    />
                ) : (
                    <div className="flex justify-center pb-8">
                        <ActionButtons
                            onAction={(action) => dispatch({ type: 'PLAYER_ACTION', action })}
                            canHit={canHit}
                            canStand={canStand}
                            canDouble={canDouble}
                            canSplit={canSplit}
                        />
                    </div>
                )}
            </div>

            <RoundSummaryModal
                state={state}
                onNextRound={() => dispatch({ type: 'NEW_ROUND' })}
            />
        </div>
    );
};

export default BlackjackTable;
