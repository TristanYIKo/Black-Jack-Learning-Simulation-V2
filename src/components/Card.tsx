import React from 'react';
import { Card as CardType } from '../types';

interface CardProps {
    card: CardType;
    className?: string;
}

const Card: React.FC<CardProps> = ({ card, className = '' }) => {
    if (card.isHidden) {
        return (
            <div className={`w-24 h-36 bg-blue-800 rounded-lg border-2 border-white shadow-md flex items-center justify-center ${className}`}>
                <div className="w-20 h-32 border border-blue-600 rounded flex items-center justify-center bg-blue-700">
                    <span className="text-blue-300 text-2xl">♠</span>
                </div>
            </div>
        );
    }

    const isRed = card.suit === 'hearts' || card.suit === 'diamonds';
    const suitIcon = {
        hearts: '♥',
        diamonds: '♦',
        clubs: '♣',
        spades: '♠',
    }[card.suit];

    return (
        <div className={`w-24 h-36 bg-white rounded-lg border border-gray-300 shadow-md flex flex-col justify-between p-2 select-none transition-transform hover:-translate-y-1 ${className}`}>
            <div className={`text-lg font-bold ${isRed ? 'text-red-600' : 'text-black'}`}>
                {card.rank}
                <div className="text-sm">{suitIcon}</div>
            </div>
            <div className={`text-4xl self-center ${isRed ? 'text-red-600' : 'text-black'}`}>
                {suitIcon}
            </div>
            <div className={`text-lg font-bold self-end rotate-180 ${isRed ? 'text-red-600' : 'text-black'}`}>
                {card.rank}
                <div className="text-sm">{suitIcon}</div>
            </div>
        </div>
    );
};

export default Card;
