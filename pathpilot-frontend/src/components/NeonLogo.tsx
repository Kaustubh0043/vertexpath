import React, { useEffect, useRef } from 'react';

interface NeonLogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
  small?: boolean;
}

export const NeonLogo: React.FC<NeonLogoProps> = ({
  className = '',
  size,
  showText = false,
  small = false,
}) => {
  const markRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      const m = markRef.current;
      if (!m) return;
      const r = m.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width / 2)) / window.innerWidth;
      const dy = (e.clientY - (r.top + r.height / 2)) / window.innerHeight;
      m.style.setProperty('--ry', `${dx * 60}deg`);
      m.style.setProperty('--rx', `${-dy * 40}deg`);
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    return () => window.removeEventListener('pointermove', handlePointerMove);
  }, []);

  const fontSizeStyle = size ? { fontSize: `${Math.max(12, Math.round(size * 0.42))}px` } : undefined;

  return (
    <span
      className={`vp-logo ${small ? 'sm' : ''} ${className}`}
      style={fontSizeStyle}
    >
      <div
        ref={markRef}
        className="vp-mark"
        style={size ? { height: `${size}px` } : undefined}
      >
        <i className="vp-spark" />
      </div>
      {showText && <span>VertexPath</span>}
    </span>
  );
};
