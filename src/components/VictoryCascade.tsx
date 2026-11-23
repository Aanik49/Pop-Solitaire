import React, { useEffect, useRef } from 'react';
import { Trophy, RotateCcw, Home } from 'lucide-react';
import { PlayerStats } from '../game/types';

interface VictoryOverlayProps {
  score: number;
  moves: number;
  timeFormatted: string;
  stats: PlayerStats;
  onPlayAgain: () => void;
  onReturnToTitle: () => void;
}

interface BouncingCard {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  vrot: number;
  label: string;
  suitChar: string;
  isRed: boolean;
  accent: string;
}

const LABELS = ['A', 'K', 'Q', 'J', '10', '9', '8'];
const SUIT_SYMBOLS = [
  { char: '♥', isRed: true, accent: '#FFE600' },
  { char: '♠', isRed: false, accent: '#00D2FF' },
  { char: '♦', isRed: true, accent: '#FF0099' },
  { char: '♣', isRed: false, accent: '#00E676' },
];

export const VictoryOverlay: React.FC<VictoryOverlayProps> = ({
  score,
  moves,
  timeFormatted,
  stats,
  onPlayAgain,
  onReturnToTitle,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Classic Solitaire celebratory bouncing card cascade rendered at 60fps in Pop Art comic style!
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) return;

    let animId = 0;
    let lastTime = performance.now();
    let spawnTimer = 0;
    const cards: BouncingCard[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const spawnCard = () => {
      if (cards.length > 26) cards.shift();
      const suit = SUIT_SYMBOLS[Math.floor(Math.random() * SUIT_SYMBOLS.length)];
      const label = LABELS[Math.floor(Math.random() * LABELS.length)];
      const fromLeft = Math.random() < 0.5;
      cards.push({
        x: fromLeft ? canvas.width * (0.15 + Math.random() * 0.25) : canvas.width * (0.6 + Math.random() * 0.25),
        y: 80 + Math.random() * 80,
        vx: (fromLeft ? 1 : -1) * (160 + Math.random() * 200),
        vy: -(180 + Math.random() * 220),
        rot: (Math.random() - 0.5) * 0.4,
        vrot: (Math.random() - 0.5) * 2.2,
        label,
        suitChar: suit.char,
        isRed: suit.isRed,
        accent: suit.accent,
      });
    };

    for (let i = 0; i < 6; i++) spawnCard();

    const drawFrame = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;
      spawnTimer += dt;
      if (spawnTimer > 0.28) {
        spawnTimer = 0;
        spawnCard();
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const cw = 72;
      const ch = 100;

      for (const c of cards) {
        c.vy += 980 * dt;
        c.x += c.vx * dt;
        c.y += c.vy * dt;
        c.rot += c.vrot * dt;

        if (c.y + ch / 2 > canvas.height) {
          c.y = canvas.height - ch / 2;
          c.vy = -Math.abs(c.vy) * 0.78;
        }
        if (c.x < -cw || c.x > canvas.width + cw) {
          c.vx *= -0.9;
        }

        ctx.save();
        ctx.translate(c.x, c.y);
        ctx.rotate(c.rot);

        // Hard comic shadow
        ctx.fillStyle = '#0D0D0D';
        ctx.beginPath();
        ctx.roundRect(-cw / 2 + 5, -ch / 2 + 5, cw, ch, 8);
        ctx.fill();

        // Card paper
        ctx.fillStyle = '#FFFDF7';
        ctx.strokeStyle = '#0D0D0D';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.roundRect(-cw / 2, -ch / 2, cw, ch, 8);
        ctx.fill();
        ctx.stroke();

        // Pop Art center circle
        ctx.fillStyle = c.accent;
        ctx.beginPath();
        ctx.arc(0, 2, 18, 0, Math.PI * 2);
        ctx.fill();

        // Rank & Suit
        ctx.fillStyle = c.isRed ? '#FF1E42' : '#0D0D0D';
        ctx.font = 'bold 20px Bangers, Impact, sans-serif';
        ctx.fillText(c.label, -cw / 2 + 7, -ch / 2 + 21);

        ctx.font = 'bold 28px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(c.suitChar, 0, 4);

        ctx.restore();
      }

      animId = requestAnimationFrame(drawFrame);
    };

    animId = requestAnimationFrame(drawFrame);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[10030] bg-black/72 flex items-center justify-center p-4 overflow-hidden">
      {/* Spinning Comic Sunburst Rays */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-65">
        <svg className="w-[165vmax] h-[165vmax] animate-spin-slow" viewBox="0 0 200 200" aria-hidden="true">
          <g transform="translate(100,100)">
            <polygon points="0,0 -15,-100 15,-100" fill="#FFE600" />
            <polygon points="0,0 45,-90 70,-70" fill="#FF1E42" />
            <polygon points="0,0 90,-45 100,-15" fill="#FFE600" />
            <polygon points="0,0 100,15 90,45" fill="#FF0099" />
            <polygon points="0,0 70,70 45,90" fill="#FFE600" />
            <polygon points="0,0 15,100 -15,100" fill="#00D2FF" />
            <polygon points="0,0 -45,90 -70,70" fill="#FFE600" />
            <polygon points="0,0 -90,45 -100,15" fill="#FF1E42" />
            <polygon points="0,0 -100,-15 -90,-45" fill="#FFE600" />
            <polygon points="0,0 -70,-70 -45,-90" fill="#FF0099" />
          </g>
        </svg>
      </div>

      {/* Bouncing Pop Art Card Waterfall Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />

      {/* Victory Comic Panel */}
      <div className="relative z-10 bg-[#FFE600] border-[5px] border-[#0D0D0D] shadow-[10px_10px_0_#0D0D0D] rounded-2xl max-w-md w-full p-6 text-center -rotate-1">
        <div className="inline-flex items-center gap-2 bg-[#FF1E42] text-white font-bangers text-2xl px-4 py-1 border-[3px] border-[#0D0D0D] shadow-[4px_4px_0_#0D0D0D] rounded-xl -mt-12 mb-3 rotate-2">
          <Trophy className="w-5 h-5 text-[#FFE600]" strokeWidth={2.8} />
          <span>SENSATIONAL!</span>
        </div>

        <h2 className="font-bangers text-5xl sm:text-6xl text-[#00D2FF] comic-title-stroke tracking-wider mb-1.5">
          VICTORY!
        </h2>
        <p className="font-extrabold text-sm sm:text-base text-[#0D0D0D] mb-5">
          Every single card stacked from Ace to King!
        </p>

        {/* Clean Tabular Run Summary */}
        <div className="grid grid-cols-3 gap-2.5 mb-4">
          <div className="bg-[#FFFDF7] border-[3px] border-[#0D0D0D] rounded-xl p-2.5 shadow-[4px_4px_0_#0D0D0D]">
            <div className="font-bangers text-sm text-[#FF1E42] tracking-wide">SCORE</div>
            <div className="font-bangers text-2xl sm:text-3xl text-[#0D0D0D] tabular-nums">{score}</div>
          </div>
          <div className="bg-[#FFFDF7] border-[3px] border-[#0D0D0D] rounded-xl p-2.5 shadow-[4px_4px_0_#0D0D0D]">
            <div className="font-bangers text-sm text-[#1D4ED8] tracking-wide">MOVES</div>
            <div className="font-bangers text-2xl sm:text-3xl text-[#0D0D0D] tabular-nums">{moves}</div>
          </div>
          <div className="bg-[#FFFDF7] border-[3px] border-[#0D0D0D] rounded-xl p-2.5 shadow-[4px_4px_0_#0D0D0D]">
            <div className="font-bangers text-sm text-[#FF0099] tracking-wide">TIME</div>
            <div className="font-bangers text-2xl sm:text-3xl text-[#0D0D0D] tabular-nums">{timeFormatted}</div>
          </div>
        </div>

        <p className="text-xs font-extrabold text-[#0D0D0D]/80 mb-5 tabular-nums">
          Total Wins: {stats.wins} · Best Score: {stats.bestScore}
        </p>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onReturnToTitle}
            className="pop-btn bg-[#FFFDF7] text-[#0D0D0D] font-bangers text-xl px-4 py-3 rounded-xl flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0"
          >
            <Home className="w-5 h-5" strokeWidth={2.8} />
            <span>Title</span>
          </button>
          <button
            type="button"
            onClick={onPlayAgain}
            className="pop-btn flex-1 bg-[#00E676] text-[#0D0D0D] font-bangers text-2xl sm:text-3xl py-3 rounded-xl tracking-wider flex items-center justify-center gap-2 whitespace-nowrap"
          >
            <RotateCcw className="w-6 h-6" strokeWidth={3} />
            <span>Play Again!</span>
          </button>
        </div>
      </div>
    </div>
  );
};
