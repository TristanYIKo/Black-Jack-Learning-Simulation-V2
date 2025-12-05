import React from 'react';
import { Card as CardType } from '../types';

interface CardProps {
    card: CardType;
    className?: string;
}

const Card: React.FC<CardProps> = ({ card, className = '' }) => {
    const getSuitIcon = (suit: string) => {
        switch (suit) {
            case 'hearts': return '♥';
            case 'diamonds': return '♦';
            case 'clubs': return '♣';
            case 'spades': return '♠';
            default: return '';
        }
    };

    const getColor = (suit: string) => {
        return suit === 'hearts' || suit === 'diamonds' ? 'text-red-600' : 'text-black';
    };

    if (card.isHidden) {
        return (
            <div className={`w-24 h-36 bg-blue-800 rounded-lg border-2 border-white shadow-md flex items-center justify-center ${className}`}>
                <div className="w-20 h-32 border-2 border-blue-600 rounded flex items-center justify-center">
                    <span className="text-white text-2xl">♠</span>
                </div>
            </div>
        );
    }

    return (
        <div className={`w-24 h-36 bg-white rounded-lg border border-gray-300 shadow-md flex flex-col justify-between p-2 ${className}`}>
            <div className={`text-lg font-bold ${getColor(card.suit)}`}>
                {card.rank}
                <div className="text-sm">{getSuitIcon(card.suit)}</div>
            </div>

            <div className={`text-4xl self-center ${getColor(card.suit)}`}>
                {getSuitIcon(card.suit)}
            </div>

            <div className={`text-lg font-bold self-end transform rotate-180 ${getColor(card.suit)}`}>
                {card.rank}
                <div className="text-sm">{getSuitIcon(card.suit)}</div>
            </div>
        </div>
    );
};

export default Card;
