import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { 
  Search, 
  Map, 
  FileText, 
  Cpu, 
  Mic, 
  Mail, 
  Terminal, 
  DollarSign, 
  LayoutDashboard, 
  MessageSquare,
  ArrowRight,
  X,
  HelpCircle,
  Share2,
  FileCheck,
  User,
  Sun,
  Moon,
  Laptop
} from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CommandItem {
  id: string;
  title: string;
  description: string;
  category: string;
  icon: React.ElementType;
  path?: string;
  action?: () => void;
  shortcut?: string;
  badge?: string;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { setTheme } = useTheme();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const commands: CommandItem[] = [
    {
      id: 'tour',
      title: 'Take Product Tour',
      description: 'Step-by-step guided walkthrough of all VertexPath features',
      category: 'Help',
      icon: HelpCircle,
      action: () => {
        window.dispatchEvent(new Event('startVertexTour'));
      },
      shortcut: 'TOUR'
    },
    {
      id: 'theme-light',
      title: 'Switch to Light Mode',
      description: 'Clean high-contrast daytime interface',
      category: 'Appearance',
      icon: Sun,
      action: () => {
        setTheme('light');
      },
      shortcut: 'T L'
    },
    {
      id: 'theme-dark',
      title: 'Switch to Dark Mode',
      description: 'Sleek low-glare Raycast dark aesthetic',
      category: 'Appearance',
      icon: Moon,
      action: () => {
        setTheme('dark');
      },
      shortcut: 'T D'
    },
    {
      id: 'theme-system',
      title: 'Use System Default Theme',
      description: 'Automatically match operating system preferences',
      category: 'Appearance',
      icon: Laptop,
      action: () => {
        setTheme('system');
      },
      shortcut: 'T S'
    },
    {
      id: 'dashboard',
      title: 'Dashboard Overview',
      description: 'Command center showing completion, streaks, and milestone actions',
      category: 'Overview',
      icon: LayoutDashboard,
      path: '/dashboard',
      shortcut: 'G D'
    },
    {
      id: 'resume',
      title: 'Resume & ATS Scorer',
      description: 'ATS audit, XYZ bullet optimizer, and RAG context sandbox',
      category: 'Build',
      icon: FileText,
      path: '/dashboard/resume',
      shortcut: 'G R'
    },
    {
      id: 'roadmaps',
      title: 'Learning Paths & Roadmaps',
      description: 'Synthesize multi-week step-by-step curriculum milestones',
      category: 'Build',
      icon: Map,
      path: '/dashboard/roadmaps',
      shortcut: 'G L'
    },
    {
      id: 'projects',
      title: 'Project Architect',
      description: 'Model system directory structures and database schemas',
      category: 'Build',
      icon: Cpu,
      path: '/dashboard/projects',
      shortcut: 'G P'
    },
    {
      id: 'interviews',
      title: 'Mock Voice Interviews',
      badge: 'Interactive',
      description: 'Practice role-specific voice interviews with live AI grading',
      category: 'Practice',
      icon: Mic,
      path: '/dashboard/interviews',
      shortcut: 'G I'
    },
    {
      id: 'coding',
      title: 'Live Code IDE & Complexity',
      description: 'Monaco dark IDE with automated Time O(N) and Space O(1) complexity audits',
      category: 'Practice',
      icon: Terminal,
      path: '/dashboard/coding',
      shortcut: 'G C'
    },
    {
      id: 'jd-match',
      title: 'Job Description Matcher',
      description: 'Audit resume compatibility against target job descriptions',
      category: 'Get Hired',
      icon: FileCheck,
      path: '/dashboard/jd-match',
      shortcut: 'G J'
    },
    {
      id: 'outreach',
      title: 'Outreach & Recruiter Copilot',
      description: 'Generate high-converting cold outreach DMs & pitch emails',
      category: 'Get Hired',
      icon: Mail,
      path: '/dashboard/outreach',
      shortcut: 'G O'
    },
    {
      id: 'compensation',
      title: 'Salary & Offer Negotiation',
      description: 'Benchmark market percentiles and generate counter-offer scripts',
      category: 'Career',
      icon: DollarSign,
      path: '/dashboard/compensation',
      shortcut: 'G S'
    },
    {
      id: 'profile',
      title: 'Career Profile Settings',
      description: 'Update target roles, primary tech stacks, and learning styles',
      category: 'System',
      icon: User,
      path: '/dashboard/profile',
      shortcut: 'G A'
    }
  ];

  const filteredCommands = commands.filter(cmd => 
    cmd.title.toLowerCase().includes(query.toLowerCase()) ||
    cmd.description.toLowerCase().includes(query.toLowerCase()) ||
    cmd.category.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev < filteredCommands.length - 1 ? prev + 1 : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : filteredCommands.length - 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          handleSelect(filteredCommands[selectedIndex]);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredCommands, selectedIndex]);

  const handleSelect = (cmd: CommandItem) => {
    if (cmd.action) {
      cmd.action();
    } else if (cmd.path) {
      navigate(cmd.path);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="relative w-full max-w-xl bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-[0_20px_70px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-[var(--border)] gap-3 bg-[var(--surface)]">
          <Search className="w-5 h-5 text-[#8B5CF6] shrink-0" />
          <input
            autoFocus
            type="text"
            placeholder="Type a command, page name, or theme..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-[var(--text-primary)] placeholder-[var(--text-muted)] text-sm focus:outline-none border-none p-0"
          />
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[var(--card)] border border-[var(--border)] text-[var(--text-muted)]">
            ESC
          </span>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2 space-y-1 custom-scrollbar">
          {filteredCommands.length === 0 ? (
            <div className="p-8 text-center text-xs text-[var(--text-muted)]">
              No matching actions found for "{query}".
            </div>
          ) : (
            filteredCommands.map((cmd, idx) => {
              const Icon = cmd.icon;
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={cmd.id}
                  onClick={() => handleSelect(cmd)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`
                    flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-100 group
                    ${isSelected 
                      ? 'bg-[#8B5CF6]/15 text-[var(--text-primary)]' 
                      : 'text-[var(--text-secondary)] hover:bg-[var(--surface)] hover:text-[var(--text-primary)]'}
                  `}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`p-1.5 rounded-lg transition-colors ${
                      isSelected ? 'bg-[#8B5CF6] text-white' : 'bg-[var(--surface)] text-[var(--text-muted)] group-hover:text-[var(--text-primary)]'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="truncate">
                      <p className={`text-xs font-semibold truncate ${isSelected ? 'text-[var(--text-primary)] font-bold' : ''}`}>
                        {cmd.title}
                      </p>
                      <p className="text-[11px] text-[var(--text-muted)] truncate">
                        {cmd.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    <span className="text-[9px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded bg-[var(--surface)] border border-[var(--border)] text-[var(--text-muted)]">
                      {cmd.category}
                    </span>
                    {cmd.shortcut && (
                      <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[var(--surface)] border border-[var(--border)] text-[var(--text-muted)]">
                        {cmd.shortcut}
                      </kbd>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info bar */}
        <div className="px-4 py-2 bg-[var(--surface)] border-t border-[var(--border)] flex items-center justify-between text-[11px] text-[var(--text-muted)]">
          <div className="flex items-center gap-3">
            <span>Use <kbd className="font-mono text-[9px] bg-[var(--card)] px-1 rounded border border-[var(--border)]">↑</kbd> <kbd className="font-mono text-[9px] bg-[var(--card)] px-1 rounded border border-[var(--border)]">↓</kbd> to navigate</span>
            <span><kbd className="font-mono text-[9px] bg-[var(--card)] px-1 rounded border border-[var(--border)]">↵</kbd> to select</span>
          </div>
          <span className="font-mono text-[10px]">VertexPath Spotlight</span>
        </div>
      </div>
    </div>
  );
};
