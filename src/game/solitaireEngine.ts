import {
  Card,
  CardSource,
  DailyChallengeRecord,
  DrawMode,
  GameState,
  MoveHint,
  MoveTarget,
  PlayerStats,
  Suit,
} from './types';

export const SUITS: Suit[] = ['spades', 'hearts', 'clubs', 'diamonds'];

export const RANKS: { val: number; label: string }[] = [
  { val: 1, label: 'A' },
  { val: 2, label: '2' },
  { val: 3, label: '3' },
  { val: 4, label: '4' },
  { val: 5, label: '5' },
  { val: 6, label: '6' },
  { val: 7, label: '7' },
  { val: 8, label: '8' },
  { val: 9, label: '9' },
  { val: 10, label: '10' },
  { val: 11, label: 'J' },
  { val: 12, label: 'Q' },
  { val: 13, label: 'K' },
];

export function createDeck(): Card[] {
  const deck: Card[] = [];
  let counter = 0;
  for (const suit of SUITS) {
    const color = suit === 'hearts' || suit === 'diamonds' ? 'red' : 'black';
    for (const rank of RANKS) {
      deck.push({
        id: `c-${suit[0]}-${rank.val}-${counter++}`,
        suit,
        color,
        value: rank.val,
        label: rank.label,
        faceUp: false,
      });
    }
  }
  return deck;
}

