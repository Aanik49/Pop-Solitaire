import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Lightbulb,
  Undo2,
  RotateCcw,
  Volume2,
  VolumeX,
  Music,
  Pause,
  Calendar,
} from 'lucide-react';
import {
  BackgroundTheme,
  CalloutBurst,
  CardBackStyle,
  CardSource,
  DailyChallengeRecord,
  DrawMode,
  GameState,
  MoveHint,
  MoveTarget,
  PlayerStats,
  ScreenState,
} from './game/types';
import {
  canAutoComplete,
  cloneGameState,
  dealDailyChallenge,
  dealNewGame,
  drawFromStock,
  executeMove,
  findBestHint,
  findSmartMove,
  formatDailyDateLabel,
  getNextAutoCompleteMove,
  getTodayDateKey,
  isDailyCompleted,
  isGameWon,
  loadDailyRecord,
  loadPlayerStats,
  recordDailyWin,
  recordWinStats,
} from './game/solitaireEngine';
import { soundEngine } from './audio/soundEngine';
import { IntroSplash } from './components/IntroSplash';
import { SplashScreen } from './components/SplashScreen';
import { GameBoard } from './components/GameBoard';
import { ComicCalloutLayer } from './components/ComicCalloutLayer';
import { PauseModal } from './components/PauseModal';
import { VictoryOverlay } from './components/VictoryCascade';
import { OfflineIndicator } from './components/OfflineIndicator';

