import React from 'react';
import { Play, RotateCcw, Home, Volume2, VolumeX, Music, X, Palette, Check } from 'lucide-react';
import { CardBackStyle, DrawMode } from '../game/types';
import { CARD_BACK_OPTIONS, CardBackGraphic } from './CardArt';
import { PWAInstallButton } from './PWAInstallButton';

interface PauseModalProps {
  drawMode: DrawMode;
  cardBackStyle: CardBackStyle;
  sfxEnabled: boolean;
  musicEnabled: boolean;
  onResume: () => void;
  onNewDeal: () => void;
  onToggleDrawMode: () => void;
  onSelectCardBack: (style: CardBackStyle) => void;
  onToggleSfx: () => void;
  onToggleMusic: () => void;
  onReturnToTitle: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  drawMode,
  cardBackStyle,
  sfxEnabled,
  musicEnabled,
  onResume,
  onNewDeal,
  onToggleDrawMode,
  onSelectCardBack,
  onToggleSfx,
  onToggleMusic,
  onReturnToTitle,
}) => {
  return (
    <div
      className="fixed inset-0 z-[10025] bg-black/70 flex items-center justify-center p-3 sm:p-4"
      onClick={onResume}
    >
      <div
        className="pop-panel bg-[#FFFDF7] rounded-2xl max-w-md w-full max-h-[92dvh] overflow-y-auto p-5 sm:p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onResume}
          aria-label="Resume game"
          className="pop-btn absolute top-4 right-4 w-9 h-9 bg-[#FF1E42] text-white rounded-lg flex items-center justify-center"
        >
          <X className="w-5 h-5" strokeWidth={3} />
        </button>

        <h2 className="font-bangers text-4xl text-[#1D4ED8] comic-text-stroke tracking-wider mb-1 pr-10">
          GAME PAUSED
        </h2>
        <p className="text-xs font-bold text-[#0D0D0D]/70 mb-4">
          Timer paused · Customize your deck or jump back in
        </p>

        {/* Primary Actions */}
        <div className="space-y-2.5 mb-4">
          <button
            type="button"
            onClick={onResume}
            className="pop-btn w-full bg-[#00E676] text-[#0D0D0D] font-bangers text-2xl py-2.5 rounded-xl tracking-wider flex items-center justify-center gap-2"
          >
            <Play className="w-5 h-5 fill-[#0D0D0D]" strokeWidth={2.5} />
            <span>Resume Game</span>
          </button>

          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={onNewDeal}
              className="pop-btn bg-[#FF1E42] text-white font-bangers text-xl py-2 rounded-xl tracking-wide flex items-center justify-center gap-1.5"
            >
              <RotateCcw className="w-4 h-4" strokeWidth={2.8} />
              <span>New Deal</span>
            </button>
            <button
              type="button"
              onClick={onToggleDrawMode}
              className="pop-btn bg-[#FFE600] text-[#0D0D0D] font-bangers text-xl py-2 rounded-xl tracking-wide"
            >
              Mode: Draw {drawMode}
            </button>
          </div>
        </div>

        {/* Customization Section: Pop Art Card Back Patterns */}
        <div className="bg-[#00D2FF]/15 border-[2.5px] border-[#0D0D0D] rounded-xl p-3 mb-4">
          <div className="flex items-center gap-1.5 mb-2.5">
            <Palette className="w-4 h-4 text-[#FF0099]" strokeWidth={2.8} />
            <h3 className="font-bangers text-xl tracking-wide text-[#0D0D0D] leading-none">
              Customization · Card Back
            </h3>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {CARD_BACK_OPTIONS.map((option) => {
              const isSelected = cardBackStyle === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => onSelectCardBack(option.id)}
                  aria-pressed={isSelected}
                  className={`group flex flex-col items-center gap-1.5 p-1.5 rounded-xl border-2 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#FFE600] border-[#0D0D0D] shadow-[3px_3px_0_#0D0D0D] -translate-y-0.5'
                      : 'bg-[#FFFDF7] border-[#0D0D0D]/30 hover:border-[#0D0D0D]'
                  }`}
                >
                  <div className="relative w-12 h-16 sm:w-14 sm:h-20 rounded-md border-2 border-[#0D0D0D] overflow-hidden shadow-[2px_2px_0_#0D0D0D] shrink-0">
                    <CardBackGraphic styleVariant={option.id} />
                    {isSelected && (
                      <div className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-[#00E676] border border-[#0D0D0D] flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 text-[#0D0D0D]" strokeWidth={3.5} />
                      </div>
                    )}
                  </div>
                  <span className="font-bangers text-xs tracking-wide text-[#0D0D0D] leading-none text-center whitespace-nowrap">
                    {option.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Audio Toggles */}
        <div className="grid grid-cols-2 gap-2.5 mb-4">
          <button
            type="button"
            onClick={onToggleMusic}
            className={`pop-btn py-2 px-3 rounded-xl font-bangers text-lg tracking-wide flex items-center justify-center gap-1.5 ${
              musicEnabled ? 'bg-[#00D2FF] text-[#0D0D0D]' : 'bg-slate-200 text-[#0D0D0D]/60'
            }`}
          >
            <Music className="w-4 h-4" strokeWidth={2.8} />
            <span>{musicEnabled ? 'Music: On' : 'Music: Off'}</span>
          </button>

          <button
            type="button"
            onClick={onToggleSfx}
            className={`pop-btn py-2 px-3 rounded-xl font-bangers text-lg tracking-wide flex items-center justify-center gap-1.5 ${
              sfxEnabled ? 'bg-[#00D2FF] text-[#0D0D0D]' : 'bg-slate-200 text-[#0D0D0D]/60'
            }`}
          >
            {sfxEnabled ? <Volume2 className="w-4 h-4" strokeWidth={2.8} /> : <VolumeX className="w-4 h-4" strokeWidth={2.8} />}
            <span>{sfxEnabled ? 'SFX: On' : 'SFX: Off'}</span>
          </button>
        </div>

        {/* Classic Rules Summary */}
        <div className="bg-[#FFE600]/30 border-2 border-[#0D0D0D] rounded-xl p-3 mb-4 text-xs font-semibold text-[#0D0D0D] space-y-1">
          <div className="font-bangers text-base tracking-wide text-[#FF1E42]">How to Play Classic Klondike</div>
          <p>· Build the 4 Foundations up from Ace to King by matching suit.</p>
          <p>· Stack Tableau columns down in alternating colors (Red / Black).</p>
          <p>· Only Kings can fill an empty Tableau column. Tap or drag any card!</p>
        </div>

        <div className="flex items-center justify-between gap-2.5">
          <button
            type="button"
            onClick={onReturnToTitle}
            className="pop-btn bg-[#FFFDF7] text-[#0D0D0D] font-bangers text-lg px-4 py-2 rounded-xl flex items-center gap-1.5 whitespace-nowrap"
          >
            <Home className="w-4 h-4" strokeWidth={2.8} />
            <span>Title Screen</span>
          </button>

          <PWAInstallButton compact />
        </div>
      </div>
    </div>
  );
};
