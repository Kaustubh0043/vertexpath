import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  X, 
  ArrowRight, 
  ArrowLeft, 
  Sparkles 
} from 'lucide-react';

interface TourStep {
  targetSelector: string;
  title: string;
  badge: string;
  description: string;
  preferredPlacement: 'right' | 'bottom' | 'top' | 'left';
}

export const ProductTour: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const activeElementRef = useRef<Element | null>(null);

  // Sequenced precisely to match the new Information Architecture
  const steps: TourStep[] = [
    {
      targetSelector: '[data-tour="tour-quick-actions"]',
      title: 'Global Command Palette (Ctrl + K)',
      badge: 'SYSTEM / SHORTCUT',
      description: 'Press Ctrl + K from anywhere on VertexPath to search tools, jump between pages, and trigger AI copilots instantly.',
      preferredPlacement: 'bottom'
    },
    {
      targetSelector: '[data-tour="tour-dashboard"]',
      title: 'Command Center Dashboard',
      badge: 'OVERVIEW / PHASE 0',
      description: 'Your central hub displaying profile completion, career journey roadmap, daily technical drills, skill coverage, and recent activity.',
      preferredPlacement: 'right'
    },
    {
      targetSelector: '[data-tour="tour-route-tracker"]',
      title: 'Career Route Tracker',
      badge: 'CAREER TIMELINE',
      description: 'Track your end-to-end career journey. Milestones dynamically light up as you build resumes, complete learning roadmaps, practice interviews, and launch applications.',
      preferredPlacement: 'bottom'
    },
    {
      targetSelector: '[data-tour="tour-resume"]',
      title: 'Resume & ATS Intelligence',
      badge: 'BUILD / STAGE 01',
      description: 'Audit your resume against strict ATS parser criteria, optimize XYZ impact bullet points, and query your resume context using vector RAG search.',
      preferredPlacement: 'right'
    },
    {
      targetSelector: '[data-tour="tour-roadmaps"]',
      title: 'Learning Paths & Syllabi',
      badge: 'BUILD / STAGE 02',
      description: 'Generate customized multi-week structured learning roadmaps with interactive task checklists and 1-click printable PDF study guides.',
      preferredPlacement: 'right'
    },
    {
      targetSelector: '[data-tour="tour-projects"]',
      title: 'Project Architect & Sandbox',
      badge: 'BUILD / STAGE 03',
      description: 'Synthesize production folder structures, normalized database schemas (SQL/NoSQL), and REST controller endpoint blueprints.',
      preferredPlacement: 'right'
    },
    {
      targetSelector: '[data-tour="tour-coding"]',
      title: 'Live Code Challenge IDE',
      badge: 'PRACTICE / STAGE 01',
      description: 'Solve real-world algorithmic problems with automated Time O(N) and Space O(1) complexity audits, test cases, and optimal refactors.',
      preferredPlacement: 'right'
    },
    {
      targetSelector: '[data-tour="tour-interviews"]',
      title: 'Mock Voice Interviews',
      badge: 'PRACTICE / STAGE 02',
      description: 'Practice realistic technical and behavioral interviews with Web Speech audio dictation, speech synthesis, and real-time AI scoring.',
      preferredPlacement: 'right'
    },
    {
      targetSelector: '[data-tour="tour-daily-drill"]',
      title: 'Daily Technical Drills',
      badge: 'PRACTICE / STAGE 03',
      description: 'Sharpen your engineering fundamentals every day to earn XP, maintain your study streak, and stay interview-ready.',
      preferredPlacement: 'right'
    },
    {
      targetSelector: '[data-tour="tour-jd-match"]',
      title: 'Job Description Match Audit',
      badge: 'GET HIRED / STAGE 01',
      description: 'Compare your active resume profile against target job descriptions to identify stack gaps, match percentage, and customized interview prep.',
      preferredPlacement: 'right'
    },
    {
      targetSelector: '[data-tour="tour-outreach"]',
      title: 'Recruiter Outreach Suite',
      badge: 'GET HIRED / STAGE 02',
      description: 'Generate high-converting, personalized cold emails and LinkedIn pitches tailored for Recruiters, Engineering Managers, and Founders.',
      preferredPlacement: 'right'
    },
    {
      targetSelector: '[data-tour="tour-portfolio"]',
      title: 'Public Developer Portfolio',
      badge: 'GET HIRED / STAGE 03',
      description: 'Share your verified public portfolio (/p/:username) with hiring managers to showcase your stack mastery, projects, and career milestones.',
      preferredPlacement: 'right'
    },
    {
      targetSelector: '[data-tour="tour-compensation"]',
      title: 'Salary & Negotiation Copilot',
      badge: 'CAREER / STAGE 01',
      description: 'Benchmark base, equity, and total compensation percentiles and generate tailored counter-offer negotiation scripts.',
      preferredPlacement: 'right'
    },
    {
      targetSelector: '[data-tour="tour-career-badge"]',
      title: 'Verified Career Badge',
      badge: 'CAREER / STAGE 02',
      description: 'Earn and showcase your verified VertexPath career credential badge on LinkedIn, GitHub repositories, and resumes.',
      preferredPlacement: 'right'
    },
    {
      targetSelector: '[data-tour="tour-profile"]',
      title: 'Developer Career Profile',
      badge: 'SYSTEM / PROFILE',
      description: 'Configure your target career roles, primary tech stack, years of experience, and platform preferences.',
      preferredPlacement: 'right'
    }
  ];

  const updateTargetPosition = useCallback(() => {
    if (!isOpen) return;
    const current = steps[currentStep];
    if (!current) return;

    const el = document.querySelector(current.targetSelector);
    
    // Clear previous highlight
    if (activeElementRef.current && activeElementRef.current !== el) {
      activeElementRef.current.classList.remove('tour-highlight-active');
    }

    if (el) {
      if (current.targetSelector !== '[data-tour="tour-quick-actions"]') {
        el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
      }
      el.classList.add('tour-highlight-active');
      activeElementRef.current = el;
      const rect = el.getBoundingClientRect();
      setTargetRect(rect);
    } else {
      setTargetRect(null);
    }
  }, [isOpen, currentStep]);

  const cleanupHighlight = () => {
    if (activeElementRef.current) {
      activeElementRef.current.classList.remove('tour-highlight-active');
      activeElementRef.current = null;
    }
    document.querySelectorAll('.tour-highlight-active').forEach(node => {
      node.classList.remove('tour-highlight-active');
    });
  };

  useEffect(() => {
    const hasCompleted = localStorage.getItem('vertexpath_tour_completed');
    if (!hasCompleted && location.pathname === '/dashboard') {
      const timer = setTimeout(() => {
        setIsOpen(true);
        setCurrentStep(0);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [location.pathname]);

  // Handle manual trigger event
  useEffect(() => {
    const handleStartTour = () => {
      if (location.pathname !== '/dashboard') {
        navigate('/dashboard');
      }
      setIsOpen(true);
      setCurrentStep(0);
    };

    window.addEventListener('startVertexTour', handleStartTour);
    return () => window.removeEventListener('startVertexTour', handleStartTour);
  }, [location.pathname, navigate]);

  // Position recalculation
  useEffect(() => {
    if (isOpen) {
      updateTargetPosition();
      const timer = setTimeout(updateTargetPosition, 100);
      const timer2 = setTimeout(updateTargetPosition, 300);

      window.addEventListener('resize', updateTargetPosition);
      window.addEventListener('scroll', updateTargetPosition, true);

      return () => {
        clearTimeout(timer);
        clearTimeout(timer2);
        window.removeEventListener('resize', updateTargetPosition);
        window.removeEventListener('scroll', updateTargetPosition, true);
      };
    } else {
      cleanupHighlight();
    }
  }, [isOpen, currentStep, updateTargetPosition]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
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
    cleanupHighlight();
    localStorage.setItem('vertexpath_tour_completed', 'true');
    setIsOpen(false);
  };

  const handleComplete = () => {
    cleanupHighlight();
    localStorage.setItem('vertexpath_tour_completed', 'true');
    setIsOpen(false);
  };

  if (!isOpen) return null;

  const current = steps[currentStep];
  if (!current) return null;

  const popoverWidth = Math.min(360, window.innerWidth - 32);
  const popoverHeight = 210;
  const arrowSize = 12;

  let popoverTop = window.innerHeight / 2 - popoverHeight / 2;
  let popoverLeft = window.innerWidth / 2 - popoverWidth / 2;
  let arrowSide: 'left' | 'right' | 'top' | 'bottom' = 'left';
  let arrowOffset = 24;

  if (targetRect) {
    const placement = current.preferredPlacement;

    if (placement === 'right') {
      popoverLeft = targetRect.right + arrowSize + 4;
      popoverTop = targetRect.top + (targetRect.height / 2) - (popoverHeight / 2);
      arrowSide = 'left';

      const clampedTop = Math.max(16, Math.min(window.innerHeight - popoverHeight - 16, popoverTop));
      const targetCenterY = targetRect.top + targetRect.height / 2;
      arrowOffset = Math.max(16, Math.min(popoverHeight - 28, targetCenterY - clampedTop - arrowSize / 2));
      popoverTop = clampedTop;
    } else if (placement === 'bottom') {
      popoverTop = targetRect.bottom + arrowSize + 4;
      popoverLeft = targetRect.left + (targetRect.width / 2) - (popoverWidth / 2);
      arrowSide = 'top';

      const clampedLeft = Math.max(16, Math.min(window.innerWidth - popoverWidth - 16, popoverLeft));
      const targetCenterX = targetRect.left + targetRect.width / 2;
      arrowOffset = Math.max(16, Math.min(popoverWidth - 28, targetCenterX - clampedLeft - arrowSize / 2));
      popoverLeft = clampedLeft;
    } else if (placement === 'top') {
      popoverTop = targetRect.top - popoverHeight - arrowSize - 4;
      popoverLeft = targetRect.left + (targetRect.width / 2) - (popoverWidth / 2);
      arrowSide = 'bottom';

      const clampedLeft = Math.max(16, Math.min(window.innerWidth - popoverWidth - 16, popoverLeft));
      const targetCenterX = targetRect.left + targetRect.width / 2;
      arrowOffset = Math.max(16, Math.min(popoverWidth - 28, targetCenterX - clampedLeft - arrowSize / 2));
      popoverLeft = clampedLeft;
    }
  }

  return (
    <div className="fixed inset-0 z-50 pointer-events-none select-none">
      
      {/* Dark overlay with crisp contrast */}
      <div 
        className="fixed inset-0 bg-[#09090B]/75 pointer-events-auto transition-opacity duration-300"
        onClick={handleSkip}
      />

      {/* Popover Card */}
      <div
        className="fixed pointer-events-auto z-50 bg-[#15161C] border border-[#8B5CF6]/50 rounded-xl p-5 shadow-[0_12px_48px_rgba(0,0,0,0.9),0_0_24px_rgba(139,92,246,0.25)] space-y-3.5 animate-in fade-in zoom-in-95 duration-200"
        style={{
          top: `${popoverTop}px`,
          left: `${popoverLeft}px`,
          width: `${popoverWidth}px`
        }}
      >
        {/* Pointer Arrow */}
        {arrowSide === 'left' && (
          <div
            className="absolute w-0 h-0 pointer-events-none"
            style={{
              left: `-${arrowSize + 2}px`,
              top: `${arrowOffset}px`,
              borderTop: `${arrowSize}px solid transparent`,
              borderBottom: `${arrowSize}px solid transparent`,
              borderRight: `${arrowSize + 2}px solid rgba(139,92,246,0.5)`,
            }}
          >
            <div
              className="absolute w-0 h-0"
              style={{
                left: '1px',
                top: `-${arrowSize}px`,
                borderTop: `${arrowSize}px solid transparent`,
                borderBottom: `${arrowSize}px solid transparent`,
                borderRight: `${arrowSize}px solid #15161C`,
              }}
            />
          </div>
        )}

        {arrowSide === 'top' && (
          <div
            className="absolute w-0 h-0 pointer-events-none"
            style={{
              top: `-${arrowSize + 2}px`,
              left: `${arrowOffset}px`,
              borderLeft: `${arrowSize}px solid transparent`,
              borderRight: `${arrowSize}px solid transparent`,
              borderBottom: `${arrowSize + 2}px solid rgba(139,92,246,0.5)`,
            }}
          >
            <div
              className="absolute w-0 h-0"
              style={{
                top: '1px',
                left: `-${arrowSize}px`,
                borderLeft: `${arrowSize}px solid transparent`,
                borderRight: `${arrowSize}px solid transparent`,
                borderBottom: `${arrowSize}px solid #15161C`,
              }}
            />
          </div>
        )}

        {arrowSide === 'bottom' && (
          <div
            className="absolute w-0 h-0 pointer-events-none"
            style={{
              bottom: `-${arrowSize + 2}px`,
              left: `${arrowOffset}px`,
              borderLeft: `${arrowSize}px solid transparent`,
              borderRight: `${arrowSize}px solid transparent`,
              borderTop: `${arrowSize + 2}px solid rgba(139,92,246,0.5)`,
            }}
          >
            <div
              className="absolute w-0 h-0"
              style={{
                bottom: '1px',
                left: `-${arrowSize}px`,
                borderLeft: `${arrowSize}px solid transparent`,
                borderRight: `${arrowSize}px solid transparent`,
                borderTop: `${arrowSize}px solid #15161C`,
              }}
            />
          </div>
        )}

        {/* Card Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-[#8B5CF6] animate-pulse" />
            <span className="text-[10px] font-mono font-bold uppercase text-[#A78BFA] tracking-wider">
              {current.badge}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-[#71717A] font-semibold">
              {currentStep + 1} / {steps.length}
            </span>
            <button
              onClick={handleSkip}
              className="text-[#71717A] hover:text-[#F4F4F5] p-1 rounded-md hover:bg-[#111318] cursor-pointer transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Card Title & Content */}
        <div className="space-y-1.5">
          <h4 className="text-sm font-bold text-[#F4F4F5] tracking-tight leading-snug">
            {current.title}
          </h4>
          <p className="text-xs text-[#A1A1AA] leading-relaxed">
            {current.description}
          </p>
        </div>

        {/* Step Progress & Buttons */}
        <div className="flex items-center justify-between pt-2 border-t border-[#25262D]">
          <button
            onClick={handleSkip}
            className="text-[11px] font-medium text-[#71717A] hover:text-[#A1A1AA] cursor-pointer transition-colors"
          >
            Skip
          </button>

          <div className="flex items-center gap-2">
            {currentStep > 0 && (
              <button
                onClick={handlePrev}
                className="px-2.5 py-1.5 bg-[#111318] hover:bg-[#25262D] text-[#F4F4F5] text-xs font-semibold rounded-lg border border-[#25262D] cursor-pointer transition-colors"
              >
                Back
              </button>
            )}

            <button
              onClick={handleNext}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-xs font-semibold rounded-lg shadow-sm hover:shadow-[0_0_15px_rgba(139,92,246,0.35)] cursor-pointer active:scale-95 transition-all"
            >
              <span>{currentStep === steps.length - 1 ? "Finish Tour" : "Next"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
