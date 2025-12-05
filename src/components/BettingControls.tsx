import React from 'react';
import Chip from './Chip';

interface BettingControlsProps {
    balance: number;
    currentBet: number;
    onBet: (amount: number) => void;
    onClear: () => void;
    onDeal: () => void;
}

const BettingControls: React.FC<BettingControlsProps> = ({ balance, currentBet, onBet, onClear, onDeal }) => {
    return (
        <div className="flex flex-col items-center space-y-4 bg-black/40 p-6 rounded-xl backdrop-blur-sm">
            <div className="text-white text-xl font-bold">Place Your Bet</div>
            <div className="flex space-x-4">
                <Chip value={1} onClick={onBet} disabled={balance < 1} />
                <Chip value={5} onClick={onBet} disabled={balance < 5} />
                <Chip value={25} onClick={onBet} disabled={balance < 25} />
                <Chip value={100} onClick={onBet} disabled={balance < 100} />
            </div>
            <div className="flex items-center space-x-6 mt-4">
                <div className="text-white font-mono text-lg">
                    Bet: <span className="text-yellow-400">${currentBet}</span>
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
            </div>
        </div>
    );
};

export default BettingControls;
