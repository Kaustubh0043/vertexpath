import React, { useState } from 'react';
import { 
  Target, 
  AlertCircle, 
  ArrowRight, 
  RotateCcw, 
  Check, 
  X, 
  Sparkles, 
  Layers, 
  BrainCircuit, 
  Layout, 
  Server, 
  Cloud, 
  Smartphone, 
  Database, 
  ShieldCheck, 
  ChevronRight 
} from 'lucide-react';
import { api } from '../services/api';

interface ChangeTargetRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentRole: string;
  onRoleChanged: (newRole: string) => void;
}

interface RoleOption {
  id: string;
  name: string;
  icon: React.FC<{ className?: string }>;
  color: string;
  badge: string;
  desc: string;
}

const ROLES: RoleOption[] = [
  {
    id: 'fullstack',
    name: 'Full Stack Developer',
    icon: Layers,
    color: 'from-violet-500/20 to-purple-500/20 text-[#A78BFA] border-[#8B5CF6]/30',
    badge: 'React • Node • SQL • Spring',
    desc: 'End-to-end web architectures, APIs, and modern frontends',
  },
  {
    id: 'ai-ml',
    name: 'AI / ML Engineer',
    icon: BrainCircuit,
    color: 'from-fuchsia-500/20 to-pink-500/20 text-[#F472B6] border-[#EC4899]/30',
    badge: 'LLMs • PyTorch • RAG • Agents',
    desc: 'Generative AI pipelines, model fine-tuning, and vector stores',
  },
  {
    id: 'frontend',
    name: 'Frontend Developer',
    icon: Layout,
    color: 'from-cyan-500/20 to-blue-500/20 text-[#38BDF8] border-[#0284C7]/30',
    badge: 'React • TypeScript • Next.js • Tailwind',
    desc: 'High-performance UI/UX, animations, and state systems',
  },
  {
    id: 'backend',
    name: 'Backend Developer',
    icon: Server,
    color: 'from-emerald-500/20 to-teal-500/20 text-[#34D399] border-[#059669]/30',
    badge: 'Java • Go • Distributed Systems • Redis',
    desc: 'High-concurrency microservices, DB design, and caching',
  },
  {
    id: 'devops',
    name: 'DevOps / Cloud Engineer',
    icon: Cloud,
    color: 'from-sky-500/20 to-indigo-500/20 text-[#60A5FA] border-[#3B82F6]/30',
    badge: 'K8s • Docker • AWS • Terraform',
    desc: 'Infrastructure as code, CI/CD pipelines, and cloud security',
  },
  {
    id: 'mobile',
    name: 'Mobile Developer',
    icon: Smartphone,
    color: 'from-amber-500/20 to-orange-500/20 text-[#FBBF24] border-[#D97706]/30',
    badge: 'Flutter • React Native • iOS • Android',
    desc: 'Cross-platform mobile applications and native integrations',
  },
  {
    id: 'data',
    name: 'Data Scientist',
    icon: Database,
    color: 'from-teal-500/20 to-emerald-500/20 text-[#2DD4BF] border-[#0D9488]/30',
    badge: 'Python • Pandas • ML • Analytics',
    desc: 'Statistical modeling, data warehousing, and predictions',
  },
  {
    id: 'security',
    name: 'Cybersecurity Engineer',
    icon: ShieldCheck,
    color: 'from-rose-500/20 to-red-500/20 text-[#FB7185] border-[#E11D48]/30',
    badge: 'AppSec • PenTesting • Auth • SOC2',
    desc: 'Application vulnerability audits and cloud infrastructure defense',
  },
];

