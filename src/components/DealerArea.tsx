import React from 'react';
import { Hand } from '../types';
import Card from './Card';
import { calculateHandValue } from '../utils/hand';

interface DealerAreaProps {
    hand: Hand;
}

const DealerArea: React.FC<DealerAreaProps> = ({ hand }) => {
    const { total } = calculateHandValue(hand);

    // Only show total if no hidden cards
    const showTotal = !hand.cards.some(c => c.isHidden);

    return (
        <div className="flex flex-col items-center mb-8">
            <h2 className="text-white text-lg font-semibold mb-2">Dealer {showTotal ? `(${total})` : ''}</h2>
            <div className="flex -space-x-12 mb-4">
                {hand.cards.map((card, index) => (
                    <div key={card.id} className="transform hover:-translate-y-4 transition-transform duration-200" style={{ zIndex: index }}>
                        <Card
                            card={card}
                            delay={index > 1 ? 0 : (index * 0.6) + 0.3}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DealerArea;
