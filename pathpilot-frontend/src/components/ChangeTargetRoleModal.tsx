import React, { useState } from 'react';
import { Target, AlertTriangle, ArrowRight, RotateCcw, Check, X, Sparkles } from 'lucide-react';
import { api } from '../services/api';

interface ChangeTargetRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentRole: string;
  onRoleChanged: (newRole: string) => void;
}

const POPULAR_ROLES = [
  { id: 'fullstack', name: 'Full Stack Developer', icon: '💻', desc: 'React, Node, Spring Boot, Databases' },
  { id: 'ai-ml', name: 'AI / ML Engineer', icon: '🤖', desc: 'LLMs, PyTorch, LangChain, Vector DBs' },
  { id: 'frontend', name: 'Frontend Developer', icon: '🎨', desc: 'React, TypeScript, Next.js, UI/UX' },
  { id: 'backend', name: 'Backend Developer', icon: '⚙️', desc: 'Java, Microservices, Distributed Systems' },
  { id: 'devops', name: 'DevOps / Cloud Engineer', icon: '☁️', desc: 'Kubernetes, Docker, CI/CD, AWS' },
  { id: 'mobile', name: 'Mobile Developer', icon: '📱', desc: 'Flutter, React Native, iOS, Android' },
  { id: 'data-scientist', name: 'Data Scientist', icon: '📊', desc: 'Python, Analytics, Machine Learning' },
  { id: 'security', name: 'Cybersecurity Engineer', icon: '🔒', desc: 'AppSec, Penetration Testing, Cloud Sec' },
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

      // 1. Reset all local journey milestone flags to start 0% fresh
      localStorage.setItem('careerGoal', newRole);
      localStorage.setItem(`trackReset_${newRole}`, 'true');
      localStorage.removeItem('projectCompleted');
      localStorage.removeItem('interviewCompleted');
      localStorage.removeItem('codingCompleted');
      localStorage.removeItem('outreachCompleted');
      localStorage.removeItem('compensationCompleted');
      localStorage.removeItem('jobMatchCompleted');

      // 2. Persist new target goal to backend if possible
      try {
        await api.post('/api/user/profile', { careerGoal: newRole });
      } catch (err) {
        console.warn('Backend profile update deferred:', err);
      }

      // 3. Emit global event and invoke callback
      window.dispatchEvent(new Event('careerGoalUpdated'));
      onRoleChanged(newRole);
      onClose();
    } finally {
      setIsSubmitting(false);
      setStep('select');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-[var(--border)] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#8B5CF6]/15 border border-[#8B5CF6]/30 flex items-center justify-center text-[#8B5CF6]">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[var(--text-primary)]">
                {step === 'select' ? 'Change Target Career Goal' : 'Confirm Career Track Switch'}
              </h3>
              <p className="text-[11px] text-[var(--text-muted)]">
                {step === 'select' ? `Current Target: ${currentRole}` : 'Review track impact before switching'}
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

        {/* STEP 1: SELECT NEW ROLE */}
        {step === 'select' && (
          <div className="p-6 overflow-y-auto space-y-5 custom-scrollbar">
            <div>
              <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider block mb-2.5">
                Select Engineering Track
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {POPULAR_ROLES.map((r) => {
                  const isCurrent = r.name.toLowerCase() === currentRole.toLowerCase();
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => handleRoleClick(r.name)}
                      className={`flex items-start gap-3 p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        isCurrent
                          ? 'bg-[#8B5CF6]/10 border-[#8B5CF6] ring-1 ring-[#8B5CF6]/30'
                          : 'bg-[var(--surface)] border-[var(--border)] hover:border-[var(--brand-purple)]/50 hover:bg-[var(--surface)]/80'
                      }`}
                    >
                      <span className="text-xl shrink-0">{r.icon}</span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-[var(--text-primary)] truncate">{r.name}</p>
                          {isCurrent && (
                            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-[#8B5CF6] text-white">
                              Active
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-[var(--text-muted)] mt-0.5 truncate">{r.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Role Input */}
            <form onSubmit={handleCustomSubmit} className="pt-2 border-t border-[var(--border)] space-y-2">
              <label className="text-xs font-semibold text-[var(--text-secondary)]">Or specify a custom role:</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. Distributed Systems Engineer"
                  value={customRoleInput}
                  onChange={(e) => setCustomRoleInput(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs rounded-lg bg-[var(--surface)] border border-[var(--border)] text-[var(--text-primary)] focus:outline-none focus:border-[#8B5CF6]"
                />
                <button
                  type="submit"
                  disabled={!customRoleInput.trim()}
                  className="btn-primary text-xs py-2 px-3.5 disabled:opacity-50"
                >
                  <span>Select</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* STEP 2: ARE YOU SURE WARNING / CONFIRMATION */}
        {step === 'confirm' && (
          <div className="p-6 overflow-y-auto space-y-5 custom-scrollbar">
            
            {/* Warning Alert Box */}
            <div className="p-4 rounded-xl bg-[#F59E0B]/10 border border-[#F59E0B]/30 flex items-start gap-3.5">
              <div className="p-2 rounded-lg bg-[#F59E0B]/20 text-[#F59E0B] shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-[#F59E0B]">
                  Your journey for {currentRole} is not completed yet!
                </h4>
                <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                  Are you sure you want to switch tracks? Changing your goal from <strong className="text-[var(--text-primary)]">{currentRole}</strong> to <strong className="text-[#8B5CF6]">{selectedRole}</strong> will recalibrate your entire learning path.
                </p>
              </div>
            </div>

            {/* What will happen breakdown */}
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4 space-y-3 text-xs">
              <span className="font-bold text-[var(--text-primary)] block text-[11px] uppercase tracking-wider text-[var(--text-muted)]">
                Track Switch Impact:
              </span>
              
              <div className="flex items-start gap-2.5 text-[var(--text-secondary)]">
                <RotateCcw className="w-4 h-4 text-[#EF4444] shrink-0 mt-0.5" />
                <span>
                  <strong className="text-[var(--text-primary)]">Career Profile completion will reset to 0%</strong> so you can track your genuine progress for {selectedRole}.
                </span>
              </div>

              <div className="flex items-start gap-2.5 text-[var(--text-secondary)]">
                <Sparkles className="w-4 h-4 text-[#8B5CF6] shrink-0 mt-0.5" />
                <span>
                  <strong className="text-[var(--text-primary)]">Fresh AI blueprints & roadmaps</strong>: VertexPath will generate new week-by-week syllabi and project architectures specific to {selectedRole}.
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 flex flex-col sm:flex-row gap-2.5 justify-end">
              <button
                type="button"
                onClick={() => setStep('select')}
                className="btn-secondary text-xs py-2 px-4 justify-center"
              >
                Cancel, Keep {currentRole}
              </button>
              <button
                type="button"
                onClick={handleConfirmSwitch}
                disabled={isSubmitting}
                className="btn-primary text-xs py-2 px-4 justify-center bg-gradient-to-r from-[#7C3AED] to-[#6D28D9] shadow-lg shadow-purple-900/30"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Switching...' : `Yes, Switch to ${selectedRole} (Reset to 0%)`}</span>
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
