import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  X, 
  ArrowRight, 
  ArrowLeft, 
  Sparkles, 
  Compass, 
  FileText, 
  Map, 
  Terminal, 
  Mic, 
  Send, 
  DollarSign, 
  Command, 
  CheckCircle2, 
  UserCheck 
} from 'lucide-react';

export interface TourStep {
  title: string;
  badge: string;
  description: string;
  icon: React.ReactNode;
  highlightRoute?: string;
  tips: string[];
}

export const ProductTour: React.FC = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const steps: TourStep[] = [
    {
      title: 'Welcome to VertexPath',
      badge: 'CAREER OPERATING SYSTEM',
      description: 'Your complete AI-powered developer journey — from foundational resume benchmarking to salary negotiation and shareable public portfolios.',
      icon: <Sparkles className="w-8 h-8 text-[#9B5CFF] animate-pulse" />,
      tips: [
        'Everything is interconnected to build your path to your dream engineering role.',
        'Track daily streaks, XP, and milestone completions in real-time.'
      ]
    },
    {
      title: 'Career Route Tracker',
      badge: 'LIVE MILESTONES',
      description: 'Your personal career roadmap dynamically reflects real actions. As you upload resumes, build paths, solve challenges, and interview, the tracker automatically lights up.',
      icon: <Compass className="w-8 h-8 text-[#55D39A]" />,
      highlightRoute: '/dashboard',
      tips: [
        'Click directly on any node in the Route Tracker to jump straight into that module.',
        'Edit your target role dynamically right from the top header.'
      ]
    },
    {
      title: 'Resume & ATS Optimization',
      badge: 'STAGE 01 / PROFILE',
      description: 'Run deep ATS audits against top tech company standards and use the Google XYZ Bullet Optimizer to transform raw bullets into high-impact, metrics-driven achievements.',
      icon: <FileText className="w-8 h-8 text-[#9B5CFF]" />,
      highlightRoute: '/dashboard/resume',
      tips: [
        'Get 3 instant variations: Performance, Scale, and Business impact.',
        'Benchmark against job descriptions with the Job Match Audit tool.'
      ]
    },
    {
      title: 'Learning Paths & Project Architect',
      badge: 'STAGE 02 / FOUNDATION',
      description: 'Generate customized week-by-week curriculum roadmaps with printable PDF exports, and scaffold complete full-stack project specs with database schemas and REST APIs.',
      icon: <Map className="w-8 h-8 text-[#00E5FF]" />,
      highlightRoute: '/dashboard/roadmaps',
      tips: [
        'Export roadmaps as Markdown or high-resolution printable PDFs.',
        'Project Architect generates copy-paste ready directory trees & schemas.'
      ]
    },
    {
      title: 'Mock Interviews & Code Challenge IDE',
      badge: 'STAGE 03 / PREPARATION',
      description: 'Practice real-time voice-powered technical & behavioral interviews with strict scoring, and solve algorithmic challenges in our dark-mode Monaco-style IDE with automated Big-O complexity audits.',
      icon: <Terminal className="w-8 h-8 text-[#FF8A00]" />,
      highlightRoute: '/dashboard/coding',
      tips: [
        'Voice simulator features speech-to-text, questions read aloud, and 2-minute countdown timer.',
        'Complexity analyzer breaks down Time O(N) & Space O(1) efficiency with optimal refactor solutions.'
      ]
    },
    {
      title: 'Outreach Copilot & Salary Negotiation',
      badge: 'STAGE 04 / CONVERSION',
      description: 'Generate 3 high-converting cold outreach pitches (Recruiter DM, Engineering Manager Deep Dive, Founder Pitch) and calculate market percentiles with automated counter-offer email scripts.',
      icon: <DollarSign className="w-8 h-8 text-[#FF6577]" />,
      highlightRoute: '/dashboard/outreach',
      tips: [
        'Craft tailored counter-offers for +10% to +20% increases with professional phrasing.',
        'Share your public verified developer portfolio with recruiters at /p/:username.'
      ]
    },
    {
      title: 'Global Command Palette (Ctrl + K)',
      badge: 'PRODUCTIVITY SHORTCUT',
      description: 'Press Ctrl + K (or ⌘K on macOS) at any time to instantly jump between tools, trigger actions, or copy your public portfolio link without touching your mouse.',
      icon: <Command className="w-8 h-8 text-[#9B5CFF]" />,
      tips: [
        'Supports instant keyword search across all 10+ modules.',
        'You can relaunch this interactive tour at any time from the Dashboard.'
      ]
    }
  ];

  useEffect(() => {
    // Check if user has already completed tour
    const hasCompleted = localStorage.getItem('vertexpath_tour_completed');
    if (!hasCompleted) {
      // Auto open on first visit with small delay for smooth mount
      const timer = setTimeout(() => setIsOpen(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    // Listener for manual tour triggering
    const handleStartTour = () => {
      setCurrentStep(0);
      setIsOpen(true);
    };

    window.addEventListener('startVertexTour', handleStartTour);
    return () => window.removeEventListener('startVertexTour', handleStartTour);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleSkip();
      } else if (e.key === 'ArrowRight' || e.key === 'Enter') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentStep]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSkip = () => {
    localStorage.setItem('vertexpath_tour_completed', 'true');
    setIsOpen(false);
  };

  const handleComplete = () => {
    localStorage.setItem('vertexpath_tour_completed', 'true');
    setIsOpen(false);
  };

  const handleJumpToRoute = (route?: string) => {
    if (route) {
      setIsOpen(false);
      localStorage.setItem('vertexpath_tour_completed', 'true');
      navigate(route);
    }
  };

  if (!isOpen) return null;

  const current = steps[currentStep];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#07080C]/85 backdrop-blur-md animate-in fade-in duration-300">
      <div 
        className="relative w-full max-w-xl bg-[#0D1016] border border-slate-800/90 rounded-2xl p-6 sm:p-8 shadow-[0_0_50px_rgba(155,92,255,0.18)] space-y-6 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow ambient accent */}
        <div className="absolute top-0 right-1/4 w-48 h-48 bg-[#9B5CFF]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-48 h-48 bg-[#00E5FF]/5 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header Bar */}
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 bg-[#9B5CFF]/15 border border-[#9B5CFF]/30 text-[#C49AFF] text-[10px] font-mono font-bold uppercase rounded-md tracking-wider">
              {current.badge}
            </span>
            <span className="text-[11px] font-mono text-slate-500 font-bold">
              Step {currentStep + 1} of {steps.length}
            </span>
          </div>

          <button
            onClick={handleSkip}
            className="text-slate-500 hover:text-[#F4F1EA] p-1.5 rounded-lg hover:bg-slate-900 transition-all cursor-pointer"
            title="Skip Tour (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Content */}
        <div className="space-y-4 relative z-10">
          <div className="flex items-center gap-4">
            <div className="p-3.5 bg-[#11151D] border border-slate-800 rounded-xl flex items-center justify-center shrink-0 shadow-inner">
              {current.icon}
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-[#F4F1EA] tracking-tight">
                {current.title}
              </h3>
            </div>
          </div>

          <p className="text-sm text-[#9299A8] leading-relaxed">
            {current.description}
          </p>

          {/* Pro Tips Box */}
          <div className="p-4 bg-[#11151D]/80 border border-slate-900 rounded-xl space-y-2">
            <p className="text-[10px] font-mono uppercase tracking-widest text-[#9B5CFF] font-bold">
              Key Capabilities
            </p>
            <div className="space-y-1.5">
              {current.tips.map((tip, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#55D39A] shrink-0 mt-0.5" />
                  <span>{tip}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Step Progress Dots */}
        <div className="flex items-center justify-center gap-1.5 pt-2">
          {steps.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentStep(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                idx === currentStep 
                  ? 'w-6 bg-[#9B5CFF]' 
                  : idx < currentStep 
                  ? 'w-2 bg-[#55D39A]' 
                  : 'w-2 bg-slate-800 hover:bg-slate-700'
              }`}
            />
          ))}
        </div>

        {/* Footer Controls (Skip, Back, Next) */}
        <div className="flex items-center justify-between gap-4 pt-4 border-t border-slate-900 relative z-10">
          <button
            onClick={handleSkip}
            className="text-xs font-bold text-slate-500 hover:text-slate-300 transition-colors cursor-pointer px-2 py-1.5"
          >
            Skip Tour
          </button>

          <div className="flex items-center gap-2">
            {currentStep > 0 && (
              <button
                onClick={handlePrev}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-[#11151D] hover:bg-[#1A202C] border border-slate-800 text-[#F4F1EA] text-xs font-bold rounded-lg transition-all cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            )}

            {current.highlightRoute && currentStep < steps.length - 1 && (
              <button
                onClick={() => handleJumpToRoute(current.highlightRoute)}
                className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 bg-[#11151D] hover:bg-[#1A202C] border border-slate-800 text-[#9B5CFF] hover:text-[#C49AFF] text-xs font-bold rounded-lg transition-all cursor-pointer"
              >
                <span>Try It Now</span>
              </button>
            )}

            <button
              onClick={handleNext}
              className="flex items-center gap-1.5 px-5 py-2 bg-gradient-to-r from-[#9B5CFF] to-[#8038FF] hover:from-[#A86FFF] hover:to-[#9147FF] text-[#07080C] text-xs font-extrabold rounded-lg transition-all shadow-[0_0_20px_rgba(155,92,255,0.3)] hover:shadow-[0_0_25px_rgba(155,92,255,0.5)] cursor-pointer active:scale-95"
            >
              <span>{currentStep === steps.length - 1 ? 'Get Started 🚀' : 'Next'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
