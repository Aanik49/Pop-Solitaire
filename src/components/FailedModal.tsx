import React from 'react';
import { motion } from 'motion/react';
import { RotateCcw, Undo2, Home } from 'lucide-react';

interface FailedModalProps {
  score: number;
  moves: number;
  timeFormatted: string;
  canUndo: boolean;
  isDailyChallenge: boolean;
  onPlayAgain: () => void;
  onUndoLastMove: () => void;
  onReturnToLobby: () => void;
}

export const FailedModal: React.FC<FailedModalProps> = ({
  score,
  moves,
  timeFormatted,
  canUndo,
  isDailyChallenge,
  onPlayAgain,
  onUndoLastMove,
  onReturnToLobby,
}) => {
  return (
    <div
      className="fixed inset-0 z-[10030] bg-black/72 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="failed-modal-title"
    >
      <motion.div
        initial={{ scale: 0.72, opacity: 0, rotate: -4 }}
        animate={{ scale: 1, opacity: 1, rotate: -1 }}
        transition={{ type: 'spring', stiffness: 280, damping: 18 }}
        className="pop-panel bg-[#FFFDF7] rounded-2xl max-w-sm w-full p-6 text-center relative"
      >
        {/* Top Comic Stamp */}
        <div className="inline-block bg-[#FF1E42] text-white font-bangers text-xl px-4 py-1 border-[3px] border-[#0D0D0D] shadow-[3px_3px_0_#0D0D0D] rounded-xl -mt-11 mb-3 rotate-2 tracking-wider">
          OUT OF MOVES!
        </div>

        {/* Expressive Pop Art Sad Emoji Illustration */}
        <motion.div
          animate={{ y: [0, -5, 0], rotate: [-2, 2, -2] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
          className="w-24 h-24 sm:w-28 sm:h-28 mx-auto mb-3"
        >
          <svg
            viewBox="0 0 120 120"
            className="w-full h-full drop-shadow-[4px_4px_0_#0D0D0D]"
            role="img"
            aria-label="Sad emoji"
          >
            {/* Outer yellow face */}
            <circle cx="60" cy="60" r="50" fill="#FFE600" stroke="#0D0D0D" strokeWidth="6" />
            {/* Comic halftone cheek shade */}
            <circle cx="32" cy="70" r="8" fill="#FF6B9D" fillOpacity="0.45" />
            <circle cx="88" cy="70" r="8" fill="#FF6B9D" fillOpacity="0.45" />
            {/* Sad angled eyebrows */}
            <path d="M29,43 Q39,38 47,33" stroke="#0D0D0D" strokeWidth="5.5" strokeLinecap="round" fill="none" />
            <path d="M91,43 Q81,38 73,33" stroke="#0D0D0D" strokeWidth="5.5" strokeLinecap="round" fill="none" />
            {/* Eyes */}
            <circle cx="42" cy="54" r="6.5" fill="#0D0D0D" />
            <circle cx="40" cy="51.5" r="2.2" fill="#FFFFFF" />
            <circle cx="78" cy="54" r="6.5" fill="#0D0D0D" />
            <circle cx="76" cy="51.5" r="2.2" fill="#FFFFFF" />
            {/* Pop Art comic teardrop */}
            <path
              d="M86,62 C86,62 96,74 96,81 C96,86.5 91.5,91 86,91 C80.5,91 76,86.5 76,81 C76,74 86,62 86,62 Z"
              fill="#00D2FF"
              stroke="#0D0D0D"
              strokeWidth="4"
              strokeLinejoin="round"
            />
            <circle cx="83" cy="80" r="2.5" fill="#FFFFFF" />
            {/* Downturned sad mouth */}
            <path
              d="M40,86 Q60,70 80,86"
              fill="none"
              stroke="#0D0D0D"
              strokeWidth="6"
              strokeLinecap="round"
            />
          </svg>
        </motion.div>

        <h2
          id="failed-modal-title"
          className="font-bangers text-4xl sm:text-5xl text-[#FF1E42] comic-text-stroke tracking-wider mb-1.5"
        >
          GAME FAILED!
        </h2>
        <p className="text-sm font-bold text-[#0D0D0D]/80 mb-5 leading-snug">
          No winning moves remain on the board or in the deck. Ready for a fresh deal?
        </p>

        {/* Compact Score Summary */}
        <div className="grid grid-cols-3 gap-2 mb-5 tabular-nums">
          <div className="bg-[#FFE600]/30 border-[2.5px] border-[#0D0D0D] rounded-xl p-2">
            <div className="font-bangers text-xs text-[#FF1E42] tracking-wide">SCORE</div>
            <div className="font-bangers text-2xl text-[#0D0D0D] leading-tight">{score}</div>
          </div>
          <div className="bg-[#00D2FF]/20 border-[2.5px] border-[#0D0D0D] rounded-xl p-2">
            <div className="font-bangers text-xs text-[#1D4ED8] tracking-wide">MOVES</div>
            <div className="font-bangers text-2xl text-[#0D0D0D] leading-tight">{moves}</div>
          </div>
          <div className="bg-[#FF0099]/15 border-[2.5px] border-[#0D0D0D] rounded-xl p-2">
            <div className="font-bangers text-xs text-[#FF0099] tracking-wide">TIME</div>
            <div className="font-bangers text-2xl text-[#0D0D0D] leading-tight">{timeFormatted}</div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2.5">
          <button
            type="button"
            onClick={onPlayAgain}
            className="pop-btn play-btn-glow w-full bg-[#00E676] hover:bg-[#19FF8C] text-[#0D0D0D] font-bangers text-3xl py-3 rounded-xl tracking-wider flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-6 h-6 relative z-10" strokeWidth={3} />
            <span className="relative z-10">{isDailyChallenge ? 'TRY DAILY AGAIN' : 'PLAY AGAIN'}</span>
          </button>

          <div className={`grid ${canUndo ? 'grid-cols-2' : 'grid-cols-1'} gap-2`}>
            {canUndo && (
              <button
                type="button"
                onClick={onUndoLastMove}
                className="pop-btn bg-[#00D2FF] text-[#0D0D0D] font-bangers text-lg py-2 rounded-xl tracking-wide flex items-center justify-center gap-1.5"
              >
                <Undo2 className="w-4 h-4" strokeWidth={2.8} />
                <span>Undo Move</span>
              </button>
            )}
            <button
              type="button"
              onClick={onReturnToLobby}
              className="pop-btn bg-[#FFE600] text-[#0D0D0D] font-bangers text-lg py-2 rounded-xl tracking-wide flex items-center justify-center gap-1.5"
            >
              <Home className="w-4 h-4" strokeWidth={2.8} />
              <span>Lobby</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
