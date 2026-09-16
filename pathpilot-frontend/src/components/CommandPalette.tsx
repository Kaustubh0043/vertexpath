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
  X,
  HelpCircle,
  Share2
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
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const commands: CommandItem[] = [
    {
      id: 'tour',
      title: 'Take Interactive Product Tour',
      description: 'Step-by-step interactive walkthrough of all VertexPath features',
      category: 'Help',
      icon: HelpCircle,
      action: () => {
        window.dispatchEvent(new Event('startVertexTour'));
      },
      shortcut: 'T O U R'
    },
    {
      id: 'dashboard',
      title: 'Dashboard Overview & Career Route',
      description: 'View daily streak, technical drill & readiness badge',
      category: 'Overview',
      icon: LayoutDashboard,
      path: '/dashboard',
      shortcut: 'G D'
    },
    {
      id: 'portfolio',
      title: 'Public Developer Portfolio',
      description: 'View & share your verified public career portfolio profile',
      category: 'Overview',
      icon: Share2,
      path: '/portfolio/me',
      shortcut: 'G P'
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
        const selected = filteredCommands[selectedIndex];
        if (selected) {
          if (selected.action) {
            selected.action();
          } else if (selected.path) {
            navigate(selected.path);
          }
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, filteredCommands, navigate, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-[#07080C]/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl bg-[#0D1016] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-900 gap-3">
          <Search className="w-5 h-5 text-[#9B5CFF]" />
          <input
            type="text"
            placeholder="Type a command or search tools (e.g. 'coding', 'salary', 'tour')..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="flex-1 bg-transparent text-sm text-[#F4F1EA] placeholder:text-slate-500 focus:outline-none"
          />
          <button 
            onClick={onClose}
            className="text-slate-500 hover:text-slate-300 p-1 rounded-md hover:bg-slate-900 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2 divide-y divide-slate-900/50">
          {filteredCommands.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-500">
              No matching commands or tools found.
            </div>
          ) : (
            filteredCommands.map((command, idx) => {
              const Icon = command.icon;
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={command.id}
                  onClick={() => {
                    if (command.action) {
                      command.action();
                    } else if (command.path) {
                      navigate(command.path);
                    }
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${
                    isSelected 
                      ? 'bg-[#151A23] border border-[#9B5CFF]/30 text-white' 
                      : 'text-slate-300 hover:bg-[#11151D] border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${isSelected ? 'bg-[#9B5CFF]/20 text-[#C49AFF]' : 'bg-slate-900 text-slate-400'}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#F4F1EA]">{command.title}</span>
                        <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 bg-slate-900 rounded text-slate-500 font-mono">
                          {command.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400">{command.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {command.shortcut && (
                      <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[9px] font-mono bg-slate-900/80 border border-slate-800 rounded text-slate-500">
                        {command.shortcut}
                      </kbd>
                    )}
                    <ArrowRight className={`w-3.5 h-3.5 transition-transform ${isSelected ? 'text-[#9B5CFF] translate-x-0.5' : 'text-slate-700'}`} />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-[#090C10] border-t border-slate-900 text-[10px] text-slate-500">
          <div className="flex items-center gap-3">
            <span><kbd className="font-mono bg-slate-900 px-1 py-0.5 rounded border border-slate-800">↑↓</kbd> Navigate</span>
            <span><kbd className="font-mono bg-slate-900 px-1 py-0.5 rounded border border-slate-800">↵</kbd> Select</span>
            <span><kbd className="font-mono bg-slate-900 px-1 py-0.5 rounded border border-slate-800">ESC</kbd> Close</span>
          </div>
          <span className="text-slate-600 font-mono">VertexPath Command v2.4</span>
        </div>
      </div>
    </div>
  );
};
