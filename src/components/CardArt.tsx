import React from 'react';
import { Card, CardBackStyle, GameplayTheme, Suit } from '../game/types';

export type CardVisualStyle = GameplayTheme | Exclude<CardBackStyle, 'theme'>;

export const CARD_BACK_OPTIONS: { id: CardBackStyle; label: string }[] = [
  { id: 'theme', label: 'Match Theme' },
  { id: 'dots', label: 'Ben Day' },
  { id: 'geometric', label: 'Mod Geo' },
  { id: 'checker', label: 'POP' },
];

export const CARD_SUIT_PALETTE: Record<
  CardVisualStyle,
  { red: string; black: string; hiRed: string; hiBlack: string }
> = {
  comic: { red: '#FF1E42', black: '#0D0D0D', hiRed: '#FFFFFF', hiBlack: '#00D2FF' },
  memphis: { red: '#FF5C8A', black: '#1F2937', hiRed: '#FFE600', hiBlack: '#5CE1E6' },
  street: { red: '#FF3B00', black: '#0D0D0D', hiRed: '#FFE600', hiBlack: '#FF5500' },
  manga: { red: '#FF2A6D', black: '#1E1B4B', hiRed: '#FBCFE8', hiBlack: '#38BDF8' },
  // 3 standalone Card Styles (change both front & back!)
  dots: { red: '#FF0099', black: '#1D4ED8', hiRed: '#FFE600', hiBlack: '#00D2FF' },
  geometric: { red: '#E11D48', black: '#0F172A', hiRed: '#FFE600', hiBlack: '#38BDF8' },
  checker: { red: '#FF006E', black: '#0D0D0D', hiRed: '#FFE600', hiBlack: '#00E676' },
};

export function resolveCardVisualStyle(
  cardBackStyle: CardBackStyle = 'theme',
  gameplayTheme: GameplayTheme = 'comic'
): CardVisualStyle {
  return cardBackStyle === 'theme' ? gameplayTheme : cardBackStyle;
}

export const SuitIcon: React.FC<{
  suit: Suit;
  className?: string;
  visualStyle?: CardVisualStyle;
}> = ({ suit, className = 'w-full h-full', visualStyle = 'comic' }) => {
  const palette = CARD_SUIT_PALETTE[visualStyle] || CARD_SUIT_PALETTE.comic;

  switch (suit) {
    case 'spades':
      return (
        <svg className={className} viewBox="0 0 64 64" aria-hidden="true">
          <path
            d="M32 6 C14 24 8 34 8 42 C8 49 14 53 20 53 C24 53 27 51 29 48 L25 58 L39 58 L35 48 C37 51 40 53 44 53 C50 53 56 49 56 42 C56 34 50 24 32 6 Z"
            fill={palette.black}
            stroke="#0D0D0D"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          <path
            d="M23 30 C19 34 17 38 18 42"
            stroke={palette.hiBlack}
            strokeWidth="3.5"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
      );
    case 'hearts':
      return (
        <svg className={className} viewBox="0 0 64 64" aria-hidden="true">
          <path
            d="M32 56 C32 56 8 40 8 22 C8 13 15 8 22 8 C27 8 30 11 32 15 C34 11 37 8 42 8 C49 8 56 13 56 22 C56 40 32 56 32 56 Z"
            fill={palette.red}
            stroke="#0D0D0D"
            strokeWidth="4"
            strokeLinejoin="round"
          />
          <path
            d="M16 19 C16 15 19 13 22 13"
            stroke={palette.hiRed}
            strokeWidth="3.5"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
      );
    case 'clubs':
      return (
        <svg className={className} viewBox="0 0 64 64" aria-hidden="true">
          <path
            d="M32 8 C25 8 20 13 20 20 C20 23 21 26 23 28 C16 27 10 32 10 39 C10 46 16 51 22 51 C25 51 28 49 29 47 L25 58 L39 58 L35 47 C36 49 39 51 42 51 C48 51 54 46 54 39 C54 32 48 27 41 28 C43 26 44 23 44 20 C44 13 39 8 32 8 Z"
            fill={palette.black}
            stroke="#0D0D0D"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          <circle cx="29" cy="17" r="2.8" fill={visualStyle === 'comic' ? '#FFE600' : palette.hiBlack} />
        </svg>
      );
    case 'diamonds':
      return (
        <svg className={className} viewBox="0 0 64 64" aria-hidden="true">
          <polygon
            points="32,6 54,32 32,58 10,32"
            fill={palette.red}
            stroke="#0D0D0D"
            strokeWidth="4"
            strokeLinejoin="round"
          />
          <polygon
            points="32,14 44,32 32,50 20,32"
            fill={visualStyle === 'comic' ? '#FFE600' : palette.hiRed}
            opacity="0.5"
          />
        </svg>
      );
  }
};

