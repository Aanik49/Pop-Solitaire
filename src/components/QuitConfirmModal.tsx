import React from 'react';
import { motion } from 'motion/react';
import { LogOut, Play } from 'lucide-react';

interface QuitConfirmModalProps {
  onConfirmQuit: () => void;
  onCancelQuit: () => void;
}

export const QuitConfirmModal: React.FC<QuitConfirmModalProps> = ({
  onConfirmQuit,
  onCancelQuit,
}) => {
  return (
    <div
      className="fixed inset-0 z-[10040] bg-black/72 flex items-center justify-center p-4"
      onClick={onCancelQuit}
      role="dialog"
      aria-modal="true"
      aria-labelledby="quit-confirm-title"
    >
      <motion.div
        initial={{ scale: 0.78, opacity: 0, rotate: -3 }}
        animate={{ scale: 1, opacity: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="pop-panel bg-[#FFFDF7] rounded-2xl max-w-sm w-full p-6 text-center relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="inline-block bg-[#FFE600] text-[#0D0D0D] font-bangers text-lg px-3.5 py-0.5 border-[3px] border-[#0D0D0D] shadow-[3px_3px_0_#0D0D0D] rounded-xl -mt-10 mb-3 -rotate-2 tracking-wider">
          HOLD ON!
        </div>

        <h2
          id="quit-confirm-title"
          className="font-bangers text-4xl text-[#FF1E42] comic-text-stroke tracking-wider mb-2"
        >
          QUIT GAME?
        </h2>
        <p className="text-sm font-bold text-[#0D0D0D]/80 mb-6 leading-snug">
          Are you sure you want to leave this deal and return to the Lobby?
        </p>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onConfirmQuit}
            className="pop-btn bg-[#FF1E42] hover:bg-[#FF3355] text-white font-bangers text-2xl py-2.5 rounded-xl tracking-wider flex items-center justify-center gap-1.5"
          >
            <LogOut className="w-5 h-5" strokeWidth={2.8} />
            <span>YES</span>
          </button>

          <button
            type="button"
            onClick={onCancelQuit}
            className="pop-btn bg-[#00E676] hover:bg-[#19FF8C] text-[#0D0D0D] font-bangers text-2xl py-2.5 rounded-xl tracking-wider flex items-center justify-center gap-1.5"
          >
            <Play className="w-5 h-5 fill-[#0D0D0D]" strokeWidth={2.5} />
            <span>NO</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};