export function shuffleDeck(cards: Card[], rng: () => number = Math.random): Card[] {
  const copy = [...cards];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/** Deterministic string hash (FNV-1a 32-bit) + Mulberry32 PRNG for worldwide Daily Challenge deals */
function hashStringToSeed(input: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function createMulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function getTodayDateKey(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function formatDailyDateLabel(dateKey: string): string {
  const parts = dateKey.split('-').map(Number);
  if (parts.length !== 3) return dateKey;
  const dt = new Date(parts[0], parts[1] - 1, parts[2]);
  return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function cloneGameState(state: GameState): GameState {
  return {
    ...state,
    stock: state.stock.map((c) => ({ ...c })),
    waste: state.waste.map((c) => ({ ...c })),
    foundations: state.foundations.map((pile) => pile.map((c) => ({ ...c }))),
    tableau: state.tableau.map((col) => col.map((c) => ({ ...c }))),
  };
}

let globalDealCounter = 1;

function dealFromDeck(
  deck: Card[],
  drawMode: DrawMode,
  isDailyChallenge: boolean,
  dailyDateKey: string | null
): GameState {
  const working = [...deck];
  const tableau: Card[][] = [[], [], [], [], [], [], []];

  // Classic Klondike Deal: Column i receives i+1 cards, top card face-up
  for (let col = 0; col < 7; col++) {
    for (let row = 0; row <= col; row++) {
      const card = working.pop()!;
      card.faceUp = row === col;
      tableau[col].push(card);
    }
  }

  return {
    stock: working, // remaining 24 cards face-down
    waste: [],
    foundations: [[], [], [], []],
    tableau,
    score: 0,
    moves: 0,
    recycleCount: 0,
    drawMode,
    dealId: globalDealCounter++,
    isDailyChallenge,
    dailyDateKey,
  };
}

export function dealNewGame(drawMode: DrawMode): GameState {
  const deck = shuffleDeck(createDeck());
  return dealFromDeck(deck, drawMode, false, null);
}

/**
 * Generates the exact same pre-seeded Klondike Solitaire layout for all players on a given calendar date.
 */
export function dealDailyChallenge(dateKey: string = getTodayDateKey()): GameState {
  const seed = hashStringToSeed(`pop-solitaire-daily-v1::${dateKey}`);
  const rng = createMulberry32(seed);
  const deck = shuffleDeck(createDeck(), rng);
  return dealFromDeck(deck, 1, true, dateKey);
}

/**
 * Classic Klondike Foundation Rule:
 * - Empty foundation accepts ONLY an Ace (value === 1) of any suit.
 * - Non-empty foundation accepts ONLY the next ascending rank (+1) of the exact same suit.
 */
export function canMoveToFoundation(card: Card, pile: Card[]): boolean {
  if (pile.length === 0) {
    return card.value === 1;
  }
  const top = pile[pile.length - 1];
  return card.suit === top.suit && card.value === top.value + 1;
}

export function findValidFoundationIndex(card: Card, foundations: Card[][]): number {
  if (card.value === 1) {
    return foundations.findIndex((p) => p.length === 0);
  }
  return foundations.findIndex((p) => {
    if (p.length === 0) return false;
    const top = p[p.length - 1];
    return top.suit === card.suit && card.value === top.value + 1;
  });
}

/**
 * Classic Klondike Tableau Rule:
 * - Empty column accepts ONLY a King (value === 13) or King-led alternating stack.
 * - Non-empty column accepts ONLY opposite color and descending rank (top.value - 1).
 */
export function canMoveToTableau(card: Card, column: Card[]): boolean {
  if (column.length === 0) {
    return card.value === 13;
  }
  const top = column[column.length - 1];
  if (!top.faceUp) return false;
  return card.color !== top.color && card.value === top.value - 1;
}

export function isValidTableauSubStack(cards: Card[]): boolean {
  if (cards.length === 0 || !cards[0].faceUp) return false;
  for (let i = 1; i < cards.length; i++) {
    if (!cards[i].faceUp) return false;
    if (cards[i].color === cards[i - 1].color) return false;
    if (cards[i].value !== cards[i - 1].value - 1) return false;
  }
  return true;
}

export interface DrawResult {
  nextState: GameState;
  recycled: boolean;
  drawnIds: string[];
}

export function drawFromStock(state: GameState): DrawResult | null {
  if (state.stock.length === 0 && state.waste.length === 0) {
    return null;
  }

  const next = cloneGameState(state);

  if (next.stock.length > 0) {
    const count = Math.min(next.drawMode, next.stock.length);
    const drawnIds: string[] = [];
    for (let i = 0; i < count; i++) {
      const card = next.stock.pop()!;
      card.faceUp = true;
      next.waste.push(card);
      drawnIds.push(card.id);
    }
    next.moves += 1;
    return { nextState: next, recycled: false, drawnIds };
  }

  // Recycle waste back into stock preserving exact draw order
  while (next.waste.length > 0) {
    const card = next.waste.pop()!;
    card.faceUp = false;
    next.stock.push(card);
  }
  next.recycleCount += 1;
  // Standard Klondike recycle scoring
  if (next.drawMode === 1) {
    next.score = Math.max(0, next.score - 100);
  } else if (next.recycleCount > 3) {
    next.score = Math.max(0, next.score - 20);
  }
  next.moves += 1;
  return { nextState: next, recycled: true, drawnIds: [] };
}

export interface MoveExecutionResult {
  nextState: GameState;
  movedCardIds: string[];
  leadCard: Card;
  revealedCardId: string | null;
  targetType: 'foundation' | 'tableau';
  scoreDelta: number;
}

export function executeMove(
  state: GameState,
  source: CardSource,
  target: MoveTarget
): MoveExecutionResult | null {
  let movingCards: Card[] = [];

  if (source.type === 'waste') {
    if (state.waste.length === 0) return null;
    if (source.cardIndex !== state.waste.length - 1) return null;
    movingCards = [state.waste[state.waste.length - 1]];
  } else if (source.type === 'foundation') {
    const pile = state.foundations[source.colIndex];
    if (!pile || pile.length === 0) return null;
    movingCards = [pile[pile.length - 1]];
  } else if (source.type === 'tableau') {
    const col = state.tableau[source.colIndex];
    if (!col || source.cardIndex < 0 || source.cardIndex >= col.length) return null;
    movingCards = col.slice(source.cardIndex);
    if (!isValidTableauSubStack(movingCards)) return null;
  }

  if (movingCards.length === 0) return null;
  const leadCard = movingCards[0];

  if (target.type === 'foundation') {
    if (movingCards.length !== 1) return null;
    if (source.type === 'foundation' && source.colIndex === target.index) return null;
    if (!canMoveToFoundation(leadCard, state.foundations[target.index])) return null;
  } else {
    if (source.type === 'tableau' && source.colIndex === target.index) return null;
    if (!canMoveToTableau(leadCard, state.tableau[target.index])) return null;
  }

  const next = cloneGameState(state);
  let popped: Card[] = [];

  if (source.type === 'waste') {
    popped = [next.waste.pop()!];
  } else if (source.type === 'foundation') {
    popped = [next.foundations[source.colIndex].pop()!];
  } else {
    popped = next.tableau[source.colIndex].splice(source.cardIndex);
  }

  let scoreDelta = 0;

  if (target.type === 'foundation') {
    next.foundations[target.index].push(popped[0]);
    if (source.type === 'waste' || source.type === 'tableau') {
      scoreDelta += 10;
    }
  } else {
    next.tableau[target.index].push(...popped);
    if (source.type === 'waste') {
      scoreDelta += 5;
    } else if (source.type === 'foundation') {
      scoreDelta -= 15;
    }
  }

  let revealedCardId: string | null = null;
  if (source.type === 'tableau') {
    const srcCol = next.tableau[source.colIndex];
    if (srcCol.length > 0 && !srcCol[srcCol.length - 1].faceUp) {
      srcCol[srcCol.length - 1].faceUp = true;
      revealedCardId = srcCol[srcCol.length - 1].id;
      scoreDelta += 5;
    }
  }

  next.score = Math.max(0, next.score + scoreDelta);
  next.moves += 1;

  return {
    nextState: next,
    movedCardIds: popped.map((c) => c.id),
    leadCard,
    revealedCardId,
    targetType: target.type,
    scoreDelta,
  };
}

/**
 * Smart Tap / Click Auto-Move:
 * Picks the highest-value legal destination for a clicked card or stack.
 */
export function findSmartMove(state: GameState, source: CardSource): MoveTarget | null {
  let movingCards: Card[] = [];

  if (source.type === 'waste') {
    if (state.waste.length === 0 || source.cardIndex !== state.waste.length - 1) return null;
    movingCards = [state.waste[state.waste.length - 1]];
  } else if (source.type === 'foundation') {
    const pile = state.foundations[source.colIndex];
    if (!pile || pile.length === 0) return null;
    movingCards = [pile[pile.length - 1]];
  } else {
    const col = state.tableau[source.colIndex];
    if (!col || source.cardIndex < 0 || source.cardIndex >= col.length) return null;
    movingCards = col.slice(source.cardIndex);
    if (!isValidTableauSubStack(movingCards)) return null;
  }

  const lead = movingCards[0];

  // 1. Prefer moving single card to Foundation
  if (movingCards.length === 1 && source.type !== 'foundation') {
    const fIdx = findValidFoundationIndex(lead, state.foundations);
    if (fIdx !== -1) {
      return { type: 'foundation', index: fIdx };
    }
  }

  // 2. Try non-empty Tableau columns first
  const nonEmptyCols: number[] = [];
  const emptyCols: number[] = [];

  for (let c = 0; c < 7; c++) {
    if (source.type === 'tableau' && source.colIndex === c) continue;
    if (canMoveToTableau(lead, state.tableau[c])) {
      if (state.tableau[c].length > 0) {
        nonEmptyCols.push(c);
      } else {
        emptyCols.push(c);
      }
    }
  }

  if (nonEmptyCols.length > 0) {
    return { type: 'tableau', index: nonEmptyCols[0] };
  }

  // 3. Only move King to empty column if from Waste/Foundation or uncovers a face-down card
  if (emptyCols.length > 0) {
    const freesFaceDown =
      source.type === 'tableau' &&
      source.cardIndex > 0 &&
      !state.tableau[source.colIndex][source.cardIndex - 1].faceUp;

    if (source.type !== 'tableau' || freesFaceDown) {
      return { type: 'tableau', index: emptyCols[0] };
    }
  }

  return null;
}

export function findBestHint(state: GameState): MoveHint {
  // 1. Waste top card -> Foundation
  if (state.waste.length > 0) {
    const wCard = state.waste[state.waste.length - 1];
    const fIdx = findValidFoundationIndex(wCard, state.foundations);
    if (fIdx !== -1) {
      return {
        kind: 'move',
        cardIds: [wCard.id],
        target: { type: 'foundation', index: fIdx },
        message: `Move ${wCard.label} to Foundation`,
      };
    }
  }

  // 2. Tableau top card -> Foundation
  for (let c = 0; c < 7; c++) {
    const col = state.tableau[c];
    if (col.length > 0) {
      const top = col[col.length - 1];
      const fIdx = findValidFoundationIndex(top, state.foundations);
      if (fIdx !== -1) {
        return {
          kind: 'move',
          cardIds: [top.id],
          target: { type: 'foundation', index: fIdx },
          message: `Move ${top.label} to Foundation`,
        };
      }
    }
  }

  // 3. Tableau stack -> another Tableau column (prioritize moves that uncover face-down cards or clear a column)
  for (let c = 0; c < 7; c++) {
    const col = state.tableau[c];
    const firstUpIdx = col.findIndex((card) => card.faceUp);
    if (firstUpIdx === -1) continue;
    const lead = col[firstUpIdx];
    // Avoid futile King-to-empty-column shuffle
    if (lead.value === 13 && firstUpIdx === 0) continue;

    for (let targetC = 0; targetC < 7; targetC++) {
      if (c === targetC) continue;
      if (canMoveToTableau(lead, state.tableau[targetC])) {
        const ids = col.slice(firstUpIdx).map((card) => card.id);
        return {
          kind: 'move',
          cardIds: ids,
          target: { type: 'tableau', index: targetC },
          message: `Move ${lead.label} stack to Column ${targetC + 1}`,
        };
      }
    }
  }

  // 4. Waste top card -> Tableau
  if (state.waste.length > 0) {
    const wCard = state.waste[state.waste.length - 1];
    for (let c = 0; c < 7; c++) {
      if (canMoveToTableau(wCard, state.tableau[c])) {
        return {
          kind: 'move',
          cardIds: [wCard.id],
          target: { type: 'tableau', index: c },
          message: `Move ${wCard.label} from Waste`,
        };
      }
    }
  }

  // 5. Stock / Waste draw available
  if (state.stock.length > 0 || state.waste.length > 0) {
    return {
      kind: 'draw',
      cardIds: [],
      message: state.stock.length > 0 ? 'Draw from Stock' : 'Recycle Stock',
    };
  }

  return {
    kind: 'stuck',
    cardIds: [],
    message: 'No legal moves left',
  };
}

export function canAutoComplete(state: GameState): boolean {
  if (isGameWon(state)) return false;
  if (state.stock.length > 0 || state.waste.length > 0) return false;
  const remaining = state.tableau.reduce((acc, col) => acc + col.length, 0);
  if (remaining === 0) return false;
  return state.tableau.every((col) => col.every((card) => card.faceUp));
}

export function getNextAutoCompleteMove(
  state: GameState
): { source: CardSource; target: MoveTarget } | null {
  // Always pick the lowest-value top card eligible for foundation for crisp A->K cascade
  let best: { value: number; source: CardSource; target: MoveTarget } | null = null;

  for (let c = 0; c < 7; c++) {
    const col = state.tableau[c];
    if (col.length === 0) continue;
    const top = col[col.length - 1];
    const fIdx = findValidFoundationIndex(top, state.foundations);
    if (fIdx !== -1) {
      if (!best || top.value < best.value) {
        best = {
          value: top.value,
          source: { type: 'tableau', colIndex: c, cardIndex: col.length - 1 },
          target: { type: 'foundation', index: fIdx },
        };
      }
    }
  }

  return best ? { source: best.source, target: best.target } : null;
}

export function isGameWon(state: GameState): boolean {
  return state.foundations.reduce((sum, pile) => sum + pile.length, 0) === 52;
}

/**
 * Checks whether ANY productive (positive) move exists anywhere in the current game state,
 * including cycling through all reachable Stock & Waste cards under the active Draw 1 / Draw 3 rules.
 *
 * Returns false when the player is truly deadlocked (only futile flipping or pointless King shuffles remain).
 */
export function hasAnyProductiveMove(state: GameState): boolean {
  if (isGameWon(state)) return true;

  // 1. Check if any Tableau top card can move to a Foundation
  for (let c = 0; c < 7; c++) {
    const col = state.tableau[c];
    if (col.length === 0) continue;
    const top = col[col.length - 1];
    if (findValidFoundationIndex(top, state.foundations) !== -1) {
      return true;
    }
  }

  // 2. Check if any Tableau face-up card/sub-stack can make a productive move to another Tableau column
  for (let c = 0; c < 7; c++) {
    const col = state.tableau[c];
    if (col.length === 0) continue;

    // 2a. Check the leading face-up card of the column (can uncover a face-down card or free an empty column for a King)
    const firstUpIdx = col.findIndex((card) => card.faceUp);
    if (firstUpIdx !== -1) {
      const lead = col[firstUpIdx];
      const uncoversFaceDown = firstUpIdx > 0 && !col[firstUpIdx - 1].faceUp;

      for (let targetC = 0; targetC < 7; targetC++) {
        if (c === targetC) continue;
        if (!canMoveToTableau(lead, state.tableau[targetC])) continue;

        // Moving a King from index 0 to another empty column is a pointless loop
        if (lead.value === 13 && firstUpIdx === 0 && state.tableau[targetC].length === 0) {
          continue;
        }

        // Uncovering a face-down card is always productive
        if (uncoversFaceDown) {
          return true;
        }

        // Clearing an entire column (index 0 non-King moving onto another card) is productive if a King exists that can use it
        if (firstUpIdx === 0) {
          const hasPlayableKing =
            state.tableau.some((kCol, kIdx) => {
              if (kIdx === c || kCol.length === 0) return false;
              const kFirstUp = kCol.findIndex((card) => card.faceUp);
              return kFirstUp > 0 && kCol[kFirstUp].value === 13;
            }) ||
            state.waste.some((card) => card.value === 13) ||
            state.stock.some((card) => card.value === 13);

          if (hasPlayableKing) {
            return true;
          }
        }
      }
    }

    // 2b. Check splitting a face-up stack ONLY if the newly exposed card underneath can go straight to a Foundation
    for (let idx = Math.max(1, firstUpIdx + 1); idx < col.length; idx++) {
      const exposedUnder = col[idx - 1];
      if (!exposedUnder.faceUp) continue;
      if (findValidFoundationIndex(exposedUnder, state.foundations) === -1) continue;

      const subLead = col[idx];
      for (let targetC = 0; targetC < 7; targetC++) {
        if (c === targetC) continue;
        if (canMoveToTableau(subLead, state.tableau[targetC])) {
          return true;
        }
      }
    }
  }

  // 3. Check ALL reachable cards from Stock & Waste by simulating a full deck cycle
  //    (If Draw 1, every card in stock + waste is reachable; if Draw 3, simulate exact 3-card steps through current pass + recycled pass)
  const reachableCards: Card[] = [];
  const seenIds = new Set<string>();

  const collectReachable = (card: Card | undefined) => {
    if (card && !seenIds.has(card.id)) {
      seenIds.add(card.id);
      reachableCards.push(card);
    }
  };

  // Current top of waste is immediately reachable
  if (state.waste.length > 0) {
    collectReachable(state.waste[state.waste.length - 1]);
  }

  if (state.drawMode === 1) {
    for (const c of state.stock) collectReachable(c);
    for (const c of state.waste) collectReachable(c);
  } else {
    // Simulate Draw 3 forward through remaining stock, then recycle and traverse one complete fresh pass
    let simStock = [...state.stock];
    let simWaste = [...state.waste];

    const stepPass = () => {
      while (simStock.length > 0) {
        const count = Math.min(3, simStock.length);
        for (let i = 0; i < count; i++) {
          simWaste.push(simStock.pop()!);
        }
        collectReachable(simWaste[simWaste.length - 1]);
      }
    };

    stepPass();
    // Recycle once and traverse the recycled deck completely
    if (simWaste.length > 0) {
      while (simWaste.length > 0) {
        simStock.push(simWaste.pop()!);
      }
      stepPass();
    }
  }

  for (const card of reachableCards) {
    if (findValidFoundationIndex(card, state.foundations) !== -1) {
      return true;
    }
    for (let c = 0; c < 7; c++) {
      if (canMoveToTableau(card, state.tableau[c])) {
        return true;
      }
    }
  }

  return false;
}

const STATS_KEY = 'pop_solitaire_stats_v1';

export function loadPlayerStats(): PlayerStats {
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (!raw) return { bestScore: 0, wins: 0, fastestWinSecs: null };
    const parsed = JSON.parse(raw) as Partial<PlayerStats>;
    return {
      bestScore: typeof parsed.bestScore === 'number' ? parsed.bestScore : 0,
      wins: typeof parsed.wins === 'number' ? parsed.wins : 0,
      fastestWinSecs: typeof parsed.fastestWinSecs === 'number' ? parsed.fastestWinSecs : null,
    };
  } catch {
    return { bestScore: 0, wins: 0, fastestWinSecs: null };
  }
}

export function recordWinStats(score: number, seconds: number): PlayerStats {
  const prev = loadPlayerStats();
  const next: PlayerStats = {
    bestScore: Math.max(prev.bestScore, score),
    wins: prev.wins + 1,
    fastestWinSecs:
      prev.fastestWinSecs === null ? seconds : Math.min(prev.fastestWinSecs, seconds),
  };
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(next));
  } catch {
    // Ignore quota errors
  }
  return next;
}

const DAILY_STORAGE_KEY = 'pop_solitaire_daily_v1';

export function loadDailyRecord(): DailyChallengeRecord {
  try {
    const raw = localStorage.getItem(DAILY_STORAGE_KEY);
    if (!raw) return { completedDates: [], streak: 0, lastCompletedDate: null };
    const parsed = JSON.parse(raw) as Partial<DailyChallengeRecord>;
    return {
      completedDates: Array.isArray(parsed.completedDates) ? parsed.completedDates : [],
      streak: typeof parsed.streak === 'number' ? parsed.streak : 0,
      lastCompletedDate: typeof parsed.lastCompletedDate === 'string' ? parsed.lastCompletedDate : null,
    };
  } catch {
    return { completedDates: [], streak: 0, lastCompletedDate: null };
  }
}

export function isDailyCompleted(record: DailyChallengeRecord, dateKey: string = getTodayDateKey()): boolean {
  return record.completedDates.includes(dateKey);
}

function getPreviousDateKey(dateKey: string): string {
  const parts = dateKey.split('-').map(Number);
  if (parts.length !== 3) return '';
  const dt = new Date(parts[0], parts[1] - 1, parts[2] - 1);
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, '0');
  const d = String(dt.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function recordDailyWin(dateKey: string = getTodayDateKey()): DailyChallengeRecord {
  const prev = loadDailyRecord();
  if (prev.completedDates.includes(dateKey)) {
    return prev;
  }

  const yesterday = getPreviousDateKey(dateKey);
  const nextStreak = prev.lastCompletedDate === yesterday ? prev.streak + 1 : 1;
  const completedDates = [...prev.completedDates.slice(-60), dateKey];

  const next: DailyChallengeRecord = {
    completedDates,
    streak: nextStreak,
    lastCompletedDate: dateKey,
  };

  try {
    localStorage.setItem(DAILY_STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Ignore storage errors
  }
  return next;
}
