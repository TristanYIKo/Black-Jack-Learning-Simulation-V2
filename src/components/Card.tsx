import React from 'react';
import { Card as CardType } from '../types';
import { motion, Variants } from 'framer-motion';

interface CardProps {
    card: CardType;
    className?: string;
    index?: number;
    delay?: number;
}

const Card: React.FC<CardProps> = ({ card, className = '', index = 0, delay }) => {
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

    // Entrance Animation variants
    const variants: Variants = {
        hidden: {
            opacity: 0,
            y: -200,
            x: -100,
            rotate: -180,
            scale: 0.5
        },
        visible: {
            opacity: 1,
            y: 0,
            x: 0,
            rotate: 0,
            scale: 1,
            transition: {
                type: "spring",
                stiffness: 200,
                damping: 20,
                delay: delay !== undefined ? delay : index * 0.3
            }
        },
        exit: {
            opacity: 0,
            scale: 0.8,
            transition: { duration: 0.2 }
        }
    };

    return (
        <motion.div
            layout
            variants={variants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={`w-24 h-36 ${className}`}
            style={{ perspective: 1000 }}
        >
            <motion.div
                className="w-full h-full relative"
                initial={false}
                animate={{ rotateY: card.isHidden ? 180 : 0 }}
                transition={{ duration: 0.4 }}
                style={{ transformStyle: 'preserve-3d' }}
            >
                {/* FRONT FACE */}
                <div
                    className="absolute inset-0 w-full h-full bg-white rounded-lg border border-gray-300 shadow-md flex flex-col justify-between p-2"
                    style={{ backfaceVisibility: 'hidden' }}
                >
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

                {/* BACK FACE */}
                <div
                    className="absolute inset-0 w-full h-full bg-blue-800 rounded-lg border-2 border-white shadow-md flex items-center justify-center"
                    style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                >
                    <div className="w-20 h-32 border-2 border-blue-600 rounded flex items-center justify-center">
                        <span className="text-white text-2xl">♠</span>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default Card;
