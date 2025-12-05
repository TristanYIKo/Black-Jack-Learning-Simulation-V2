import React from 'react';

interface LobbyScreenProps {
    onStart: () => void;
    balance: number;
    onReset: () => void;
}

const LobbyScreen: React.FC<LobbyScreenProps> = ({ onStart, balance, onReset }) => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-green-900 to-black flex flex-col items-center justify-center text-white p-4">
            <div className="max-w-2xl w-full text-center space-y-8">
                <h1 className="text-6xl font-bold text-yellow-500 drop-shadow-lg tracking-wider">
                    BLACKJACK
                    <span className="block text-2xl text-white mt-2 font-light tracking-normal">Training Simulation</span>
                </h1>

                <div className="bg-black/30 backdrop-blur-md p-8 rounded-2xl border border-white/10 shadow-2xl">
                    <h2 className="text-2xl font-semibold mb-4">Current Bankroll</h2>
                    <div className={`text-5xl font-mono mb-6 ${balance <= 0 ? 'text-red-500' : 'text-green-400'}`}>
                        ${balance}
                    </div>

                    {balance < 1 ? (
                        <div className="space-y-4">
                            <p className="text-red-300">You're out of chips!</p>
                            <button
                                onClick={onReset}
                                className="px-8 py-3 bg-yellow-600 hover:bg-yellow-500 rounded-lg font-bold transition-transform hover:scale-105"
                            >
                                Reset to $100
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={onStart}
                            className="px-12 py-4 bg-green-600 hover:bg-green-500 rounded-xl font-bold text-xl shadow-lg transition-all hover:scale-105 hover:shadow-green-500/20"
                        >
                            START TRAINING
                        </button>
                    )}
                </div>

                <div className="text-left bg-black/20 p-6 rounded-xl text-gray-300 text-sm">
                    <h3 className="text-white font-bold mb-2 text-lg">How to Play & Train</h3>
                    <ul className="list-disc list-inside space-y-1">
                        <li>Goal: Beat the dealer's hand without going over 21.</li>
                        <li>Blackjack pays 3:2. Dealer hits on Soft 17.</li>
                        <li><strong>Training Mode:</strong> Every decision you make is analyzed against Basic Strategy.</li>
                        <li>You'll get instant feedback on whether your move was statistically optimal.</li>
                        <li>Track your accuracy and improve your game!</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default LobbyScreen;
