import React from 'react';
import { CalloutBurst, GameplayTheme } from '../game/types';

export const ComicCalloutLayer: React.FC<{
  callouts: CalloutBurst[];
  gameplayTheme?: GameplayTheme;
}> = ({ callouts, gameplayTheme = 'comic' }) => {
  if (callouts.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[10010] overflow-hidden" aria-hidden="true">
      {callouts.map((burst) => {
        const isDarkBg =
          burst.bgColor === '#FF1E42' ||
          burst.bgColor === '#FF0099' ||
          burst.bgColor === '#FF2A6D' ||
          burst.bgColor === '#FF5500';
        const textColor = isDarkBg ? '#FFFFFF' : '#0D0D0D';

        return (
          <div
            key={burst.id}
            className="fixed w-[142px] h-[112px] flex items-center justify-center animate-comic-burst"
            style={{ left: `${burst.x}px`, top: `${burst.y}px` }}
          >
            <svg viewBox="0 0 160 120" className="w-full h-full drop-shadow-[4px_4px_0_#0D0D0D]">
              {gameplayTheme === 'memphis' ? (
                <>
                  <rect
                    x="12"
                    y="20"
                    width="136"
                    height="80"
                    rx="40"
                    fill={burst.bgColor}
                    stroke="#0D0D0D"
                    strokeWidth="5"
                  />
                  <circle cx="130" cy="24" r="10" fill="#FFE600" stroke="#0D0D0D" strokeWidth="3.5" />
                </>
              ) : gameplayTheme === 'street' ? (
                <polygon
                  points="10,28 144,12 152,88 18,106"
                  fill={burst.bgColor}
                  stroke="#0D0D0D"
                  strokeWidth="5.5"
                  strokeLinejoin="round"
                />
              ) : gameplayTheme === 'manga' ? (
                <polygon
                  points="80,2 96,34 148,10 124,50 158,64 122,78 144,114 96,92 80,118 64,92 16,114 38,78 2,64 36,50 12,10 64,34"
                  fill={burst.bgColor}
                  stroke="#1E1B4B"
                  strokeWidth="4.5"
                  strokeLinejoin="miter"
                />
              ) : (
                <polygon
                  points="80,4 100,26 138,14 128,46 156,64 124,80 134,110 98,96 80,116 62,96 26,110 36,80 4,64 32,46 22,14 60,26"
                  fill={burst.bgColor}
                  stroke="#0D0D0D"
                  strokeWidth="5"
                  strokeLinejoin="round"
                />
              )}
              <text
                x="80"
                y="70"
                textAnchor="middle"
                fontFamily="Bangers, sans-serif"
                fontSize="33"
                letterSpacing="1.5"
                fill={textColor}
                stroke="#0D0D0D"
                strokeWidth={isDarkBg ? '2' : '0'}
              >
                {burst.text}
              </text>
            </svg>
          </div>
        );
      })}
    </div>
  );
};
