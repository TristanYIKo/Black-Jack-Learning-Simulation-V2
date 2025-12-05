import React from 'react';
import { Feedback, Stats } from '../types';

interface TrainerPanelProps {
    feedback?: Feedback;
    stats: Stats;
}

const TrainerPanel: React.FC<TrainerPanelProps> = ({ feedback, stats }) => {
    const accuracy = stats.decisions > 0
        ? Math.round((stats.correct / stats.decisions) * 100)
        : 0;

    return (
        <div className="absolute top-4 right-4 w-80 bg-black/60 backdrop-blur-md p-4 rounded-lg border border-gray-700 text-white shadow-xl">
            <h3 className="text-lg font-bold mb-2 text-yellow-400">Basic Strategy Trainer</h3>

            <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                    <span>Accuracy:</span>
                    <span className={`font-bold ${accuracy >= 90 ? 'text-green-400' : accuracy >= 70 ? 'text-yellow-400' : 'text-red-400'}`}>
                        {accuracy}%
                    </span>
                </div>
                <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden">
                    <div
                        className={`h-full ${accuracy >= 90 ? 'bg-green-500' : accuracy >= 70 ? 'bg-yellow-500' : 'bg-red-500'}`}
                        style={{ width: `${accuracy}%` }}
                    />
                </div>
                <div className="text-xs text-gray-400 mt-1 text-right">
                    {stats.correct} / {stats.decisions} Correct
                </div>
            </div>

            {feedback && (
                <div className={`p-3 rounded border ${feedback.correct ? 'bg-green-900/50 border-green-500' : 'bg-red-900/50 border-red-500'}`}>
                    <div className="font-bold mb-1">
                        {feedback.correct ? '✅ Correct Decision!' : '❌ Incorrect Decision'}
                    </div>
                    {!feedback.correct && (
                        <div className="text-sm">
                            You chose <span className="font-bold">{feedback.userAction}</span>.
                            <br />
                            Basic Strategy says: <span className="font-bold text-yellow-300">{feedback.optimalAction}</span>.
                        </div>
                    )}
                    {feedback.correct && (
                        <div className="text-sm text-green-200">
                            Good job following the chart!
                        </div>
                    )}
                </div>
            )}

            {!feedback && stats.decisions === 0 && (
                <div className="text-sm text-gray-400 italic">
                    Make a move to see feedback...
                </div>
            )}
        </div>
    );
};

export default TrainerPanel;
