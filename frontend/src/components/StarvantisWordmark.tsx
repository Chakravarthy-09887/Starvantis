'use client';

import React from 'react';

interface StarvantisWordmarkProps {
  className?: string;
  glowIntensity?: number;
  animate?: boolean;
}

export default function StarvantisWordmark({
  className = '',
  glowIntensity = 1.4,
  animate = true,
}: StarvantisWordmarkProps) {
  return (
    <div className={`relative w-full flex items-center justify-center ${className}`}>
      <svg
        viewBox="0 0 1350 180"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto overflow-visible select-none"
        aria-label="STARVANTIS"
      >
        <defs>
          {/* Subtle elegant aerospace glow */}
          <filter id="wordmark-glow" x="-30%" y="-80%" width="160%" height="260%">
            <feGaussianBlur in="SourceGraphic" stdDeviation={4 * glowIntensity} result="blurSoft" />
            <feGaussianBlur in="SourceGraphic" stdDeviation={1.5 * glowIntensity} result="blurSharp" />
            <feFlood floodColor="#63C7FF" floodOpacity={0.6 * glowIntensity} result="glow" />
            <feComposite in="glow" in2="blurSoft" operator="in" result="glowComposite" />
            <feMerge>
              <feMergeNode in="glowComposite" />
              <feMergeNode in="blurSharp" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Intense Space Glow for A next to V */}
          <radialGradient id="a-space-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
            <stop offset="20%" stopColor="#63C7FF" stopOpacity="0.85" />
            <stop offset="50%" stopColor="#0284c7" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </radialGradient>

          {/* Horizontal laser beam gradient */}
          <linearGradient id="beam-laser" x1="0%" y1="50%" x2="100%" y2="50%">
            <stop offset="0%" stopColor="#63C7FF" stopOpacity="0" />
            <stop offset="35%" stopColor="#63C7FF" stopOpacity="0.3" />
            <stop offset="52%" stopColor="#ffffff" stopOpacity="0.9" />
            <stop offset="68%" stopColor="#63C7FF" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#63C7FF" stopOpacity="0" />
          </linearGradient>

          {/* Pure Titanium Silver-White Letter Stroke */}
          <linearGradient id="monoline-stroke" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="60%" stopColor="#F5F8FA" />
            <stop offset="100%" stopColor="#cbd5e1" />
          </linearGradient>
        </defs>

        {/* 1. HORIZONTAL LIGHT BEAM PASSING DIRECTLY THROUGH WORD */}
        <g opacity="0.85">
          <ellipse cx="650" cy="94" rx="630" ry="20" fill="url(#beam-laser)" opacity="0.3" filter="blur(8px)" />
          <line x1="30" y1="94" x2="1280" y2="94" stroke="url(#beam-laser)" strokeWidth="1.8" />
          <line x1="280" y1="94" x2="1050" y2="94" stroke="#ffffff" strokeWidth="0.8" opacity="0.7" />
        </g>

        {/* 2. RADIANT SPACE GLOW HIGHLIGHT ON 'A' NEXT TO 'V' */}
        <g transform="translate(675, 72)">
          <ellipse cx="0" cy="0" rx="95" ry="48" fill="url(#a-space-glow)" opacity="0.8" />
          <circle cx="0" cy="0" r="14" fill="#ffffff" filter="blur(2px)" />
          <circle cx="0" cy="0" r="5" fill="#ffffff" />
          <line x1="0" y1="-48" x2="0" y2="48" stroke="#63C7FF" strokeWidth="1.8" opacity="0.8" filter="blur(1px)" />
          <line x1="-60" y1="0" x2="60" y2="0" stroke="#ffffff" strokeWidth="1.2" opacity="0.85" />
        </g>

        {/* 3. SUBTLE GLINT ON FIRST S */}
        <g transform="translate(85, 52)">
          <circle cx="0" cy="0" r="3.5" fill="#ffffff" filter="blur(1px)" />
          <line x1="-8" y1="0" x2="8" y2="0" stroke="#ffffff" strokeWidth="0.9" />
          <line x1="0" y1="-8" x2="0" y2="8" stroke="#ffffff" strokeWidth="0.9" />
        </g>

        {/* 4. BALANCED GEOMETRIC MONOLINE LETTERS: S T A R V A N T I S */}
        <g
          filter="url(#wordmark-glow)"
          fill="none"
          stroke="url(#monoline-stroke)"
          strokeWidth="3.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* S (x: 80 - 150) */}
          <path d="
            M 146 54 
            C 138 45, 96 45, 88 60 
            C 78 76, 146 80, 142 108 
            C 138 128, 92 130, 84 120
          " />

          {/* T (x: 175 - 255) */}
          <path d="
            M 175 50 L 255 50 
            M 215 50 L 215 138
          " />

          {/* A (x: 285 - 365) — Inverted U-Arch '∩' */}
          <path d="
            M 290 138 
            L 290 88 
            C 290 50, 360 50, 360 88 
            L 360 138
          " />

          {/* R (x: 395 - 475) */}
          <path d="
            M 400 138 L 400 50 
            L 448 50 
            C 476 50, 476 90, 448 90 
            L 400 90 
            M 442 90 L 475 138
          " />

          {/* V (x: 505 - 585) */}
          <path d="
            M 510 50 
            L 547 136 
            L 585 50
          " />

          {/* A (x: 615 - 695) — HIGHLIGHTED 'A' NEXT TO 'V' WITH SPACE GLOW */}
          <path
            d="
              M 620 138 
              L 620 88 
              C 620 50, 690 50, 690 88 
              L 690 138
            "
            stroke="#ffffff"
            strokeWidth="4.2"
          />

          {/* N (x: 725 - 805) */}
          <path d="
            M 730 138 L 730 50 
            L 800 138 
            L 800 50
          " />

          {/* T (x: 835 - 915) */}
          <path d="
            M 835 50 L 915 50 
            M 875 50 L 875 138
          " />

          {/* I (x: 945 - 975) — PROMINENT AND CLEARLY VISIBLE WITH SERIF CAPS */}
          <path d="
            M 935 50 L 965 50 
            M 950 50 L 950 138 
            M 935 138 L 965 138
          " strokeWidth="3.8" />

          {/* S (x: 995 - 1065) — TIGHTENED BALANCED SPACING TO 'I' */}
          <path d="
            M 1060 54 
            C 1052 45, 1010 45, 1002 60 
            C 992 76, 1060 80, 1056 108 
            C 1052 128, 1006 130, 998 120
          " />
        </g>
      </svg>
    </div>
  );
}
