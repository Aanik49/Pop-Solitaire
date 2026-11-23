import React from 'react';
import { Card, CardBackStyle, Suit } from '../game/types';

export const CARD_BACK_OPTIONS: { id: CardBackStyle; label: string }[] = [
  { id: 'dots', label: 'Ben-Day Dots' },
  { id: 'stripes', label: 'Comic Lines' },
  { id: 'geometric', label: 'Mod Geo' },
  { id: 'checker', label: 'Pop Check' },
];

export const SuitIcon: React.FC<{ suit: Suit; className?: string }> = ({
  suit,
  className = 'w-full h-full',
}) => {
  switch (suit) {
    case 'spades':
      return (
        <svg className={className} viewBox="0 0 64 64" aria-hidden="true">
          <path
            d="M32 6 C14 24 8 34 8 42 C8 49 14 53 20 53 C24 53 27 51 29 48 L25 58 L39 58 L35 48 C37 51 40 53 44 53 C50 53 56 49 56 42 C56 34 50 24 32 6 Z"
            fill="#0D0D0D"
            stroke="#0D0D0D"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          <path
            d="M23 30 C19 34 17 38 18 42"
            stroke="#00D2FF"
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
            fill="#FF1E42"
            stroke="#0D0D0D"
            strokeWidth="4"
            strokeLinejoin="round"
          />
          <path
            d="M16 19 C16 15 19 13 22 13"
            stroke="#FFFFFF"
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
            fill="#0D0D0D"
            stroke="#0D0D0D"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          <circle cx="29" cy="17" r="2.8" fill="#FFE600" />
        </svg>
      );
    case 'diamonds':
      return (
        <svg className={className} viewBox="0 0 64 64" aria-hidden="true">
          <polygon
            points="32,6 54,32 32,58 10,32"
            fill="#FF1E42"
            stroke="#0D0D0D"
            strokeWidth="4"
            strokeLinejoin="round"
          />
          <polygon points="32,14 44,32 32,50 20,32" fill="#FFE600" opacity="0.48" />
        </svg>
      );
  }
};

const FaceCardEmblem: React.FC<{ label: string; suit: Suit }> = ({ label, suit }) => {
  const isRed = suit === 'hearts' || suit === 'diamonds';
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

export const CardBackGraphic: React.FC<{ styleVariant?: CardBackStyle }> = ({
  styleVariant = 'dots',
}) => {
  const patternClass =
    styleVariant === 'stripes'
      ? 'card-back-stripes'
      : styleVariant === 'geometric'
      ? 'card-back-geometric'
      : styleVariant === 'checker'
      ? 'card-back-checker'
      : 'card-back-dots';

  const innerBg =
    styleVariant === 'stripes'
      ? 'bg-[#00D2FF]'
      : styleVariant === 'geometric'
      ? 'bg-[#FF1E42]'
      : styleVariant === 'checker'
      ? 'bg-[#FF0099]'
      : 'bg-[#1D4ED8]';

  return (
    <div className={`w-full h-full ${patternClass} flex items-center justify-center relative`}>
      <div
        className={`w-[76%] h-[80%] border-[2.5px] border-[#0D0D0D] rounded-md ${innerBg} flex items-center justify-center shadow-[2px_2px_0_#0D0D0D] relative overflow-hidden`}
      >
        {styleVariant === 'stripes' ? (
          /* Pop Art Lightning Bolt */
          <svg className="w-3/4 h-3/4" viewBox="0 0 60 60" aria-hidden="true">
            <polygon
              points="35,4 14,33 29,33 23,56 46,26 31,26"
              fill="#FFE600"
              stroke="#0D0D0D"
              strokeWidth="3.5"
              strokeLinejoin="round"
            />
          </svg>
        ) : styleVariant === 'geometric' ? (
          /* Pop Art Nested Geometric Diamond */
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
          /* Pop Art Concentric Burst Circle */
          <svg className="w-3/4 h-3/4" viewBox="0 0 60 60" aria-hidden="true">
            <circle cx="30" cy="30" r="23" fill="#00E676" stroke="#0D0D0D" strokeWidth="3.5" />
            <circle cx="30" cy="30" r="13" fill="#FFE600" stroke="#0D0D0D" strokeWidth="3" />
            <circle cx="30" cy="30" r="5" fill="#0D0D0D" />
          </svg>
        ) : (
          /* Classic Pop Art Star */
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
};

interface PlayingCardViewProps {
  card: Card;
  cardBackStyle?: CardBackStyle;
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
    cardBackStyle = 'dots',
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
          <CardBackGraphic styleVariant={cardBackStyle} />
        ) : (
          <div
            className={`w-full h-full bg-[#FFFDF7] relative flex flex-col justify-between p-[3px] sm:p-1 ${
              isRed ? 'card-front-dots-red' : 'card-front-dots-black'
            }`}
          >
            {/* Top-left corner rank & suit */}
            <div
              className={`flex flex-col items-center leading-[0.9] z-[2] w-fit ${
                isRed ? 'text-[#FF1E42]' : 'text-[#0D0D0D]'
              }`}
            >
              <span className="font-bangers text-[clamp(14px,2.3vw,24px)] tracking-[0.02em]">
                {card.label}
              </span>
              <div className="w-[clamp(10px,1.5vw,16px)] h-[clamp(10px,1.5vw,16px)]">
                <SuitIcon suit={card.suit} />
              </div>
            </div>

            {/* Center Pop Art Artwork */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[1]">
              {isFace ? (
                <FaceCardEmblem label={card.label} suit={card.suit} />
              ) : (
                <div className="w-[50%] h-[50%]">
                  <SuitIcon suit={card.suit} />
                </div>
              )}
            </div>

            {/* Bottom-right rotated corner */}
            <div
              className={`flex flex-col items-center leading-[0.9] z-[2] w-fit self-end rotate-180 ${
                isRed ? 'text-[#FF1E42]' : 'text-[#0D0D0D]'
              }`}
            >
              <span className="font-bangers text-[clamp(14px,2.3vw,24px)] tracking-[0.02em]">
                {card.label}
              </span>
              <div className="w-[clamp(10px,1.5vw,16px)] h-[clamp(10px,1.5vw,16px)]">
                <SuitIcon suit={card.suit} />
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
);
PlayingCardView.displayName = 'PlayingCardView';
