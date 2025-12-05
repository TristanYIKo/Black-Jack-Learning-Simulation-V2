import React from 'react';
import { ActionType } from '../types';

interface ActionButtonsProps {
    onAction: (action: ActionType) => void;
    canHit: boolean;
    canStand: boolean;
    canDouble: boolean;
    canSplit: boolean;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({ onAction, canHit, canStand, canDouble, canSplit }) => {
    return (
        <div className="flex space-x-4">
            <button
                onClick={() => onAction('HIT')}
                disabled={!canHit}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
                HIT
            </button>
            <button
                onClick={() => onAction('STAND')}
                disabled={!canStand}
                className="px-6 py-3 bg-red-600 text-white rounded-lg font-bold hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
                STAND
            </button>
            <button
                onClick={() => onAction('DOUBLE')}
                disabled={!canDouble}
                className="px-6 py-3 bg-yellow-600 text-white rounded-lg font-bold hover:bg-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
                DOUBLE
            </button>
            <button
                onClick={() => onAction('SPLIT')}
                disabled={!canSplit}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
                SPLIT
            </button>
        </div>
    );
};

export default ActionButtons;