export const ChangeTargetRoleModal: React.FC<ChangeTargetRoleModalProps> = ({
  isOpen,
  onClose,
  currentRole,
  onRoleChanged,
}) => {
  const [step, setStep] = useState<'select' | 'confirm'>('select');
  const [selectedRole, setSelectedRole] = useState<string>(currentRole);
  const [customRoleInput, setCustomRoleInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleRoleClick = (roleName: string) => {
    if (roleName.trim().toLowerCase() === currentRole.trim().toLowerCase()) {
      onClose();
      return;
    }
    setSelectedRole(roleName);
    setStep('confirm');
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customRoleInput.trim()) return;
    handleRoleClick(customRoleInput.trim());
  };

  const handleConfirmSwitch = async () => {
    setIsSubmitting(true);
    try {
      const newRole = selectedRole.trim();

      // Reset all milestone trackers for authentic 0% new journey
      localStorage.setItem('careerGoal', newRole);
      localStorage.setItem(`trackReset_${newRole}`, 'true');
      localStorage.removeItem('projectCompleted');
      localStorage.removeItem('interviewCompleted');
      localStorage.removeItem('codingCompleted');
      localStorage.removeItem('outreachCompleted');
      localStorage.removeItem('compensationCompleted');
      localStorage.removeItem('jobMatchCompleted');

      // Persist to backend database
      try {
        await api.post('/api/user/profile', { careerGoal: newRole });
      } catch (err) {
        console.warn('Backend profile update deferred:', err);
      }

      window.dispatchEvent(new Event('careerGoalUpdated'));
      onRoleChanged(newRole);
      onClose();
    } finally {
      setIsSubmitting(false);
      setStep('select');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header Bar */}
        <div className="px-6 py-4.5 border-b border-[var(--border)] flex items-center justify-between bg-[var(--surface)]/40">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#7C3AED]/30 to-[#8B5CF6]/10 border border-[#8B5CF6]/30 flex items-center justify-center text-[#8B5CF6] shrink-0">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[var(--text-primary)] font-display tracking-tight">
                {step === 'select' ? 'Select Target Career Track' : 'Confirm Track Calibration'}
              </h3>
              <p className="text-[11px] text-[var(--text-muted)]">
                {step === 'select' ? (
                  <>Active Goal: <span className="font-semibold text-[#8B5CF6]">{currentRole}</span></>
                ) : (
                  'Review track transition and progress recalibration'
                )}
              </p>
            </div>
          </div>
          
          <button
            onClick={() => {
              setStep('select');
              onClose();
            }}
            className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface)] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* STEP 1: SELECT ENGINEERING TRACK */}
        {step === 'select' && (
          <div className="p-6 overflow-y-auto space-y-5 custom-scrollbar">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {ROLES.map((r) => {
                const isCurrent = r.name.toLowerCase() === currentRole.toLowerCase();
                const IconComponent = r.icon;

                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => handleRoleClick(r.name)}
                    className={`group relative flex items-start gap-3.5 p-3.5 rounded-xl border text-left transition-all duration-150 cursor-pointer ${
                      isCurrent
                        ? 'bg-[#8B5CF6]/10 border-[#8B5CF6] shadow-sm'
                        : 'bg-[var(--surface)]/50 border-[var(--border)] hover:border-[#8B5CF6]/40 hover:bg-[var(--surface)]'
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-lg bg-gradient-to-tr ${r.color} border flex items-center justify-center shrink-0`}>
                      <IconComponent className="w-4.5 h-4.5" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <p className="text-xs font-bold text-[var(--text-primary)] truncate group-hover:text-[#8B5CF6] transition-colors">
                          {r.name}
                        </p>
                        {isCurrent ? (
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-[#8B5CF6] text-white font-semibold">
                            Current
                          </span>
                        ) : (
                          <ChevronRight className="w-3.5 h-3.5 text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition-opacity" />
                        )}
                      </div>
                      <span className="text-[10px] font-mono text-[var(--text-muted)] block mt-0.5 truncate">
                        {r.badge}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Custom Track Form */}
            <form onSubmit={handleCustomSubmit} className="pt-3 border-t border-[var(--border)] space-y-2">
              <span className="text-[11px] font-medium text-[var(--text-secondary)] block">
                Targeting a specialized domain?
              </span>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. Distributed Systems & Core Java Architect"
                  value={customRoleInput}
                  onChange={(e) => setCustomRoleInput(e.target.value)}
                  className="flex-1 px-3.5 py-2 text-xs rounded-xl bg-[var(--surface)] border border-[var(--border)] text-[var(--text-primary)] focus:outline-none focus:border-[#8B5CF6] transition-colors"
                />
                <button
                  type="submit"
                  disabled={!customRoleInput.trim()}
                  className="btn-primary text-xs py-2 px-4 shrink-0 disabled:opacity-40"
                >
                  <span>Select Track</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* STEP 2: PROFESSIONAL CONFIRMATION SCREEN */}
        {step === 'confirm' && (
          <div className="p-6 overflow-y-auto space-y-5 custom-scrollbar">
            
            {/* Track Comparison Header */}
            <div className="p-4 rounded-xl bg-[var(--surface)]/70 border border-[var(--border)] flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
              <div className="space-y-0.5">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-muted)]">Current Track</span>
                <p className="text-xs font-bold text-[var(--text-primary)]">{currentRole}</p>
              </div>

              <div className="w-8 h-8 rounded-full bg-[#8B5CF6]/15 border border-[#8B5CF6]/30 flex items-center justify-center text-[#8B5CF6] shrink-0 rotate-90 sm:rotate-0">
                <ArrowRight className="w-4 h-4" />
              </div>

              <div className="space-y-0.5">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#8B5CF6]">New Target Track</span>
                <p className="text-xs font-bold text-[#8B5CF6]">{selectedRole}</p>
              </div>
            </div>

            {/* Warning Alert Banner */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-transparent border border-amber-500/30 flex items-start gap-3.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                <AlertCircle className="w-4.5 h-4.5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-amber-300">
                  Your journey for {currentRole} is not completed yet.
                </h4>
                <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                  Switching targets will recalibrate your developer workflow. Your current milestone progress will be reset so you can begin tracking your genuine roadmap for <strong className="text-[var(--text-primary)]">{selectedRole}</strong>.
                </p>
              </div>
            </div>

            {/* Transition Details */}
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-[var(--surface)]/40 border border-[var(--border)]">
                <RotateCcw className="w-4 h-4 text-[#EF4444] shrink-0" />
                <span className="text-[var(--text-secondary)]">
                  <strong className="text-[var(--text-primary)]">Career Profile Completion resets to 0%</strong> (Fresh 7-step journey).
                </span>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-[var(--surface)]/40 border border-[var(--border)]">
                <Sparkles className="w-4 h-4 text-[#8B5CF6] shrink-0" />
                <span className="text-[var(--text-secondary)]">
                  <strong className="text-[var(--text-primary)]">Personalized Syllabi & Architectures</strong> will calibrate for {selectedRole}.
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 flex flex-col-reverse sm:flex-row gap-2.5 justify-end">
              <button
                type="button"
                onClick={() => setStep('select')}
                className="btn-secondary text-xs py-2.5 px-4 justify-center"
              >
                Keep Current Track
              </button>
              
              <button
                type="button"
                onClick={handleConfirmSwitch}
                disabled={isSubmitting}
                className="btn-primary text-xs py-2.5 px-5 justify-center font-semibold bg-gradient-to-r from-[#7C3AED] to-[#6D28D9] shadow-lg shadow-purple-950/40"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Switching...' : `Confirm & Begin 0% Journey`}</span>
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
