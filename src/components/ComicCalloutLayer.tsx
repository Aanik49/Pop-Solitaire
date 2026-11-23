import React from 'react';
import { CalloutBurst } from '../game/types';

export const ComicCalloutLayer: React.FC<{ callouts: CalloutBurst[] }> = ({ callouts }) => {
  if (callouts.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[10010] overflow-hidden" aria-hidden="true">
      {callouts.map((burst) => {
        const isDarkBg = burst.bgColor === '#FF1E42' || burst.bgColor === '#FF0099';
        const textColor = isDarkBg ? '#FFFFFF' : '#0D0D0D';

        return (
          <div
            key={burst.id}
            className="fixed w-[142px] h-[112px] flex items-center justify-center animate-comic-burst"
            style={{ left: `${burst.x}px`, top: `${burst.y}px` }}
          >
            <svg viewBox="0 0 160 120" className="w-full h-full drop-shadow-[4px_4px_0_#0D0D0D]">
              <polygon
                points="80,4 100,26 138,14 128,46 156,64 124,80 134,110 98,96 80,116 62,96 26,110 36,80 4,64 32,46 22,14 60,26"
                fill={burst.bgColor}
                stroke="#0D0D0D"
                strokeWidth="5"
                strokeLinejoin="round"
              />
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
