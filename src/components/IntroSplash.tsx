import React, { useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { soundEngine } from '../audio/soundEngine';
import { SuitIcon } from './CardArt';

interface IntroSplashProps {
  onComplete: () => void;
}

export const IntroSplash: React.FC<IntroSplashProps> = ({ onComplete }) => {
  const completedRef = useRef(false);
  const soundPlayedRef = useRef(false);

  const finishIntro = () => {
    if (completedRef.current) return;
    completedRef.current = true;
    onComplete();
  };

  useEffect(() => {
    // Trigger comic splash intro sound immediately (if browser allows autoplay)
    if (!soundPlayedRef.current) {
      soundPlayedRef.current = true;
      soundEngine.playSplashIntro();
    }

    const timer = window.setTimeout(() => {
      finishIntro();
    }, 2200);

    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleInteraction = () => {
    soundEngine.playSplashIntro();
    finishIntro();
  };

  return (
    <div
      onClick={handleInteraction}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') handleInteraction();
      }}
      aria-label="POP! Solitaire Intro Splash Screen"
      className="relative w-full h-full pop-halftone-bg overflow-hidden flex flex-col items-center justify-center p-6 cursor-pointer"
    >
      {/* Expanding Comic Sunburst Backdrop */}
      <motion.div
        initial={{ scale: 0.2, opacity: 0, rotate: -35 }}
        animate={{ scale: 1, opacity: 0.26, rotate: 20 }}
        transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
      >
        <svg className="w-[175vmax] h-[175vmax]" viewBox="0 0 200 200" aria-hidden="true">
          <g transform="translate(100,100)">
            <polygon points="0,0 -13,-100 13,-100" fill="#FFE600" />
            <polygon points="0,0 38,-92 60,-80" fill="#FFFFFF" />
            <polygon points="0,0 80,-60 92,-38" fill="#FFE600" />
            <polygon points="0,0 100,-13 100,13" fill="#FFFFFF" />
            <polygon points="0,0 92,38 80,60" fill="#FFE600" />
            <polygon points="0,0 60,80 38,92" fill="#FFFFFF" />
            <polygon points="0,0 13,100 -13,100" fill="#FFE600" />
            <polygon points="0,0 -38,92 -60,80" fill="#FFFFFF" />
            <polygon points="0,0 -80,60 -92,38" fill="#FFE600" />
            <polygon points="0,0 -100,13 -100,-13" fill="#FFFFFF" />
            <polygon points="0,0 -92,-38 -80,-60" fill="#FFE600" />
            <polygon points="0,0 -60,-80 -38,-92" fill="#FFFFFF" />
          </g>
        </svg>
      </motion.div>

      {/* Center Animated Splash Emblem */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Animated Pop Art Card Trio Pop-In */}
        <div className="relative flex items-center justify-center h-36 sm:h-44 mb-4">
          <motion.div
            initial={{ x: 0, y: 40, rotate: 0, scale: 0.4, opacity: 0 }}
            animate={{ x: -64, y: 4, rotate: -18, scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 16, delay: 0.25 }}
            className="absolute w-22 h-30 sm:w-26 sm:h-36 rounded-xl border-[3.5px] border-[#0D0D0D] bg-[#FFFDF7] shadow-[5px_5px_0_#0D0D0D] p-2 flex flex-col justify-between card-front-dots-black"
          >
            <span className="font-bangers text-xl text-[#0D0D0D] leading-none">A</span>
            <div className="w-10 h-10 mx-auto"><SuitIcon suit="spades" /></div>
            <div className="h-2" />
          </motion.div>

          <motion.div
            initial={{ x: 0, y: 40, rotate: 0, scale: 0.4, opacity: 0 }}
            animate={{ x: 64, y: 4, rotate: 18, scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 16, delay: 0.32 }}
            className="absolute w-22 h-30 sm:w-26 sm:h-36 rounded-xl border-[3.5px] border-[#0D0D0D] bg-[#FFFDF7] shadow-[5px_5px_0_#0D0D0D] p-2 flex flex-col justify-between card-front-dots-red"
          >
            <span className="font-bangers text-xl text-[#FF1E42] leading-none self-end">K</span>
            <div className="w-10 h-10 mx-auto"><SuitIcon suit="diamonds" /></div>
            <div className="h-2" />
          </motion.div>

          <motion.div
            initial={{ scale: 0.2, y: -60, rotate: -14, opacity: 0 }}
            animate={{ scale: 1, y: 0, rotate: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.08 }}
            className="relative z-10 w-26 h-34 sm:w-30 sm:h-40 rounded-xl border-[4px] border-[#0D0D0D] bg-[#FFFDF7] shadow-[6px_6px_0_#0D0D0D] p-2.5 flex flex-col justify-between card-front-dots-red"
          >
            <span className="font-bangers text-2xl text-[#FF1E42] leading-none">A</span>
            <div className="w-14 h-14 mx-auto rounded-full bg-[#FFE600] border-[3px] border-[#0D0D0D] flex items-center justify-center p-2">
              <SuitIcon suit="hearts" />
            </div>
            <span className="font-bangers text-2xl text-[#FF1E42] leading-none self-end rotate-180">A</span>
          </motion.div>
        </div>

        {/* Explosive Comic Title Slam */}
        <motion.div
          initial={{ scale: 0.3, opacity: 0, rotate: -10 }}
          animate={{ scale: 1, opacity: 1, rotate: -2 }}
          transition={{ type: 'spring', stiffness: 280, damping: 16, delay: 0.38 }}
          className="w-[310px] sm:w-[420px] mb-6"
        >
          <svg viewBox="0 0 500 172" className="w-full h-auto drop-shadow-[6px_6px_0_#0D0D0D]" role="img" aria-label="POP! Solitaire">
            <polygon
              points="250,6 286,32 346,12 352,48 418,36 404,76 474,88 426,118 468,154 398,148 390,168 320,152 250,168 180,152 110,168 102,148 32,154 74,118 26,88 96,76 82,36 148,48 154,12 214,32"
              fill="#FFE600"
              stroke="#0D0D0D"
              strokeWidth="6"
              strokeLinejoin="round"
            />
            <text
              x="250"
              y="84"
              textAnchor="middle"
              fontFamily="Bangers, Impact, sans-serif"
              fontSize="74"
              letterSpacing="5"
              fill="#FF1E42"
              stroke="#0D0D0D"
              strokeWidth="8"
              paintOrder="stroke"
            >
              POP!
            </text>
            <rect x="66" y="96" width="368" height="58" rx="12" fill="#1D4ED8" stroke="#0D0D0D" strokeWidth="6" />
            <text
              x="250"
              y="141"
              textAnchor="middle"
              fontFamily="Bangers, Impact, sans-serif"
              fontSize="48"
              letterSpacing="4"
              fill="#FFFFFF"
              stroke="#0D0D0D"
              strokeWidth="5"
              paintOrder="stroke"
            >
              SOLITAIRE
            </text>
          </svg>
        </motion.div>

        {/* Comic Loading Bar */}
        <div className="w-56 sm:w-64 h-4 bg-[#FFFDF7] border-[3px] border-[#0D0D0D] rounded-full shadow-[3px_3px_0_#0D0D0D] overflow-hidden p-0.5">
          <motion.div
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: 1.95, ease: [0.22, 1, 0.36, 1] }}
            className="h-full bg-[#00E676] rounded-full"
          />
        </div>
      </div>
    </div>
  );
};
