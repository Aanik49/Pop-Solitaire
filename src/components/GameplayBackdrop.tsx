import React from 'react';
import { GameplayTheme } from '../game/types';

interface GameplayBackdropProps {
  theme: GameplayTheme;
}

export const GameplayBackdrop: React.FC<GameplayBackdropProps> = React.memo(({ theme }) => {
  return (
    <div
      className="fixed inset-0 z-0 pointer-events-none overflow-hidden select-none"
      aria-hidden="true"
    >
      {theme === 'comic' && (
        <svg
          className="w-full h-full block"
          viewBox="0 0 1440 900"
          preserveAspectRatio="xMidYMid slice"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id="benday-cyan"
              width="14"
              height="14"
              patternUnits="userSpaceOnUse"
              patternTransform="rotate(18)"
            >
              <circle cx="4" cy="4" r="3.4" fill="#00B8E6" fillOpacity="0.34" />
              <circle cx="11" cy="11" r="3.4" fill="#00B8E6" fillOpacity="0.34" />
            </pattern>
            <pattern
              id="benday-magenta"
              width="13"
              height="13"
              patternUnits="userSpaceOnUse"
              patternTransform="rotate(-22)"
            >
              <circle cx="4" cy="4" r="3.3" fill="#FF0088" fillOpacity="0.28" />
              <circle cx="10.5" cy="10.5" r="3.3" fill="#FF0088" fillOpacity="0.28" />
            </pattern>
            <pattern
              id="benday-yellow"
              width="15"
              height="15"
              patternUnits="userSpaceOnUse"
              patternTransform="rotate(12)"
            >
              <circle cx="4.5" cy="4.5" r="3.8" fill="#FFD500" fillOpacity="0.45" />
              <circle cx="12" cy="12" r="3.8" fill="#FFD500" fillOpacity="0.45" />
            </pattern>
            <radialGradient id="center-clarity-comic" cx="50%" cy="46%" r="58%">
              <stop offset="0%" stopColor="#FFFDF5" stopOpacity="0.52" />
              <stop offset="68%" stopColor="#FFFDF5" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#00D2FF" stopOpacity="0" />
            </radialGradient>
          </defs>
          <g opacity="0.38">
            <polygon points="720,160 120,0 320,0" fill="#FFE600" />
            <polygon points="720,160 510,0 650,0" fill="#00D2FF" />
            <polygon points="720,160 790,0 930,0" fill="#FFE600" />
            <polygon points="720,160 1110,0 1320,0" fill="#FF66B2" />
            <polygon points="720,160 1440,140 1440,340" fill="#FFE600" />
            <polygon points="720,160 1440,540 1440,760" fill="#00D2FF" />
            <polygon points="720,160 1160,900 940,900" fill="#FFE600" />
            <polygon points="720,160 520,900 290,900" fill="#FF66B2" />
            <polygon points="720,160 0,720 0,500" fill="#00D2FF" />
            <polygon points="720,160 0,310 0,120" fill="#FFE600" />
          </g>
          <circle cx="95" cy="95" r="260" fill="url(#benday-magenta)" />
          <circle cx="70" cy="75" r="150" fill="url(#benday-yellow)" />
          <circle cx="1345" cy="105" r="280" fill="url(#benday-cyan)" />
          <ellipse cx="140" cy="830" rx="340" ry="210" fill="url(#benday-cyan)" />
          <ellipse cx="1300" cy="825" rx="350" ry="220" fill="url(#benday-magenta)" />
          <g stroke="#0D0D0D" strokeLinecap="round" fill="none">
            <line x1="365" y1="-20" x2="215" y2="920" strokeWidth="5" strokeOpacity="0.22" />
            <line x1="1085" y1="-20" x2="1225" y2="920" strokeWidth="5" strokeOpacity="0.22" />
          </g>
          <g className="backdrop-float" opacity="0.45">
            <polygon
              points="74,340 84,364 110,366 90,382 96,408 74,394 52,408 58,382 38,366 64,364"
              fill="#FFE600"
              stroke="#0D0D0D"
              strokeWidth="3.5"
            />
            <polygon
              points="118,480 86,528 108,528 96,574 138,518 114,518"
              fill="#FF1E42"
              stroke="#0D0D0D"
              strokeWidth="3.5"
            />
            <polygon
              points="1365,330 1375,354 1401,356 1381,372 1387,398 1365,384 1343,398 1349,372 1329,356 1355,354"
              fill="#00D2FF"
              stroke="#0D0D0D"
              strokeWidth="3.5"
            />
          </g>
          <path
            d="M-30,865 Q65,805 165,852 Q275,795 390,855 Q515,800 635,858 Q750,802 870,856 Q995,798 1115,855 Q1235,802 1350,852 Q1415,822 1470,855 L1470,920 L-30,920 Z"
            fill="#FFE600"
            stroke="#0D0D0D"
            strokeWidth="4.5"
          />
          <path
            d="M-30,888 Q95,842 220,884 Q345,844 470,886 Q600,842 730,886 Q860,844 990,886 Q1120,842 1250,885 Q1360,848 1470,885 L1470,920 L-30,920 Z"
            fill="#00D2FF"
            stroke="#0D0D0D"
            strokeWidth="4"
          />
          <rect x="0" y="0" width="1440" height="900" fill="url(#center-clarity-comic)" />
        </svg>
      )}

      {theme === 'memphis' && (
        <svg
          className="w-full h-full block"
          viewBox="0 0 1440 900"
          preserveAspectRatio="xMidYMid slice"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern id="memphis-grid" width="44" height="44" patternUnits="userSpaceOnUse">
              <path d="M 44 0 L 0 0 0 44" fill="none" stroke="#0D0D0D" strokeWidth="1.2" strokeOpacity="0.1" />
            </pattern>
            <radialGradient id="center-clarity-memphis" cx="50%" cy="48%" r="58%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.62" />
              <stop offset="72%" stopColor="#FFFFFF" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect x="0" y="0" width="1440" height="900" fill="url(#memphis-grid)" />
          <g className="backdrop-float" opacity="0.65" stroke="#0D0D0D" strokeWidth="3.5" strokeLinejoin="round">
            <circle cx="110" cy="190" r="46" fill="#FF6B9D" />
            <circle cx="110" cy="190" r="24" fill="#FFE600" />
            <polygon points="75,380 135,355 115,435" fill="#0D0D0D" />
            <polygon points="65,372 125,347 105,427" fill="#5CE1E6" />
            <polyline
              points="42,520 72,500 95,530 125,510 145,540"
              fill="none"
              stroke="#FF6B9D"
              strokeWidth="9"
              strokeLinecap="round"
            />
            <polyline
              points="42,520 72,500 95,530 125,510 145,540"
              fill="none"
              stroke="#0D0D0D"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <path d="M1300,220 A42,42 0 0,1 1384,220 Z" fill="#FFE600" />
            <rect
              x="1310"
              y="340"
              width="76"
              height="28"
              rx="14"
              transform="rotate(-24 1348 354)"
              fill="#FF6B9D"
            />
            <circle cx="1350" cy="540" r="38" fill="#B5838D" />
            <circle cx="1350" cy="540" r="15" fill="#C9F7EB" />
            <polygon points="1310,670 1380,655 1355,730" fill="#FFE600" />
          </g>
          <polyline
            points="-20,865 60,835 140,865 220,835 300,865 380,835 460,865 540,835 620,865 700,835 780,865 860,835 940,865 1020,835 1100,865 1180,835 1260,865 1340,835 1460,865"
            fill="none"
            stroke="#FF6B9D"
            strokeWidth="14"
            strokeLinejoin="round"
          />
          <polyline
            points="-20,865 60,835 140,865 220,835 300,865 380,835 460,865 540,835 620,865 700,835 780,865 860,835 940,865 1020,835 1100,865 1180,835 1260,865 1340,835 1460,865"
            fill="none"
            stroke="#0D0D0D"
            strokeWidth="4"
            strokeLinejoin="round"
          />
          <rect x="0" y="0" width="1440" height="900" fill="url(#center-clarity-memphis)" />
        </svg>
      )}

      {theme === 'street' && (
        <svg
          className="w-full h-full block"
          viewBox="0 0 1440 900"
          preserveAspectRatio="xMidYMid slice"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <radialGradient id="spray-orange" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FF5500" stopOpacity="0.36" />
              <stop offset="70%" stopColor="#FF5500" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#FF5500" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="spray-cyan" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#00D2FF" stopOpacity="0.34" />
              <stop offset="70%" stopColor="#00D2FF" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#00D2FF" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="center-clarity-street" cx="50%" cy="48%" r="58%">
              <stop offset="0%" stopColor="#FFFDF5" stopOpacity="0.6" />
              <stop offset="72%" stopColor="#FFFDF5" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#FFFDF5" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="130" cy="220" r="210" fill="url(#spray-orange)" />
          <circle cx="1320" cy="240" r="220" fill="url(#spray-cyan)" />
          <circle cx="150" cy="740" r="220" fill="url(#spray-cyan)" />
          <circle cx="1300" cy="750" r="220" fill="url(#spray-orange)" />
          <g
            className="backdrop-float"
            opacity="0.6"
            stroke="#0D0D0D"
            strokeWidth="4.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <g transform="translate(52, 310)">
              <polygon points="10,65 10,25 32,45 50,18 68,45 90,25 90,65" fill="#FFE600" />
              <line x1="50" y1="2" x2="50" y2="11" />
              <line x1="18" y1="8" x2="24" y2="16" />
              <line x1="82" y1="8" x2="76" y2="16" />
            </g>
            <g transform="translate(55, 510)">
              <path
                d="M45,75 C45,75 10,52 10,28 C10,16 19,10 29,10 C36,10 42,14 45,20 C48,14 54,10 61,10 C71,10 80,16 80,28 C80,52 45,75 45,75 Z"
                fill="#FF1E42"
              />
              <line x1="0" y1="26" x2="-12" y2="22" />
              <line x1="90" y1="26" x2="102" y2="22" />
              <line x1="45" y1="0" x2="45" y2="-12" />
            </g>
            <g transform="translate(1305, 320)">
              <polygon points="48,5 18,52 42,52 34,92 72,42 46,42" fill="#FF5500" />
              <line x1="8" y1="30" x2="18" y2="34" />
              <line x1="74" y1="68" x2="86" y2="72" />
            </g>
            <g transform="translate(1305, 530)">
              <circle cx="45" cy="45" r="28" fill="#00D2FF" />
              <line x1="45" y1="4" x2="45" y2="12" />
              <line x1="45" y1="78" x2="45" y2="86" />
              <line x1="4" y1="45" x2="12" y2="45" />
              <line x1="78" y1="45" x2="86" y2="45" />
            </g>
          </g>
          <rect x="0" y="0" width="1440" height="900" fill="url(#center-clarity-street)" />
        </svg>
      )}

      {theme === 'manga' && (
        <svg
          className="w-full h-full block"
          viewBox="0 0 1440 900"
          preserveAspectRatio="xMidYMid slice"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <radialGradient id="center-clarity-manga" cx="50%" cy="48%" r="56%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.72" />
              <stop offset="72%" stopColor="#FFFFFF" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
            </radialGradient>
          </defs>
          <g stroke="#1E1B4B" strokeOpacity="0.16" strokeLinecap="round">
            <line x1="0" y1="0" x2="360" y2="230" strokeWidth="5" />
            <line x1="180" y1="0" x2="440" y2="210" strokeWidth="2.5" />
            <line x1="1440" y1="0" x2="1080" y2="230" strokeWidth="5" />
            <line x1="1260" y1="0" x2="1000" y2="210" strokeWidth="2.5" />
            <line x1="0" y1="900" x2="350" y2="670" strokeWidth="5" />
            <line x1="200" y1="900" x2="450" y2="700" strokeWidth="2.5" />
            <line x1="1440" y1="900" x2="1090" y2="670" strokeWidth="5" />
            <line x1="1240" y1="900" x2="990" y2="700" strokeWidth="2.5" />
            <line x1="0" y1="450" x2="260" y2="450" strokeWidth="4" />
            <line x1="1440" y1="450" x2="1180" y2="450" strokeWidth="4" />
          </g>
          <g className="backdrop-float" opacity="0.65" stroke="#1E1B4B" strokeWidth="3">
            <g transform="translate(95, 340)">
              <circle cx="0" cy="-26" r="15" fill="#FF2A6D" />
              <circle cx="24" cy="-10" r="15" fill="#FFE600" />
              <circle cx="16" cy="21" r="15" fill="#38BDF8" />
              <circle cx="-16" cy="21" r="15" fill="#A855F7" />
              <circle cx="-24" cy="-10" r="15" fill="#34D399" />
              <circle cx="0" cy="0" r="16" fill="#FFE600" />
              <circle cx="-5" cy="-3" r="2.2" fill="#1E1B4B" />
              <circle cx="5" cy="-3" r="2.2" fill="#1E1B4B" />
              <path d="M-6,4 Q0,11 6,4" fill="none" stroke="#1E1B4B" strokeWidth="2.2" strokeLinecap="round" />
            </g>
            <g transform="translate(1345, 360)">
              <circle cx="0" cy="-26" r="15" fill="#38BDF8" />
              <circle cx="24" cy="-10" r="15" fill="#FF2A6D" />
              <circle cx="16" cy="21" r="15" fill="#FFE600" />
              <circle cx="-16" cy="21" r="15" fill="#34D399" />
              <circle cx="-24" cy="-10" r="15" fill="#A855F7" />
              <circle cx="0" cy="0" r="16" fill="#FFFFFF" />
              <circle cx="-5" cy="-3" r="2.2" fill="#1E1B4B" />
              <circle cx="5" cy="-3" r="2.2" fill="#1E1B4B" />
              <path d="M-6,4 Q0,11 6,4" fill="none" stroke="#1E1B4B" strokeWidth="2.2" strokeLinecap="round" />
            </g>
            <polygon
              points="90,560 97,580 117,587 97,594 90,614 83,594 63,587 83,580"
              fill="#FF2A6D"
            />
            <polygon
              points="1345,560 1352,580 1372,587 1352,594 1345,614 1338,594 1318,587 1338,580"
              fill="#38BDF8"
            />
          </g>
          <path
            d="M-20,875 Q140,815 300,875 Q460,815 620,875 Q780,815 940,875 Q1100,815 1260,875 Q1360,835 1460,875 L1460,920 L-20,920 Z"
            fill="#38BDF8"
            fillOpacity="0.45"
            stroke="#1E1B4B"
            strokeWidth="3.5"
          />
          <rect x="0" y="0" width="1440" height="900" fill="url(#center-clarity-manga)" />
        </svg>
      )}
    </div>
  );
});
GameplayBackdrop.displayName = 'GameplayBackdrop';
