import React from 'react';
import { Hand } from '../types';
import Card from './Card';
import { calculateHandValue } from '../utils/hand';
import { AnimatePresence, motion } from 'framer-motion';

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
                        {/* Result Popup - Overlay */}
                        <AnimatePresence>
                            {hand.result && hand.result !== 'LOSS' && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.5, y: 20 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.5 }}
                                    className="absolute -top-32 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
                                >
                                    <div className="bg-black/90 text-white px-6 py-4 rounded-xl border-2 border-yellow-500 shadow-2xl backdrop-blur-md">
                                        <div className="text-lg font-bold text-center whitespace-nowrap">
                                            {hand.result === 'BLACKJACK' && <span className="text-yellow-400 block text-2xl mb-1">Black Jack!</span>}
                                            {hand.result === 'WIN' && <span className="text-green-400 block text-2xl mb-1">Win!</span>}
                                            {hand.result === 'PUSH' && <span className="text-gray-300 block text-xl mb-1">Push</span>}
                                            {hand.result === 'DEALER_BLACKJACK' && <span className="text-red-400 block text-lg leading-tight">Dealer has<br />Black Jack</span>}

                                            {hand.payout !== undefined && hand.payout > 0 && (
                                                <div className="text-yellow-300 font-mono text-xl">
                                                    +${hand.payout}
                                                </div>
                                            )}
                                            {hand.result === 'PUSH' && hand.payout !== undefined && (
                                                <div className="text-gray-400 font-mono text-lg">
                                                    ${hand.payout}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="flex -space-x-12 mb-4">
                            {hand.cards.map((card, i) => (
                                <div key={card.id} className="transform hover:-translate-y-4 transition-transform duration-200" style={{ zIndex: i }}>
                                    <Card card={card} delay={i > 1 ? 0 : i * 0.6} />
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
