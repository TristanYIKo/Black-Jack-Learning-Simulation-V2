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
    const btnClass = "px-6 py-3 rounded-lg font-bold text-white shadow-lg transform transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed";

    return (
        <div className="flex space-x-4 mt-8">
            <button
                onClick={() => onAction('HIT')}
                disabled={!canHit}
                className={`${btnClass} bg-green-600 hover:bg-green-500`}
            >
                HIT
            </button>
            <button
                onClick={() => onAction('STAND')}
                disabled={!canStand}
                className={`${btnClass} bg-red-600 hover:bg-red-500`}
            >
                STAND
            </button>
            <button
                onClick={() => onAction('DOUBLE')}
                disabled={!canDouble}
                className={`${btnClass} bg-yellow-600 hover:bg-yellow-500`}
            >
                DOUBLE
            </button>
            <button
                onClick={() => onAction('SPLIT')}
                disabled={!canSplit}
                className={`${btnClass} bg-blue-600 hover:bg-blue-500`}
            >
                SPLIT
            </button>
        </div>
    );
};

export default ActionButtons;
