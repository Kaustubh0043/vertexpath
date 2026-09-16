import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Sparkles,
  ArrowRight,
  X
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
  path: string;
  shortcut?: string;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const commands: CommandItem[] = [
    {
      id: 'dashboard',
      title: 'Dashboard Overview',
      description: 'View daily streak, technical drill & readiness badge',
      category: 'Overview',
      icon: LayoutDashboard,
      path: '/dashboard',
      shortcut: 'G D'
    },
    {
      id: 'resume',
      title: 'Resume ATS Optimizer & XYZ Rewriter',
      description: 'Score resume, match JDs & optimize bullet points',
      category: 'Your Path',
      icon: FileText,
      path: '/dashboard/resume',
      shortcut: 'G R'
    },
    {
      id: 'learning',
      title: 'Learning Roadmaps',
      description: 'Generate 4-week custom curriculum & study plans',
      category: 'Your Path',
      icon: Map,
      path: '/dashboard/learning',
      shortcut: 'G L'
    },
    {
      id: 'projects',
      title: 'Project Architecture Generator',
      description: 'Synthesize folder layouts, schemas & REST routes',
      category: 'Your Path',
      icon: Cpu,
      path: '/dashboard/projects',
      shortcut: 'G P'
    },
    {
      id: 'interviews',
      title: 'AI Voice Mock Interviews',
      description: 'Speech recognition interview simulator with audio AI',
      category: 'Prepare',
      icon: Mic,
      path: '/dashboard/interviews',
      shortcut: 'G I'
    },
    {
      id: 'coding',
      title: 'Live Code Challenge & Complexity Analyzer',
      description: 'In-browser IDE with O(n) Time/Space complexity audits',
      category: 'Prepare',
      icon: Terminal,
      path: '/dashboard/coding',
      shortcut: 'G C'
    },
    {
      id: 'outreach',
      title: 'Recruiter Outreach & Cold DM Generator',
      description: 'High-converting email and LinkedIn outreach templates',
      category: 'Tools',
      icon: Mail,
      path: '/dashboard/outreach',
      shortcut: 'G O'
    },
    {
      id: 'compensation',
      title: 'Tech Salary & Negotiation Copilot',
      description: 'Benchmark market percentiles & counter-offer scripts',
      category: 'Tools',
      icon: DollarSign,
      path: '/dashboard/compensation',
      shortcut: 'G S'
    },
    {
      id: 'chat',
      title: 'Senior AI Career Coach Chat',
      description: 'Interactive dialogue with personalized context',
      category: 'Coach',
      icon: MessageSquare,
      path: '/dashboard/chat',
      shortcut: 'G A'
    }
  ];

  const filteredCommands = commands.filter(c => 
    c.title.toLowerCase().includes(query.toLowerCase()) ||
    c.description.toLowerCase().includes(query.toLowerCase()) ||
    c.category.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev < filteredCommands.length - 1 ? prev + 1 : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : filteredCommands.length - 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          navigate(filteredCommands[selectedIndex].path);
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, filteredCommands, navigate, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-xl bg-[#0D1016] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-800/80 bg-[#11151D]/60">
          <Search className="w-5 h-5 text-[#9B5CFF] shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder="Type a command, tool name, or feature..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent border-none text-sm text-[#F4F1EA] placeholder-slate-500 focus:outline-none focus:ring-0"
          />
          <button 
            onClick={onClose}
            className="p-1 text-slate-500 hover:text-slate-300 rounded-md transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Command List */}
        <div className="max-h-[380px] overflow-y-auto p-2 space-y-1 custom-scrollbar">
          {filteredCommands.length === 0 ? (
            <div className="text-center py-10 space-y-2">
              <Sparkles className="w-6 h-6 text-slate-600 mx-auto" />
              <p className="text-xs text-slate-400 font-medium">No actions found for "{query}"</p>
            </div>
          ) : (
            filteredCommands.map((item, index) => {
              const isSelected = index === selectedIndex;
              const Icon = item.icon;
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    navigate(item.path);
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`
                    flex items-center justify-between px-3.5 py-3 rounded-xl cursor-pointer transition-all
                    ${isSelected 
                      ? 'bg-[#9B5CFF]/15 border border-[#9B5CFF]/30 text-[#F4F1EA]' 
                      : 'hover:bg-[#11151D] border border-transparent text-[#9299A8]'}
                  `}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`p-2 rounded-lg ${isSelected ? 'bg-[#9B5CFF] text-[#07080C]' : 'bg-[#11151D] text-slate-400'}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#F4F1EA] truncate">{item.title}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/5 text-slate-500 font-mono uppercase">{item.category}</span>
                      </div>
                      <p className="text-[11px] text-[#9299A8] truncate mt-0.5">{item.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <ArrowRight className={`w-3.5 h-3.5 transition-transform ${isSelected ? 'translate-x-0.5 text-[#9B5CFF]' : 'opacity-0'}`} />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-[#07080C] border-t border-slate-900 text-[10px] text-slate-500 font-mono">
          <div className="flex items-center gap-2">
            <span>Navigate: <kbd className="px-1 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">↑</kbd> <kbd className="px-1 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">↓</kbd></span>
            <span>Select: <kbd className="px-1 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">↵</kbd></span>
          </div>
          <span>Press <kbd className="px-1 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">ESC</kbd> to exit</span>
        </div>
      </div>
    </div>
  );
};