const FaceCardEmblem: React.FC<{
  label: string;
  suit: Suit;
  visualStyle?: CardVisualStyle;
}> = ({ label, suit, visualStyle = 'comic' }) => {
  const isRed = suit === 'hearts' || suit === 'diamonds';
  const labelWord = label === 'K' ? 'KING' : label === 'Q' ? 'QUEEN' : 'JACK';

  // Standalone Card Style 1: Ben Day Halftone Medallion Court Art
  if (visualStyle === 'dots') {
    const outer = isRed ? '#FF0099' : '#00D2FF';
    const inner = isRed ? '#FFE600' : '#1D4ED8';
    const badgeText = isRed ? '#0D0D0D' : '#FFFFFF';
    return (
      <svg className="w-[76%] h-[64%]" viewBox="0 0 100 110" aria-hidden="true">
        <rect x="8" y="8" width="84" height="94" rx="14" fill={outer} stroke="#0D0D0D" strokeWidth="4.5" />
        {/* Ben-Day corner dots inside court frame */}
        <circle cx="20" cy="20" r="4" fill="#FFFFFF" opacity="0.7" />
        <circle cx="80" cy="20" r="4" fill="#FFFFFF" opacity="0.7" />
        <circle cx="20" cy="70" r="4" fill="#FFFFFF" opacity="0.7" />
        <circle cx="80" cy="70" r="4" fill="#FFFFFF" opacity="0.7" />
        <circle cx="50" cy="46" r="25" fill={inner} stroke="#0D0D0D" strokeWidth="4" />
        <text
          x="50"
          y="56"
          textAnchor="middle"
          fontFamily="Bangers, sans-serif"
          fontSize="31"
          fill={badgeText}
        >
          {label}
        </text>
        <rect x="16" y="78" width="68" height="20" rx="6" fill="#0D0D0D" />
        <text
          x="50"
          y="93"
          textAnchor="middle"
          fontFamily="Bangers, sans-serif"
          fontSize="16"
          fill="#FFE600"
          letterSpacing="1.5"
        >
          {labelWord}
        </text>
      </svg>
    );
  }

  // Standalone Card Style 2: Mod Geo Faceted Diamond Court Art
  if (visualStyle === 'geometric') {
    const primary = isRed ? '#E11D48' : '#1D4ED8';
    const accent = isRed ? '#FFE600' : '#00D2FF';
    return (
      <svg className="w-[76%] h-[64%]" viewBox="0 0 100 110" aria-hidden="true">
        <rect x="8" y="8" width="84" height="94" rx="4" fill="#FFFFFF" stroke="#0D0D0D" strokeWidth="4.5" />
        <polygon
          points="50,14 84,48 50,82 16,48"
          fill={primary}
          stroke="#0D0D0D"
          strokeWidth="4"
          strokeLinejoin="round"
        />
        <polygon
          points="50,26 70,48 50,70 30,48"
          fill={accent}
          stroke="#0D0D0D"
          strokeWidth="3.5"
          strokeLinejoin="round"
        />
        <text
          x="50"
          y="56"
          textAnchor="middle"
          fontFamily="Bangers, sans-serif"
          fontSize="24"
          fill="#0D0D0D"
        >
          {label}
        </text>
        <rect x="14" y="80" width="72" height="18" fill="#0D0D0D" />
        <text
          x="50"
          y="94"
          textAnchor="middle"
          fontFamily="Bangers, sans-serif"
          fontSize="15"
          fill="#FFFFFF"
          letterSpacing="1.5"
        >
          {labelWord}
        </text>
      </svg>
    );
  }

  // Standalone Card Style 3: POP Concentric Bullseye Starburst Court Art
  if (visualStyle === 'checker') {
    const ring1 = isRed ? '#FF006E' : '#00E676';
    const ring2 = isRed ? '#FFE600' : '#00D2FF';
    return (
      <svg className="w-[76%] h-[64%]" viewBox="0 0 100 110" aria-hidden="true">
        <rect x="8" y="8" width="84" height="94" rx="12" fill="#0D0D0D" stroke="#0D0D0D" strokeWidth="4" />
        <circle cx="50" cy="46" r="31" fill={ring1} stroke="#0D0D0D" strokeWidth="3.5" />
        <circle cx="50" cy="46" r="20" fill={ring2} stroke="#0D0D0D" strokeWidth="3.5" />
        <circle cx="50" cy="46" r="10" fill="#FFFFFF" stroke="#0D0D0D" strokeWidth="3" />
        <text
          x="50"
          y="53"
          textAnchor="middle"
          fontFamily="Bangers, sans-serif"
          fontSize="18"
          fill="#0D0D0D"
        >
          {label}
        </text>
        <rect x="16" y="79" width="68" height="19" rx="5" fill="#FFE600" stroke="#0D0D0D" strokeWidth="3" />
        <text
          x="50"
          y="94"
          textAnchor="middle"
          fontFamily="Bangers, sans-serif"
          fontSize="16"
          fill="#0D0D0D"
          letterSpacing="1.5"
        >
          {labelWord}
        </text>
      </svg>
    );
  }

  // Theme: Memphis 80s Geometric Pop Court Art
  if (visualStyle === 'memphis') {
    const main = isRed ? '#FF6B9D' : '#5CE1E6';
    const sub = isRed ? '#FFE600' : '#B5838D';
    return (
      <svg className="w-[76%] h-[64%]" viewBox="0 0 100 110" aria-hidden="true">
        <rect x="10" y="10" width="80" height="90" rx="16" fill="#FFFFFF" stroke="#0D0D0D" strokeWidth="4" />
        <polygon
          points="50,16 82,70 18,70"
          fill={main}
          stroke="#0D0D0D"
          strokeWidth="4"
          strokeLinejoin="round"
        />
        <circle cx="50" cy="48" r="15" fill={sub} stroke="#0D0D0D" strokeWidth="3.5" />
        <polyline
          points="22,78 36,70 50,78 64,70 78,78"
          fill="none"
          stroke="#0D0D0D"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        <text
          x="50"
          y="95"
          textAnchor="middle"
          fontFamily="Bangers, sans-serif"
          fontSize="18"
          fill="#0D0D0D"
          letterSpacing="1"
        >
          {labelWord}
        </text>
      </svg>
    );
  }

  // Theme: Neo-Pop Street Graffiti Court Art
  if (visualStyle === 'street') {
    const bg = isRed ? '#FF5500' : '#FFE600';
    const fg = isRed ? '#FFE600' : '#00D2FF';
    return (
      <svg className="w-[76%] h-[64%]" viewBox="0 0 100 110" aria-hidden="true">
        <rect x="8" y="8" width="84" height="94" rx="6" fill={bg} stroke="#0D0D0D" strokeWidth="5" />
        <polygon
          points="22,62 22,30 38,46 50,22 62,46 78,30 78,62"
          fill={fg}
          stroke="#0D0D0D"
          strokeWidth="4.5"
          strokeLinejoin="round"
        />
        <line x1="50" y1="10" x2="50" y2="17" stroke="#0D0D0D" strokeWidth="4" strokeLinecap="round" />
        <line x1="22" y1="15" x2="27" y2="21" stroke="#0D0D0D" strokeWidth="4" strokeLinecap="round" />
        <line x1="78" y1="15" x2="73" y2="21" stroke="#0D0D0D" strokeWidth="4" strokeLinecap="round" />
        <rect x="16" y="70" width="68" height="22" fill="#0D0D0D" />
        <text
          x="50"
          y="87"
          textAnchor="middle"
          fontFamily="Bangers, sans-serif"
          fontSize="19"
          fill="#FFFFFF"
          letterSpacing="1.5"
        >
          {labelWord}
        </text>
      </svg>
    );
  }

  // Theme: Retro Japanese Manga & Superflat Court Art
  if (visualStyle === 'manga') {
    const aura = isRed ? '#FF2A6D' : '#38BDF8';
    const core = isRed ? '#FFE600' : '#A855F7';
    return (
      <svg className="w-[76%] h-[64%]" viewBox="0 0 100 110" aria-hidden="true">
        <polygon
          points="50,6 63,28 90,22 76,48 94,70 66,72 50,98 34,72 6,70 24,48 10,22 37,28"
          fill={aura}
          stroke="#1E1B4B"
          strokeWidth="4"
          strokeLinejoin="round"
        />
        <circle cx="50" cy="50" r="22" fill={core} stroke="#1E1B4B" strokeWidth="3.5" />
        <circle cx="43" cy="46" r="2.5" fill="#1E1B4B" />
        <circle cx="57" cy="46" r="2.5" fill="#1E1B4B" />
        <path d="M43,54 Q50,62 57,54" fill="none" stroke="#1E1B4B" strokeWidth="2.5" strokeLinecap="round" />
        <rect x="18" y="84" width="64" height="18" rx="3" fill="#1E1B4B" />
        <text
          x="50"
          y="98"
          textAnchor="middle"
          fontFamily="Bangers, sans-serif"
          fontSize="16"
          fill="#FFFFFF"
          letterSpacing="1.5"
        >
          {labelWord}
        </text>
      </svg>
    );
  }

  // Theme Default: Lichtenstein Comic Pop Art Court Art
  const primary = isRed ? '#FF1E42' : '#1D4ED8';
  const secondary = isRed ? '#FFE600' : '#00D2FF';
  const accent = isRed ? '#FF0099' : '#FFE600';

  if (label === 'K') {
    return (
      <svg className="w-[74%] h-[62%]" viewBox="0 0 100 110" aria-hidden="true">
        <rect x="8" y="8" width="84" height="94" rx="10" fill={secondary} stroke="#0D0D0D" strokeWidth="5" />
        <polygon
          points="18,64 18,32 36,48 50,24 64,48 82,32 82,64"
          fill={primary}
          stroke="#0D0D0D"
          strokeWidth="4.5"
          strokeLinejoin="round"
        />
        <circle cx="18" cy="27" r="5" fill={accent} stroke="#0D0D0D" strokeWidth="3" />
        <circle cx="50" cy="19" r="6" fill={accent} stroke="#0D0D0D" strokeWidth="3" />
        <circle cx="82" cy="27" r="5" fill={accent} stroke="#0D0D0D" strokeWidth="3" />
        <rect x="18" y="64" width="64" height="13" rx="3" fill="#FFFFFF" stroke="#0D0D0D" strokeWidth="4" />
        <text x="50" y="96" textAnchor="middle" fontFamily="Bangers, sans-serif" fontSize="22" fill="#0D0D0D">
          KING
        </text>
      </svg>
    );
  }

  if (label === 'Q') {
    return (
      <svg className="w-[74%] h-[62%]" viewBox="0 0 100 110" aria-hidden="true">
        <rect x="8" y="8" width="84" height="94" rx="10" fill={accent} stroke="#0D0D0D" strokeWidth="5" />
        <circle cx="50" cy="48" r="26" fill={secondary} stroke="#0D0D0D" strokeWidth="4.5" />
        <polygon
          points="50,24 57,41 75,41 61,52 66,69 50,59 34,69 39,52 25,41 43,41"
          fill={primary}
          stroke="#0D0D0D"
          strokeWidth="3.5"
          strokeLinejoin="round"
        />
        <text
          x="50"
          y="96"
          textAnchor="middle"
          fontFamily="Bangers, sans-serif"
          fontSize="22"
          fill="#FFFFFF"
          stroke="#0D0D0D"
          strokeWidth="1.2"
        >
          QUEEN
        </text>
      </svg>
    );
  }

  return (
    <svg className="w-[74%] h-[62%]" viewBox="0 0 100 110" aria-hidden="true">
      <rect x="8" y="8" width="84" height="94" rx="10" fill={primary} stroke="#0D0D0D" strokeWidth="5" />
      <polygon
        points="55,18 28,56 48,56 42,84 72,44 52,44"
        fill={secondary}
        stroke="#0D0D0D"
        strokeWidth="4"
        strokeLinejoin="round"
      />
      <text
        x="50"
        y="97"
        textAnchor="middle"
        fontFamily="Bangers, sans-serif"
        fontSize="21"
        fill="#FFFFFF"
        stroke="#0D0D0D"
        strokeWidth="1.2"
      >
        JACK
      </text>
    </svg>
  );
};

