import React from 'react';
import { GameState } from '../types';
import { calculateHandValue } from '../utils/hand';

interface RoundSummaryModalProps {
    state: GameState;
    onNextRound: () => void;
}

const RoundSummaryModal: React.FC<RoundSummaryModalProps> = ({ state, onNextRound }) => {
    if (state.phase !== 'RESOLUTION') return null;

    const dealerTotal = calculateHandValue(state.dealerHand).total;
    const dealerBust = state.dealerHand.isBust;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className="bg-gray-900 border border-gray-600 p-8 rounded-2xl max-w-md w-full shadow-2xl text-center">
                <h2 className="text-3xl font-bold text-white mb-6">Round Over</h2>

                <div className="mb-6 space-y-4">
                    <div className="p-4 bg-gray-800 rounded-lg">
                        <div className="text-gray-400 text-sm">Dealer Had</div>
                        <div className="text-xl font-bold text-white">
                            {dealerTotal} {dealerBust ? '(BUST)' : ''}
                        </div>
                    </div>

                    <div className="space-y-2">
                        {state.playerHands.map((hand, idx) => {
                            const { total } = calculateHandValue(hand);
                            let result = '';
                            let color = '';

                            if (hand.isBust) {
                                result = 'BUST';
                                color = 'text-red-500';
                            } else if (hand.isBlackjack) {
                                // Check if dealer also has BJ
                                if (dealerTotal === 21 && state.dealerHand.cards.length === 2) {
                                    result = 'PUSH';
                                    color = 'text-gray-400';
                                } else {
                                    result = 'BLACKJACK!';
                                    color = 'text-yellow-400';
                                }
                            } else if (dealerBust) {
                                result = 'WIN';
                                color = 'text-green-500';
                            } else if (total > dealerTotal) {
                                result = 'WIN';
                                color = 'text-green-500';
                            } else if (total === dealerTotal) {
                                result = 'PUSH';
                                color = 'text-gray-400';
                            } else {
                                result = 'LOSE';
                                color = 'text-red-500';
                            }

                            return (
                                <div key={idx} className="flex justify-between items-center bg-gray-800 p-3 rounded">
                                    <span className="text-gray-300">Hand {idx + 1} ({total})</span>
                                    <span className={`font-bold ${color}`}>{result}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="text-xl text-white mb-6">
                    New Balance: <span className="text-green-400 font-mono">${state.balance}</span>
                </div>

                <button
                    onClick={onNextRound}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition-colors"
                >
                    Play Again
                </button>
            </div>
        </div>
    );
};

export default RoundSummaryModal;
