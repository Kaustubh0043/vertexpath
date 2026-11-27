import { UserAvatar } from './UserAvatar';
import { AvatarPickerModal } from './AvatarPickerModal';
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Home,
  FileText,
  Compass,
  Layers,
  Code2,
  Users,
  Zap,
  Target,
  Send,
  Globe,
  TrendingUp,
  Award,
  User,
  LogOut
} from 'lucide-react';
import { NeonLogo } from './NeonLogo';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
  const [showAvatarModal, setShowAvatarModal] = React.useState(false);
  React.useEffect(() => {
    const handleTourSidebar = (e: any) => {
      setIsOpen(e.detail === true);
    };
    window.addEventListener('toggleSidebarTour', handleTourSidebar);
    return () => window.removeEventListener('toggleSidebarTour', handleTourSidebar);
  }, [setIsOpen]);
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const userPortfolioSlug = user?.fullName
    ? user.fullName.toLowerCase().replace(/\s+/g, '-')
    : 'developer';

  const navSections = [
    {
      title: 'Overview',
      items: [
        { name: 'Dashboard', path: '/dashboard', icon: Home, tourId: 'tour-dashboard' }
      ]
    },
    {
      title: 'Build',
      items: [
        { name: 'Resume & ATS', path: '/dashboard/resume', icon: FileText, tourId: 'tour-resume' },
        { name: 'Learning Paths', path: '/dashboard/roadmaps', icon: Compass, tourId: 'tour-roadmaps' },
        { name: 'Project Architect', path: '/dashboard/projects', icon: Layers, tourId: 'tour-projects' }
      ]
    },
    {
      title: 'Practice',
      items: [
        { name: 'Code Challenge', path: '/dashboard/coding', icon: Code2, tourId: 'tour-coding' },
        { name: 'Mock Interviews', path: '/dashboard/interviews', icon: Users, tourId: 'tour-interviews' },
        { name: 'Technical Drills', path: '/dashboard#daily-drill', icon: Zap, tourId: 'tour-daily-drill' }
      ]
    },
    {
      title: 'Get Hired',
      items: [
        { name: 'JD Match', path: '/dashboard/jd-match', icon: Target, tourId: 'tour-jd-match' },
        { name: 'Outreach Copilot', path: '/dashboard/outreach', icon: Send, tourId: 'tour-outreach' },
        { name: 'Public Portfolio', path: `/p/${userPortfolioSlug}`, icon: Globe, tourId: 'tour-portfolio' }
      ]
    },
    {
      title: 'Career',
      items: [
        { name: 'Salary & Negotiation', path: '/dashboard/compensation', icon: TrendingUp, tourId: 'tour-compensation' },
        { name: 'Career Badge', path: '/dashboard#career-badge', icon: Award, tourId: 'tour-career-badge' }
      ]
    },
    {
      title: 'System',
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
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={`
          fixed top-0 bottom-0 left-0 z-50 flex flex-col w-64 bg-[#FFFFFF] border-r border-[#E5E7EB] transition-transform duration-200 ease-out
          lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Logo Section */}
        <div className="flex items-center justify-between px-5 h-16 border-b border-[#E5E7EB] shrink-0">
          <NavLink to="/dashboard" className="flex items-center gap-2">
            <NeonLogo size={34} showText />
          </NavLink>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#F1F5F9] border border-[#E5E7EB] text-[#64748B]">
            v2.4
          </span>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-3 py-4 space-y-4 overflow-y-auto custom-scrollbar">
          {navSections.map((section) => (
            <div key={section.title} className="space-y-1">
              <h4 className="px-2.5 text-[11px] font-medium text-[#94A3B8] tracking-wide">
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
                      if (item.name === 'Career Badge') {
                        window.dispatchEvent(new CustomEvent('open-career-badge'));
                      }
                      if (item.name === 'Technical Drills') {
                        const el = document.getElementById('daily-drill');
                        if (el) {
                          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                          el.classList.add('ring-2', 'ring-[#0F172A]');
                          setTimeout(() => el.classList.remove('ring-2', 'ring-[#0F172A]'), 3000);
                        }
                      }
                      if (item.path.includes('#')) {
                        const hash = item.path.split('#')[1];
                        document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth' });
                      }
                    }}
                    end={item.path === '/dashboard'}
                    className={({ isActive }) => `
                      relative flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] transition-all duration-150 group
                      ${isActive && !item.path.includes('#')
                        ? 'text-[#0F172A] bg-[#F1F5F9] font-semibold'
                        : 'text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC] font-medium'}
                    `}
                  >
                    {({ isActive }) => (
                      <>
                        <item.icon
                          className={`w-4 h-4 shrink-0 transition-colors ${
                            isActive && !item.path.includes('#')
                              ? 'text-[#0F172A] fill-[#0F172A]/10'
                              : 'text-[#64748B] group-hover:text-[#0F172A]'
                          }`}
                        />
                        <span className="truncate">{item.name}</span>
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Bottom Account & Sign Out Section (Medesk style) */}
        <div className="mt-auto border-t border-[#E5E7EB] bg-[#FFFFFF] shrink-0 p-3 space-y-2">
          <p className="px-2 text-[11px] font-medium text-[#94A3B8]">Account</p>
          <div className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-[#F8FAFC] transition-colors">
            <button
              type="button"
              onClick={() => setShowAvatarModal(true)}
              className="relative cursor-pointer group shrink-0"
              title="Change Avatar"
            >
              <UserAvatar name={user?.fullName || 'Developer'} size="sm" showOnlineIndicator border />
              <span className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[9px] text-white font-bold transition-opacity">
                Edit
              </span>
            </button>
            <NavLink to="/dashboard/profile" className="min-w-0 flex-1">
              <p className="font-semibold text-xs text-[#0F172A] truncate">{user?.fullName || 'Developer'}</p>
              <p className="text-[11px] text-[#64748B] truncate">{user?.email}</p>
            </NavLink>
            <button
              onClick={handleLogout}
              title="Sign Out"
              className="p-1.5 text-[#64748B] hover:text-[#EF4444] hover:bg-[#FEF2F2] rounded-md transition-colors cursor-pointer shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
      <AvatarPickerModal isOpen={showAvatarModal} onClose={() => setShowAvatarModal(false)} userName={user?.fullName || 'Developer'} />
    </>
  );
};
