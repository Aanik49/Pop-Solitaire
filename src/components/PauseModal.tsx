import React from 'react';
import {
  Play,
  RotateCcw,
  Home,
  Volume2,
  VolumeX,
  Music,
  X,
  Palette,
  Check,
  Calendar,
  Image,
} from 'lucide-react';
import { BackgroundTheme, CardBackStyle, DrawMode } from '../game/types';
import { CARD_BACK_OPTIONS, CardBackGraphic } from './CardArt';

const BACKGROUND_OPTIONS: { id: BackgroundTheme; label: string; previewClass: string }[] = [
  { id: 'cyan', label: 'Pop Cyan', previewClass: 'bg-theme-cyan' },
  { id: 'mint', label: 'Arcade Mint', previewClass: 'bg-theme-mint' },
  { id: 'lavender', label: 'Comic Violet', previewClass: 'bg-theme-lavender' },
  { id: 'peach', label: 'Sunset Peach', previewClass: 'bg-theme-peach' },
];

interface PauseModalProps {
  drawMode: DrawMode;
  isDailyChallenge: boolean;
  dailyDateLabel: string;
  cardBackStyle: CardBackStyle;
  backgroundTheme: BackgroundTheme;
  sfxEnabled: boolean;
  musicEnabled: boolean;
  onResume: () => void;
  onNewDeal: () => void;
  onStartDailyChallenge: () => void;
  onToggleDrawMode: () => void;
  onSelectCardBack: (style: CardBackStyle) => void;
  onSelectBackgroundTheme: (theme: BackgroundTheme) => void;
  onToggleSfx: () => void;
  onToggleMusic: () => void;
  onReturnToTitle: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  drawMode,
  isDailyChallenge,
  dailyDateLabel,
  cardBackStyle,
  backgroundTheme,
  sfxEnabled,
  musicEnabled,
  onResume,
  onNewDeal,
  onStartDailyChallenge,
  onToggleDrawMode,
  onSelectCardBack,
  onSelectBackgroundTheme,
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
          {isDailyChallenge
            ? `Daily Challenge (${dailyDateLabel}) · Same seeded deal for everyone today`
            : 'Timer paused · Customize your table or jump back in'}
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
              className="pop-btn bg-[#FF1E42] text-white font-bangers text-xl py-2 rounded-xl tracking-wide flex items-center justify-center gap-1.5 whitespace-nowrap"
            >
              <RotateCcw className="w-4 h-4 shrink-0" strokeWidth={2.8} />
              <span>{isDailyChallenge ? 'Restart Daily' : 'New Deal'}</span>
            </button>

            {isDailyChallenge ? (
              <button
                type="button"
                onClick={onToggleDrawMode}
                className="pop-btn bg-[#FFE600] text-[#0D0D0D] font-bangers text-xl py-2 rounded-xl tracking-wide whitespace-nowrap"
              >
                Switch Classic
              </button>
            ) : (
              <button
                type="button"
                onClick={onStartDailyChallenge}
                className="pop-btn bg-[#FF0099] text-white font-bangers text-xl py-2 rounded-xl tracking-wide flex items-center justify-center gap-1.5 whitespace-nowrap"
              >
                <Calendar className="w-4 h-4 shrink-0" strokeWidth={2.8} />
                <span>Daily · {dailyDateLabel}</span>
              </button>
            )}
          </div>

          {!isDailyChallenge && (
            <button
              type="button"
              onClick={onToggleDrawMode}
              className="pop-btn w-full bg-[#FFE600] text-[#0D0D0D] font-bangers text-lg py-1.5 rounded-xl tracking-wide"
            >
              Classic Mode: Draw {drawMode} (Tap to Switch)
            </button>
          )}
        </div>

        {/* Customization Section 1: Card Back */}
        <div className="bg-[#00D2FF]/15 border-[2.5px] border-[#0D0D0D] rounded-xl p-3 mb-3.5">
          <div className="flex items-center gap-1.5 mb-2.5">
            <Palette className="w-4 h-4 text-[#FF0099]" strokeWidth={2.8} />
            <h3 className="font-bangers text-xl tracking-wide text-[#0D0D0D] leading-none">
              Customization - Card Back
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

        {/* Customization Section 2: Background (4 Pop Art Soft Halftone Table Themes) */}
        <div className="bg-[#FFE600]/20 border-[2.5px] border-[#0D0D0D] rounded-xl p-3 mb-5">
          <div className="flex items-center gap-1.5 mb-2.5">
            <Image className="w-4 h-4 text-[#1D4ED8]" strokeWidth={2.8} />
            <h3 className="font-bangers text-xl tracking-wide text-[#0D0D0D] leading-none">
              Customization - Background
            </h3>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {BACKGROUND_OPTIONS.map((bg) => {
              const isSelected = backgroundTheme === bg.id;
              return (
                <button
                  key={bg.id}
                  type="button"
                  onClick={() => onSelectBackgroundTheme(bg.id)}
                  aria-pressed={isSelected}
                  className={`flex flex-col items-center gap-1.5 p-1.5 rounded-xl border-2 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#FFE600] border-[#0D0D0D] shadow-[3px_3px_0_#0D0D0D] -translate-y-0.5'
                      : 'bg-[#FFFDF7] border-[#0D0D0D]/30 hover:border-[#0D0D0D]'
                  }`}
                >
                  <div
                    className={`relative w-full h-11 sm:h-12 rounded-lg border-2 border-[#0D0D0D] shadow-[2px_2px_0_#0D0D0D] overflow-hidden ${bg.previewClass}`}
                  >
                    {isSelected && (
                      <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#00E676] border border-[#0D0D0D] flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 text-[#0D0D0D]" strokeWidth={3.5} />
                      </div>
                    )}
                  </div>
                  <span className="font-bangers text-xs tracking-wide text-[#0D0D0D] leading-none text-center whitespace-nowrap">
                    {bg.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer Row: Title Screen on Left + Icon-Only Music & SFX Buttons on Right */}
        <div className="flex items-center justify-between gap-2.5">
          <button
            type="button"
            onClick={onReturnToTitle}
            className="pop-btn bg-[#FFFDF7] text-[#0D0D0D] font-bangers text-lg px-4 py-2 rounded-xl flex items-center gap-1.5 whitespace-nowrap"
          >
            <Home className="w-4 h-4" strokeWidth={2.8} />
            <span>Title Screen</span>
          </button>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onToggleMusic}
              aria-label={musicEnabled ? 'Mute Music' : 'Enable Music'}
              title={musicEnabled ? 'Mute Music' : 'Enable Music'}
              className={`pop-btn w-11 h-11 rounded-xl flex items-center justify-center relative ${
                musicEnabled ? 'bg-[#FFE600] text-[#0D0D0D]' : 'bg-slate-200 text-[#0D0D0D]/45'
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
              className={`pop-btn w-11 h-11 rounded-xl flex items-center justify-center ${
                sfxEnabled ? 'bg-[#00D2FF] text-[#0D0D0D]' : 'bg-slate-200 text-[#0D0D0D]/45'
              }`}
            >
              {sfxEnabled ? (
                <Volume2 className="w-5 h-5" strokeWidth={2.8} />
              ) : (
                <VolumeX className="w-5 h-5 text-[#FF1E42]" strokeWidth={2.8} />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
