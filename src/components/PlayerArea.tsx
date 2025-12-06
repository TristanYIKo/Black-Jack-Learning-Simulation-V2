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
    const totalBet = hands.reduce((sum, h) => sum + h.bet, 0);
    const totalPayout = hands.reduce((sum, h) => (h.payout || 0) + sum, 0);
    const profit = totalPayout - totalBet;

    // Determine round result
    let roundResult: 'WIN' | 'LOSS' | 'PUSH' | 'BLACKJACK' | 'DEALER_BLACKJACK' | null = null;
    let displayPayout = 0;

    const allResolved = hands.every(h => h.result); // Ensure round is over

    if (allResolved && hands.length > 0) {
        if (hands.length === 1) {
            // Single hand - preserve specific statuses
            roundResult = hands[0].result || null;
            displayPayout = hands[0].payout || 0;
        } else {
            // Split hands - aggregate
            if (totalPayout > totalBet) {
                roundResult = 'WIN';
                displayPayout = totalPayout;
            } else if (totalPayout === totalBet && totalBet > 0) {
                roundResult = 'PUSH';
                displayPayout = totalBet;
            } else if (hands[0].result === 'DEALER_BLACKJACK') {
                // Special case: if dealer detected BJ early, all hands lost immediately
                roundResult = 'DEALER_BLACKJACK';
            } else {
                roundResult = 'LOSS';
            }
        }
    }

    return (
        <div className="relative flex justify-center items-end space-x-8">
            {/* Result Popup - Centralized */}
            <AnimatePresence>
                {roundResult && roundResult !== 'LOSS' && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        className="absolute -top-40 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
                    >
                        <div className="bg-black/90 text-white px-8 py-5 rounded-2xl border-2 border-yellow-500 shadow-2xl backdrop-blur-md">
                            <div className="text-xl font-bold text-center whitespace-nowrap">
                                {roundResult === 'BLACKJACK' && <span className="text-yellow-400 block text-3xl mb-1">Black Jack!</span>}
                                {roundResult === 'WIN' && <span className="text-green-400 block text-3xl mb-1">Win!</span>}
                                {roundResult === 'PUSH' && <span className="text-gray-300 block text-2xl mb-1">Push</span>}
                                {roundResult === 'DEALER_BLACKJACK' && <span className="text-red-400 block text-xl leading-tight">Dealer has<br />Black Jack</span>}

                                {displayPayout > 0 && roundResult === 'WIN' && (
                                    <div className="text-yellow-300 font-mono text-2xl mt-1">
                                        +${displayPayout - totalBet}
                                        <span className="text-sm text-gray-400 block font-sans font-normal mt-1">(Total Payout: ${displayPayout})</span>
                                    </div>
                                )}
                                {displayPayout > 0 && roundResult === 'BLACKJACK' && (
                                    <div className="text-yellow-300 font-mono text-2xl mt-1">
                                        +${displayPayout}
                                    </div>
                                )}
                                {roundResult === 'PUSH' && displayPayout > 0 && (
                                    <div className="text-gray-400 font-mono text-xl mt-1">
                                        ${displayPayout} Returned
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {hands.map((hand, index) => {
                const { total, isSoft } = calculateHandValue(hand);

                // Determine result text (just for visual card border/stats if needed, or remove resultText logic if unused?)
                // Keeping styling logic based on 'isActive'

                return (
                    <div
                        key={index}
                        className={`relative p-4 rounded-xl transition-all duration-300 ${index === activeHandIndex && hand.isActive
                            ? 'bg-yellow-500/20 border-2 border-yellow-500 shadow-[0_0_20px_rgba(234,179,8,0.3)]'
                            : 'bg-black/20 border-2 border-transparent'
                            }`}
                    >
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
