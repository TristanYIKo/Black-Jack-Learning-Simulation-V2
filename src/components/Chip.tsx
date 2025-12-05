import React from 'react';

interface ChipProps {
    value: number;
    onClick: (value: number) => void;
    disabled?: boolean;
}

const Chip: React.FC<ChipProps> = ({ value, onClick, disabled }) => {
    const getColor = (val: number) => {
        switch (val) {
            case 1: return 'bg-white text-gray-800 border-gray-300';
            case 5: return 'bg-red-600 text-white border-red-800';
            case 25: return 'bg-green-600 text-white border-green-800';
            case 100: return 'bg-black text-white border-gray-600';
            default: return 'bg-blue-500 text-white';
        }
    };

    return (
        <button
            onClick={() => onClick(value)}
            disabled={disabled}
            className={`
        w-16 h-16 rounded-full border-4 border-dashed flex items-center justify-center shadow-lg
        transform transition-all active:scale-95 hover:scale-105
        ${getColor(value)}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
        >
            <span className="font-bold text-sm">${value}</span>
        </button>
    );
};

export default Chip;
