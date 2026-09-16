import React, { useState, useRef, useEffect } from 'react';
import { useTheme, type ThemeMode } from '../context/ThemeContext';
import { Sun, Moon, Laptop, Check } from 'lucide-react';

interface ThemeToggleProps {
  variant?: 'compact' | 'dropdown' | 'segmented';
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ variant = 'dropdown', className = '' }) => {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const options: { mode: ThemeMode; label: string; icon: React.FC<{ className?: string }> }[] = [
    { mode: 'light', label: 'Light', icon: Sun },
    { mode: 'dark', label: 'Dark', icon: Moon },
    { mode: 'system', label: 'System', icon: Laptop },
  ];

  if (variant === 'segmented') {
    return (
      <div className={`inline-flex p-1 bg-[#111318] [data-theme=light]_&:bg-[#F4F4F5] border border-[#25262D] [data-theme=light]_&:border-[#E4E4E7] rounded-lg gap-1 ${className}`}>
        {options.map((opt) => {
          const Icon = opt.icon;
          const isSelected = theme === opt.mode;
          return (
            <button
              key={opt.mode}
              type="button"
              onClick={() => setTheme(opt.mode)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                isSelected
                  ? 'bg-[#8B5CF6] text-white shadow-sm'
                  : 'text-[#A1A1AA] hover:text-[#F4F4F5] [data-theme=light]_&:text-[#52525B] [data-theme=light]_&:hover:text-[#18181B]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{opt.label}</span>
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className={`relative inline-block ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#111318] [data-theme=light]_&:bg-[#F4F4F5] border border-[#25262D] [data-theme=light]_&:border-[#E4E4E7] text-[#A1A1AA] hover:text-[#F4F4F5] [data-theme=light]_&:text-[#52525B] [data-theme=light]_&:hover:text-[#18181B] transition-colors cursor-pointer"
        title={`Theme: ${theme.charAt(0).toUpperCase() + theme.slice(1)}`}
        aria-label="Toggle theme"
      >
        {resolvedTheme === 'dark' ? (
          <Moon className="w-4 h-4 text-[#8B5CF6]" />
        ) : (
          <Sun className="w-4 h-4 text-[#F59E0B]" />
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-36 rounded-xl bg-[#15161C] [data-theme=light]_&:bg-[#FFFFFF] border border-[#25262D] [data-theme=light]_&:border-[#E4E4E7] shadow-xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150 space-y-0.5">
          {options.map((opt) => {
            const Icon = opt.icon;
            const isSelected = theme === opt.mode;
            return (
              <button
                key={opt.mode}
                type="button"
                onClick={() => {
                  setTheme(opt.mode);
                  setIsOpen(false);
                }}
                className={`flex items-center justify-between w-full px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-[#8B5CF6]/15 text-[#8B5CF6] font-semibold'
                    : 'text-[#A1A1AA] hover:text-[#F4F4F5] hover:bg-[#111318] [data-theme=light]_&:text-[#52525B] [data-theme=light]_&:hover:text-[#18181B] [data-theme=light]_&:hover:bg-[#F4F4F5]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-[#8B5CF6]' : 'text-current'}`} />
                  <span>{opt.label}</span>
                </div>
                {isSelected && <Check className="w-3.5 h-3.5 text-[#8B5CF6]" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