export const CardBackGraphic: React.FC<{
  styleVariant?: CardBackStyle;
  gameplayTheme?: GameplayTheme;
}> = ({ styleVariant = 'theme', gameplayTheme = 'comic' }) => {
  // Match Theme: renders signature card back for the active gameplay theme (Comic default, Memphis, Street, Manga)
  if (styleVariant === 'theme') {
    const themePatternClass =
      gameplayTheme === 'memphis'
        ? 'card-back-theme-memphis'
        : gameplayTheme === 'street'
        ? 'card-back-theme-street'
        : gameplayTheme === 'manga'
        ? 'card-back-theme-manga'
        : 'card-back-theme-comic';

    const themeInnerClass =
      gameplayTheme === 'memphis'
        ? 'bg-[#FFFFFF] rounded-xl'
        : gameplayTheme === 'street'
        ? 'bg-[#FF1E42] rounded-[4px]'
        : gameplayTheme === 'manga'
        ? 'bg-[#FFF5F7] rounded-[2px]'
        : 'bg-[#1D4ED8] rounded-md';

    return (
      <div className={`w-full h-full ${themePatternClass} flex items-center justify-center relative`}>
        <div
          className={`w-[78%] h-[82%] border-[2.5px] border-[#0D0D0D] ${themeInnerClass} flex items-center justify-center shadow-[2px_2px_0_#0D0D0D] relative overflow-hidden`}
        >
          {gameplayTheme === 'memphis' ? (
            <svg className="w-4/5 h-4/5" viewBox="0 0 60 60" aria-hidden="true">
              <polygon
                points="30,8 52,46 8,46"
                fill="#FF6B9D"
                stroke="#0D0D0D"
                strokeWidth="3"
                strokeLinejoin="round"
              />
              <circle cx="30" cy="32" r="10" fill="#FFE600" stroke="#0D0D0D" strokeWidth="2.5" />
              <polyline
                points="12,52 21,46 30,52 39,46 48,52"
                fill="none"
                stroke="#0D0D0D"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>
          ) : gameplayTheme === 'street' ? (
            <svg className="w-4/5 h-4/5" viewBox="0 0 60 60" aria-hidden="true">
              <polygon
                points="10,44 10,20 23,32 30,14 37,32 50,20 50,44"
                fill="#FFE600"
                stroke="#0D0D0D"
                strokeWidth="3.5"
                strokeLinejoin="round"
              />
              <line x1="30" y1="4" x2="30" y2="9" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
              <line x1="14" y1="8" x2="18" y2="12" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
              <line x1="46" y1="8" x2="42" y2="12" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
            </svg>
          ) : gameplayTheme === 'manga' ? (
            <svg className="w-4/5 h-4/5" viewBox="0 0 60 60" aria-hidden="true">
              <circle cx="30" cy="24" r="14" fill="#FF2A6D" stroke="#1E1B4B" strokeWidth="2.5" />
              <polygon
                points="8,50 30,22 52,50"
                fill="#38BDF8"
                stroke="#1E1B4B"
                strokeWidth="3"
                strokeLinejoin="round"
              />
              <polygon points="22,32 30,22 38,32 34,35 30,31 26,35" fill="#FFFFFF" />
            </svg>
          ) : (
            <svg className="w-3/4 h-3/4" viewBox="0 0 60 60" aria-hidden="true">
              <polygon
                points="30,3 37,20 56,20 41,32 46,50 30,39 14,50 19,32 4,20 23,20"
                fill="#FFE600"
                stroke="#0D0D0D"
                strokeWidth="3.5"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </div>
      </div>
    );
  }

  // 3 Standalone Card Style backs (Ben Day, Mod Geo, POP)
  const patternClass =
    styleVariant === 'geometric'
      ? 'card-back-geometric'
      : styleVariant === 'checker'
      ? 'card-back-checker'
      : 'card-back-dots';

  const innerBg =
    styleVariant === 'geometric'
      ? 'bg-[#FF1E42]'
      : styleVariant === 'checker'
      ? 'bg-[#FF0099]'
      : 'bg-[#00D2FF]';

  return (
    <div className={`w-full h-full ${patternClass} flex items-center justify-center relative`}>
      <div
        className={`w-[76%] h-[80%] border-[2.5px] border-[#0D0D0D] rounded-md ${innerBg} flex items-center justify-center shadow-[2px_2px_0_#0D0D0D] relative overflow-hidden`}
      >
        {styleVariant === 'geometric' ? (
          <svg className="w-3/4 h-3/4" viewBox="0 0 60 60" aria-hidden="true">
            <polygon
              points="30,4 54,30 30,56 6,30"
              fill="#FFE600"
              stroke="#0D0D0D"
              strokeWidth="3.5"
              strokeLinejoin="round"
            />
            <polygon
              points="30,15 43,30 30,45 17,30"
              fill="#00D2FF"
              stroke="#0D0D0D"
              strokeWidth="3"
              strokeLinejoin="round"
            />
          </svg>
        ) : styleVariant === 'checker' ? (
          <svg className="w-3/4 h-3/4" viewBox="0 0 60 60" aria-hidden="true">
            <circle cx="30" cy="30" r="23" fill="#00E676" stroke="#0D0D0D" strokeWidth="3.5" />
            <circle cx="30" cy="30" r="13" fill="#FFE600" stroke="#0D0D0D" strokeWidth="3" />
            <circle cx="30" cy="30" r="5" fill="#0D0D0D" />
          </svg>
        ) : (
          /* Ben Day Lightning & Halftone Starburst */
          <svg className="w-4/5 h-4/5" viewBox="0 0 60 60" aria-hidden="true">
            <polygon
              points="35,4 14,33 29,33 23,56 46,26 31,26"
              fill="#FFE600"
              stroke="#0D0D0D"
              strokeWidth="3.5"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </div>
    </div>
  );
};

interface PlayingCardViewProps {
  card: Card;
  cardBackStyle?: CardBackStyle;
  gameplayTheme?: GameplayTheme;
  isPlayable?: boolean;
  isHinted?: boolean;
  isTargetHighlight?: boolean;
  isDragging?: boolean;
  isFlippedAnim?: boolean;
  isLandedAnim?: boolean;
  isShaking?: boolean;
  dealDelayMs?: number | null;
  style?: React.CSSProperties;
  className?: string;
  onPointerDown?: (e: React.PointerEvent<HTMLDivElement>) => void;
}

export const PlayingCardView: React.FC<PlayingCardViewProps> = React.memo(
  ({
    card,
    cardBackStyle = 'theme',
    gameplayTheme = 'comic',
    isPlayable = false,
    isHinted = false,
    isTargetHighlight = false,
    isDragging = false,
    isFlippedAnim = false,
    isLandedAnim = false,
    isShaking = false,
    dealDelayMs = null,
    style,
    className = '',
    onPointerDown,
  }) => {
    const isRed = card.color === 'red';
    const isFace = card.value >= 11;
    const visualStyle = resolveCardVisualStyle(cardBackStyle, gameplayTheme);
    const palette = CARD_SUIT_PALETTE[visualStyle] || CARD_SUIT_PALETTE.comic;
    const rankColor = isRed ? palette.red : palette.black;

    const frontSurfaceClass =
      cardBackStyle === 'theme'
        ? `card-front-${gameplayTheme}-${isRed ? 'red' : 'black'}`
        : `card-front-style-${cardBackStyle}-${isRed ? 'red' : 'black'}`;

    const animClass = isShaking
      ? 'animate-card-shake'
      : isFlippedAnim
      ? 'animate-card-flip'
      : isLandedAnim
      ? 'animate-card-land'
      : dealDelayMs !== null
      ? 'animate-card-deal'
      : '';

    const combinedStyle: React.CSSProperties = {
      ...style,
      ...(dealDelayMs !== null ? { animationDelay: `${dealDelayMs}ms` } : {}),
    };

    return (
      <div
        data-card-id={card.id}
        onPointerDown={isPlayable ? onPointerDown : undefined}
        style={combinedStyle}
        className={[
          'playing-card',
          isPlayable ? 'playing-card-playable' : 'cursor-default',
          isDragging ? 'playing-card-dragging' : '',
          isHinted ? 'playing-card-hint' : '',
          isTargetHighlight ? 'playing-card-target' : '',
          animClass,
          className,
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {!card.faceUp ? (
          <CardBackGraphic styleVariant={cardBackStyle} gameplayTheme={gameplayTheme} />
        ) : (
          <div
            className={`w-full h-full relative flex flex-col justify-between p-[3px] sm:p-1 ${frontSurfaceClass}`}
          >
            {/* Top-left corner rank & suit */}
            <div
              className="flex flex-col items-center leading-[0.9] z-[2] w-fit"
              style={{ color: rankColor }}
            >
              <span className="font-bangers text-[clamp(14px,2.3vw,24px)] tracking-[0.02em]">
                {card.label}
              </span>
              <div className="w-[clamp(10px,1.5vw,16px)] h-[clamp(10px,1.5vw,16px)]">
                <SuitIcon suit={card.suit} visualStyle={visualStyle} />
              </div>
            </div>

            {/* Center Pop Art Artwork */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[1]">
              {isFace ? (
                <FaceCardEmblem label={card.label} suit={card.suit} visualStyle={visualStyle} />
              ) : (
                <div className="w-[50%] h-[50%]">
                  <SuitIcon suit={card.suit} visualStyle={visualStyle} />
                </div>
              )}
            </div>

            {/* Bottom-right rotated corner */}
            <div
              className="flex flex-col items-center leading-[0.9] z-[2] w-fit self-end rotate-180"
              style={{ color: rankColor }}
            >
              <span className="font-bangers text-[clamp(14px,2.3vw,24px)] tracking-[0.02em]">
                {card.label}
              </span>
              <div className="w-[clamp(10px,1.5vw,16px)] h-[clamp(10px,1.5vw,16px)]">
                <SuitIcon suit={card.suit} visualStyle={visualStyle} />
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
);
PlayingCardView.displayName = 'PlayingCardView';
