import React, { useEffect, useRef } from 'react';
import { Trophy, RotateCcw, Home, Award } from 'lucide-react';
import { PlayerStats } from '../game/types';

interface VictoryOverlayProps {
  score: number;
  moves: number;
  timeFormatted: string;
  stats: PlayerStats;
  isDailyChallenge?: boolean;
  dailyDateLabel?: string | null;
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

type ConfettiShape = 'star' | 'dot' | 'exclamation';

interface ConfettiParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  rot: number;
  vrot: number;
  swayPhase: number;
  swaySpeed: number;
  swayAmp: number;
  shape: ConfettiShape;
  color: string;
  life: number;
  maxLife: number;
}

const LABELS = ['A', 'K', 'Q', 'J', '10', '9', '8'];
const SUIT_SYMBOLS = [
  { char: '♥', isRed: true, accent: '#FFE600' },
  { char: '♠', isRed: false, accent: '#00D2FF' },
  { char: '♦', isRed: true, accent: '#FF0099' },
  { char: '♣', isRed: false, accent: '#00E676' },
];
const CONFETTI_COLORS = ['#FFE600', '#FF1E42', '#00D2FF', '#FF0099', '#00E676', '#FFFFFF'];
const CONFETTI_SHAPES: ConfettiShape[] = ['star', 'dot', 'exclamation'];

