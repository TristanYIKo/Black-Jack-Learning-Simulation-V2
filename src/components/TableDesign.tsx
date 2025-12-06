import React from 'react';

const TableDesign: React.FC = () => {
    return (
        <div className="absolute inset-x-0 top-[28%] -translate-y-1/2 flex justify-center pointer-events-none opacity-80">
            <svg
                width="800"
                height="400"
                viewBox="0 0 800 400"
                className="w-full max-w-3xl"
                style={{ overflow: 'visible' }}
            >
                <defs>
                    {/* Main top arch for "BLACKJACK PAYS 3 TO 2" - Compacted Rainbow */}
                    <path
                        id="blackjackPath"
                        d="M 220,260 A 350,350 0 0,0 580,260"
                        fill="transparent"
                    />

                    {/* Sub arch for "Dealer must stand..." - Moved down to 300 for spacing */}
                    <path
                        id="dealerRulePath"
                        d="M 250,300 A 350,350 0 0,0 550,300"
                        fill="transparent"
                    />

                    {/* Arch for Insurance - Moved down to 350 */}
                    <path
                        id="insurancePath"
                        d="M 280,350 A 300,300 0 0,0 520,350"
                        fill="transparent"
                    />
                </defs>

                {/* BLACKJACK PAYS 3 TO 2 */}
                <text fill="#FFD700" fontSize="26" fontWeight="bold" letterSpacing="4" textAnchor="middle">
                    <textPath href="#blackjackPath" startOffset="50%" textAnchor="middle">
                        BLACKJACK PAYS 3 TO 2
                    </textPath>
                </text>

                {/* Dealer Rule */}
                <text fill="white" fontSize="13" fontWeight="500" letterSpacing="1" textAnchor="middle" dy="-5">
                    <textPath href="#dealerRulePath" startOffset="50%" textAnchor="middle">
                        Dealer must stand on 17 and draw to 16
                    </textPath>
                </text>

                {/* INSURANCE BOX & TEXT */}
                {/* Yellow Box Background/Border - Matches new Insurance path at Y=350 */}
                <path
                    d="M 270,330 A 310,310 0 0,0 530,330 L 530,365 A 310,310 0 0,1 270,365 Z"
                    fill="transparent"
                    stroke="#FFD700"
                    strokeWidth="2"
                    strokeOpacity="0.8"
                />

                <text fill="#FFD700" fontSize="18" fontWeight="bold" letterSpacing="2" textAnchor="middle" dy="5">
                    <textPath href="#insurancePath" startOffset="50%" textAnchor="middle">
                        INSURANCE PAYS 2:1
                    </textPath>
                </text>
            </svg>
        </div>
    );
};

export default TableDesign;
