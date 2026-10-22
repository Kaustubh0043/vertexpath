import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Laptop, Moon, Sun } from 'lucide-react';
import { useTheme, type ThemeMode } from '../context/ThemeContext';

interface ThemeToggleProps {
  variant?: 'compact' | 'dropdown' | 'segmented';
  className?: string;
  showLabel?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  variant = 'compact',
  className = '',
  showLabel = false,
}) => {
  const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const menuId = React.useId();
  const clipId = `skiper-theme-${React.useId().replace(/:/g, '-')}`;
  const isDark = resolvedTheme === 'dark';
  const nextTheme = isDark ? 'light' : 'dark';

  useEffect(() => {
    if (variant !== 'dropdown' || !isOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener('mousedown', handlePointerDown);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, variant]);

  const options: { mode: ThemeMode; label: string; icon: typeof Sun }[] = [
    { mode: 'light', label: 'Light', icon: Sun },
    { mode: 'dark', label: 'Dark', icon: Moon },
    { mode: 'system', label: 'System', icon: Laptop },
  ];

  const themeIcon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      fill="currentColor"
      strokeLinecap="round"
      viewBox="0 0 32 32"
      className="h-5 w-5 text-[var(--text-primary)] transition-colors duration-200 group-hover:text-[var(--brand-primary)]"
    >
      <clipPath id={clipId}>
        <motion.path
          animate={{ y: isDark ? 10 : 0, x: isDark ? -12 : 0 }}
          transition={{ ease: 'easeInOut', duration: 0.35 }}
          d="M0-5h30a1 1 0 0 0 9 13v24H0Z"
        />
      </clipPath>
      <g clipPath={`url(#${clipId})`}>
        <motion.circle
          animate={{ r: isDark ? 10 : 8 }}
          transition={{ ease: 'easeInOut', duration: 0.35 }}
          cx="16"
          cy="16"
        />
        <motion.g
          animate={{
            rotate: isDark ? -100 : 0,
            scale: isDark ? 0.5 : 1,
            opacity: isDark ? 0 : 1,
          }}
          transition={{ ease: 'easeInOut', duration: 0.35 }}
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path d="M16 5.5v-4" />
          <path d="M16 30.5v-4" />
          <path d="M1.5 16h4" />
          <path d="M26.5 16h4" />
          <path d="m23.4 8.6 2.8-2.8" />
          <path d="m5.7 26.3 2.9-2.9" />
          <path d="m5.8 5.8 2.8 2.8" />
          <path d="m23.4 23.4 2.9 2.9" />
        </motion.g>
      </g>
    </svg>
  );

  if (variant === 'segmented') {
    return (
      <div
        role="radiogroup"
        aria-label="Theme preference"
        className={`inline-flex gap-1 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-1 ${className}`}
      >
        {options.map(({ mode, label, icon: Icon }) => {
          const isSelected = theme === mode;
          return (
            <button
              key={mode}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => setTheme(mode)}
              className={`flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                isSelected
                  ? 'bg-[var(--brand-primary)] text-[#04101A] shadow-sm'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--card)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Icon className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{label}</span>
            </button>
          );
        })}
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        aria-label={`Switch to ${nextTheme} theme`}
        aria-pressed={isDark}
        title={`Switch to ${nextTheme} theme (currently ${resolvedTheme})`}
        className={`skiper-theme-btn group ${className}`}
      >
        {themeIcon}
        {showLabel && (
          <span className="text-xs font-semibold capitalize text-[var(--text-secondary)]">
            {resolvedTheme}
          </span>
        )}
      </button>
    );
  }

  return (
    <div className={`relative inline-block ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-label="Select theme"
        aria-controls={menuId}
        aria-expanded={isOpen}
        title={`Theme: ${theme.charAt(0).toUpperCase()}${theme.slice(1)}`}
        className="skiper-theme-btn group"
      >
        {themeIcon}
      </button>
      <div
        id={menuId}
        role="menu"
        aria-label="Theme preference"
        aria-hidden={!isOpen}
        data-open={isOpen}
        className="theme-toggle-menu absolute right-0 z-50 mt-2 w-36 space-y-0.5 rounded-xl border border-[var(--border)] bg-[var(--card)] p-1.5 shadow-xl"
      >
        {options.map(({ mode, label, icon: Icon }) => {
          const isSelected = theme === mode;
          return (
            <button
              key={mode}
              type="button"
              role="menuitemradio"
              aria-checked={isSelected}
              tabIndex={isOpen ? 0 : -1}
              onClick={() => {
                setTheme(mode);
                setIsOpen(false);
              }}
              className={`flex w-full cursor-pointer items-center justify-between rounded-lg px-2.5 py-2 text-xs transition-colors ${
                isSelected
                  ? 'bg-[var(--brand-primary)]/15 font-bold text-[var(--brand-primary)]'
                  : 'font-medium text-[var(--text-secondary)] hover:bg-[var(--surface)] hover:text-[var(--text-primary)]'
              }`}
            >
              <span className="flex items-center gap-2">
                <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{label}</span>
              </span>
              {isSelected && <Check className="h-3.5 w-3.5" aria-hidden="true" />}
            </button>
          );
        })}
      </div>
    </div>
  );
};