function drawComicStar(ctx: CanvasRenderingContext2D, r: number, color: string) {
  const spikes = 5;
  const inner = r * 0.46;
  ctx.beginPath();
  for (let i = 0; i < spikes * 2; i++) {
    const rad = i % 2 === 0 ? r : inner;
    const angle = (i * Math.PI) / spikes - Math.PI / 2;
    const px = Math.cos(angle) * rad;
    const py = Math.sin(angle) * rad;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.strokeStyle = '#0D0D0D';
  ctx.lineWidth = 2.4;
  ctx.lineJoin = 'round';
  ctx.fill();
  ctx.stroke();
}

function drawComicDot(ctx: CanvasRenderingContext2D, r: number, color: string) {
  // Bold comic halftone circle with crisp highlight
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.72, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.strokeStyle = '#0D0D0D';
  ctx.lineWidth = 2.4;
  ctx.fill();
  ctx.stroke();

  // Comic shine dot
  ctx.beginPath();
  ctx.arc(-r * 0.22, -r * 0.22, r * 0.18, 0, Math.PI * 2);
  ctx.fillStyle = '#FFFFFF';
  ctx.fill();
}

function drawComicExclamation(ctx: CanvasRenderingContext2D, r: number, color: string) {
  // Chunky tapered Pop Art "!" exclamation stem + dot
  ctx.fillStyle = color;
  ctx.strokeStyle = '#0D0D0D';
  ctx.lineWidth = 2.4;
  ctx.lineJoin = 'round';

  // Stem polygon
  ctx.beginPath();
  ctx.moveTo(-r * 0.34, -r * 0.95);
  ctx.lineTo(r * 0.34, -r * 0.95);
  ctx.lineTo(r * 0.18, r * 0.28);
  ctx.lineTo(-r * 0.18, r * 0.28);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Bottom exclamation dot
  ctx.beginPath();
  ctx.arc(0, r * 0.72, r * 0.24, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
}

export const VictoryOverlay: React.FC<VictoryOverlayProps> = ({
  score,
  moves,
  timeFormatted,
  stats,
  isDailyChallenge = false,
  dailyDateLabel = null,
  onPlayAgain,
  onReturnToTitle,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // 60fps Pop Art bouncing card waterfall + comic-book particle confetti (stars, dots, exclamation marks)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) return;

    let animId = 0;
    let lastTime = performance.now();
    let cardSpawnTimer = 0;
    let confettiSpawnTimer = 0;

    const cards: BouncingCard[] = [];
    const confetti: ConfettiParticle[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const spawnCard = () => {
      if (cards.length > 22) cards.shift();
      const suit = SUIT_SYMBOLS[Math.floor(Math.random() * SUIT_SYMBOLS.length)];
      const label = LABELS[Math.floor(Math.random() * LABELS.length)];
      const fromLeft = Math.random() < 0.5;
      cards.push({
        x: fromLeft
          ? canvas.width * (0.12 + Math.random() * 0.24)
          : canvas.width * (0.64 + Math.random() * 0.24),
        y: 70 + Math.random() * 75,
        vx: (fromLeft ? 1 : -1) * (150 + Math.random() * 190),
        vy: -(180 + Math.random() * 210),
        rot: (Math.random() - 0.5) * 0.4,
        vrot: (Math.random() - 0.5) * 2.2,
        label,
        suitChar: suit.char,
        isRed: suit.isRed,
        accent: suit.accent,
      });
    };

    const spawnConfettiBurst = (originX: number, originY: number, count: number, spreadSpeed = 520) => {
      for (let i = 0; i < count; i++) {
        if (confetti.length >= 140) confetti.shift();
        const angle = -Math.PI * 0.15 - Math.random() * Math.PI * 0.7;
        const speed = 170 + Math.random() * spreadSpeed;
        confetti.push({
          x: originX + (Math.random() - 0.5) * 40,
          y: originY + (Math.random() - 0.5) * 24,
          vx: Math.cos(angle) * speed + (Math.random() - 0.5) * 140,
          vy: Math.sin(angle) * speed - 90,
          size: 10 + Math.random() * 11,
          rot: Math.random() * Math.PI * 2,
          vrot: (Math.random() - 0.5) * 7.5,
          swayPhase: Math.random() * Math.PI * 2,
          swaySpeed: 3 + Math.random() * 3.5,
          swayAmp: 35 + Math.random() * 55,
          shape: CONFETTI_SHAPES[Math.floor(Math.random() * CONFETTI_SHAPES.length)],
          color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
          life: 0,
          maxLife: 3.4 + Math.random() * 2.2,
        });
      }
    };

    const spawnRainConfetti = (count: number) => {
      for (let i = 0; i < count; i++) {
        if (confetti.length >= 140) confetti.shift();
        confetti.push({
          x: Math.random() * canvas.width,
          y: -22 - Math.random() * 40,
          vx: (Math.random() - 0.5) * 85,
          vy: 110 + Math.random() * 140,
          size: 9 + Math.random() * 10,
          rot: Math.random() * Math.PI * 2,
          vrot: (Math.random() - 0.5) * 6,
          swayPhase: Math.random() * Math.PI * 2,
          swaySpeed: 2.5 + Math.random() * 3,
          swayAmp: 40 + Math.random() * 55,
          shape: CONFETTI_SHAPES[Math.floor(Math.random() * CONFETTI_SHAPES.length)],
          color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
          life: 0,
          maxLife: 4.2 + Math.random() * 2.0,
        });
      }
    };

    // Initial explosive celebration bursts from left, center, and right cannons!
    for (let i = 0; i < 5; i++) spawnCard();
    spawnConfettiBurst(canvas.width * 0.5, canvas.height * 0.48, 42, 540);
    spawnConfettiBurst(canvas.width * 0.14, canvas.height * 0.72, 22, 460);
    spawnConfettiBurst(canvas.width * 0.86, canvas.height * 0.72, 22, 460);

    const drawFrame = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      cardSpawnTimer += dt;
      if (cardSpawnTimer > 0.34) {
        cardSpawnTimer = 0;
        spawnCard();
      }

      confettiSpawnTimer += dt;
      if (confettiSpawnTimer > 0.22) {
        confettiSpawnTimer = 0;
        spawnRainConfetti(4);
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 1. Render bouncing Pop Art cards (background layer)
      const cw = 70;
      const ch = 98;
      for (const c of cards) {
        c.vy += 960 * dt;
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

        ctx.fillStyle = '#0D0D0D';
        ctx.beginPath();
        ctx.roundRect(-cw / 2 + 5, -ch / 2 + 5, cw, ch, 8);
        ctx.fill();

        ctx.fillStyle = '#FFFDF7';
        ctx.strokeStyle = '#0D0D0D';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.roundRect(-cw / 2, -ch / 2, cw, ch, 8);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = c.accent;
        ctx.beginPath();
        ctx.arc(0, 2, 17, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = c.isRed ? '#FF1E42' : '#0D0D0D';
        ctx.font = 'bold 20px Bangers, Impact, sans-serif';
        ctx.fillText(c.label, -cw / 2 + 7, -ch / 2 + 21);

        ctx.font = 'bold 27px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(c.suitChar, 0, 4);

        ctx.restore();
      }

      // 2. Render Comic-Book Confetti Particles (stars, halftone dots, exclamation marks)
      for (let i = confetti.length - 1; i >= 0; i--) {
        const p = confetti[i];
        p.life += dt;
        if (p.life >= p.maxLife || p.y > canvas.height + 40) {
          confetti.splice(i, 1);
          continue;
        }

        // Physics: gravity + gentle air drag + sinusoidal flutter sway
        p.vy += 420 * dt;
        p.vx *= 1 - 0.65 * dt;
        p.swayPhase += p.swaySpeed * dt;
        p.x += (p.vx + Math.sin(p.swayPhase) * p.swayAmp) * dt;
        p.y += p.vy * dt;
        p.rot += p.vrot * dt;

        const fadeOut = p.life > p.maxLife - 0.6 ? Math.max(0, (p.maxLife - p.life) / 0.6) : 1;

        ctx.save();
        ctx.globalAlpha = fadeOut;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);

        // Hard offset shadow for comic print depth
        ctx.save();
        ctx.translate(2.5, 2.5);
        ctx.globalAlpha = fadeOut * 0.45;
        if (p.shape === 'star') drawComicStar(ctx, p.size, '#0D0D0D');
        else if (p.shape === 'dot') drawComicDot(ctx, p.size, '#0D0D0D');
        else drawComicExclamation(ctx, p.size, '#0D0D0D');
        ctx.restore();

        if (p.shape === 'star') drawComicStar(ctx, p.size, p.color);
        else if (p.shape === 'dot') drawComicDot(ctx, p.size, p.color);
        else drawComicExclamation(ctx, p.size, p.color);

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

      {/* Bouncing Pop Art Cards + Comic Confetti Particle Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />

      {/* Victory Comic Panel */}
      <div className="relative z-10 bg-[#FFE600] border-[5px] border-[#0D0D0D] shadow-[10px_10px_0_#0D0D0D] rounded-2xl max-w-md w-full p-6 text-center -rotate-1">
        <div
          className={`inline-flex items-center gap-2 font-bangers text-2xl px-4 py-1 border-[3px] border-[#0D0D0D] shadow-[4px_4px_0_#0D0D0D] rounded-xl -mt-12 mb-3 rotate-2 ${
            isDailyChallenge ? 'bg-[#FF0099] text-white' : 'bg-[#FF1E42] text-white'
          }`}
        >
          {isDailyChallenge ? (
            <>
              <Award className="w-5 h-5 text-[#FFE600]" strokeWidth={2.8} />
              <span>DAILY WINNER{dailyDateLabel ? ` · ${dailyDateLabel}` : ''}!</span>
            </>
          ) : (
            <>
              <Trophy className="w-5 h-5 text-[#FFE600]" strokeWidth={2.8} />
              <span>SENSATIONAL!</span>
            </>
          )}
        </div>

        <h2 className="font-bangers text-5xl sm:text-6xl text-[#00D2FF] comic-title-stroke tracking-wider mb-1.5">
          VICTORY!
        </h2>
        <p className="font-extrabold text-sm sm:text-base text-[#0D0D0D] mb-5">
          {isDailyChallenge
            ? 'You conquered today’s worldwide Daily Challenge!'
            : 'Every single card stacked from Ace to King!'}
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
            <span>{isDailyChallenge ? 'New Classic' : 'Play Again!'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
