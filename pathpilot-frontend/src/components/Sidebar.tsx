import React from 'react';
import { motion } from 'framer-motion';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  FileText, 
  Map, 
  Cpu, 
  Terminal, 
  UserCheck, 
  Zap, 
  FileCheck, 
  Mail, 
  DollarSign, 
  Compass, 
  Award, 
  User, 
  LogOut 
} from 'lucide-react';
import logoImg from '../assets/logo.png';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const userPortfolioSlug = user?.fullName 
    ? user.fullName.toLowerCase().replace(/\s+/g, '-')
    : 'developer';

  const navSections = [
    {
      title: 'OVERVIEW',
      items: [
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, tourId: 'tour-dashboard' }
      ]
    },
    {
      title: 'BUILD',
      items: [
        { name: 'Resume & ATS', path: '/dashboard/resume', icon: FileText, tourId: 'tour-resume' },
        { name: 'Learning Paths', path: '/dashboard/roadmaps', icon: Map, tourId: 'tour-roadmaps' },
        { name: 'Project Architect', path: '/dashboard/projects', icon: Cpu, tourId: 'tour-projects' }
      ]
    },
    {
      title: 'PRACTICE',
      items: [
        { name: 'Code Challenge', path: '/dashboard/coding', icon: Terminal, tourId: 'tour-coding' },
        { name: 'Mock Interviews', path: '/dashboard/interviews', icon: UserCheck, tourId: 'tour-interviews' },
        { name: 'Technical Drills', path: '/dashboard#daily-drill', icon: Zap, tourId: 'tour-daily-drill' }
      ]
    },
    {
      title: 'GET HIRED',
      items: [
        { name: 'JD Match', path: '/dashboard/jd-match', icon: FileCheck, tourId: 'tour-jd-match' },
        { name: 'Outreach Copilot', path: '/dashboard/outreach', icon: Mail, tourId: 'tour-outreach' },
        { name: 'Public Portfolio', path: `/p/${userPortfolioSlug}`, icon: Compass, tourId: 'tour-portfolio' }
      ]
    },
    {
      title: 'CAREER',
      items: [
        { name: 'Salary & Negotiation', path: '/dashboard/compensation', icon: DollarSign, tourId: 'tour-compensation' },
        { name: 'Career Badge', path: '/dashboard#career-badge', icon: Award, tourId: 'tour-career-badge' }
      ]
    },
    {
      title: 'SYSTEM',
      items: [
        { name: 'Career Profile', path: '/dashboard/profile', icon: User, tourId: 'tour-profile' }
      ]
    }
  ];

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside className={`
        fixed top-0 bottom-0 left-0 z-50 flex flex-col w-64 bg-[var(--bg-secondary)] border-r border-[var(--border)] transition-transform duration-200 ease-out
        lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo Section */}
        <div className="flex items-center gap-2 px-5 h-16 border-b border-[var(--border)] shrink-0">
          <img src={logoImg} alt="VertexPath Logo" className="w-8 h-8 object-contain" />
          <span className="text-base font-extrabold tracking-tight text-[var(--text-primary)] font-display">VertexPath</span>
          <span className="ml-auto text-[10px] font-mono px-1.5 py-0.5 rounded bg-[var(--surface)] border border-[var(--border)] text-[var(--text-muted)]">
            v2.4
          </span>
        </div>

        {/* User Card */}
        <div className="px-5 py-3.5 border-b border-[var(--border)] bg-[var(--surface)]/50 flex items-center justify-between shrink-0">
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-xs text-[var(--text-primary)] truncate">{user?.fullName || 'Developer'}</p>
            <p className="text-[11px] text-[var(--text-muted)] truncate font-mono">{user?.email}</p>
          </div>
          <NavLink 
            to="/dashboard/profile"
            className="text-[var(--text-muted)] hover:text-[#8B5CF6] transition-colors p-1"
            title="Edit Profile"
          >
            <User className="w-3.5 h-3.5" />
          </NavLink>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-3 py-4 space-y-4 overflow-y-auto custom-scrollbar">
          {navSections.map((section) => (
            <div key={section.title} className="space-y-1">
              <h4 className="px-2 text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-[0.18em]">
                {section.title}
              </h4>
              <div className="space-y-0.5">
                {section.items.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.path}
                    data-tour={item.tourId}
                    onClick={() => {
                      setIsOpen(false);
                      if (item.path.includes('#')) {
                        const hash = item.path.split('#')[1];
                        document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth' });
                      }
                    }}
                    className={({ isActive }) => `
                      relative flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all duration-150 group
                      ${isActive && !item.path.includes('#')
                        ? 'text-[var(--text-primary)] bg-[#8B5CF6]/10 border-l-2 border-[#8B5CF6] font-semibold' 
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface)] border-l-2 border-transparent'}
                    `}
                  >
                    <item.icon className="w-4 h-4 shrink-0 transition-colors text-[var(--text-muted)] group-hover:text-[var(--text-primary)]" />
                    <span className="truncate">{item.name}</span>
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Sign Out Footer */}
        <div className="p-3 border-t border-[var(--border)] shrink-0 bg-[var(--bg-secondary)]">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-2.5 py-1.5 text-xs font-medium text-[var(--text-secondary)] hover:text-[#EF4444] hover:bg-[var(--surface)] rounded-md transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};