import React from 'react';

interface NeonLogoProps {
  className?: string;
  size?: number;
}

export const NeonLogo: React.FC<NeonLogoProps> = ({ className = 'w-8 h-8', size }) => {
  return (
    <div className={`relative inline-flex items-center justify-center shrink-0 ${className}`}>
      <svg
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full neon-vertex-brand"
        style={{ overflow: 'visible' }}
        width={size}
        height={size}
      >
        <defs>
          {/* Multi-layered Neon Ambient Glow */}
          <filter id="vertexGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="blur1" />
            <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur2" />
            <feMerge>
              <feMergeNode in="blur2" />
              <feMergeNode in="blur1" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="pointPulse" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="pointBlur" />
            <feMerge>
              <feMergeNode in="pointBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Gradients */}
          <linearGradient id="leftArmGrad" x1="8" y1="10" x2="24" y2="38" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#10B981" />
            <stop offset="50%" stopColor="#34D399" />
            <stop offset="100%" stopColor="#C2F84F" />
          </linearGradient>

          <linearGradient id="rightArmGrad" x1="40" y1="10" x2="24" y2="38" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#E2FF6F" />
            <stop offset="50%" stopColor="#C2F84F" />
            <stop offset="100%" stopColor="#34D399" />
          </linearGradient>

          <linearGradient id="coreBeamGrad" x1="16" y1="14" x2="32" y2="14" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#34D399" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#C2F84F" stopOpacity="0.8" />
          </linearGradient>

          <radialGradient id="centerBloom" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="45%" stopColor="#C2F84F" />
            <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Ambient Bloom Aura */}
        <circle cx="24" cy="36" r="10" fill="url(#centerBloom)" opacity="0.45" filter="url(#vertexGlow)" className="neon-bloom-pulse" />

        {/* Left Sweeping Cyber Arm */}
        <path
          d="M10 12 L24 37 L20 38 L6 13 Z"
          fill="url(#leftArmGrad)"
          opacity="0.9"
        />

        {/* Right Sweeping Luminous Arm */}
        <path
          d="M38 12 L24 37 L28 38 L42 13 Z"
          fill="url(#rightArmGrad)"
          filter="url(#vertexGlow)"
        />

        {/* Inner Apex Convergence Core */}
        <path
          d="M13 14 L24 34 L35 14"
          stroke="url(#coreBeamGrad)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#pointPulse)"
        />

        {/* Top Floating Orbit Nodes */}
        <circle cx="10" cy="12" r="2.5" fill="#34D399" filter="url(#pointPulse)" />
        <circle cx="38" cy="12" r="2.5" fill="#C2F84F" filter="url(#pointPulse)" />

        {/* Focal Vertex Apex Crystal (Pulsing Center) */}
        <circle cx="24" cy="35" r="3.2" fill="#FFFFFF" filter="url(#pointPulse)" className="vertex-core-crystal" />
        <circle cx="24" cy="35" r="1.5" fill="#C2F84F" />
      </svg>
    </div>
  );
};
