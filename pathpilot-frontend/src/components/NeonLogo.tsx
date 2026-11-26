import React from 'react';

interface NeonLogoProps {
  className?: string;
  size?: number;
}

export const NeonLogo: React.FC<NeonLogoProps> = ({ className = 'w-8 h-8', size }) => {
  return (
    <div className={`relative inline-flex items-center justify-center shrink-0 ${className}`}>
      {/* 3D Radiant Ambient Glow Aura */}
      <div 
        className="absolute inset-[-20%] rounded-2xl bg-gradient-to-tr from-[#10B981]/30 via-[#38BDF8]/20 to-[#8B5CF6]/20 blur-lg opacity-80 pointer-events-none"
        style={{ animation: 'neon3dPulse 3.5s ease-in-out infinite' }}
      />

      <svg
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative w-full h-full drop-shadow-[0_4px_16px_rgba(16,185,129,0.4)]"
        width={size}
        height={size}
      >
        <defs>
          {/* Isometric Top Facet Gradient */}
          <linearGradient id="vpTop3d" x1="6" y1="4" x2="30" y2="18" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#38BDF8" />
            <stop offset="60%" stopColor="#34D399" />
            <stop offset="100%" stopColor="#10B981" />
          </linearGradient>

          {/* Isometric Left Facet Gradient */}
          <linearGradient id="vpLeft3d" x1="6" y1="11" x2="18" y2="32" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#10B981" />
            <stop offset="100%" stopColor="#064E3B" />
          </linearGradient>

          {/* Isometric Right Facet Gradient */}
          <linearGradient id="vpRight3d" x1="18" y1="18" x2="30" y2="32" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#047857" />
            <stop offset="60%" stopColor="#0F172A" />
            <stop offset="100%" stopColor="#1E1B4B" />
          </linearGradient>

          {/* Inner Trajectory Path Gradient */}
          <linearGradient id="vpPath3d" x1="10" y1="28" x2="24" y2="8" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#059669" />
            <stop offset="50%" stopColor="#34D399" />
            <stop offset="100%" stopColor="#FFFFFF" />
          </linearGradient>

          {/* Subtle Chamfer Highlight */}
          <linearGradient id="vpEdgeHighlight" x1="6" y1="11" x2="18" y2="18" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#34D399" stopOpacity="0.2" />
          </linearGradient>

          <filter id="vpGlowFilter3d" x="-25%" y="-25%" width="150%" height="150%">
            <feGaussianBlur stdDeviation="1.8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* 3D Geometric Isometric Prism Facets */}
        {/* Left Facet */}
        <path
          d="M 20 19.5 L 7 12 L 7 26.5 L 20 34 Z"
          fill="url(#vpLeft3d)"
          stroke="rgba(255,255,255,0.12)"
          strokeWidth="0.8"
        />

        {/* Right Facet */}
        <path
          d="M 20 19.5 L 33 12 L 33 26.5 L 20 34 Z"
          fill="url(#vpRight3d)"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="0.8"
        />

        {/* Top Facet (Illuminated) */}
        <path
          d="M 20 5 L 33 12 L 20 19.5 L 7 12 Z"
          fill="url(#vpTop3d)"
          stroke="rgba(255,255,255,0.3)"
          strokeWidth="0.8"
        />

        {/* Top Center Ridge Highlight */}
        <line
          x1="20"
          y1="5"
          x2="20"
          y2="19.5"
          stroke="rgba(255,255,255,0.4)"
          strokeWidth="0.75"
        />

        {/* Ascending Chevron 3D Vector Path */}
        <path
          d="M 11 20 L 20 28 L 29 18"
          stroke="url(#vpPath3d)"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#vpGlowFilter3d)"
        />

        {/* Inner Core Vertex Chevron */}
        <path
          d="M 14.5 17 L 20 22.5 L 25.5 16"
          stroke="#FFFFFF"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeOpacity="0.9"
        />

        {/* Apex Core Energy Orb */}
        <circle
          cx="20"
          cy="28"
          r="4.5"
          fill="#10B981"
          fillOpacity="0.4"
        />
        <circle
          cx="20"
          cy="28"
          r="2.2"
          fill="#34D399"
        />
        <circle
          cx="20"
          cy="28"
          r="1"
          fill="#FFFFFF"
        />
      </svg>
    </div>
  );
};
