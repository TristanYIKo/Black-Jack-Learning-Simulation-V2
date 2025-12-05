import React from 'react';
import { Hand } from '../types';
import Card from './Card';
import { calculateHandValue } from '../utils/hand';

interface PlayerAreaProps {
    hands: Hand[];
    activeHandIndex: number;
}

const PlayerArea: React.FC<PlayerAreaProps> = ({ hands, activeHandIndex }) => {
    return (
        <div className="flex justify-center items-end space-x-8">
            {hands.map((hand, index) => {
                const { total, isSoft } = calculateHandValue(hand);

                // Determine result text
                let resultText = '';
                let resultColor = '';

                if (hand.isBust) {
                    resultText = 'BUST';
                    resultColor = 'text-red-500';
                } else if (hand.isBlackjack) {
                    resultText = 'BLACKJACK!';
                    resultColor = 'text-yellow-400';
                } else if (hand.isStand && !hand.isActive) {
                    // If round is over (resolution phase), we could show Win/Loss if we passed that info down
                    // But for now, let's rely on the fact that if it's not active and not bust, we just show the score
                }

                return (
                    <div
                        key={index}
                        className={`relative p-4 rounded-xl transition-all duration-300 ${index === activeHandIndex && hand.isActive
                                ? 'bg-yellow-500/20 border-2 border-yellow-500 shadow-[0_0_20px_rgba(234,179,8,0.3)]'
                                : 'bg-black/20 border-2 border-transparent'
                            }`}
                    >
                        {/* Hand Status Overlay */}
                        {!hand.isActive && (hand.isBust || hand.isBlackjack || hand.isStand) && (
                            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-20 whitespace-nowrap">
                                <span className={`text-xl font-black px-3 py-1 rounded-full bg-black/80 border border-white/10 ${resultColor || 'text-white'}`}>
                                    {resultText || total}
                                </span>
                            </div>
                        )}

                        <div className="flex -space-x-12 mb-4">
                            {hand.cards.map((card, i) => (
                                <div key={i} className="transform hover:-translate-y-4 transition-transform duration-200" style={{ zIndex: i }}>
                                    <Card card={card} />
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-between items-end">
                            <div className="text-white font-mono text-sm bg-black/40 px-2 py-1 rounded">
                                Bet: ${hand.bet}
                            </div>
                            <div className="text-white font-bold text-lg">
                                {total} {isSoft && total !== 21 ? ' (Soft)' : ''}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default PlayerArea;
