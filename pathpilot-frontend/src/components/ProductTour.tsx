import React, { useState, useEffect, useCallback } from 'react';
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
  DollarSign, 
  Command, 
  CheckCircle2, 
  HelpCircle,
  MousePointerClick
} from 'lucide-react';

interface TourStep {
  targetSelector: string;
  title: string;
  badge: string;
  description: string;
  tips: string;
  preferredPlacement: 'top' | 'bottom' | 'left' | 'right';
  targetRoute?: string;
}

export const ProductTour: React.FC = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  const steps: TourStep[] = [
    {
      targetSelector: '[data-tour="route-tracker"]',
      title: 'Career Route Tracker',
      badge: 'LIVE MILESTONES',
      description: 'This is your real-time career journey. Click on any milestone node to jump directly into Resume, Skills, Roadmaps, Projects, Interviews, Coding, or Outreach.',
      tips: 'Nodes dynamically check off as you complete real actions in the platform.',
      preferredPlacement: 'bottom',
      targetRoute: '/dashboard'
    },
    {
      targetSelector: '[data-tour="daily-drill"]',
      title: 'Daily Technical Drill',
      badge: 'STREAK & XP',
      description: 'Practice high-yield engineering questions every day to boost your streak, earn XP, and test your system architecture readiness.',
      tips: 'Completing the daily drill awards XP and increments your streak counter.',
      preferredPlacement: 'top',
      targetRoute: '/dashboard'
    },
    {
      targetSelector: '[data-tour="quick-actions"]',
      title: 'Global Command Palette (Ctrl + K)',
      badge: 'SHORTCUTS',
      description: 'Access the spotlight search at any time by clicking here or pressing Ctrl + K to instantly switch between modules and trigger actions.',
      tips: 'Press ⌘K on macOS or Ctrl+K on Windows from anywhere.',
      preferredPlacement: 'bottom'
    },
    {
      targetSelector: '[data-tour="sidebar-your-path"]',
      title: 'Your Path (Resume, Roadmaps, Projects)',
      badge: 'STAGE 01 & 02',
      description: 'Audit your resume with Google XYZ formulas, build 4-week syllabus roadmaps, and scaffold full-stack architectures with database schemas.',
      tips: 'Export roadmaps as PDF or project specs as Markdown.',
      preferredPlacement: 'right'
    },
    {
      targetSelector: '[data-tour="sidebar-practice"]',
      title: 'Mock Interviews & Live Code IDE',
      badge: 'STAGE 03 / PREP',
      description: 'Practice real-time voice interviews with Web Speech synthesis and solve algorithmic problems in our dark-mode IDE with automated Big-O complexity audits.',
      tips: 'Evaluates Time & Space complexity ($O(N)$ / $O(1)$) with optimal refactor code.',
      preferredPlacement: 'right'
    },
    {
      targetSelector: '[data-tour="sidebar-tools"]',
      title: 'Outreach & Salary Negotiation',
      badge: 'STAGE 04 / CAREER TOOLS',
      description: 'Generate high-converting recruiter DMs, calculate market percentiles, and craft professional counter-offer email scripts.',
      tips: 'Includes 3 tailored pitch variations: Recruiter, Engineering Manager, Founder.',
      preferredPlacement: 'right'
    },
    {
      targetSelector: '[data-tour="career-badge"]',
      title: 'Verified Career Badge & Public Portfolio',
      badge: 'CERTIFIED BADGE',
      description: 'Click here to preview your verified readiness certificate and copy your shareable public developer portfolio link (/p/:username).',
      tips: 'Embed your live badge markdown directly into your GitHub README or LinkedIn bio.',
      preferredPlacement: 'bottom',
      targetRoute: '/dashboard'
    }
  ];

  const updateTargetPosition = useCallback(() => {
    if (!isOpen) return;
    const current = steps[currentStep];
    const el = document.querySelector(current.targetSelector);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
      // Allow slight delay for smooth scroll to finish
      setTimeout(() => {
        const rect = el.getBoundingClientRect();
        setTargetRect(rect);
      }, 150);
    } else {
      setTargetRect(null);
    }
  }, [isOpen, currentStep]);

  useEffect(() => {
    // Check if tour completed before
    const hasCompleted = localStorage.getItem('vertexpath_tour_completed');
    if (!hasCompleted) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    const handleStartTour = () => {
      setCurrentStep(0);
      setIsOpen(true);
    };

    window.addEventListener('startVertexTour', handleStartTour);
    return () => window.removeEventListener('startVertexTour', handleStartTour);
  }, []);

  useEffect(() => {
    if (isOpen) {
      updateTargetPosition();
      window.addEventListener('resize', updateTargetPosition);
      window.addEventListener('scroll', updateTargetPosition, true);
      return () => {
        window.removeEventListener('resize', updateTargetPosition);
        window.removeEventListener('scroll', updateTargetPosition, true);
      };
    }
  }, [isOpen, currentStep, updateTargetPosition]);

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

  if (!isOpen) return null;

  const current = steps[currentStep];

  // Calculate popover positioning with boundary clamping
  const calculatePopoverStyle = () => {
    if (!targetRect) {
      return {
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        arrowPosition: 'none'
      };
    }

    const padding = 16;
    const popoverWidth = Math.min(380, window.innerWidth - 32);
    const popoverHeight = 260; // Estimated height

    let top = 0;
    let left = 0;
    let arrowDir: 'top' | 'bottom' | 'left' | 'right' = 'top';

    const placement = current.preferredPlacement;

    if (placement === 'bottom') {
      top = targetRect.bottom + padding;
      left = targetRect.left + targetRect.width / 2 - popoverWidth / 2;
      arrowDir = 'top'; // Arrow points UP towards the element above
      if (top + popoverHeight > window.innerHeight) {
        // Fallback to top
        top = Math.max(padding, targetRect.top - popoverHeight - padding);
        arrowDir = 'bottom';
      }
    } else if (placement === 'top') {
      top = targetRect.top - popoverHeight - padding;
      left = targetRect.left + targetRect.width / 2 - popoverWidth / 2;
      arrowDir = 'bottom'; // Arrow points DOWN towards the element below
      if (top < padding) {
        top = targetRect.bottom + padding;
        arrowDir = 'top';
      }
    } else if (placement === 'right') {
      left = targetRect.right + padding;
      top = targetRect.top + targetRect.height / 2 - popoverHeight / 2;
      arrowDir = 'left'; // Arrow points LEFT towards sidebar element
      if (left + popoverWidth > window.innerWidth) {
        left = Math.max(padding, targetRect.left - popoverWidth - padding);
        arrowDir = 'right';
      }
    } else {
      left = targetRect.left - popoverWidth - padding;
      top = targetRect.top + targetRect.height / 2 - popoverHeight / 2;
      arrowDir = 'right';
    }

    // Clamp horizontal boundary
    left = Math.max(padding, Math.min(window.innerWidth - popoverWidth - padding, left));
    top = Math.max(padding, Math.min(window.innerHeight - popoverHeight - padding, top));

    return {
      top: `${top}px`,
      left: `${left}px`,
      width: `${popoverWidth}px`,
      arrowPosition: arrowDir
    };
  };

  const popoverStyle = calculatePopoverStyle();

  return (
    <div className="fixed inset-0 z-50 pointer-events-none select-none">
      
      {/* Dark overlay with translucent backdrop */}
      <div 
        className="fixed inset-0 bg-[#07080C]/75 backdrop-blur-[2px] pointer-events-auto transition-opacity duration-300"
        onClick={handleSkip}
      />

      {/* Target Element Spotlight Box */}
      {targetRect && (
        <div
          className="fixed pointer-events-none transition-all duration-300 ease-out z-50 rounded-xl"
          style={{
            top: `${targetRect.top - 6}px`,
            left: `${targetRect.left - 6}px`,
            width: `${targetRect.width + 12}px`,
            height: `${targetRect.height + 12}px`,
            boxShadow: '0 0 0 9999px rgba(7, 8, 12, 0.78), 0 0 25px rgba(155, 92, 255, 0.6)',
            border: '2px solid #9B5CFF'
          }}
        >
          {/* Animated corner accents */}
          <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-[#00E5FF] animate-pulse" />
          <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-[#00E5FF] animate-pulse" />
          <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-[#00E5FF] animate-pulse" />
          <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-[#00E5FF] animate-pulse" />
        </div>
      )}

      {/* Floating Spotlight Popover with Pointing Arrow */}
      <div
        className="fixed pointer-events-auto z-50 bg-[#0D1016] border border-[#9B5CFF]/60 rounded-2xl p-5 shadow-[0_0_40px_rgba(155,92,255,0.25)] space-y-4 animate-in fade-in zoom-in-95 duration-200"
        style={{
          top: popoverStyle.top,
          left: popoverStyle.left,
          width: popoverStyle.width
        }}
      >
        {/* Pointing Caret Arrow */}
        {popoverStyle.arrowPosition === 'top' && (
          <div 
            className="absolute -top-3 left-1/2 -translate-x-1/2 w-0 h-0 border-x-8 border-x-transparent border-b-8 border-b-[#9B5CFF]"
          />
        )}
        {popoverStyle.arrowPosition === 'bottom' && (
          <div 
            className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-[#9B5CFF]"
          />
        )}
        {popoverStyle.arrowPosition === 'left' && (
          <div 
            className="absolute -left-3 top-8 w-0 h-0 border-y-8 border-y-transparent border-r-8 border-r-[#9B5CFF]"
          />
        )}
        {popoverStyle.arrowPosition === 'right' && (
          <div 
            className="absolute -right-3 top-8 w-0 h-0 border-y-8 border-y-transparent border-l-8 border-l-[#9B5CFF]"
          />
        )}

        {/* Top Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-[#9B5CFF]/20 border border-[#9B5CFF]/40 text-[#C49AFF] text-[9px] font-mono font-bold uppercase rounded tracking-wider">
              {current.badge}
            </span>
            <span className="text-[10px] font-mono text-slate-500 font-bold">
              {currentStep + 1} of {steps.length}
            </span>
          </div>

          <button
            onClick={handleSkip}
            className="text-slate-500 hover:text-[#F4F1EA] p-1 rounded hover:bg-slate-900 transition-colors cursor-pointer"
            title="Skip Tour (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-2">
          <h4 className="text-base font-extrabold text-[#F4F1EA] flex items-center gap-2 tracking-tight">
            <span>{current.title}</span>
          </h4>
          <p className="text-xs text-[#9299A8] leading-relaxed">
            {current.description}
          </p>

          <div className="p-2.5 bg-[#11151D] border border-slate-900 rounded-lg flex items-start gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#55D39A] shrink-0 mt-0.5" />
            <p className="text-[11px] text-slate-300 leading-snug">
              {current.tips}
            </p>
          </div>
        </div>

        {/* Step dots & Controls */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-900">
          <button
            onClick={handleSkip}
            className="text-[11px] font-bold text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
          >
            Skip
          </button>

          <div className="flex items-center gap-1.5">
            {steps.map((_, idx) => (
              <div
                key={idx}
                className={`h-1 rounded-full transition-all ${
                  idx === currentStep ? 'w-4 bg-[#9B5CFF]' : 'w-1 bg-slate-800'
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            {currentStep > 0 && (
              <button
                onClick={handlePrev}
                className="p-1.5 bg-[#11151D] hover:bg-[#1A202C] border border-slate-800 text-[#F4F1EA] rounded-md transition-all cursor-pointer"
                title="Previous step"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              onClick={handleNext}
              className="flex items-center gap-1 px-3.5 py-1.5 bg-[#9B5CFF] hover:bg-[#C49AFF] text-[#07080C] text-xs font-bold rounded-md transition-all cursor-pointer active:scale-95 shadow-[0_0_15px_rgba(155,92,255,0.4)]"
            >
              <span>{currentStep === steps.length - 1 ? 'Got it! 🚀' : 'Next'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};