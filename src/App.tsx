import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Lightbulb,
  Undo2,
  RotateCcw,
  Pause,
  Calendar,
} from 'lucide-react';
import {
  CalloutBurst,
  CardBackStyle,
  CardSource,
  DailyChallengeRecord,
  DrawMode,
  GameplayTheme,
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
  hasAnyProductiveMove,
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
import { GameplayBackdrop } from './components/GameplayBackdrop';
import { ComicCalloutLayer } from './components/ComicCalloutLayer';
import { PauseModal } from './components/PauseModal';
import { VictoryOverlay } from './components/VictoryCascade';
import { FailedModal } from './components/FailedModal';
import { QuitConfirmModal } from './components/QuitConfirmModal';
import { OfflineIndicator } from './components/OfflineIndicator';

interface CapacitorWindow extends Window {
  Capacitor?: {
    Plugins?: {
      App?: {
        exitApp?: () => Promise<void> | void;
        addListener?: (
          eventName: string,
          listenerFunc: () => void
        ) => Promise<{ remove: () => Promise<void> }> | { remove: () => void };
      };
      StatusBar?: {
        hide?: () => Promise<void>;
        setBackgroundColor?: (options: { color: string }) => Promise<void>;
        setOverlaysWebView?: (options: { overlay: boolean }) => Promise<void>;
      };
    };
  };
}

function formatTime(secs: number): string {
  const m = Math.floor(secs / 60)
    .toString()
    .padStart(2, '0');
  const s = (secs % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

const CARD_BACK_STORAGE_KEY = 'pop_solitaire_card_back_v2';
const GAMEPLAY_THEME_STORAGE_KEY = 'pop_solitaire_gameplay_theme_v1';

function loadSavedCardBack(): CardBackStyle {
  try {
    const raw = localStorage.getItem(CARD_BACK_STORAGE_KEY);
    if (raw === 'theme' || raw === 'dots' || raw === 'geometric' || raw === 'checker') {
      return raw;
    }
  } catch {
    // ignore storage restrictions
  }
  return 'theme';
}

function loadSavedGameplayTheme(): GameplayTheme {
  try {
    const raw = localStorage.getItem(GAMEPLAY_THEME_STORAGE_KEY);
    if (raw === 'comic' || raw === 'memphis' || raw === 'street' || raw === 'manga') {
      return raw;
    }
  } catch {
    // ignore storage restrictions
  }
  return 'comic';
}

export default function App() {
  const [screen, setScreen] = useState<ScreenState>('INTRO');
  const [drawMode, setDrawMode] = useState<DrawMode>(1);
  const [cardBackStyle, setCardBackStyle] = useState<CardBackStyle>(() => loadSavedCardBack());
  const [gameplayTheme, setGameplayTheme] = useState<GameplayTheme>(() => loadSavedGameplayTheme());
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

  // Back-button Quit System states
  const [showQuitConfirm, setShowQuitConfirm] = useState<boolean>(false);
  const [quitToastVisible, setQuitToastVisible] = useState<boolean>(false);

  const calloutCounterRef = useRef(1);
  const autoCompleteTimerRef = useRef<number | null>(null);
  const dealAnimTimerRef = useRef<number | null>(null);
  const deadlockTimerRef = useRef<number | null>(null);
  const quitToastTimerRef = useRef<number | null>(null);
  const lastBackPressTimeRef = useRef<number>(0);
  const exitingAppRef = useRef<boolean>(false);

  const screenRef = useRef<ScreenState>(screen);
  const showQuitConfirmRef = useRef<boolean>(showQuitConfirm);

  useEffect(() => {
    screenRef.current = screen;
  }, [screen]);

  useEffect(() => {
    showQuitConfirmRef.current = showQuitConfirm;
  }, [showQuitConfirm]);

  // Automatically hide device top status bar and fill area with Pop Yellow (#FFE600) on launch
  useEffect(() => {
    const capWindow = window as CapacitorWindow;
    const statusBar = capWindow.Capacitor?.Plugins?.StatusBar;
    if (statusBar) {
      statusBar.setOverlaysWebView?.({ overlay: true }).catch(() => {});
      statusBar.setBackgroundColor?.({ color: '#FFE600' }).catch(() => {});
      statusBar.hide?.().catch(() => {});
    }
  }, []);

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

  const cancelDeadlockTimer = useCallback(() => {
    if (deadlockTimerRef.current !== null) {
      window.clearTimeout(deadlockTimerRef.current);
      deadlockTimerRef.current = null;
    }
  }, []);

  const triggerFailedPanel = useCallback(() => {
    cancelDeadlockTimer();
    setIsAutoCompleting(false);
    setTimerActive(false);
    setHint(null);
    soundEngine.playSadFail();
    setScreen('FAILED');
  }, [cancelDeadlockTimer]);

  const scheduleDeadlockCheck = useCallback(
    (nextState: GameState) => {
      cancelDeadlockTimer();
      if (isGameWon(nextState) || canAutoComplete(nextState)) return;
      if (!hasAnyProductiveMove(nextState)) {
        deadlockTimerRef.current = window.setTimeout(() => {
          if (screenRef.current === 'PLAYING') {
            triggerFailedPanel();
          }
        }, 420);
      }
    },
    [cancelDeadlockTimer, triggerFailedPanel]
  );

  // Unified Device Back Button / Back Gesture Handler (Android Capacitor + Mobile/Web Browser)
  const handleDeviceBack = useCallback(() => {
    // 1. If quit confirmation is already visible, Back dismisses it and continues playing
    if (showQuitConfirmRef.current) {
      soundEngine.playButton();
      setShowQuitConfirm(false);
      return;
    }

    const currentScreen = screenRef.current;

    // 2. From Gameplay or Pause: show Game Quit Confirmation Panel
    if (currentScreen === 'PLAYING' || currentScreen === 'PAUSED') {
      soundEngine.playButton();
      setShowQuitConfirm(true);
      return;
    }

    // 3. From Victory or Failed overlay: return to Lobby
    if (currentScreen === 'VICTORY' || currentScreen === 'FAILED') {
      soundEngine.playButton();
      setScreen('SPLASH');
      return;
    }

    // 4. From Lobby (SPLASH): press Back two times in a row to quit game
    if (currentScreen === 'SPLASH') {
      const now = Date.now();
      if (now - lastBackPressTimeRef.current < 2200) {
        if (quitToastTimerRef.current !== null) {
          window.clearTimeout(quitToastTimerRef.current);
          quitToastTimerRef.current = null;
        }
        setQuitToastVisible(false);
        const capWindow = window as CapacitorWindow;
        if (capWindow.Capacitor?.Plugins?.App?.exitApp) {
          capWindow.Capacitor.Plugins.App.exitApp();
        } else {
          exitingAppRef.current = true;
          window.close();
          window.history.back();
        }
      } else {
        lastBackPressTimeRef.current = now;
        soundEngine.playButton();
        setQuitToastVisible(true);
        if (quitToastTimerRef.current !== null) {
          window.clearTimeout(quitToastTimerRef.current);
        }
        quitToastTimerRef.current = window.setTimeout(() => {
          setQuitToastVisible(false);
          quitToastTimerRef.current = null;
        }, 2200);
      }
    }
  }, []);

  useEffect(() => {
    // Push history sentinel so mobile browser back gestures trigger popstate cleanly
    try {
      window.history.pushState({ popSolitaireGuard: true }, '', window.location.href);
    } catch {
      // ignore sandboxed history restrictions
    }

    const onPopState = () => {
      if (exitingAppRef.current) return;
      handleDeviceBack();
      if (!exitingAppRef.current) {
        try {
          window.history.pushState({ popSolitaireGuard: true }, '', window.location.href);
        } catch {
          // ignore
        }
      }
    };

    window.addEventListener('popstate', onPopState);

    // Capacitor Android native hardware/gesture back listener
    let removeCapListener: (() => void) | null = null;
    const capWindow = window as CapacitorWindow;
    const capApp = capWindow.Capacitor?.Plugins?.App;
    if (capApp?.addListener) {
      const handlePromise = capApp.addListener('backButton', () => {
        handleDeviceBack();
      });
      Promise.resolve(handlePromise)
        .then((handle) => {
          if (handle && typeof handle.remove === 'function') {
            removeCapListener = () => {
              handle.remove();
            };
          }
        })
        .catch(() => {});
    }

    return () => {
      window.removeEventListener('popstate', onPopState);
      if (removeCapListener) removeCapListener();
    };
  }, [handleDeviceBack]);

  // Game Clock: ticks only when actively playing after first move and not paused/confirming quit
  useEffect(() => {
    if (screen !== 'PLAYING' || !timerActive || showQuitConfirm) return;
    const id = window.setInterval(() => {
      setSeconds((s) => s + 1);
    }, 1000);
    return () => window.clearInterval(id);
  }, [screen, timerActive, showQuitConfirm]);

  // Cleanup all timers on unmount
  useEffect(() => {
    return () => {
      if (autoCompleteTimerRef.current !== null) window.clearTimeout(autoCompleteTimerRef.current);
      if (dealAnimTimerRef.current !== null) window.clearTimeout(dealAnimTimerRef.current);
      if (deadlockTimerRef.current !== null) window.clearTimeout(deadlockTimerRef.current);
      if (quitToastTimerRef.current !== null) window.clearTimeout(quitToastTimerRef.current);
    };
  }, []);

  const startFreshDeal = useCallback(
    (mode: DrawMode, showCallout = true) => {
      cancelDeadlockTimer();
      if (autoCompleteTimerRef.current !== null) {
        window.clearTimeout(autoCompleteTimerRef.current);
        autoCompleteTimerRef.current = null;
      }
      if (dealAnimTimerRef.current !== null) {
        window.clearTimeout(dealAnimTimerRef.current);
      }

      setShowQuitConfirm(false);
      setIsAutoCompleting(false);
      setHint(null);
      clearTransientAnimFlags();
      setUndoStack([]);
      setSeconds(0);
      setTimerActive(false);
      const freshState = dealNewGame(mode);
      setGameState(freshState);
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
    [cancelDeadlockTimer, clearTransientAnimFlags, spawnCallout]
  );

  const startDailyChallenge = useCallback(() => {
    cancelDeadlockTimer();
    if (autoCompleteTimerRef.current !== null) {
      window.clearTimeout(autoCompleteTimerRef.current);
      autoCompleteTimerRef.current = null;
    }
    if (dealAnimTimerRef.current !== null) {
      window.clearTimeout(dealAnimTimerRef.current);
    }

    const dateKey = getTodayDateKey();
    setShowQuitConfirm(false);
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
  }, [cancelDeadlockTimer, clearTransientAnimFlags, spawnCallout]);

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

  const handleSelectGameplayTheme = useCallback((theme: GameplayTheme) => {
    setGameplayTheme(theme);
    setCardBackStyle('theme');
    soundEngine.playButton();
    try {
      localStorage.setItem(GAMEPLAY_THEME_STORAGE_KEY, theme);
      localStorage.setItem(CARD_BACK_STORAGE_KEY, 'theme');
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

    scheduleDeadlockCheck(result.nextState);
  }, [gameState, isAutoCompleting, scheduleDeadlockCheck, screen, spawnCallout]);

  const commitWinIfNeeded = useCallback(
    (nextState: GameState): boolean => {
      if (!isGameWon(nextState)) return false;
      cancelDeadlockTimer();
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
      return true;
    },
    [cancelDeadlockTimer, seconds, spawnCallout]
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

      const won = commitWinIfNeeded(result.nextState);
      if (!won) {
        scheduleDeadlockCheck(result.nextState);
      }
      return true;
    },
    [commitWinIfNeeded, gameState, scheduleDeadlockCheck, screen, spawnCallout]
  );

  const handleSmartTap = useCallback(
    (source: CardSource, coords: { x: number; y: number }): boolean => {
      if (screen !== 'PLAYING' || isAutoCompleting) return false;
      const bestTarget = findSmartMove(gameState, source);
      if (!bestTarget) {
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
    if ((screen !== 'PLAYING' && screen !== 'FAILED') || undoStack.length === 0 || isAutoCompleting) {
      return;
    }
    cancelDeadlockTimer();
    const previous = undoStack[undoStack.length - 1];
    setUndoStack((prev) => prev.slice(0, -1));
    setGameState({ ...previous, moves: gameState.moves + 1 });
    setHint(null);
    clearTransientAnimFlags();
    if (screen === 'FAILED') {
      setScreen('PLAYING');
      setTimerActive(true);
    }
    soundEngine.playUndo();
  }, [cancelDeadlockTimer, clearTransientAnimFlags, gameState.moves, isAutoCompleting, screen, undoStack]);

  const handleHint = useCallback(() => {
    if (screen !== 'PLAYING' || isAutoCompleting) return;

    // If no positive/winning move exists anywhere (including full deck cycle), show Failed Panel!
    if (!hasAnyProductiveMove(gameState)) {
      triggerFailedPanel();
      return;
    }

    const best = findBestHint(gameState);
    if (best.kind === 'stuck') {
      triggerFailedPanel();
      return;
    }

    setHint(best);
    soundEngine.playHint();
    if (best.kind === 'draw') {
      spawnCallout('DRAW!', window.innerWidth * 0.14, window.innerHeight * 0.25, '#00D2FF');
    }
  }, [gameState, isAutoCompleting, screen, spawnCallout, triggerFailedPanel]);

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
        if (showQuitConfirm) {
          setShowQuitConfirm(false);
        } else {
          setScreen((prev) => (prev === 'PLAYING' ? 'PAUSED' : 'PLAYING'));
        }
        return;
      }

      if (screen !== 'PLAYING' || showQuitConfirm) return;

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
  }, [handleHint, handleToggleMusic, handleUndo, screen, showQuitConfirm]);

  const timeFormatted = formatTime(seconds);
  const isGameplayScreen = screen !== 'INTRO' && screen !== 'SPLASH';

  return (
    <div
      className={`w-full h-full flex flex-col overflow-hidden relative ${
        isGameplayScreen ? `gameplay-theme-${gameplayTheme}` : 'pop-halftone-bg'
      }`}
    >
      {/* Top Safe-Area Yellow Bar Fill for Intro & Lobby (zero element shift on devices without cutout/status inset) */}
      {!isGameplayScreen && (
        <div
          className="w-full bg-[#FFE600] shrink-0"
          style={{ height: 'env(safe-area-inset-top, 0px)' }}
          aria-hidden="true"
        />
      )}

      {screen === 'INTRO' ? (
        <IntroSplash onComplete={() => setScreen('SPLASH')} />
      ) : screen === 'SPLASH' ? (
        <SplashScreen
          drawMode={drawMode}
          sfxEnabled={sfxEnabled}
          musicEnabled={musicEnabled}
          dailyDateLabel={todayDateLabel}
          isDailyWinner={isDailyWinnerToday}
          dailyStreak={dailyRecord.streak}
          quitToastVisible={quitToastVisible}
          onSelectDrawMode={handleSelectDrawModeOnSplash}
          onToggleSfx={handleToggleSfx}
          onToggleMusic={handleToggleMusic}
          onStartGame={() => startFreshDeal(drawMode, true)}
          onStartDailyChallenge={startDailyChallenge}
        />
      ) : (
        <>
          {/* Multi-Layered Theme-Specific Pop Art Gameplay Tabletop Backdrop */}
          <GameplayBackdrop theme={gameplayTheme} />

          {/* Pop Yellow Top Scoreboard Bar (with Yellow Safe-Top Fill & Equal Top/Bottom Space) */}
          <header className="safe-top-yellow w-full border-b-[3.5px] border-[#0D0D0D] z-50 shadow-[0_4px_0_#0D0D0D] shrink-0 relative">
            <div className="w-full max-w-[1040px] mx-auto px-2.5 sm:px-4 py-3 sm:py-3.5 flex items-stretch justify-between gap-2 sm:gap-3">
              {/* Expanded Crisp White Comic Scoreboard */}
              <div className="flex-1 bg-[#FFFDF7] border-[2.5px] sm:border-[3px] border-[#0D0D0D] rounded-lg px-3 sm:px-6 py-1.5 sm:py-2 shadow-[3px_3px_0_#0D0D0D] flex items-center justify-around gap-2 sm:gap-4 tabular-nums min-w-0">
                <div className="flex items-baseline justify-center gap-1.5 min-w-0">
                  <span className="font-bangers text-xs sm:text-base text-[#FF1E42] tracking-wide">SCORE</span>
                  <span className="font-bangers text-base sm:text-2xl text-[#0D0D0D] leading-none">
                    {gameState.score}
                  </span>
                </div>
                <span className="w-[2px] h-4 sm:h-5 bg-[#0D0D0D]/25 rounded-full shrink-0" aria-hidden="true" />
                <div className="flex items-baseline justify-center gap-1.5 min-w-0">
                  <span className="font-bangers text-xs sm:text-base text-[#1D4ED8] tracking-wide">MOVES</span>
                  <span className="font-bangers text-base sm:text-2xl text-[#0D0D0D] leading-none">
                    {gameState.moves}
                  </span>
                </div>
                <span className="w-[2px] h-4 sm:h-5 bg-[#0D0D0D]/25 rounded-full shrink-0" aria-hidden="true" />
                <div className="flex items-baseline justify-center gap-1.5 min-w-0">
                  <span className="font-bangers text-xs sm:text-base text-[#FF0099] tracking-wide">TIME</span>
                  <span className="font-bangers text-base sm:text-2xl text-[#0D0D0D] leading-none">
                    {timeFormatted}
                  </span>
                </div>
              </div>

              {/* Right: Compact Draw Mode / Daily Challenge Chip */}
              {gameState.isDailyChallenge ? (
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playButton();
                    setScreen('PAUSED');
                  }}
                  className="pop-btn bg-[#FF0099] text-white font-bangers text-sm sm:text-lg px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg tracking-wide inline-flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0"
                  title="Daily Challenge · Pre-seeded worldwide layout"
                >
                  <Calendar className="w-4 h-4 shrink-0" strokeWidth={2.8} />
                  <span>DAILY</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleToggleDrawModeInGame}
                  className="pop-btn bg-[#FFFDF7] text-[#0D0D0D] font-bangers text-sm sm:text-lg px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg tracking-wide inline-flex items-center justify-center whitespace-nowrap shrink-0"
                  title="Switch Draw 1 / Draw 3 and deal new game"
                >
                  DRAW {drawMode}
                </button>
              )}
            </div>
          </header>

          {/* Main Solitaire Card Table */}
          <GameBoard
            gameState={gameState}
            cardBackStyle={cardBackStyle}
            gameplayTheme={gameplayTheme}
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

          {/* Floating Pop Art Bottom Thumb Dock (Design 1) */}
          <nav
            aria-label="Gameplay Controls"
            className="w-full px-3 pt-1 pb-[max(0.65rem,env(safe-area-inset-bottom))] z-40 shrink-0 pointer-events-none relative"
          >
            <div className="pointer-events-auto w-full max-w-[430px] mx-auto bg-[#FFFDF7] border-[3px] sm:border-[3.5px] border-[#0D0D0D] rounded-2xl shadow-[5px_5px_0_#0D0D0D] p-1.5 sm:p-2 grid grid-cols-4 gap-1.5 sm:gap-2">
              {/* 1. HINT */}
              <button
                type="button"
                onClick={handleHint}
                disabled={isAutoCompleting}
                className="pop-btn bg-[#FFE600] hover:bg-[#FFF04D] text-[#0D0D0D] rounded-xl py-1.5 sm:py-2 px-1 flex flex-col items-center justify-center gap-0.5"
                title="Show Legal Move Hint (H)"
                aria-label="Hint"
              >
                <Lightbulb className="w-5 h-5 sm:w-6 sm:h-6 text-[#0D0D0D]" strokeWidth={2.8} />
                <span className="font-bangers text-sm sm:text-base tracking-wider leading-none">
                  HINT
                </span>
              </button>

              {/* 2. UNDO */}
              <button
                type="button"
                onClick={handleUndo}
                disabled={undoStack.length === 0 || isAutoCompleting}
                className="pop-btn bg-[#00D2FF] hover:bg-[#33DDFF] text-[#0D0D0D] rounded-xl py-1.5 sm:py-2 px-1 flex flex-col items-center justify-center gap-0.5 relative"
                title="Undo Last Move (Z)"
                aria-label="Undo"
              >
                <Undo2 className="w-5 h-5 sm:w-6 sm:h-6 text-[#0D0D0D]" strokeWidth={2.8} />
                <span className="font-bangers text-sm sm:text-base tracking-wider leading-none">
                  UNDO
                </span>
                {undoStack.length > 0 && (
                  <span className="absolute -top-1.5 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[#FFE600] border-2 border-[#0D0D0D] text-[#0D0D0D] font-bangers text-[11px] leading-none flex items-center justify-center tabular-nums shadow-[1px_1px_0_#0D0D0D]">
                    {undoStack.length > 99 ? '99+' : undoStack.length}
                  </span>
                )}
              </button>

              {/* 3. DEAL / RETRY */}
              <button
                type="button"
                onClick={handleDealOrRestart}
                className="pop-btn bg-[#FF1E42] hover:bg-[#FF3355] text-white rounded-xl py-1.5 sm:py-2 px-1 flex flex-col items-center justify-center gap-0.5"
                title={gameState.isDailyChallenge ? 'Restart Today’s Daily Deal' : 'Deal New Game'}
                aria-label={gameState.isDailyChallenge ? 'Retry Daily' : 'New Deal'}
              >
                <RotateCcw className="w-5 h-5 sm:w-6 sm:h-6 text-white" strokeWidth={2.8} />
                <span className="font-bangers text-sm sm:text-base tracking-wider leading-none">
                  {gameState.isDailyChallenge ? 'RETRY' : 'DEAL'}
                </span>
              </button>

              {/* 4. MENU / PAUSE */}
              <button
                type="button"
                onClick={() => {
                  soundEngine.playButton();
                  setScreen('PAUSED');
                }}
                className="pop-btn bg-[#FFFDF7] hover:bg-[#F3EFE6] text-[#0D0D0D] rounded-xl py-1.5 sm:py-2 px-1 flex flex-col items-center justify-center gap-0.5"
                title="Pause, Theme & Card Customization (Esc)"
                aria-label="Menu"
              >
                <Pause className="w-5 h-5 sm:w-6 sm:h-6 text-[#0D0D0D]" strokeWidth={2.8} />
                <span className="font-bangers text-sm sm:text-base tracking-wider leading-none">
                  MENU
                </span>
              </button>
            </div>
          </nav>

          {/* Pause & Theme/Card Customization Modal */}
          {screen === 'PAUSED' && (
            <PauseModal
              drawMode={drawMode}
              isDailyChallenge={gameState.isDailyChallenge}
              dailyDateLabel={todayDateLabel}
              cardBackStyle={cardBackStyle}
              gameplayTheme={gameplayTheme}
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
              onSelectGameplayTheme={handleSelectGameplayTheme}
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

          {/* Failed / Deadlock Modal (Sad Emoji + Sad Sound Effect + Play Again) */}
          {screen === 'FAILED' && (
            <FailedModal
              score={gameState.score}
              moves={gameState.moves}
              timeFormatted={timeFormatted}
              canUndo={undoStack.length > 0}
              isDailyChallenge={gameState.isDailyChallenge}
              onPlayAgain={handleDealOrRestart}
              onUndoLastMove={handleUndo}
              onReturnToLobby={() => {
                soundEngine.playButton();
                setScreen('SPLASH');
              }}
            />
          )}

          {/* Gameplay Device-Back Quit Confirmation Modal */}
          {showQuitConfirm && (
            <QuitConfirmModal
              onConfirmQuit={() => {
                soundEngine.playButton();
                cancelDeadlockTimer();
                setShowQuitConfirm(false);
                setScreen('SPLASH');
              }}
              onCancelQuit={() => {
                soundEngine.playButton();
                setShowQuitConfirm(false);
              }}
            />
          )}
        </>
      )}

      {/* Global Comic Callout Burst Layer */}
      <ComicCalloutLayer callouts={callouts} gameplayTheme={isGameplayScreen ? gameplayTheme : 'comic'} />

      {/* Offline Mode Indicator */}
      <OfflineIndicator />
    </div>
  );
}
