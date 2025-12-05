import React, { useState, useEffect } from 'react';
import Chip from './Chip';

interface BettingControlsProps {
    balance: number;
    currentBet: number;
    onBet: (amount: number) => void;
    onClear: () => void;
    onDeal: () => void;
    lastBet: number;
    onRebet: () => void;
}

const BettingControls: React.FC<BettingControlsProps> = ({ balance, currentBet, onBet, onClear, onDeal, lastBet, onRebet }) => {
    const [animatingChip, setAnimatingChip] = useState<{ value: number; id: number } | null>(null);

    const handleBet = (amount: number) => {
        setAnimatingChip({ value: amount, id: Date.now() });
        onBet(amount);
    };

    useEffect(() => {
        if (animatingChip) {
            const timer = setTimeout(() => setAnimatingChip(null), 500);
            return () => clearTimeout(timer);
        }
    }, [animatingChip]);

    return (
        <div className="flex flex-col items-center space-y-4 bg-black/40 p-6 rounded-xl backdrop-blur-sm w-full">
            <div className="text-white text-xl font-bold">Place Your Bet</div>

            {/* Betting Area / Circle */}
            <div className="relative w-32 h-32 rounded-full border-4 border-yellow-500/30 flex items-center justify-center mb-4 bg-green-900/20">
                {currentBet > 0 ? (
                    <div className="flex flex-col items-center animate-bounce-short">
                        <div className="w-16 h-16 rounded-full bg-yellow-500 border-4 border-dashed border-yellow-300 shadow-lg flex items-center justify-center text-black font-bold">
                            ${currentBet}
                        </div>
                    </div>
                ) : (
                    <span className="text-white/20 text-xs text-center px-2">Click chips to bet</span>
                )}

                {/* Flying Chip Animation */}
                {animatingChip && (
                    <div
                        key={animatingChip.id}
                        className="absolute inset-0 flex items-center justify-center animate-ping-once opacity-0"
                    >
                        <div className="w-16 h-16 rounded-full bg-yellow-400 opacity-50"></div>
                    </div>
                )}
            </div>

            <div className="flex space-x-4">
                <Chip value={1} onClick={handleBet} disabled={balance < 1} />
                <Chip value={5} onClick={handleBet} disabled={balance < 5} />
                <Chip value={25} onClick={handleBet} disabled={balance < 25} />
                <Chip value={100} onClick={handleBet} disabled={balance < 100} />
            </div>

            <div className="flex items-center space-x-6 mt-4">
                <div className="text-white font-mono text-lg">
                    Total Bet: <span className="text-yellow-400 text-2xl font-bold">${currentBet}</span>
                </div>
                <button
                    onClick={onClear}
                    disabled={currentBet === 0}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Clear
                </button>
                <button
                    onClick={onDeal}
                    disabled={currentBet === 0}
                    className="px-8 py-3 bg-green-600 text-white text-xl font-bold rounded-lg hover:bg-green-500 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all"
                >
                    DEAL
                </button>
                {lastBet > 0 && balance >= lastBet && currentBet === 0 && (
                    <button
                        onClick={onRebet}
                        className="px-6 py-3 bg-blue-600 text-white text-lg font-bold rounded-lg hover:bg-blue-500 shadow-lg transform hover:scale-105 transition-all"
                    >
                        Rebet & Deal (${lastBet})
                    </button>
                )}
            </div>
        </div>
    );
};

export default BettingControls;
