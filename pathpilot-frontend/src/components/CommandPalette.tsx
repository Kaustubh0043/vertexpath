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
  ArrowRight,
  X,
  HelpCircle,
  Share2,
  FileCheck,
  User
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
      id: 'dashboard',
      title: 'Dashboard Overview',
      description: 'View daily streak, technical drill & milestone readiness',
      category: 'Overview',
      icon: LayoutDashboard,
      path: '/dashboard',
      shortcut: 'G D'
    },
    {
      id: 'resume',
      title: 'Resume & ATS Optimizer',
      description: 'Score resume, match JDs & optimize Google XYZ bullet points',
      category: 'Build',
      icon: FileText,
      path: '/dashboard/resume',
      shortcut: 'G R'
    },
    {
      id: 'learning',
      title: 'Learning Paths',
      description: 'Generate 4-week custom curriculum & printable PDF roadmaps',
      category: 'Build',
      icon: Map,
      path: '/dashboard/roadmaps',
      shortcut: 'G L'
    },
    {
      id: 'projects',
      title: 'Project Architect',
      description: 'Synthesize folder layouts, database schemas & REST routes',
      category: 'Build',
      icon: Cpu,
      path: '/dashboard/projects',
      shortcut: 'G P'
    },
    {
      id: 'interviews',
      title: 'Mock Voice Interviews',
      description: 'Speech recognition interview simulator with audio AI',
      category: 'Practice',
      icon: Mic,
      path: '/dashboard/interviews',
      shortcut: 'G I'
    },
    {
      id: 'coding',
      title: 'Code Challenge & Complexity',
      description: 'In-browser IDE with Time/Space O(n) complexity audits',
      category: 'Practice',
      icon: Terminal,
      path: '/dashboard/coding',
      shortcut: 'G C'
    },
    {
      id: 'jd-match',
      title: 'Job Description Match',
      description: 'Benchmark resume against target job description requirements',
      category: 'Get Hired',
      icon: FileCheck,
      path: '/dashboard/jd-match',
      shortcut: 'G J'
    },
    {
      id: 'outreach',
      title: 'Outreach Copilot',
      description: 'High-converting recruiter and engineering manager DMs',
      category: 'Get Hired',
      icon: Mail,
      path: '/dashboard/outreach',
      shortcut: 'G O'
    },
    {
      id: 'portfolio',
      title: 'Public Developer Portfolio',
      description: 'View & share your verified public career portfolio profile',
      category: 'Get Hired',
      icon: Share2,
      path: '/portfolio/me',
      shortcut: 'G V'
    },
    {
      id: 'compensation',
      title: 'Salary & Negotiation Copilot',
      description: 'Benchmark market percentiles & generate counter-offer scripts',
      category: 'Career',
      icon: DollarSign,
      path: '/dashboard/compensation',
      shortcut: 'G S'
    },
    {
      id: 'chat',
      title: 'Senior AI Career Coach',
      description: 'Interactive dialogue with personalized document context',
      category: 'Career',
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
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-[#09090B]/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="relative w-full max-w-xl bg-[#111318] border border-[#25262D] rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header */}
        <div className="flex items-center px-4 py-3 border-b border-[#25262D] gap-3 bg-[#15161C]">
          <Search className="w-4 h-4 text-[#8B5CF6]" />
          <input
            type="text"
            placeholder="Type a command or search (e.g. 'resume', 'coding', 'tour')..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="flex-1 bg-transparent text-xs text-[#F4F4F5] placeholder:text-[#71717A] focus:outline-none border-none p-0 focus:ring-0"
          />
          <button 
            onClick={onClose}
            className="text-[#71717A] hover:text-[#F4F4F5] p-1 rounded hover:bg-[#111318] cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 divide-y divide-[#1D1E24] custom-scrollbar">
          {filteredCommands.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#71717A]">
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
                  className={`flex items-center justify-between p-2.5 rounded-lg cursor-pointer transition-colors ${
                    isSelected 
                      ? 'bg-[#181A21] border border-[#353842] text-white' 
                      : 'text-[#A1A1AA] hover:bg-[#15161C] border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`p-1.5 rounded-md ${isSelected ? 'bg-[#8B5CF6]/20 text-[#A78BFA]' : 'bg-[#15161C] text-[#71717A]'}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-[#F4F4F5] truncate">{command.title}</span>
                        <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.2 bg-[#0D0E12] rounded text-[#71717A] font-mono border border-[#25262D]">
                          {command.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#71717A] truncate">{command.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    {command.shortcut && (
                      <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[9px] font-mono bg-[#0D0E12] border border-[#25262D] rounded text-[#71717A]">
                        {command.shortcut}
                      </kbd>
                    )}
                    <ArrowRight className={`w-3.5 h-3.5 ${isSelected ? 'text-[#8B5CF6]' : 'text-[#25262D]'}`} />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="flex items-center justify-between px-3.5 py-2 bg-[#0D0E12] border-t border-[#25262D] text-[10px] text-[#71717A]">
          <div className="flex items-center gap-3">
            <span><kbd className="font-mono bg-[#15161C] px-1 py-0.5 rounded border border-[#25262D]">↑↓</kbd> Navigate</span>
            <span><kbd className="font-mono bg-[#15161C] px-1 py-0.5 rounded border border-[#25262D]">↵</kbd> Select</span>
            <span><kbd className="font-mono bg-[#15161C] px-1 py-0.5 rounded border border-[#25262D]">ESC</kbd> Close</span>
          </div>
          <span className="font-mono text-[#52525B]">VertexPath v2.4</span>
        </div>
      </div>
    </div>
  );
};