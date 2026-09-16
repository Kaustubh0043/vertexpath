import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const activeElementRef = useRef<Element | null>(null);

  const steps: TourStep[] = [
    {
      targetSelector: '[data-tour="tour-quick-actions"]',
      title: 'Global Command Palette (Ctrl + K)',
      badge: 'TOP SHORTCUT',
      description: 'Press Ctrl + K from anywhere on VertexPath to search tools, jump between pages, or copy your public portfolio link instantly.',
      preferredPlacement: 'bottom'
    },
    {
      targetSelector: '[data-tour="tour-route-tracker"]',
      title: 'Career Route Tracker',
      badge: 'CAREER TIMELINE',
      description: 'Your career milestones dynamically light up as you complete real actions. Click on any milestone node to instantly jump to that module.',
      preferredPlacement: 'bottom'
    },
    {
      targetSelector: '[data-tour="tour-resume"]',
      title: 'Meet Resume & ATS Optimizer',
      badge: 'STAGE 01 / PROFILE',
      description: 'Score your resume against high-bar ATS filters and generate metrics-driven bullet alternatives formatted with Google XYZ formula.',
      preferredPlacement: 'right'
    },
    {
      targetSelector: '[data-tour="tour-roadmaps"]',
      title: 'Learning Paths & Syllabi',
      badge: 'STAGE 02 / FOUNDATION',
      description: 'Generate customized 4-week learning roadmaps tailored to your target engineering domain with 1-click printable PDF exports.',
      preferredPlacement: 'right'
    },
    {
      targetSelector: '[data-tour="tour-interviews"]',
      title: 'Mock Voice Interviews',
      badge: 'STAGE 03 / PREPARATION',
      description: 'Practice real-time technical and behavioral interviews with Web Speech audio reading and AI evaluation scores.',
      preferredPlacement: 'right'
    },
    {
      targetSelector: '[data-tour="tour-coding"]',
      title: 'Live Code Challenge IDE',
      badge: 'STAGE 03 / CODING',
      description: 'Write solutions in our Monaco-style dark IDE and receive automated Time O(N) & Space O(1) complexity audits with optimal refactors.',
      preferredPlacement: 'right'
    },
    {
      targetSelector: '[data-tour="tour-outreach"]',
      title: 'Recruiter Outreach & DM Suite',
      badge: 'STAGE 04 / CONVERSION',
      description: 'Craft personalized cold DMs for Recruiters, Engineering Managers, and Founders to maximize interview response rates.',
      preferredPlacement: 'right'
    },
    {
      targetSelector: '[data-tour="tour-compensation"]',
      title: 'Salary & Negotiation Copilot',
      badge: 'STAGE 04 / NEGOTIATION',
      description: 'Benchmark base, equity, and bonus compensation percentiles and generate tailored counter-offer email scripts.',
      preferredPlacement: 'right'
    },
    {
      targetSelector: '[data-tour="tour-portfolio"]',
      title: 'Public Developer Portfolio',
      badge: 'PROFILE / SHOWCASE',
      description: 'Share your verified public developer portfolio (/p/:username) directly with recruiters and hiring managers.',
      preferredPlacement: 'right'
    }
  ];

  const updateTargetPosition = useCallback(() => {
    if (!isOpen) return;
    const current = steps[currentStep];
    const el = document.querySelector(current.targetSelector);
    
    // Clear previous highlight
    if (activeElementRef.current && activeElementRef.current !== el) {
      activeElementRef.current.classList.remove('tour-highlight-active');
    }

    if (el) {
      // Don't scroll sticky header buttons, scroll body items smoothly
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
    if (!hasCompleted) {
      const timer = setTimeout(() => setIsOpen(true), 900);
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
      const interval = setInterval(updateTargetPosition, 250);
      window.addEventListener('resize', updateTargetPosition);
      window.addEventListener('scroll', updateTargetPosition, true);
      return () => {
        clearInterval(interval);
        window.removeEventListener('resize', updateTargetPosition);
        window.removeEventListener('scroll', updateTargetPosition, true);
      };
    } else {
      cleanupHighlight();
    }
  }, [isOpen, currentStep, updateTargetPosition]);

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

  // Slack-Style Exact Positioning & Pointer Arrow Math
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
      
      {/* Dark overlay with NO blur */}
      <div 
        className="fixed inset-0 bg-[#07080C]/70 pointer-events-auto transition-opacity duration-300"
        onClick={handleSkip}
      />

      {/* Slack/Userpilot Style Popover Card */}
      <div
        className="fixed pointer-events-auto z-50 bg-[#121620] border-2 border-[#9B5CFF] rounded-2xl p-5 shadow-[0_10px_40px_rgba(0,0,0,0.8),0_0_30px_rgba(155,92,255,0.3)] space-y-3.5 animate-in fade-in zoom-in-95 duration-200"
        style={{
          top: `${popoverTop}px`,
          left: `${popoverLeft}px`,
          width: `${popoverWidth}px`
        }}
      >
        {/* Crisp Triangular Pointer Arrow touching target */}
        {arrowSide === 'left' && (
          <div
            className="absolute w-0 h-0 pointer-events-none"
            style={{
              left: `-${arrowSize + 2}px`,
              top: `${arrowOffset}px`,
              borderTop: `${arrowSize}px solid transparent`,
              borderBottom: `${arrowSize}px solid transparent`,
              borderRight: `${arrowSize + 2}px solid #9B5CFF`,
            }}
          >
            <div
              className="absolute w-0 h-0"
              style={{
                left: '2px',
                top: `-${arrowSize}px`,
                borderTop: `${arrowSize}px solid transparent`,
                borderBottom: `${arrowSize}px solid transparent`,
                borderRight: `${arrowSize}px solid #121620`,
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
              borderBottom: `${arrowSize + 2}px solid #9B5CFF`,
            }}
          >
            <div
              className="absolute w-0 h-0"
              style={{
                top: '2px',
                left: `-${arrowSize}px`,
                borderLeft: `${arrowSize}px solid transparent`,
                borderRight: `${arrowSize}px solid transparent`,
                borderBottom: `${arrowSize}px solid #121620`,
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
              borderTop: `${arrowSize + 2}px solid #9B5CFF`,
            }}
          >
            <div
              className="absolute w-0 h-0"
              style={{
                bottom: '2px',
                left: `-${arrowSize}px`,
                borderLeft: `${arrowSize}px solid transparent`,
                borderRight: `${arrowSize}px solid transparent`,
                borderTop: `${arrowSize}px solid #121620`,
              }}
            />
          </div>
        )}

        {/* Card Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#9B5CFF] animate-pulse" />
            <span className="text-[10px] font-mono font-extrabold uppercase text-[#C49AFF] tracking-wider">
              {current.badge}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-slate-400 font-bold">
              {currentStep + 1} of {steps.length}
            </span>
            <button
              onClick={handleSkip}
              className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800/60 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Card Title & Content */}
        <div className="space-y-1.5">
          <h4 className="text-base font-extrabold text-[#F4F1EA] tracking-tight leading-snug">
            {current.title}
          </h4>
          <p className="text-xs text-[#9299A8] leading-relaxed">
            {current.description}
          </p>
        </div>

        {/* Step Progress & Buttons */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
          <button
            onClick={handleSkip}
            className="text-[11px] font-semibold text-slate-400 hover:text-slate-200 cursor-pointer"
          >
            Skip
          </button>

          <div className="flex items-center gap-2">
            {currentStep > 0 && (
              <button
                onClick={handlePrev}
                className="px-2.5 py-1.5 bg-[#1A202C] hover:bg-slate-700 text-[#F4F1EA] text-xs font-bold rounded-lg cursor-pointer"
              >
                Back
              </button>
            )}

            <button
              onClick={handleNext}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-[#9B5CFF] hover:bg-[#A86FFF] text-[#07080C] text-xs font-extrabold rounded-lg shadow-[0_0_20px_rgba(155,92,255,0.4)] cursor-pointer active:scale-95 transition-all"
            >
              <span>{currentStep === steps.length - 1 ? "Let's Go! 🚀" : "Next"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};