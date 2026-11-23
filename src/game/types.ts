export type Suit = 'spades' | 'hearts' | 'clubs' | 'diamonds';
export type CardColor = 'red' | 'black';
export type DrawMode = 1 | 3;
export type ScreenState = 'SPLASH' | 'PLAYING' | 'PAUSED' | 'VICTORY';
export type CardBackStyle = 'dots' | 'stripes' | 'geometric' | 'checker';

export interface Card {
  id: string;
  suit: Suit;
  color: CardColor;
  value: number; // 1 = Ace ... 13 = King
  label: string; // 'A' .. 'K'
  faceUp: boolean;
}

export type SourcePileType = 'waste' | 'tableau' | 'foundation';
export type TargetPileType = 'tableau' | 'foundation';

export interface CardSource {
  type: SourcePileType;
  colIndex: number; // 0 for waste, 0..3 for foundation, 0..6 for tableau
  cardIndex: number;
}

export interface MoveTarget {
  type: TargetPileType;
  index: number;
}

export interface GameState {
  stock: Card[];
  waste: Card[];
  foundations: Card[][]; // 4 piles
  tableau: Card[][]; // 7 columns
  score: number;
  moves: number;
  recycleCount: number;
  drawMode: DrawMode;
  dealId: number; // increments each new deal for entrance animation keys
}

export interface MoveHint {
  kind: 'move' | 'draw' | 'stuck';
  cardIds: string[];
  target?: MoveTarget;
  message: string;
}

export interface CalloutBurst {
  id: number;
  text: string;
  x: number;
  y: number;
  bgColor: string;
}

export interface PlayerStats {
  bestScore: number;
  wins: number;
  fastestWinSecs: number | null;
}
