import React from 'react';

interface NeonLogoProps {
  className?: string;
  size?: number;
}

export const NeonLogo: React.FC<NeonLogoProps> = ({ className = 'w-8 h-8', size = 32 }) => {
  return (
    <div className={`relative flex items-center justify-center shrink-0 ${className}`}>
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full neon-logo-svg"
        style={{ overflow: 'visible' }}
        width={size}
        height={size}
      >
        <defs>
          {/* Intense Continuous Neon Glow Filters */}
          <filter id="neonGlowOuter" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur1" />
            <feGaussianBlur in="SourceGraphic" stdDeviation="14" result="blur2" />
            <feMerge>
              <feMergeNode in="blur2" />
              <feMergeNode in="blur1" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="coreGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Gradients */}
          <linearGradient id="neonLeftFacet" x1="20" y1="20" x2="50" y2="85" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#10B981" />
            <stop offset="60%" stopColor="#059669" />
            <stop offset="100%" stopColor="#022C22" />
          </linearGradient>

          <linearGradient id="neonRightFacet" x1="80" y1="20" x2="50" y2="85" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#E2FF6F" />
            <stop offset="50%" stopColor="#C2F84F" />
            <stop offset="100%" stopColor="#10B981" />
          </linearGradient>

          <linearGradient id="neonCapLeft" x1="15" y1="20" x2="35" y2="15" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#34D399" />
            <stop offset="100%" stopColor="#A7F3D0" />
          </linearGradient>

          <linearGradient id="neonCapRight" x1="65" y1="15" x2="85" y2="20" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#C2F84F" />
          </linearGradient>

          <radialGradient id="centralCrystal" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="40%" stopColor="#C2F84F" />
            <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Ambient Neon Back-Glow Halo */}
        <circle cx="50" cy="54" r="32" fill="url(#centralCrystal)" opacity="0.65" filter="url(#neonGlowOuter)" className="neon-pulse-halo" />

        {/* 3D Geometric Vertex Chevron Facets */}
        {/* Left Wing Face */}
        <path
          d="M18 24 L36 24 L50 78 L38 84 Z"
          fill="url(#neonLeftFacet)"
          stroke="#34D399"
          strokeWidth="1.2"
        />

        {/* Right Wing Face (High Luminance) */}
        <path
          d="M82 24 L64 24 L50 78 L62 84 Z"
          fill="url(#neonRightFacet)"
          stroke="#C2F84F"
          strokeWidth="1.2"
          filter="url(#coreGlow)"
        />

        {/* Top 3D Isometric Bevel Caps */}
        <path
          d="M18 24 L26 16 L44 16 L36 24 Z"
          fill="url(#neonCapLeft)"
          opacity="0.95"
        />
        <path
          d="M64 24 L72 16 L90 16 L82 24 Z"
          fill="url(#neonCapRight)"
          filter="url(#coreGlow)"
        />

        {/* Floating Center Vertex Core Crystal */}
        <polygon
          points="50,44 58,56 50,68 42,56"
          fill="#FFFFFF"
          filter="url(#coreGlow)"
          className="neon-crystal-core"
        />

        {/* Electric Accent Edges */}
        <path
          d="M26 16 L44 16 L50 44 L56 16 L74 16"
          stroke="#FFFFFF"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.8"
        />
        <path
          d="M50 44 L50 82"
          stroke="#C2F84F"
          strokeWidth="2"
          strokeLinecap="round"
          filter="url(#coreGlow)"
        />
      </svg>
    </div>
  );
};
