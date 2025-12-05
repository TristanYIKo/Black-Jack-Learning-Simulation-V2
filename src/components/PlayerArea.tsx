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
        <div className="flex justify-center space-x-12 mt-8">
            {hands.map((hand, index) => {
                const { total, isSoft } = calculateHandValue(hand);
                const isActive = index === activeHandIndex;

                return (
                    <div
                        key={index}
                        className={`flex flex-col items-center p-4 rounded-xl transition-all ${isActive ? 'bg-white/10 ring-2 ring-yellow-400' : 'opacity-80'}`}
                    >
                        <h2 className="text-white text-lg font-semibold mb-2">
                            Player {total > 0 && `(${total}${isSoft ? ' Soft' : ''})`}
                        </h2>
                        <div className="flex space-x-[-40px] mb-2">
                            {hand.cards.map((card, idx) => (
                                <Card key={idx} card={card} className="transform transition-transform hover:z-10" />
                            ))}
                        </div>
                        <div className="text-yellow-300 font-mono text-sm">
                            Bet: ${hand.bet}
                        </div>
                        {hand.isBust && <div className="text-red-500 font-bold mt-2">BUST!</div>}
                        {hand.isBlackjack && <div className="text-yellow-400 font-bold mt-2">BLACKJACK!</div>}
                    </div>
                );
            })}
        </div>
    );
};

export default PlayerArea;
