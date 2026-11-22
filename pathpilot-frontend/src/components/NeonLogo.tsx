import React from 'react';

interface NeonLogoProps {
  className?: string;
  size?: number;
}

export const NeonLogo: React.FC<NeonLogoProps> = ({ className = 'w-8 h-8', size }) => {
  return (
    <div className={`relative inline-flex items-center justify-center shrink-0 ${className}`}>
      {/* Ambient Breathing Neon Aura */}
      <div 
        className="absolute inset-[-15%] rounded-2xl bg-gradient-to-tr from-[#10B981]/25 via-[#C2F84F]/35 to-transparent blur-md opacity-75 pointer-events-none"
        style={{ animation: 'neonBloomPulse 2.8s ease-in-out infinite' }}
      />

      <svg
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative w-full h-full drop-shadow-[0_0_8px_rgba(194,248,79,0.35)]"
        width={size}
        height={size}
      >
        <defs>
          <linearGradient id="vpOuterGrad" x1="9" y1="11" x2="27" y2="27" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#C2F84F" />
            <stop offset="50%" stopColor="#22C55E" />
            <stop offset="100%" stopColor="#10B981" />
          </linearGradient>

          <linearGradient id="vpInnerGrad" x1="13" y1="13" x2="23" y2="21" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="60%" stopColor="#C2F84F" />
            <stop offset="100%" stopColor="#22C55E" />
          </linearGradient>

          <linearGradient id="vpPlateGrad" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#171A21" />
            <stop offset="100%" stopColor="#0B0D11" />
          </linearGradient>

          <filter id="vpGlowFilter" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Precision Dark Obsidian Emblem Plate */}
        <rect
          x="1"
          y="1"
          width="34"
          height="34"
          rx="9"
          fill="url(#vpPlateGrad)"
          stroke="#2A303C"
          strokeWidth="1"
        />
        <rect
          x="1"
          y="1"
          width="34"
          height="34"
          rx="9"
          stroke="url(#vpOuterGrad)"
          strokeWidth="1"
          strokeOpacity="0.4"
        />

        {/* Outer Kinetic Vertex Chevron */}
        <path
          d="M 9.5 11.5 L 18 26.5 L 26.5 11.5"
          stroke="url(#vpOuterGrad)"
          strokeWidth="2.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#vpGlowFilter)"
        />

        {/* Inner Accelerated Career Trajectory Path */}
        <path
          d="M 13.5 13 L 18 20.5 L 22.5 13"
          stroke="url(#vpInnerGrad)"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.9"
        />

        {/* Glowing Apex Vertex Beacon */}
        <circle
          cx="18"
          cy="26.5"
          r="4"
          fill="#C2F84F"
          fillOpacity="0.3"
          className="animate-pulse"
        />
        <circle
          cx="18"
          cy="26.5"
          r="2"
          fill="#FFFFFF"
        />
        <circle
          cx="18"
          cy="26.5"
          r="1"
          fill="#C2F84F"
        />
      </svg>
    </div>
  );
};
