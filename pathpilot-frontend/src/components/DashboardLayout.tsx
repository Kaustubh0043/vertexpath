import { ChangeTargetRoleModal } from './ChangeTargetRoleModal';
import React, { useState, useEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sidebar } from './Sidebar';
import { Menu, Search, Flame, LayoutDashboard, FileText, Map, Terminal, User } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { CommandPalette } from './CommandPalette';
import { ProductTour } from './ProductTour';
import { ThemeToggle } from './ThemeToggle';

export const DashboardLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [targetModalOpen, setTargetModalOpen] = useState(false);
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

  // Synchronize profile avatar & target goal across all devices
  useQuery({
    queryKey: ['userProfileSync'],
    queryFn: async () => {
      try {
        const res = await api.get('/api/user/profile');
        if (res.data?.avatarUrl) {
          localStorage.setItem('userAvatar', res.data.avatarUrl);
          window.dispatchEvent(new Event('userAvatarUpdated'));
        }
        if (res.data?.careerGoal) {
          setCareerGoal(res.data.careerGoal);
          localStorage.setItem('careerGoal', res.data.careerGoal);
        }
        return res.data;
      } catch (e) {
        return null;
      }
    },
    staleTime: 60000,
  });
  useEffect(() => {
    if (stats?.careerGoal) {
      setCareerGoal(stats.careerGoal);
      localStorage.setItem('careerGoal', stats.careerGoal);
    }
  }, [stats]);
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
    <div className="relative min-h-screen text-[var(--text-primary)] flex overflow-hidden bg-[var(--bg-primary)] transition-colors duration-200">
      {/* Navigation Sidebar */}
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      {/* Spotlight Command Palette */}
      <CommandPalette isOpen={paletteOpen} onClose={() => setPaletteOpen(false)} />

      {/* Interactive Product Tour Modal */}
      <ProductTour />
      <ChangeTargetRoleModal
        isOpen={targetModalOpen}
        onClose={() => setTargetModalOpen(false)}
        currentRole={careerGoal}
        onRoleChanged={(newRole) => setCareerGoal(newRole)}
      />

      {/* Main Page Area */}
      <div className="flex-1 flex flex-col lg:pl-64 min-w-0 bg-[var(--bg-primary)]">
        
        {/* Top Navigation Bar */}
        <header className="h-14 flex items-center justify-between px-6 border-b border-[var(--border)] bg-[var(--bg-secondary)]/80 backdrop-blur-md sticky top-0 z-30 transition-colors duration-200">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="p-1.5 -ml-1 rounded-md text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface)] lg:hidden cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-sm font-semibold text-[var(--text-primary)] tracking-tight">
              {getPageTitle()}
            </h1>
          </div>

          <div className="flex items-center gap-3 text-xs">
            
            {/* Quick Command Palette Button */}
            <button
              data-tour="tour-quick-actions"
              onClick={() => setPaletteOpen(true)}
              className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-md bg-[var(--surface)] border border-[var(--border)] text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all cursor-pointer"
            >
              <Search className="w-3.5 h-3.5 text-[#8B5CF6]" />
              <span className="text-[11px]">Quick actions...</span>
              <kbd className="px-1.5 py-0.5 text-[9px] font-mono bg-[var(--card)] border border-[var(--border)] rounded text-[var(--text-muted)]">Ctrl K</kbd>
            </button>

            {/* Subtle Study Streak */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[var(--card)] border border-[var(--border)] rounded text-[#F59E0B] font-medium text-[11px]">
              <Flame className="w-3.5 h-3.5 text-[#F59E0B]" />
              <span>{stats?.streakCount || 1}d streak</span>
            </div>

            {/* Target Role Indicator */}
            <button
              type="button"
              onClick={() => setTargetModalOpen(true)}
              className="hidden md:flex items-center gap-1.5 px-2.5 py-1 bg-[#8B5CF6]/10 hover:bg-[#8B5CF6]/20 border border-[#8B5CF6]/20 rounded text-[#8B5CF6] font-semibold text-[10px] uppercase tracking-wider transition-colors cursor-pointer group"
              title="Click to change target track"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#8B5CF6]" />
              <span>{careerGoal}</span>
            </button>

            {/* Light / Dark / System Theme Toggle */}
            <ThemeToggle />
          </div>
        </header>

        {/* Content Viewport */}
        <main ref={mainRef} className="flex-1 overflow-y-auto p-4 sm:p-8 pb-24 lg:pb-8 relative z-10 custom-scrollbar">
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

      {/* Mobile Floating Bottom Navigation Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[var(--bg-secondary)]/95 backdrop-blur-md border-t border-[var(--border)] px-3 py-2 flex items-center justify-around shadow-2xl safe-bottom">
        <NavLink
          to="/dashboard"
          end
          className={({ isActive }) => `flex flex-col items-center gap-1 text-[10px] font-medium transition-colors ${
            isActive ? 'text-[#8B5CF6] font-bold' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Overview</span>
        </NavLink>

        <NavLink
          to="/dashboard/resume"
          className={({ isActive }) => `flex flex-col items-center gap-1 text-[10px] font-medium transition-colors ${
            isActive ? 'text-[#8B5CF6] font-bold' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Resume</span>
        </NavLink>

        <NavLink
          to="/dashboard/roadmaps"
          className={({ isActive }) => `flex flex-col items-center gap-1 text-[10px] font-medium transition-colors ${
            isActive ? 'text-[#8B5CF6] font-bold' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
          }`}
        >
          <Map className="w-4 h-4" />
          <span>Roadmaps</span>
        </NavLink>

        <NavLink
          to="/dashboard/coding"
          className={({ isActive }) => `flex flex-col items-center gap-1 text-[10px] font-medium transition-colors ${
            isActive ? 'text-[#8B5CF6] font-bold' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
          }`}
        >
          <Terminal className="w-4 h-4" />
          <span>Code IDE</span>
        </NavLink>

        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          className="flex flex-col items-center gap-1 text-[10px] font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
        >
          <Menu className="w-4 h-4" />
          <span>Menu</span>
        </button>
      </nav>
    </div>
  );
};
