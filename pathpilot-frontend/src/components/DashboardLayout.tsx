import React, { useState, useEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sidebar } from './Sidebar';
import { Menu, Search, Flame } from 'lucide-react';
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
      case '/dashboard/chat': return 'Senior AI Career Coach';
      case '/dashboard/resume': return 'Resume & ATS Optimizer';
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
    <div className="relative min-h-screen text-[#F4F4F5] flex overflow-hidden bg-[#09090B]">
      {/* Navigation Sidebar */}
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      {/* Spotlight Command Palette */}
      <CommandPalette isOpen={paletteOpen} onClose={() => setPaletteOpen(false)} />

      {/* Interactive Product Tour Modal */}
      <ProductTour />

      {/* Main Page Area */}
      <div className="flex-1 flex flex-col lg:pl-64 min-w-0 bg-[#09090B]">
        
        {/* Top Navigation Bar */}
        <header className="h-14 flex items-center justify-between px-6 border-b border-[#25262D] bg-[#0D0E12]/80 backdrop-blur-md sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="p-1.5 -ml-1 rounded-md text-[#71717A] hover:text-[#F4F4F5] hover:bg-[#15161C] lg:hidden cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-sm font-semibold text-[#F4F4F5] tracking-tight">
              {getPageTitle()}
            </h1>
          </div>

          <div className="flex items-center gap-3 text-xs">
            
            {/* Quick Command Palette Button */}
            <button
              data-tour="tour-quick-actions"
              onClick={() => setPaletteOpen(true)}
              className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#111318] border border-[#25262D] text-xs text-[#A1A1AA] hover:text-[#F4F4F5] hover:border-[#353842] transition-all cursor-pointer"
            >
              <Search className="w-3.5 h-3.5 text-[#8B5CF6]" />
              <span className="text-[11px]">Quick actions...</span>
              <kbd className="px-1.5 py-0.5 text-[9px] font-mono bg-[#15161C] border border-[#25262D] rounded text-[#71717A]">Ctrl K</kbd>
            </button>

            {/* Subtle Study Streak */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#15161C] border border-[#25262D] rounded text-[#F59E0B] font-medium text-[11px]">
              <Flame className="w-3.5 h-3.5 text-[#F59E0B]" />
              <span>{stats?.streakCount || 1}d streak</span>
            </div>

            {/* Target Role Indicator */}
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 bg-[#8B5CF6]/10 border border-[#8B5CF6]/20 rounded text-[#A78BFA] font-medium text-[10px] uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-[#8B5CF6]" />
              <span>{careerGoal}</span>
            </div>
          </div>
        </header>

        {/* Content Viewport */}
        <main ref={mainRef} className="flex-1 overflow-y-auto p-4 sm:p-8 relative z-10 custom-scrollbar">
          <div className="max-w-5xl mx-auto space-y-8">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
            >
              <Outlet />
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
};