function formatTime(secs: number): string {
  const m = Math.floor(secs / 60)
    .toString()
    .padStart(2, '0');
  const s = (secs % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

const CARD_BACK_STORAGE_KEY = 'pop_solitaire_card_back_v1';
const BG_THEME_STORAGE_KEY = 'pop_solitaire_bg_theme_v1';

function loadSavedCardBack(): CardBackStyle {
  try {
    const raw = localStorage.getItem(CARD_BACK_STORAGE_KEY);
    if (raw === 'dots' || raw === 'stripes' || raw === 'geometric' || raw === 'checker') {
      return raw;
    }
  } catch {
    // ignore storage restrictions
  }
  return 'dots';
}

function loadSavedBackgroundTheme(): BackgroundTheme {
  try {
    const raw = localStorage.getItem(BG_THEME_STORAGE_KEY);
    if (raw === 'cyan' || raw === 'mint' || raw === 'lavender' || raw === 'peach') {
      return raw;
    }
  } catch {
    // ignore storage restrictions
  }
  return 'cyan';
}

export default function App() {
  const [screen, setScreen] = useState<ScreenState>('INTRO');
  const [drawMode, setDrawMode] = useState<DrawMode>(1);
  const [cardBackStyle, setCardBackStyle] = useState<CardBackStyle>(() => loadSavedCardBack());
  const [backgroundTheme, setBackgroundTheme] = useState<BackgroundTheme>(() => loadSavedBackgroundTheme());
  const [gameState, setGameState] = useState<GameState>(() => dealNewGame(1));
  const [undoStack, setUndoStack] = useState<GameState[]>([]);
  const [seconds, setSeconds] = useState<number>(0);
  const [timerActive, setTimerActive] = useState<boolean>(false);

  const [sfxEnabled, setSfxEnabled] = useState<boolean>(() => soundEngine.isSfxEnabled());
  const [musicEnabled, setMusicEnabled] = useState<boolean>(() => soundEngine.isMusicEnabled());
  const [stats, setStats] = useState<PlayerStats>(() => loadPlayerStats());
  const [dailyRecord, setDailyRecord] = useState<DailyChallengeRecord>(() => loadDailyRecord());

  const todayDateKey = getTodayDateKey();
  const todayDateLabel = formatDailyDateLabel(todayDateKey);
  const isDailyWinnerToday = isDailyCompleted(dailyRecord, todayDateKey);

  const [hint, setHint] = useState<MoveHint | null>(null);
  const [callouts, setCallouts] = useState<CalloutBurst[]>([]);
  const [lastFlippedCardId, setLastFlippedCardId] = useState<string | null>(null);
  const [lastLandedCardIds, setLastLandedCardIds] = useState<string[]>([]);
  const [shakingCardId, setShakingCardId] = useState<string | null>(null);
  const [isNewDealAnim, setIsNewDealAnim] = useState<boolean>(false);
  const [isAutoCompleting, setIsAutoCompleting] = useState<boolean>(false);

  const calloutCounterRef = useRef(1);
  const autoCompleteTimerRef = useRef<number | null>(null);
  const dealAnimTimerRef = useRef<number | null>(null);

  const spawnCallout = useCallback((text: string, x: number, y: number, bgColor: string) => {
    const safeX = Math.max(82, Math.min(window.innerWidth - 82, x));
    const safeY = Math.max(82, Math.min(window.innerHeight - 82, y));
    const id = calloutCounterRef.current++;
    setCallouts((prev) => [...prev, { id, text, x: safeX, y: safeY, bgColor }]);
    window.setTimeout(() => {
      setCallouts((prev) => prev.filter((item) => item.id !== id));
    }, 840);
  }, []);

  const clearTransientAnimFlags = useCallback(() => {
    setLastFlippedCardId(null);
    setLastLandedCardIds([]);
    setShakingCardId(null);
  }, []);

  // Game Clock: ticks only when actively playing after first move
  useEffect(() => {
    if (screen !== 'PLAYING' || !timerActive) return;
    const id = window.setInterval(() => {
      setSeconds((s) => s + 1);
    }, 1000);
    return () => window.clearInterval(id);
  }, [screen, timerActive]);

  // Cleanup auto-complete timer on unmount
  useEffect(() => {
    return () => {
      if (autoCompleteTimerRef.current !== null) window.clearTimeout(autoCompleteTimerRef.current);
      if (dealAnimTimerRef.current !== null) window.clearTimeout(dealAnimTimerRef.current);
    };
  }, []);

  const startFreshDeal = useCallback(
    (mode: DrawMode, showCallout = true) => {
      if (autoCompleteTimerRef.current !== null) {
        window.clearTimeout(autoCompleteTimerRef.current);
        autoCompleteTimerRef.current = null;
      }
      if (dealAnimTimerRef.current !== null) {
        window.clearTimeout(dealAnimTimerRef.current);
      }

      setIsAutoCompleting(false);
      setHint(null);
      clearTransientAnimFlags();
      setUndoStack([]);
      setSeconds(0);
      setTimerActive(false);
      setGameState(dealNewGame(mode));
      setScreen('PLAYING');
      setIsNewDealAnim(true);

      soundEngine.unlockAndStartMusic();
      soundEngine.playShuffle();

      dealAnimTimerRef.current = window.setTimeout(() => {
        setIsNewDealAnim(false);
      }, 650);

      if (showCallout) {
        spawnCallout('DEAL!', window.innerWidth / 2, window.innerHeight * 0.36, '#FFE600');
      }
    },
    [clearTransientAnimFlags, spawnCallout]
  );

  const startDailyChallenge = useCallback(() => {
    if (autoCompleteTimerRef.current !== null) {
      window.clearTimeout(autoCompleteTimerRef.current);
      autoCompleteTimerRef.current = null;
    }
    if (dealAnimTimerRef.current !== null) {
      window.clearTimeout(dealAnimTimerRef.current);
    }

    const dateKey = getTodayDateKey();
    setIsAutoCompleting(false);
    setHint(null);
    clearTransientAnimFlags();
    setUndoStack([]);
    setSeconds(0);
    setTimerActive(false);
    setGameState(dealDailyChallenge(dateKey));
    setScreen('PLAYING');
    setIsNewDealAnim(true);

    soundEngine.unlockAndStartMusic();
    soundEngine.playShuffle();

    dealAnimTimerRef.current = window.setTimeout(() => {
      setIsNewDealAnim(false);
    }, 650);

    spawnCallout('DAILY!', window.innerWidth / 2, window.innerHeight * 0.36, '#FF0099');
  }, [clearTransientAnimFlags, spawnCallout]);

  const handleDealOrRestart = useCallback(() => {
    if (gameState.isDailyChallenge) {
      startDailyChallenge();
    } else {
      startFreshDeal(drawMode, true);
    }
  }, [drawMode, gameState.isDailyChallenge, startDailyChallenge, startFreshDeal]);

  const handleToggleSfx = useCallback(() => {
    const next = !sfxEnabled;
    setSfxEnabled(next);
    soundEngine.setSfxEnabled(next);
    if (next) soundEngine.playButton();
  }, [sfxEnabled]);

  const handleToggleMusic = useCallback(() => {
    const next = !musicEnabled;
    setMusicEnabled(next);
    soundEngine.setMusicEnabled(next);
    if (sfxEnabled) soundEngine.playButton();
  }, [musicEnabled, sfxEnabled]);

  const handleSelectDrawModeOnSplash = useCallback((mode: DrawMode) => {
    setDrawMode(mode);
    soundEngine.playButton();
  }, []);

  const handleToggleDrawModeInGame = useCallback(() => {
    if (gameState.isDailyChallenge) {
      startFreshDeal(drawMode, true);
      return;
    }
    const nextMode: DrawMode = drawMode === 1 ? 3 : 1;
    setDrawMode(nextMode);
    startFreshDeal(nextMode, true);
  }, [drawMode, gameState.isDailyChallenge, startFreshDeal]);

  const handleSelectCardBack = useCallback((style: CardBackStyle) => {
    setCardBackStyle(style);
    soundEngine.playButton();
    try {
      localStorage.setItem(CARD_BACK_STORAGE_KEY, style);
    } catch {
      // ignore storage errors
    }
  }, []);

  const handleSelectBackgroundTheme = useCallback((theme: BackgroundTheme) => {
    setBackgroundTheme(theme);
    soundEngine.playButton();
    try {
      localStorage.setItem(BG_THEME_STORAGE_KEY, theme);
    } catch {
      // ignore storage errors
    }
  }, []);

  const handleStockClick = useCallback(() => {
    if (screen !== 'PLAYING' || isAutoCompleting) return;
    soundEngine.unlockAndStartMusic();

    const result = drawFromStock(gameState);
    if (!result) return;

    setTimerActive(true);
    setHint(null);
    setUndoStack((prev) => [...prev.slice(-99), cloneGameState(gameState)]);
    setGameState(result.nextState);
    setLastFlippedCardId(null);
    setLastLandedCardIds(result.drawnIds);

    soundEngine.playCardFlip();
    if (result.recycled) {
      spawnCallout('RELOAD!', window.innerWidth * 0.16, window.innerHeight * 0.24, '#00D2FF');
    }
  }, [gameState, isAutoCompleting, screen, spawnCallout]);

  const commitWinIfNeeded = useCallback(
    (nextState: GameState) => {
      if (!isGameWon(nextState)) return;
      setIsAutoCompleting(false);
      setTimerActive(false);
      soundEngine.playWin();
      spawnCallout('BOOM!', window.innerWidth / 2, window.innerHeight / 2, '#FF1E42');
      const updatedStats = recordWinStats(nextState.score, seconds);
      setStats(updatedStats);
      if (nextState.isDailyChallenge) {
        const updatedDaily = recordDailyWin(nextState.dailyDateKey ?? getTodayDateKey());
        setDailyRecord(updatedDaily);
      }
      window.setTimeout(() => {
        setScreen('VICTORY');
      }, 520);
    },
    [seconds, spawnCallout]
  );

  const handleExecuteMove = useCallback(
    (source: CardSource, target: MoveTarget, coords: { x: number; y: number }): boolean => {
      if (screen !== 'PLAYING') return false;
      soundEngine.unlockAndStartMusic();

      const result = executeMove(gameState, source, target);
      if (!result) return false;

      setTimerActive(true);
      setHint(null);
      setUndoStack((prev) => [...prev.slice(-99), cloneGameState(gameState)]);
      setGameState(result.nextState);
      setLastFlippedCardId(result.revealedCardId);
      setLastLandedCardIds(result.movedCardIds);

      if (result.targetType === 'foundation') {
        soundEngine.playFoundation(result.leadCard.value);
        const label =
          result.leadCard.value === 1
            ? 'ACE!'
            : result.leadCard.value === 13
            ? 'KING!'
            : 'POW!';
        spawnCallout(label, coords.x, coords.y, '#FFE600');
      } else {
        soundEngine.playCardPlace();
        if (result.revealedCardId) {
          spawnCallout('FLIP!', coords.x, coords.y, '#00E676');
        } else if (result.leadCard.value === 13) {
          spawnCallout('KING!', coords.x, coords.y, '#00D2FF');
        }
      }

      commitWinIfNeeded(result.nextState);
      return true;
    },
    [commitWinIfNeeded, gameState, screen, spawnCallout]
  );

  const handleSmartTap = useCallback(
    (source: CardSource, coords: { x: number; y: number }): boolean => {
      if (screen !== 'PLAYING' || isAutoCompleting) return false;
      const bestTarget = findSmartMove(gameState, source);
      if (!bestTarget) {
        // Trigger visual shake on the tapped card so user gets immediate tactile feedback
        let cardId: string | null = null;
        if (source.type === 'waste' && gameState.waste.length > 0) {
          cardId = gameState.waste[gameState.waste.length - 1].id;
        } else if (source.type === 'tableau') {
          cardId = gameState.tableau[source.colIndex]?.[source.cardIndex]?.id ?? null;
        } else if (source.type === 'foundation') {
          const pile = gameState.foundations[source.colIndex];
          cardId = pile?.[pile.length - 1]?.id ?? null;
        }
        if (cardId) {
          setShakingCardId(cardId);
          window.setTimeout(() => setShakingCardId(null), 260);
        }
        return false;
      }
      return handleExecuteMove(source, bestTarget, coords);
    },
    [gameState, handleExecuteMove, isAutoCompleting, screen]
  );

  const handleUndo = useCallback(() => {
    if (screen !== 'PLAYING' || undoStack.length === 0 || isAutoCompleting) return;
    const previous = undoStack[undoStack.length - 1];
    setUndoStack((prev) => prev.slice(0, -1));
    setGameState({ ...previous, moves: gameState.moves + 1 });
    setHint(null);
    clearTransientAnimFlags();
    soundEngine.playUndo();
  }, [clearTransientAnimFlags, gameState.moves, isAutoCompleting, screen, undoStack]);

  const handleHint = useCallback(() => {
    if (screen !== 'PLAYING' || isAutoCompleting) return;
    const best = findBestHint(gameState);
    setHint(best);
    if (best.kind === 'stuck') {
      soundEngine.playError();
      spawnCallout('STUCK!', window.innerWidth / 2, window.innerHeight / 2, '#FF1E42');
    } else {
      soundEngine.playHint();
      if (best.kind === 'draw') {
        spawnCallout('DRAW!', window.innerWidth * 0.14, window.innerHeight * 0.25, '#00D2FF');
      }
    }
  }, [gameState, isAutoCompleting, screen, spawnCallout]);

  // Smooth step-by-step Auto-Complete cascade when Stock & Waste are empty and all Tableau cards are face-up
  const autoCompleteAvailable = !isAutoCompleting && canAutoComplete(gameState);

  useEffect(() => {
    if (!isAutoCompleting || screen !== 'PLAYING') return;

    const nextMove = getNextAutoCompleteMove(gameState);
    if (!nextMove) {
      setIsAutoCompleting(false);
      return;
    }

    autoCompleteTimerRef.current = window.setTimeout(() => {
      const result = executeMove(gameState, nextMove.source, nextMove.target);
      if (!result) {
        setIsAutoCompleting(false);
        return;
      }
      setGameState(result.nextState);
      setLastFlippedCardId(null);
      setLastLandedCardIds(result.movedCardIds);
      soundEngine.playFoundation(result.leadCard.value);

      if (result.leadCard.value === 13) {
        spawnCallout(
          'KING!',
          window.innerWidth * (0.45 + nextMove.target.index * 0.12),
          window.innerHeight * 0.22,
          '#FFE600'
        );
      }

      if (isGameWon(result.nextState)) {
        commitWinIfNeeded(result.nextState);
      }
    }, 95);

    return () => {
      if (autoCompleteTimerRef.current !== null) {
        window.clearTimeout(autoCompleteTimerRef.current);
      }
    };
  }, [commitWinIfNeeded, gameState, isAutoCompleting, screen, spawnCallout]);

  // Keyboard shortcuts during gameplay
  useEffect(() => {
    if (screen !== 'PLAYING' && screen !== 'PAUSED') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        soundEngine.playButton();
        setScreen((prev) => (prev === 'PLAYING' ? 'PAUSED' : 'PLAYING'));
        return;
      }

      if (screen !== 'PLAYING') return;

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        handleUndo();
      } else if (!e.metaKey && !e.ctrlKey && e.key.toLowerCase() === 'z') {
        handleUndo();
      } else if (e.key.toLowerCase() === 'h') {
        handleHint();
      } else if (e.key.toLowerCase() === 'm') {
        handleToggleMusic();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleHint, handleToggleMusic, handleUndo, screen]);

  const timeFormatted = formatTime(seconds);

  return (
    <div className={`w-full h-full flex flex-col bg-theme-${backgroundTheme} overflow-hidden relative`}>
      {screen === 'INTRO' ? (
        <IntroSplash
          backgroundTheme={backgroundTheme}
          onComplete={() => setScreen('SPLASH')}
        />
      ) : screen === 'SPLASH' ? (
        <SplashScreen
          backgroundTheme={backgroundTheme}
          drawMode={drawMode}
          sfxEnabled={sfxEnabled}
          musicEnabled={musicEnabled}
          dailyDateLabel={todayDateLabel}
          isDailyWinner={isDailyWinnerToday}
          dailyStreak={dailyRecord.streak}
          onSelectDrawMode={handleSelectDrawModeOnSplash}
          onToggleSfx={handleToggleSfx}
          onToggleMusic={handleToggleMusic}
          onStartGame={() => startFreshDeal(drawMode, true)}
          onStartDailyChallenge={startDailyChallenge}
        />
      ) : (
        <>
          {/* Responsive Pop Art Comic Game HUD: zero clipping from 320px mobile to 1440px+ desktop */}
          <header className="w-full bg-[#FFE600] border-b-[3.5px] border-[#0D0D0D] px-2 sm:px-4 py-1.5 sm:py-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 sm:gap-2 z-50 shadow-[0_4px_0_#0D0D0D] shrink-0">
            {/* Row 1 (mobile) / Left+Center (desktop): Brand, Draw Mode / Daily Tag, and Scoreboard */}
            <div className="flex items-center justify-between sm:justify-start gap-2 w-full sm:w-auto min-w-0">
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playButton();
                    setScreen('PAUSED');
                  }}
                  className="bg-[#FF1E42] text-white font-bangers text-base sm:text-xl md:text-2xl px-2 sm:px-2.5 py-0.5 rounded-lg border-[2.5px] border-[#0D0D0D] shadow-[2px_2px_0_#0D0D0D] -rotate-1 tracking-wider whitespace-nowrap cursor-pointer hover:brightness-105"
                  title="Open Menu & Customization"
                >
                  POP! SOLITAIRE
                </button>

                {gameState.isDailyChallenge ? (
                  <button
                    type="button"
                    onClick={() => {
                      soundEngine.playButton();
                      setScreen('PAUSED');
                    }}
                    className="hidden md:inline-flex pop-btn bg-[#FF0099] text-white font-bangers text-sm sm:text-base px-2.5 py-1 rounded-lg tracking-wide items-center gap-1 whitespace-nowrap"
                    title="Daily Challenge · Pre-seeded worldwide layout"
                  >
                    <Calendar className="w-3.5 h-3.5 shrink-0" strokeWidth={2.8} />
                    <span>DAILY · {todayDateLabel}</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleToggleDrawModeInGame}
                    className="hidden md:inline-flex pop-btn bg-[#FFFDF7] text-[#0D0D0D] font-bangers text-sm sm:text-base px-2.5 py-1 rounded-lg tracking-wide whitespace-nowrap"
                    title="Switch Draw 1 / Draw 3 and deal new game"
                  >
                    DRAW {drawMode}
                  </button>
                )}
              </div>

              {/* Clean Unboxed Tabular Scoreboard Strip (visible on all screen widths) */}
              <div className="bg-[#FFFDF7] border-[2.5px] border-[#0D0D0D] rounded-lg px-2 sm:px-3.5 py-0.5 sm:py-1 shadow-[2px_2px_0_#0D0D0D] flex items-center gap-2 sm:gap-3.5 tabular-nums shrink-0">
                <div className="flex items-baseline gap-1">
                  <span className="font-bangers text-[11px] sm:text-sm text-[#FF1E42] tracking-wide">SCORE</span>
                  <span className="font-bangers text-sm sm:text-xl text-[#0D0D0D] leading-none">
                    {gameState.score}
                  </span>
                </div>
                <span className="text-[#0D0D0D]/25 font-black select-none" aria-hidden="true">/</span>
                <div className="flex items-baseline gap-1">
                  <span className="font-bangers text-[11px] sm:text-sm text-[#1D4ED8] tracking-wide">MOVES</span>
                  <span className="font-bangers text-sm sm:text-xl text-[#0D0D0D] leading-none">
                    {gameState.moves}
                  </span>
                </div>
                <span className="text-[#0D0D0D]/25 font-black select-none" aria-hidden="true">/</span>
                <div className="flex items-baseline gap-1">
                  <span className="font-bangers text-[11px] sm:text-sm text-[#FF0099] tracking-wide">TIME</span>
                  <span className="font-bangers text-sm sm:text-xl text-[#0D0D0D] leading-none">
                    {timeFormatted}
                  </span>
                </div>
              </div>
            </div>

            {/* Row 2 (mobile) / Right Zone (desktop): Full Action Toolbar — never clipped! */}
            <div className="flex items-center justify-between sm:justify-end gap-1.5 w-full sm:w-auto shrink-0">
              {gameState.isDailyChallenge ? (
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playButton();
                    setScreen('PAUSED');
                  }}
                  className="sm:hidden pop-btn bg-[#FF0099] text-white font-bangers text-sm px-2.5 py-1 rounded-lg tracking-wide inline-flex items-center gap-1 whitespace-nowrap shrink-0"
                  title="Daily Challenge"
                >
                  <Calendar className="w-3.5 h-3.5 shrink-0" strokeWidth={2.8} />
                  <span>DAILY</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleToggleDrawModeInGame}
                  className="sm:hidden pop-btn bg-[#FFFDF7] text-[#0D0D0D] font-bangers text-sm px-2.5 py-1 rounded-lg tracking-wide whitespace-nowrap shrink-0"
                  title="Switch Draw 1 / Draw 3"
                >
                  DRAW {drawMode}
                </button>
              )}

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={handleHint}
                  className="pop-btn bg-[#FFFDF7] text-[#0D0D0D] font-bangers text-sm sm:text-base px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg flex items-center gap-1 whitespace-nowrap"
                  title="Show Legal Move Hint (H)"
                  aria-label="Hint"
                >
                  <Lightbulb className="w-4 h-4 text-[#FF1E42]" strokeWidth={2.8} />
                  <span className="hidden lg:inline">HINT</span>
                </button>

                <button
                  type="button"
                  onClick={handleUndo}
                  disabled={undoStack.length === 0 || isAutoCompleting}
                  className="pop-btn bg-[#00D2FF] text-[#0D0D0D] font-bangers text-sm sm:text-base px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg flex items-center gap-1 whitespace-nowrap"
                  title="Undo Move (Z)"
                  aria-label="Undo"
                >
                  <Undo2 className="w-4 h-4" strokeWidth={2.8} />
                  <span className="hidden lg:inline">UNDO</span>
                </button>

                <button
                  type="button"
                  onClick={handleToggleMusic}
                  className={`hidden lg:flex pop-btn px-2 py-1.5 rounded-lg items-center justify-center ${
                    musicEnabled ? 'bg-[#FFFDF7] text-[#1D4ED8]' : 'bg-white/60 text-[#0D0D0D]/40'
                  }`}
                  title={musicEnabled ? 'Mute Music (M)' : 'Enable Music (M)'}
                  aria-label="Toggle Music"
                >
                  <Music className="w-4 h-4" strokeWidth={2.8} />
                </button>

                <button
                  type="button"
                  onClick={handleToggleSfx}
                  className={`hidden lg:flex pop-btn px-2 py-1.5 rounded-lg items-center justify-center ${
                    sfxEnabled ? 'bg-[#FFFDF7] text-[#0D0D0D]' : 'bg-white/60 text-[#0D0D0D]/40'
                  }`}
                  title={sfxEnabled ? 'Mute SFX' : 'Enable SFX'}
                  aria-label="Toggle Sound Effects"
                >
                  {sfxEnabled ? <Volume2 className="w-4 h-4" strokeWidth={2.8} /> : <VolumeX className="w-4 h-4" strokeWidth={2.8} />}
                </button>

                <button
                  type="button"
                  onClick={handleDealOrRestart}
                  className="pop-btn bg-[#FF1E42] text-white font-bangers text-sm sm:text-base px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg flex items-center gap-1 whitespace-nowrap"
                  title={gameState.isDailyChallenge ? 'Restart Today’s Daily Deal' : 'Deal New Game'}
                  aria-label={gameState.isDailyChallenge ? 'Restart Daily' : 'New Deal'}
                >
                  <RotateCcw className="w-4 h-4" strokeWidth={2.8} />
                  <span className="hidden md:inline">{gameState.isDailyChallenge ? 'RETRY' : 'DEAL'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playButton();
                    setScreen('PAUSED');
                  }}
                  className="pop-btn bg-[#FFFDF7] text-[#0D0D0D] px-2 py-1 sm:py-1.5 rounded-lg flex items-center justify-center"
                  title="Pause, Settings & Customization (Esc)"
                  aria-label="Pause Menu"
                >
                  <Pause className="w-4 h-4" strokeWidth={2.8} />
                </button>
              </div>
            </div>
          </header>

          {/* Main Solitaire Card Table */}
          <GameBoard
            gameState={gameState}
            cardBackStyle={cardBackStyle}
            hint={hint}
            lastFlippedCardId={lastFlippedCardId}
            lastLandedCardIds={lastLandedCardIds}
            shakingCardId={shakingCardId}
            isNewDealAnim={isNewDealAnim}
            autoCompleteAvailable={autoCompleteAvailable}
            onTriggerAutoComplete={() => {
              soundEngine.playButton();
              setIsAutoCompleting(true);
            }}
            onStockClick={handleStockClick}
            onExecuteMove={handleExecuteMove}
            onSmartTap={handleSmartTap}
            onDragStartSfx={() => soundEngine.playCardLift()}
            onInvalidMoveSfx={() => soundEngine.playError()}
          />

          {/* Pause & Customization Modal */}
          {screen === 'PAUSED' && (
            <PauseModal
              drawMode={drawMode}
              isDailyChallenge={gameState.isDailyChallenge}
              dailyDateLabel={todayDateLabel}
              cardBackStyle={cardBackStyle}
              backgroundTheme={backgroundTheme}
              sfxEnabled={sfxEnabled}
              musicEnabled={musicEnabled}
              onResume={() => {
                soundEngine.playButton();
                setScreen('PLAYING');
              }}
              onNewDeal={handleDealOrRestart}
              onStartDailyChallenge={startDailyChallenge}
              onToggleDrawMode={handleToggleDrawModeInGame}
              onSelectCardBack={handleSelectCardBack}
              onSelectBackgroundTheme={handleSelectBackgroundTheme}
              onToggleSfx={handleToggleSfx}
              onToggleMusic={handleToggleMusic}
              onReturnToTitle={() => {
                soundEngine.playButton();
                setScreen('SPLASH');
              }}
            />
          )}

          {/* Victory Waterfall, Comic Confetti & Celebration Modal */}
          {screen === 'VICTORY' && (
            <VictoryOverlay
              score={gameState.score}
              moves={gameState.moves}
              timeFormatted={timeFormatted}
              stats={stats}
              isDailyChallenge={gameState.isDailyChallenge}
              dailyDateLabel={gameState.dailyDateKey ? formatDailyDateLabel(gameState.dailyDateKey) : null}
              onPlayAgain={() => startFreshDeal(drawMode, true)}
              onReturnToTitle={() => {
                soundEngine.playButton();
                setScreen('SPLASH');
              }}
            />
          )}
        </>
      )}

      {/* Global Comic Callout Burst Layer */}
      <ComicCalloutLayer callouts={callouts} />

      {/* Offline Mode Indicator */}
      <OfflineIndicator />
    </div>
  );
}
