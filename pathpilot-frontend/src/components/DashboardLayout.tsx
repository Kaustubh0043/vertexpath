import React, { useState, useEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sidebar } from './Sidebar';
import { Menu, Search } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { CommandPalette } from './CommandPalette';
import { ProductTour } from './ProductTour';

export const DashboardLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const location = useLocation();
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTop = 0;
    }
  }, [location.pathname]);

  // Global Ctrl+K / Cmd+K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Fetch stats to render streak count in header dynamically
  const { data: stats } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: async () => {
      const res = await api.get('/api/dashboard/stats');
      return res.data;
    },
    refetchInterval: 60000,
  });

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/dashboard': return 'Dashboard Overview';
      case '/dashboard/chat': return 'AI Career Coach';
      case '/dashboard/resume': return 'Resume ATS & XYZ Rewriter';
      case '/dashboard/jd-match': return 'Job Description Match';
      case '/dashboard/roadmaps':
      case '/dashboard/learning': return 'Learning Paths';
      case '/dashboard/projects': return 'Project Architect';
      case '/dashboard/interviews': return 'Mock Interviews';
      case '/dashboard/coding': return 'Code Challenge & Complexity';
      case '/dashboard/outreach': return 'Outreach Copilot';
      case '/dashboard/compensation': return 'Salary & Negotiation';
      case '/dashboard/profile': return 'Career Profile';
      default: return 'VertexPath';
    }
  };

  const [careerGoal, setCareerGoal] = useState(() => {
    return localStorage.getItem('careerGoal') || 'Software Engineer';
  });

  useEffect(() => {
    const handleGoalUpdate = () => {
      setCareerGoal(localStorage.getItem('careerGoal') || 'Software Engineer');
    };
    window.addEventListener('careerGoalUpdated', handleGoalUpdate);
    return () => window.removeEventListener('careerGoalUpdated', handleGoalUpdate);
  }, []);

  return (
    <div className="relative min-h-screen text-[#F4F1EA] flex overflow-hidden bg-[#07080C]">
      {/* Background Container */}
      <div className="aurora-container">
        <div className="cyber-grid-2d" />
      </div>

      {/* Navigation Sidebar */}
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      {/* Spotlight Command Palette */}
      <CommandPalette isOpen={paletteOpen} onClose={() => setPaletteOpen(false)} />

      {/* Interactive Product Tour Modal */}
      <ProductTour />

      {/* Main Page Area */}
      <div className="flex-1 flex flex-col lg:pl-64 min-w-0">
        
        {/* Top Navigation Bar */}
        <header className="h-16 flex items-center justify-between px-6 border-b border-slate-900 bg-[#0D1016]/40 backdrop-blur-md sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="p-2 -ml-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/40 lg:hidden cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-sm sm:text-base font-bold text-[#F4F1EA] tracking-tight">
              {getPageTitle()}
            </h1>
          </div>

          <div className="flex items-center gap-3 text-xs font-semibold text-[#9299A8]">
            
            {/* Quick Command Palette Button with Tour Target */}
            <button
              data-tour="tour-quick-actions"
              onClick={() => setPaletteOpen(true)}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#11151D] border border-slate-800 text-xs text-slate-400 hover:text-slate-200 hover:border-[#9B5CFF]/30 transition-all cursor-pointer shadow-sm"
            >
              <Search className="w-3.5 h-3.5 text-[#9B5CFF]" />
              <span className="text-[11px]">Quick actions...</span>
              <kbd className="px-1.5 py-0.5 text-[9px] font-mono bg-slate-900 border border-slate-800 rounded text-slate-400">Ctrl K</kbd>
            </button>

            {/* Subtle Study Streak */}
            <div className="flex items-center gap-1.5 px-3 py-1 bg-[#FF8A00]/10 border border-[#FF8A00]/25 rounded text-[#FF8A00] font-bold text-[11px] uppercase tracking-wider shadow-[0_0_12px_rgba(255,138,0,0.05)]">
              <span>🔥</span>
              <span>{stats?.streakCount || 1} day streak</span>
            </div>

            {/* Muted Path Indicator */}
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 bg-[#9B5CFF]/10 border border-[#9B5CFF]/20 rounded text-[#C49AFF] font-bold text-[10px] uppercase tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-[#9B5CFF] animate-pulse" />
              <span>{careerGoal}</span>
            </div>
          </div>
        </header>

        {/* Content Viewport */}
        <main ref={mainRef} className="flex-1 overflow-y-auto p-4 sm:p-8 relative z-10">
          <div className="max-w-5xl mx-auto space-y-8">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
            >
              <Outlet />
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
};