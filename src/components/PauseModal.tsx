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
  Sparkles,
} from 'lucide-react';
import { CardBackStyle, DrawMode, GameplayTheme } from '../game/types';
import { CARD_BACK_OPTIONS, CardBackGraphic } from './CardArt';

const GAMEPLAY_THEME_OPTIONS: {
  id: GameplayTheme;
  label: string;
  previewClass: string;
  dotColor: string;
  accentColor: string;
}[] = [
  {
    id: 'comic',
    label: 'Comic',
    previewClass: 'gameplay-theme-comic',
    dotColor: '#FF1E42',
    accentColor: '#FFE600',
  },
  {
    id: 'warhol',
    label: 'Warhol',
    previewClass: 'gameplay-theme-warhol',
    dotColor: '#FF0099',
    accentColor: '#00E5FF',
  },
  {
    id: 'memphis',
    label: 'Memphis',
    previewClass: 'gameplay-theme-memphis',
    dotColor: '#FF6B9D',
    accentColor: '#5CE1E6',
  },
  {
    id: 'street',
    label: 'Street',
    previewClass: 'gameplay-theme-street',
    dotColor: '#FF5500',
    accentColor: '#FFE600',
  },
  {
    id: 'manga',
    label: 'Manga',
    previewClass: 'gameplay-theme-manga',
    dotColor: '#FF2A6D',
    accentColor: '#38BDF8',
  },
];

interface PauseModalProps {
  drawMode: DrawMode;
  isDailyChallenge: boolean;
  dailyDateLabel: string;
  cardBackStyle: CardBackStyle;
  gameplayTheme: GameplayTheme;
  sfxEnabled: boolean;
  musicEnabled: boolean;
  onResume: () => void;
  onNewDeal: () => void;
  onStartDailyChallenge: () => void;
  onToggleDrawMode: () => void;
  onSelectCardBack: (style: CardBackStyle) => void;
  onSelectGameplayTheme: (theme: GameplayTheme) => void;
  onToggleSfx: () => void;
  onToggleMusic: () => void;
  onReturnToTitle: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  drawMode,
  isDailyChallenge,
  dailyDateLabel,
  cardBackStyle,
  gameplayTheme,
  sfxEnabled,
  musicEnabled,
  onResume,
  onNewDeal,
  onStartDailyChallenge,
  onToggleDrawMode,
  onSelectCardBack,
  onSelectGameplayTheme,
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
            : 'Timer paused · Customize your gameplay theme & cards'}
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

        {/* Customization Section 1: Card Style */}
        <div className="bg-[#00D2FF]/15 border-[2.5px] border-[#0D0D0D] rounded-xl p-3 mb-3.5">
          <div className="flex items-center gap-1.5 mb-2.5">
            <Palette className="w-4 h-4 text-[#FF0099]" strokeWidth={2.8} />
            <h3 className="font-bangers text-xl tracking-wide text-[#0D0D0D] leading-none">
              Customization - Card Style
            </h3>
          </div>

          <div className="grid grid-cols-5 gap-1.5">
            {CARD_BACK_OPTIONS.map((option) => {
              const isSelected = cardBackStyle === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => onSelectCardBack(option.id)}
                  aria-pressed={isSelected}
                  className={`group flex flex-col items-center gap-1 p-1 rounded-xl border-2 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#FFE600] border-[#0D0D0D] shadow-[2.5px_2.5px_0_#0D0D0D] -translate-y-0.5'
                      : 'bg-[#FFFDF7] border-[#0D0D0D]/30 hover:border-[#0D0D0D]'
                  }`}
                >
                  <div className="relative w-10 h-14 sm:w-12 sm:h-16 rounded-md border-2 border-[#0D0D0D] overflow-hidden shadow-[1.5px_1.5px_0_#0D0D0D] shrink-0">
                    <CardBackGraphic styleVariant={option.id} gameplayTheme={gameplayTheme} />
                    {isSelected && (
                      <div className="absolute top-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-[#00E676] border border-[#0D0D0D] flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 text-[#0D0D0D]" strokeWidth={3.5} />
                      </div>
                    )}
                  </div>
                  <span className="font-bangers text-[11px] tracking-wide text-[#0D0D0D] leading-none text-center whitespace-nowrap">
                    {option.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Customization Section 2: Gameplay Theme (Comic default + Warhol, Memphis, Street, Manga) */}
        <div className="bg-[#FFE600]/20 border-[2.5px] border-[#0D0D0D] rounded-xl p-3 mb-5">
          <div className="flex items-center justify-between gap-2 mb-2.5">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#1D4ED8]" strokeWidth={2.8} />
              <h3 className="font-bangers text-xl tracking-wide text-[#0D0D0D] leading-none">
                Customization - Theme
              </h3>
            </div>
            <span className="text-[10px] font-extrabold uppercase tracking-wide text-[#0D0D0D]/60">
              Board &amp; Cards
            </span>
          </div>

          <div className="grid grid-cols-5 gap-1.5">
            {GAMEPLAY_THEME_OPTIONS.map((t) => {
              const isSelected = gameplayTheme === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => onSelectGameplayTheme(t.id)}
                  aria-pressed={isSelected}
                  className={`flex flex-col items-center gap-1 p-1 rounded-xl border-2 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#FFE600] border-[#0D0D0D] shadow-[2.5px_2.5px_0_#0D0D0D] -translate-y-0.5'
                      : 'bg-[#FFFDF7] border-[#0D0D0D]/30 hover:border-[#0D0D0D]'
                  }`}
                >
                  <div
                    className={`relative w-full h-11 rounded-lg border-2 border-[#0D0D0D] shadow-[1.5px_1.5px_0_#0D0D0D] overflow-hidden flex items-center justify-center ${t.previewClass}`}
                  >
                    {/* Mini Theme Swatch Accent Dots */}
                    <div className="flex items-center gap-1">
                      <span
                        className="w-3 h-3 rounded-full border-[1.5px] border-[#0D0D0D]"
                        style={{ backgroundColor: t.dotColor }}
                      />
                      <span
                        className="w-3 h-3 rounded-full border-[1.5px] border-[#0D0D0D]"
                        style={{ backgroundColor: t.accentColor }}
                      />
                    </div>
                    {isSelected && (
                      <div className="absolute top-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-[#00E676] border border-[#0D0D0D] flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 text-[#0D0D0D]" strokeWidth={3.5} />
                      </div>
                    )}
                  </div>
                  <span className="font-bangers text-xs tracking-wide text-[#0D0D0D] leading-none text-center whitespace-nowrap">
                    {t.label}
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
