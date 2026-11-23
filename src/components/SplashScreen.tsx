import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { Play, Volume2, VolumeX, Music } from 'lucide-react';
import { DrawMode } from '../game/types';
import { PWAInstallButton } from './PWAInstallButton';
import { SuitIcon } from './CardArt';

interface SplashScreenProps {
  drawMode: DrawMode;
  sfxEnabled: boolean;
  musicEnabled: boolean;
  onSelectDrawMode: (mode: DrawMode) => void;
  onToggleSfx: () => void;
  onToggleMusic: () => void;
  onStartGame: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  drawMode,
  sfxEnabled,
  musicEnabled,
  onSelectDrawMode,
  onToggleSfx,
  onToggleMusic,
  onStartGame,
}) => {
  // Keyboard start: Enter or Space starts immediately
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onStartGame();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onStartGame]);

  return (
    <div className="relative w-full h-full pop-halftone-bg overflow-hidden flex flex-col items-center justify-between px-4 py-5 sm:py-8">
      {/* Rotating Comic Sunburst Backdrop */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
        <svg className="w-[175vmax] h-[175vmax] animate-spin-slow" viewBox="0 0 200 200" aria-hidden="true">
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
      </div>

      {/* Top Audio & Install Utility Bar */}
      <div className="relative z-10 w-full max-w-3xl flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onToggleMusic}
            className={`pop-btn px-3 py-1.5 rounded-xl font-bangers text-base tracking-wide flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
              musicEnabled ? 'bg-[#FFE600] text-[#0D0D0D]' : 'bg-[#FFFDF7] text-[#0D0D0D]/60'
            }`}
            title={musicEnabled ? 'Mute Music' : 'Enable Music'}
          >
            <Music className="w-4 h-4 shrink-0" strokeWidth={2.8} />
            <span>{musicEnabled ? 'Music On' : 'Music Off'}</span>
          </button>

          <button
            type="button"
            onClick={onToggleSfx}
            className={`pop-btn px-3 py-1.5 rounded-xl font-bangers text-base tracking-wide flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
              sfxEnabled ? 'bg-[#00E676] text-[#0D0D0D]' : 'bg-[#FFFDF7] text-[#0D0D0D]/60'
            }`}
            title={sfxEnabled ? 'Mute Sound Effects' : 'Enable Sound Effects'}
          >
            {sfxEnabled ? (
              <Volume2 className="w-4 h-4 shrink-0" strokeWidth={2.8} />
            ) : (
              <VolumeX className="w-4 h-4 shrink-0" strokeWidth={2.8} />
            )}
            <span>{sfxEnabled ? 'SFX On' : 'SFX Off'}</span>
          </button>
        </div>

        <PWAInstallButton compact />
      </div>

      {/* Center Hero Stage: Continuously Animated Pop Art Card Fan + Bespoke SVG Title Lockup */}
      <div className="relative z-10 flex flex-col items-center justify-center w-full max-w-xl my-auto">
        {/* Continuously Animated Pop Art Card Fan Showcase */}
        <motion.div
          initial={{ scale: 0.65, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 250, damping: 18 }}
          className="relative flex items-center justify-center h-40 sm:h-48 mb-3 sm:mb-4"
        >
          {/* Left Card: Queen of Clubs (always floating & gently swaying) */}
          <motion.div
            initial={{ rotate: 0, x: 0 }}
            animate={{ rotate: -18, x: -58 }}
            transition={{ type: 'spring', stiffness: 210, damping: 16, delay: 0.08 }}
            className="absolute"
          >
            <motion.div
              animate={{
                y: [0, -11, 2, -9, 0],
                rotate: [-3, 3, -2, 2, -3],
                scale: [1, 1.03, 1],
              }}
              transition={{
                duration: 3.1,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="w-24 h-32 sm:w-28 sm:h-40 rounded-xl border-[3.5px] border-[#0D0D0D] bg-[#FFFDF7] shadow-[5px_5px_0_#0D0D0D] p-2 flex flex-col justify-between card-front-dots-black"
            >
              <div className="flex flex-col items-center w-fit leading-none text-[#0D0D0D]">
                <span className="font-bangers text-xl">Q</span>
                <div className="w-3.5 h-3.5"><SuitIcon suit="clubs" /></div>
              </div>
              <div className="w-11 h-11 mx-auto"><SuitIcon suit="clubs" /></div>
              <div className="w-3 h-3" />
            </motion.div>
          </motion.div>

          {/* Right Card: King of Diamonds (always floating & gently swaying out of phase) */}
          <motion.div
            initial={{ rotate: 0, x: 0 }}
            animate={{ rotate: 18, x: 58 }}
            transition={{ type: 'spring', stiffness: 210, damping: 16, delay: 0.12 }}
            className="absolute"
          >
            <motion.div
              animate={{
                y: [-4, -14, 0, -10, -4],
                rotate: [3, -3, 2, -2, 3],
                scale: [1, 1.03, 1],
              }}
              transition={{
                duration: 3.4,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 0.4,
              }}
              className="w-24 h-32 sm:w-28 sm:h-40 rounded-xl border-[3.5px] border-[#0D0D0D] bg-[#FFFDF7] shadow-[5px_5px_0_#0D0D0D] p-2 flex flex-col justify-between card-front-dots-red"
            >
              <div className="flex flex-col items-center w-fit leading-none text-[#FF1E42]">
                <span className="font-bangers text-xl">K</span>
                <div className="w-3.5 h-3.5"><SuitIcon suit="diamonds" /></div>
              </div>
              <div className="w-11 h-11 mx-auto"><SuitIcon suit="diamonds" /></div>
              <div className="w-3 h-3" />
            </motion.div>
          </motion.div>

          {/* Center Hero Card: Ace of Hearts (always levitating & breathing) */}
          <motion.div
            animate={{
              y: [-6, -18, -6],
              rotate: [-2.2, 2.2, -2.2],
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 2.6,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="relative z-10 w-28 h-36 sm:w-32 sm:h-44 rounded-xl border-[4px] border-[#0D0D0D] bg-[#FFFDF7] shadow-[6px_6px_0_#0D0D0D] p-2.5 flex flex-col justify-between card-front-dots-red"
          >
            <div className="flex flex-col items-center w-fit leading-none text-[#FF1E42]">
              <span className="font-bangers text-2xl sm:text-3xl">A</span>
              <div className="w-4 h-4"><SuitIcon suit="hearts" /></div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#FFE600] border-[3px] border-[#0D0D0D] flex items-center justify-center p-2.5">
                <SuitIcon suit="hearts" />
              </div>
            </div>
            <div className="flex flex-col items-center w-fit leading-none text-[#FF1E42] self-end rotate-180">
              <span className="font-bangers text-2xl sm:text-3xl">A</span>
              <div className="w-4 h-4"><SuitIcon suit="hearts" /></div>
            </div>
          </motion.div>
        </motion.div>

        {/* Bespoke Inline SVG Comic Title Lockup */}
        <motion.div
          initial={{ scale: 0.72, opacity: 0, rotate: -4 }}
          animate={{ scale: 1, opacity: 1, rotate: -1.5 }}
          transition={{ type: 'spring', stiffness: 250, damping: 18, delay: 0.14 }}
          className="w-full max-w-[440px] mb-5 select-none"
        >
          <svg viewBox="0 0 500 172" className="w-full h-auto drop-shadow-[6px_6px_0_#0D0D0D]" role="img" aria-label="POP! Solitaire">
            {/* Background Comic Starburst */}
            <polygon
              points="250,6 286,32 346,12 352,48 418,36 404,76 474,88 426,118 468,154 398,148 390,168 320,152 250,168 180,152 110,168 102,148 32,154 74,118 26,88 96,76 82,36 148,48 154,12 214,32"
              fill="#FFE600"
              stroke="#0D0D0D"
              strokeWidth="6"
              strokeLinejoin="round"
            />
            {/* "POP!" Upper Wordmark */}
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
            {/* "SOLITAIRE" Lower Ribbon */}
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

        {/* Draw Mode Segmented Control */}
        <motion.div
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.25, delay: 0.22 }}
          className="flex items-center gap-2 mb-5 bg-[#FFFDF7] border-[3px] border-[#0D0D0D] shadow-[4px_4px_0_#0D0D0D] rounded-xl p-1.5"
        >
          <button
            type="button"
            onClick={() => onSelectDrawMode(1)}
            className={`px-4 py-1.5 rounded-lg font-bangers text-lg tracking-wider transition-colors cursor-pointer whitespace-nowrap ${
              drawMode === 1
                ? 'bg-[#FF1E42] text-white border-2 border-[#0D0D0D] shadow-[2px_2px_0_#0D0D0D]'
                : 'text-[#0D0D0D] hover:bg-[#FFE600]/40'
            }`}
          >
            Draw 1 · Classic
          </button>
          <button
            type="button"
            onClick={() => onSelectDrawMode(3)}
            className={`px-4 py-1.5 rounded-lg font-bangers text-lg tracking-wider transition-colors cursor-pointer whitespace-nowrap ${
              drawMode === 3
                ? 'bg-[#FF1E42] text-white border-2 border-[#0D0D0D] shadow-[2px_2px_0_#0D0D0D]'
                : 'text-[#0D0D0D] hover:bg-[#FFE600]/40'
            }`}
          >
            Draw 3 · Vegas
          </button>
        </motion.div>

        {/* Primary Play CTA */}
        <motion.button
          type="button"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.26 }}
          onClick={onStartGame}
          className="pop-btn w-full max-w-xs bg-[#00E676] hover:bg-[#19FF8C] text-[#0D0D0D] font-bangers text-3xl sm:text-4xl py-3.5 px-8 rounded-2xl tracking-wider flex items-center justify-center gap-3"
        >
          <Play className="w-8 h-8 fill-[#0D0D0D]" strokeWidth={2.5} />
          <span>PLAY NOW!</span>
        </motion.button>
      </div>

      {/* Bottom vertical balance spacer */}
      <div className="h-2 sm:h-4 shrink-0" aria-hidden="true" />
    </div>
  );
};
