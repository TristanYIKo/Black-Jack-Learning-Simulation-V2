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
            <div className="flex space-x-[-40px]">
                {hand.cards.map((card, index) => (
                    <Card key={index} card={card} className="transform transition-transform hover:z-10" />
                ))}
            </div>
        </div>
    );
};

export default DealerArea;
