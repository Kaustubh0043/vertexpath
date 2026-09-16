import React from 'react';
import { motion } from 'framer-motion';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  MessageSquare, 
  FileText, 
  FileCheck, 
  Map, 
  Cpu, 
  UserCheck, 
  LogOut,
  Mail,
  Terminal,
  DollarSign,
  Compass
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
      title: 'YOUR PATH',
      items: [
        { name: 'Resume & ATS', path: '/dashboard/resume', icon: FileText, tourId: 'tour-resume' },
        { name: 'Learning Paths', path: '/dashboard/roadmaps', icon: Map, tourId: 'tour-roadmaps' },
        { name: 'Project Architect', path: '/dashboard/projects', icon: Cpu, tourId: 'tour-projects' }
      ]
    },
    {
      title: 'PREPARE & PRACTICE',
      items: [
        { name: 'Mock Interviews', path: '/dashboard/interviews', icon: UserCheck, tourId: 'tour-interviews' },
        { name: 'Code Challenge', path: '/dashboard/coding', icon: Terminal, tourId: 'tour-coding' },
        { name: 'Job Match Audit', path: '/dashboard/jd-match', icon: FileCheck, tourId: 'tour-jd-match' }
      ]
    },
    {
      title: 'CAREER TOOLS',
      items: [
        { name: 'Outreach Copilot', path: '/dashboard/outreach', icon: Mail, tourId: 'tour-outreach' },
        { name: 'Salary Negotiation', path: '/dashboard/compensation', icon: DollarSign, tourId: 'tour-compensation' },
        { name: 'Career Coach', path: '/dashboard/chat', icon: MessageSquare, tourId: 'tour-chat' }
      ]
    },
    {
      title: 'PROFILE',
      items: [
        { name: 'Public Portfolio', path: `/p/${userPortfolioSlug}`, icon: Compass, tourId: 'tour-portfolio' }
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
        fixed top-0 bottom-0 left-0 z-50 flex flex-col w-64 bg-[#0D1016] border-r border-slate-900 transition-transform duration-300 ease-in-out
        lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo Section */}
        <div className="flex items-center gap-3 px-6 h-16 border-b border-slate-900">
          <img src={logoImg} alt="VertexPath Logo" className="w-18 h-18 object-contain -mr-4" />
          <span className="text-lg font-extrabold tracking-tight text-[#F4F1EA] font-display">VertexPath</span>
        </div>

        {/* User Card */}
        <div className="px-6 py-4 border-b border-slate-900 bg-slate-950/20 flex flex-col gap-1.5">
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Signed In As</p>
            <p className="font-semibold text-[#F4F1EA] truncate text-sm mt-0.5">{user?.fullName || 'Developer'}</p>
            <p className="text-[11px] text-[#606979] truncate">{user?.email}</p>
          </div>
          <NavLink 
            to="/dashboard/profile"
            className={({ isActive }) => 
              `text-[10px] font-bold tracking-wider uppercase text-left transition-colors cursor-pointer ${
                isActive ? 'text-[#9B5CFF]' : 'text-slate-500 hover:text-white'
              }`
            }
          >
            Edit Career Profile →
          </NavLink>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-4 py-4 space-y-5 overflow-y-auto custom-scrollbar">
          {navSections.map((section) => (
            <div key={section.title} className="space-y-1.5">
              <h4 className="px-3 text-[10px] font-bold text-[#606979] uppercase tracking-[0.2em]">
                {section.title}
              </h4>
              <div className="space-y-0.5">
                {section.items.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.path}
                    data-tour={item.tourId}
                    onClick={() => setIsOpen(false)}
                    className={({ isActive }) => `
                      relative flex items-center gap-3 py-2 rounded-lg text-xs font-semibold transition-all duration-200 group pl-3
                      ${isActive 
                        ? 'text-[#F4F1EA] border-l-2 border-[#9B5CFF]' 
                        : 'text-[#9299A8] hover:text-[#F4F1EA] border-l-2 border-transparent hover:bg-[#11151D]/40'}
                    `}
                  >
                    {({ isActive }) => (
                      <>
                        {isActive && (
                          <motion.div 
                            layoutId="activeTabBackground"
                            className="absolute inset-0 bg-[#9B5CFF]/10 rounded-lg -z-10"
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                          />
                        )}
                        <item.icon className={`w-4 h-4 transition-colors ${
                          isActive ? 'text-[#9B5CFF]' : 'text-[#606979] group-hover:text-[#F4F1EA]'
                        }`} />
                        <span>{item.name}</span>
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Logout Footer */}
        <div className="p-4 border-t border-slate-900 bg-slate-950/20">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2.5 w-full px-3 py-2 text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-950/20 rounded-lg transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};