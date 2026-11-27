import { ChangeTargetRoleModal } from './ChangeTargetRoleModal';
import React, { useState, useEffect, useRef } from 'react';
import { Outlet, useLocation, NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sidebar } from './Sidebar';
import {
  Menu,
  Search,
  Flame,
  Home,
  FileText,
  Compass,
  Code2,
  Bell,
  CheckCheck,
  Sparkles,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { CommandPalette } from './CommandPalette';
import { ProductTour } from './ProductTour';

export interface SystemNotification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'success' | 'info' | 'streak';
}

export const DashboardLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [targetModalOpen, setTargetModalOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [lastSyncedText, setLastSyncedText] = useState('just now');
  const notifRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const mainRef = useRef<HTMLElement>(null);

  const [notifications, setNotifications] = useState<SystemNotification[]>(() => {
    try {
      const saved = localStorage.getItem('vp_notifications');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        id: 'welcome-1',
        title: 'VertexPath System Ready',
        message: 'Your career workspace is synced with real-time AI diagnostics.',
        time: 'Just now',
        read: false,
        type: 'info',
      },
    ];
  });

  useEffect(() => {
    localStorage.setItem('vp_notifications', JSON.stringify(notifications.slice(0, 15)));
  }, [notifications]);

  // Listen for real-time system notification events from anywhere in the app
  useEffect(() => {
    const handleNotify = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (!detail?.title) return;
      const newNotif: SystemNotification = {
        id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        title: detail.title,
        message: detail.message || '',
        time: 'Just now',
        read: false,
        type: detail.type || 'info',
      };
      setNotifications((prev) => [newNotif, ...prev].slice(0, 15));
      setLastSyncedText('just now');
    };
    window.addEventListener('vertexpath:notify', handleNotify);
    return () => window.removeEventListener('vertexpath:notify', handleNotify);
  }, []);

  // Close notification dropdown on outside click
  useEffect(() => {
    if (!notifOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [notifOpen]);

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

  const [careerGoal, setCareerGoal] = useState(() => {
    return localStorage.getItem('careerGoal') || 'Software Engineer';
  });

  // Fetch dashboard metrics and keep the existing refresh cadence.
  const { data: stats, dataUpdatedAt } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: async () => {
      const res = await api.get('/api/dashboard/stats');
      return res.data;
    },
    refetchInterval: 60000,
  });

  useEffect(() => {
    if (!dataUpdatedAt) return;
    const updateLabel = () => {
      const diffMin = Math.floor((Date.now() - dataUpdatedAt) / 60000);
      setLastSyncedText(diffMin < 1 ? 'just now' : `${diffMin} min ago`);
    };
    updateLabel();
    const timer = setInterval(updateLabel, 30000);
    return () => clearInterval(timer);
  }, [dataUpdatedAt]);

  // Push contextual real-time notifications when stats load
  useEffect(() => {
    if (!stats) return;
    setNotifications((prev) => {
      const next = [...prev];
      if ((stats.totalDocuments || 0) > 0 && !next.some((n) => n.id === 'sys-resume-ok')) {
        next.unshift({
          id: 'sys-resume-ok',
          title: 'Resume ATS Verified',
          message: 'Your resume has been parsed and scored on your Career Journey.',
          time: 'Active',
          read: false,
          type: 'success',
        });
      }
      if ((stats.streakCount || 0) >= 1 && !next.some((n) => n.id === `sys-streak-${stats.streakCount}`)) {
        next.unshift({
          id: `sys-streak-${stats.streakCount}`,
          title: `${stats.streakCount}-Day Study Streak`,
          message: 'Keep logging daily drills or mock interviews to maintain momentum.',
          time: 'Today',
          read: false,
          type: 'streak',
        });
      }
      return next.slice(0, 15);
    });
  }, [stats]);

  // Synchronize profile avatar & target goal across all devices.
  const { data: profile } = useQuery({
    queryKey: ['userProfileSync'],
    queryFn: async () => {
      try {
        const res = await api.get('/api/user/profile');
        return res.data;
      } catch {
        return null;
      }
    },
    staleTime: 60000,
  });

  useEffect(() => {
    if (profile?.avatarUrl) {
      localStorage.setItem('userAvatar', profile.avatarUrl);
      window.dispatchEvent(new Event('userAvatarUpdated'));
    }
    if (profile?.careerGoal) {
      setCareerGoal(profile.careerGoal);
      localStorage.setItem('careerGoal', profile.careerGoal);
    }
  }, [profile]);

  useEffect(() => {
    if (stats?.careerGoal) {
      setCareerGoal(stats.careerGoal);
      localStorage.setItem('careerGoal', stats.careerGoal);
    }
  }, [stats?.careerGoal]);

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/dashboard': return 'Dashboard';
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

  useEffect(() => {
    const handleGoalUpdate = () => {
      setCareerGoal(localStorage.getItem('careerGoal') || 'Software Engineer');
    };
    window.addEventListener('careerGoalUpdated', handleGoalUpdate);
    return () => window.removeEventListener('careerGoalUpdated', handleGoalUpdate);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <div className="relative min-h-screen text-[#0F172A] flex overflow-hidden bg-[#F8F9FA]">
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
      <div className="flex-1 flex flex-col lg:pl-64 min-w-0 bg-[#F8F9FA]">
        {/* Top Navigation Bar (Medesk Clean White Style) */}
        <header className="h-14 flex items-center justify-between px-6 border-b border-[#E5E7EB] bg-[#FFFFFF] sticky top-0 z-30">
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-1.5 -ml-1 rounded-md text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] lg:hidden cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>
            <Home className="w-4 h-4 text-[#0F172A] fill-[#0F172A]/10 shrink-0 hidden sm:block" />
            <h1 className="text-sm font-semibold text-[#0F172A] tracking-tight truncate">
              {getPageTitle()}
            </h1>
            <span className="hidden md:inline-flex items-center gap-1.5 text-xs text-[#64748B]">
              <span>•</span>
              <span>Last synced {lastSyncedText}</span>
            </span>
          </div>

          <div className="flex items-center gap-2.5 text-xs">
            {/* Quick Command Palette Button */}
            <button
              data-tour="tour-quick-actions"
              onClick={() => setPaletteOpen(true)}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#F8F9FA] border border-[#E5E7EB] text-xs text-[#64748B] hover:text-[#0F172A] hover:border-[#CBD5E1] transition-all cursor-pointer"
            >
              <Search className="w-3.5 h-3.5 text-[#64748B]" />
              <span className="text-[12px]">Search anything...</span>
              <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-[#FFFFFF] border border-[#E5E7EB] rounded text-[#64748B]">
                ⌘ K
              </kbd>
            </button>

            {/* Subtle Study Streak */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 bg-[#FFFFFF] border border-[#E5E7EB] rounded-lg text-[#0F172A] font-semibold text-[11px]">
              <Flame className="w-3.5 h-3.5 text-[#F59E0B]" />
              <span>{stats?.streakCount || 1}d streak</span>
            </div>

            {/* Target Role Indicator */}
            <button
              type="button"
              onClick={() => setTargetModalOpen(true)}
              className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 bg-[#F1F5F9] hover:bg-[#E2E8F0] border border-[#E5E7EB] rounded-lg text-[#0F172A] font-semibold text-[11px] tracking-tight transition-colors cursor-pointer"
              title="Click to change target track"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#0F172A]" />
              <span>{careerGoal}</span>
            </button>

            {/* Real-Time Notification Bell */}
            <div className="relative" ref={notifRef}>
              <button
                type="button"
                onClick={() => setNotifOpen((prev) => !prev)}
                className="relative p-2 rounded-lg bg-[#FFFFFF] border border-[#E5E7EB] text-[#0F172A] hover:bg-[#F8FAFC] transition-colors cursor-pointer"
                title="System Notifications"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-[#0F172A] text-[#FFFFFF] text-[10px] font-bold flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {notifOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.98 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-80 bg-[#FFFFFF] border border-[#E5E7EB] rounded-xl shadow-lg z-50 overflow-hidden"
                  >
                    <div className="flex items-center justify-between px-4 py-3 border-b border-[#E5E7EB]">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#0F172A]">Notifications</span>
                        {unreadCount > 0 && (
                          <span className="px-1.5 py-0.5 text-[10px] font-semibold rounded-full bg-[#F1F5F9] text-[#0F172A]">
                            {unreadCount} new
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={markAllRead}
                        className="flex items-center gap-1 text-[11px] font-medium text-[#64748B] hover:text-[#0F172A] cursor-pointer"
                      >
                        <CheckCheck className="w-3.5 h-3.5" />
                        <span>Mark all read</span>
                      </button>
                    </div>

                    <div className="max-h-72 overflow-y-auto divide-y divide-[#F1F5F9]">
                      {notifications.length === 0 ? (
                        <div className="px-4 py-8 text-center text-xs text-[#64748B]">
                          No notifications yet.
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n.id}
                            onClick={() =>
                              setNotifications((prev) =>
                                prev.map((item) => (item.id === n.id ? { ...item, read: true } : item))
                              )
                            }
                            className={`px-4 py-3 flex items-start gap-3 cursor-pointer transition-colors hover:bg-[#F8FAFC] ${
                              !n.read ? 'bg-[#F8FAFC]/80' : ''
                            }`}
                          >
                            <div className="mt-0.5 shrink-0">
                              {n.type === 'success' ? (
                                <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                              ) : n.type === 'streak' ? (
                                <Flame className="w-4 h-4 text-[#F59E0B]" />
                              ) : (
                                <Sparkles className="w-4 h-4 text-[#0F172A]" />
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-2">
                                <p className="text-xs font-semibold text-[#0F172A] truncate">{n.title}</p>
                                {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-[#0F172A] shrink-0" />}
                              </div>
                              <p className="text-[11px] text-[#64748B] mt-0.5 leading-relaxed">{n.message}</p>
                              <p className="text-[10px] text-[#94A3B8] mt-1 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                <span>{n.time}</span>
                              </p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
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
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#FFFFFF]/95 backdrop-blur-md border-t border-[#E5E7EB] px-3 py-2 flex items-center justify-around shadow-lg safe-bottom">
        <NavLink
          to="/dashboard"
          end
          className={({ isActive }) => `flex flex-col items-center gap-1 text-[10px] font-medium transition-colors ${
            isActive ? 'text-[#0F172A] font-bold' : 'text-[#64748B] hover:text-[#0F172A]'
          }`}
        >
          <Home className="w-4 h-4" />
          <span>Home</span>
        </NavLink>

        <NavLink
          to="/dashboard/resume"
          className={({ isActive }) => `flex flex-col items-center gap-1 text-[10px] font-medium transition-colors ${
            isActive ? 'text-[#0F172A] font-bold' : 'text-[#64748B] hover:text-[#0F172A]'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Resume</span>
        </NavLink>

        <NavLink
          to="/dashboard/roadmaps"
          className={({ isActive }) => `flex flex-col items-center gap-1 text-[10px] font-medium transition-colors ${
            isActive ? 'text-[#0F172A] font-bold' : 'text-[#64748B] hover:text-[#0F172A]'
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>Paths</span>
        </NavLink>

        <NavLink
          to="/dashboard/coding"
          className={({ isActive }) => `flex flex-col items-center gap-1 text-[10px] font-medium transition-colors ${
            isActive ? 'text-[#0F172A] font-bold' : 'text-[#64748B] hover:text-[#0F172A]'
          }`}
        >
          <Code2 className="w-4 h-4" />
          <span>Code IDE</span>
        </NavLink>

        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          className="flex flex-col items-center gap-1 text-[10px] font-medium text-[#64748B] hover:text-[#0F172A] cursor-pointer"
        >
          <Menu className="w-4 h-4" />
          <span>Menu</span>
        </button>
      </nav>
    </div>
  );
};
