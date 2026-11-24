import React, { useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Play, Volume2, VolumeX, Music, Calendar, Award, Check } from 'lucide-react';
import { DrawMode } from '../game/types';
import { SuitIcon } from './CardArt';

interface SplashScreenProps {
  drawMode: DrawMode;
  sfxEnabled: boolean;
  musicEnabled: boolean;
  dailyDateLabel: string;
  isDailyWinner: boolean;
  dailyStreak: number;
  quitToastVisible: boolean;
  onSelectDrawMode: (mode: DrawMode) => void;
  onToggleSfx: () => void;
  onToggleMusic: () => void;
  onStartGame: () => void;
  onStartDailyChallenge: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  drawMode,
  sfxEnabled,
  musicEnabled,
  dailyDateLabel,
  isDailyWinner,
  dailyStreak,
  quitToastVisible,
  onSelectDrawMode,
  onToggleSfx,
  onToggleMusic,
  onStartGame,
  onStartDailyChallenge,
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
    <div className="relative w-full h-full pop-halftone-bg overflow-hidden flex flex-col items-center justify-between px-4 py-4 sm:py-7">
      {/* Softened Rotating Comic Sunburst Backdrop */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
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

      {/* Top Utility Bar: Clean Icon-Only Music & SFX Toggles */}
      <div className="relative z-10 w-full max-w-3xl flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={onToggleMusic}
          aria-label={musicEnabled ? 'Mute Music' : 'Enable Music'}
          title={musicEnabled ? 'Mute Music' : 'Enable Music'}
          className={`pop-btn w-10 h-10 rounded-xl flex items-center justify-center relative shrink-0 ${
            musicEnabled ? 'bg-[#FFE600] text-[#0D0D0D]' : 'bg-[#FFFDF7] text-[#0D0D0D]/45'
          }`}
        >
          <Music className="w-5 h-5" strokeWidth={2.8} />
          {!musicEnabled && (
            <span className="absolute w-7 h-[2.5px] bg-[#FF1E42] rotate-45 rounded-full" aria-hidden="true" />
          )}
        </button>

        <button
          type="button"
          onClick={onToggleSfx}
          aria-label={sfxEnabled ? 'Mute Sound Effects' : 'Enable Sound Effects'}
          title={sfxEnabled ? 'Mute Sound Effects' : 'Enable Sound Effects'}
          className={`pop-btn w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
            sfxEnabled ? 'bg-[#00E676] text-[#0D0D0D]' : 'bg-[#FFFDF7] text-[#0D0D0D]/45'
          }`}
        >
          {sfxEnabled ? (
            <Volume2 className="w-5 h-5" strokeWidth={2.8} />
          ) : (
            <VolumeX className="w-5 h-5 text-[#FF1E42]" strokeWidth={2.8} />
          )}
        </button>
      </div>

      {/* Center Hero Stage: Daily Winner Badge + Choreographed Expand/Retract 3-Card Fan + Title Lockup */}
      <div className="relative z-10 flex flex-col items-center justify-center w-full max-w-xl my-auto">
        {/* Daily Winner Comic Badge */}
        {isDailyWinner && (
          <motion.div
            initial={{ scale: 0.6, opacity: 0, rotate: -6 }}
            animate={{ scale: 1, opacity: 1, rotate: -2 }}
            transition={{ type: 'spring', stiffness: 280, damping: 16 }}
            className="mb-2 inline-flex items-center gap-2 bg-[#FF0099] text-white border-[3px] border-[#0D0D0D] shadow-[4px_4px_0_#0D0D0D] rounded-xl px-3.5 py-1"
          >
            <Award className="w-5 h-5 text-[#FFE600] shrink-0" strokeWidth={2.8} />
            <span className="font-bangers text-lg sm:text-xl tracking-wider leading-none">
              DAILY WINNER · {dailyDateLabel}
              {dailyStreak > 1 ? ` · ${dailyStreak} DAY STREAK` : ''}
            </span>
          </motion.div>
        )}

        {/* Lobby 3-Card Choreographed Animation */}
        <div className="relative flex items-center justify-center h-36 sm:h-44 mb-2 sm:mb-3 w-full">
          {/* Left Behind Card: Queen of Clubs */}
          <motion.div
            animate={{
              x: [0, 0, -90, -90, 0, 0],
              y: [0, -5, -10, -6, 0, 0],
              rotate: [0, 0, -16, -16, 0, 0],
              scale: [0.92, 0.94, 1, 1, 0.92, 0.92],
            }}
            transition={{
              duration: 3.1,
              times: [0, 0.16, 0.36, 0.72, 0.9, 1],
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="absolute z-[2] w-24 h-32 sm:w-28 sm:h-40 rounded-xl border-[3.5px] border-[#0D0D0D] bg-[#FFFDF7] shadow-[5px_5px_0_#0D0D0D] p-2 flex flex-col justify-between card-front-dots-black"
          >
            <div className="flex flex-col items-center w-fit leading-none text-[#0D0D0D]">
              <span className="font-bangers text-2xl sm:text-3xl leading-none">Q</span>
              <div className="w-4 h-4"><SuitIcon suit="clubs" /></div>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto"><SuitIcon suit="clubs" /></div>
            <div className="flex flex-col items-center w-fit leading-none text-[#0D0D0D] self-end rotate-180">
              <span className="font-bangers text-lg leading-none">Q</span>
              <div className="w-3 h-3"><SuitIcon suit="clubs" /></div>
            </div>
          </motion.div>

          {/* Right Behind Card: King of Diamonds */}
          <motion.div
            animate={{
              x: [0, 0, 90, 90, 0, 0],
              y: [0, -5, -10, -6, 0, 0],
              rotate: [0, 0, 16, 16, 0, 0],
              scale: [0.92, 0.94, 1, 1, 0.92, 0.92],
            }}
            transition={{
              duration: 3.1,
              times: [0, 0.16, 0.36, 0.72, 0.9, 1],
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="absolute z-[2] w-24 h-32 sm:w-28 sm:h-40 rounded-xl border-[3.5px] border-[#0D0D0D] bg-[#FFFDF7] shadow-[5px_5px_0_#0D0D0D] p-2 flex flex-col justify-between card-front-dots-red"
          >
            <div className="flex flex-col items-center w-fit leading-none text-[#FF1E42] self-end">
              <span className="font-bangers text-2xl sm:text-3xl leading-none">K</span>
              <div className="w-4 h-4"><SuitIcon suit="diamonds" /></div>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto"><SuitIcon suit="diamonds" /></div>
            <div className="flex flex-col items-center w-fit leading-none text-[#FF1E42] self-start rotate-180">
              <span className="font-bangers text-lg leading-none">K</span>
              <div className="w-3 h-3"><SuitIcon suit="diamonds" /></div>
            </div>
          </motion.div>

          {/* Center Front Card: Ace of Hearts */}
          <motion.div
            animate={{
              y: [-4, -14, -4],
              rotate: [-1.5, 1.5, -1.5],
              scale: [1, 1.04, 1],
            }}
            transition={{
              duration: 3.1,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="relative z-10 w-26 h-34 sm:w-32 sm:h-42 rounded-xl border-[4px] border-[#0D0D0D] bg-[#FFFDF7] shadow-[6px_6px_0_#0D0D0D] p-2.5 flex flex-col justify-between card-front-dots-red"
          >
            <div className="flex flex-col items-center w-fit leading-none text-[#FF1E42]">
              <span className="font-bangers text-2xl sm:text-3xl">A</span>
              <div className="w-4 h-4"><SuitIcon suit="hearts" /></div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-14 h-14 sm:w-18 sm:h-18 rounded-full bg-[#FFE600] border-[3px] border-[#0D0D0D] flex items-center justify-center p-2.5">
                <SuitIcon suit="hearts" />
              </div>
            </div>
            <div className="flex flex-col items-center w-fit leading-none text-[#FF1E42] self-end rotate-180">
              <span className="font-bangers text-2xl sm:text-3xl">A</span>
              <div className="w-4 h-4"><SuitIcon suit="hearts" /></div>
            </div>
          </motion.div>
        </div>

        {/* Bespoke Inline SVG Comic Title Lockup */}
        <motion.div
          initial={{ scale: 0.78, opacity: 0, rotate: -4 }}
          animate={{ scale: 1, opacity: 1, rotate: -1.5 }}
          transition={{ type: 'spring', stiffness: 250, damping: 18, delay: 0.08 }}
          className="w-full max-w-[395px] sm:max-w-[430px] mb-4 select-none"
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

        {/* Draw Mode Segmented Control */}
        <motion.div
          initial={{ y: 14, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.22, delay: 0.14 }}
          className="flex items-center gap-2 mb-4 bg-[#FFFDF7] border-[3px] border-[#0D0D0D] shadow-[4px_4px_0_#0D0D0D] rounded-xl p-1.5"
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

        {/* Action Buttons Stack: Daily Challenge + Glowing/Shining Play CTA */}
        <motion.div
          initial={{ y: 18, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.18 }}
          className="w-full max-w-xs flex flex-col gap-3"
        >
          <button
            type="button"
            onClick={onStartDailyChallenge}
            className={`pop-btn w-full font-bangers text-xl sm:text-2xl py-2.5 px-6 rounded-2xl tracking-wider flex items-center justify-center gap-2.5 whitespace-nowrap ${
              isDailyWinner
                ? 'bg-[#FFE600] hover:bg-[#FFF04D] text-[#0D0D0D]'
                : 'bg-[#FF0099] hover:bg-[#FF1FA6] text-white'
            }`}
          >
            {isDailyWinner ? (
              <Check className="w-5 h-5 text-[#0D0D0D] shrink-0" strokeWidth={3.5} />
            ) : (
              <Calendar className="w-5 h-5 shrink-0" strokeWidth={2.8} />
            )}
            <span>
              {isDailyWinner
                ? `Daily Cleared · ${dailyDateLabel}`
                : `Daily Challenge · ${dailyDateLabel}`}
            </span>
          </button>

          <button
            type="button"
            onClick={onStartGame}
            className="pop-btn play-btn-glow w-full bg-[#00E676] hover:bg-[#19FF8C] text-[#0D0D0D] font-bangers text-3xl sm:text-4xl py-3 px-8 rounded-2xl tracking-wider flex items-center justify-center gap-3 whitespace-nowrap"
          >
            <Play className="w-8 h-8 fill-[#0D0D0D] relative z-10" strokeWidth={2.5} />
            <span className="relative z-10">PLAY NOW!</span>
          </button>
        </motion.div>
      </div>

      {/* Bottom vertical balance spacer */}
      <div className="h-2 sm:h-4 shrink-0" aria-hidden="true" />

      {/* Designed Pop Art Lobby Back-to-Quit Toast */}
      <AnimatePresence>
        {quitToastVisible && (
          <motion.div
            initial={{ y: 36, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 24, opacity: 0, scale: 0.94 }}
            transition={{ type: 'spring', stiffness: 320, damping: 22 }}
            role="status"
            aria-live="polite"
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[10050] max-w-[92vw] bg-[#0D0D0D] text-[#FFE600] border-[3px] border-[#FFE600] shadow-[4px_4px_0_#FF1E42] rounded-2xl px-5 py-2.5 flex items-center gap-2.5"
          >
            <span className="w-3 h-3 rounded-full bg-[#FF1E42] border border-[#FFE600] shrink-0" aria-hidden="true" />
            <span className="font-bangers text-base sm:text-lg tracking-wider text-center leading-tight">
              Press Back two times in a row for quiting game
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
