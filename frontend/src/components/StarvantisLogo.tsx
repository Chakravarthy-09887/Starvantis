'use client';

import React from 'react';

interface StarvantisLogoProps {
  className?: string;
  size?: number;
  glow?: boolean;
}

export default function StarvantisLogo({ className = '', size = 48, glow = true }: StarvantisLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 select-none ${className}`}
      aria-label="Starvantis Logo"
    >
      <defs>
        {/* Subtle professional glow */}
        <filter id="logo-glow" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="2" result="b" />
          <feFlood floodColor="#63C7FF" floodOpacity="0.5" result="c" />
          <feComposite in="c" in2="b" operator="in" result="g" />
          <feMerge>
            <feMergeNode in="g" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <linearGradient id="logo-white" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#94a3b8" />
        </linearGradient>
      </defs>

      <g filter={glow ? 'url(#logo-glow)' : undefined}>
        {/* Orbital ring — tilted ellipse representing the mission orbit */}
        <ellipse
          cx="40"
          cy="40"
          rx="32"
          ry="12"
          transform="rotate(-25 40 40)"
          stroke="#63C7FF"
          strokeWidth="1.5"
          fill="none"
          opacity="0.6"
        />

        {/* Abstract S/V mark — formed from two converging strokes
            The "V" points downward representing descent/trajectory,
            combined with a subtle curve that suggests an "S" */}
        <path
          d="M 24 22 L 40 56 L 56 22"
          stroke="url(#logo-white)"
          strokeWidth="2.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        {/* Vertical ascent stroke through the V — forms the S crossover and represents trajectory */}
        <path
          d="M 40 18 L 40 62"
          stroke="url(#logo-white)"
          strokeWidth="1.8"
          strokeLinecap="round"
          fill="none"
          opacity="0.5"
        />

        {/* Orbital node — small dot on the ring representing satellite position */}
        <circle cx="63" cy="30" r="2.5" fill="#63C7FF" />
        <circle cx="63" cy="30" r="5" stroke="#63C7FF" strokeWidth="0.8" opacity="0.4" fill="none" />
      </g>
    </svg>
  );
}
