import React, { useState, useEffect } from 'react';

interface UserAvatarProps {
  src?: string | null;
  name?: string | null;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  showOnlineIndicator?: boolean;
  className?: string;
  onClick?: () => void;
  border?: boolean;
}

const sizeClasses = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-xl',
  '2xl': 'w-24 h-24 text-3xl font-bold',
};

const indicatorSize = {
  xs: 'w-1.5 h-1.5 right-0 bottom-0',
  sm: 'w-2 h-2 right-0 bottom-0',
  md: 'w-2.5 h-2.5 right-0.5 bottom-0.5',
  lg: 'w-3 h-3 right-0.5 bottom-0.5',
  xl: 'w-4 h-4 right-1 bottom-1',
  '2xl': 'w-5 h-5 right-1.5 bottom-1.5',
};

export const UserAvatar: React.FC<UserAvatarProps> = ({
  src,
  name = 'Developer',
  size = 'md',
  showOnlineIndicator = false,
  className = '',
  onClick,
  border = true,
}) => {
  const [currentAvatar, setCurrentAvatar] = useState<string | null>(() => {
    return src !== undefined ? src : localStorage.getItem('userAvatar') || null;
  });
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    if (src !== undefined) {
      setCurrentAvatar(src);
      setImgError(false);
    }
  }, [src]);

  useEffect(() => {
    const handleAvatarUpdate = () => {
      const saved = localStorage.getItem('userAvatar');
      setCurrentAvatar(saved);
      setImgError(false);
    };
    window.addEventListener('userAvatarUpdated', handleAvatarUpdate);
    return () => window.removeEventListener('userAvatarUpdated', handleAvatarUpdate);
  }, []);

  const getInitials = (n: string) => {
    if (!n) return 'VP';
    const parts = n.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return n.slice(0, 2).toUpperCase();
  };

  const getGradient = (n: string) => {
    const gradients = [
      'from-purple-600 to-indigo-600',
      'from-violet-600 to-fuchsia-600',
      'from-cyan-600 to-blue-600',
      'from-emerald-600 to-teal-600',
      'from-amber-500 to-rose-600',
      'from-indigo-600 to-pink-600',
    ];
    let sum = 0;
    for (let i = 0; i < n.length; i++) sum += n.charCodeAt(i);
    return gradients[sum % gradients.length];
  };

  const effectiveName = name || 'Developer';
  const defaultFallbackUrl = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(effectiveName)}&backgroundColor=15161c,111318`;

  const displaySrc = currentAvatar || defaultFallbackUrl;

  return (
    <div
      onClick={onClick}
      className={`relative inline-flex items-center justify-center shrink-0 rounded-full select-none overflow-visible ${
        onClick ? 'cursor-pointer group' : ''
      } ${className}`}
    >
      <div
        className={`${sizeClasses[size]} rounded-full overflow-hidden flex items-center justify-center ${
          border ? 'border border-[var(--border)] ring-1 ring-[var(--border-subtle)]' : ''
        } bg-[var(--surface)] transition-transform duration-150 ${onClick ? 'group-hover:scale-105' : ''}`}
      >
        {!imgError && displaySrc ? (
          <img
            src={displaySrc}
            alt={effectiveName}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover"
          />
        ) : (
          <div
            className={`w-full h-full flex items-center justify-center font-bold text-white bg-gradient-to-tr ${getGradient(
              effectiveName
            )}`}
          >
            {getInitials(effectiveName)}
          </div>
        )}
      </div>

      {showOnlineIndicator && (
        <span
          className={`absolute rounded-full bg-emerald-500 ring-2 ring-[var(--bg-primary)] ${indicatorSize[size]}`}
          title="Online"
        />
      )}
    </div>
  );
};
