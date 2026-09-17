import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  ArrowRight, 
  FileText, 
  Map, 
  Cpu, 
  UserCheck, 
  Terminal, 
  Zap, 
  FileCheck, 
  Mail, 
  DollarSign, 
  Compass, 
  Award, 
  CheckCircle2, 
  ChevronDown, 
  Sparkles, 
  X, 
  Check 
} from 'lucide-react';
import logoImg from '../assets/logo.png';
import { ThemeToggle } from '../components/ThemeToggle';

export const Landing: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // FAQ Accordion State
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  // Modals
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [activeModalTab, setActiveModalTab] = useState<'terms' | 'privacy'>('terms');

  // Contact Form state
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactSuccess, setContactSuccess] = useState(false);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactEmail.trim() || !contactMessage.trim()) return;
    setContactSuccess(true);
    setTimeout(() => {
      setContactName('');
      setContactEmail('');
      setContactMessage('');
      setContactSuccess(false);
    }, 4000);
  };

  const featureSections = [
    {
      category: 'BUILD YOUR PATH',
      tagline: 'Build the foundation of your developer career.',
      features: [
        {
          title: 'Resume & ATS Optimizer',
          desc: 'Audit your resume against high-bar ATS filters and generate metrics-driven Google XYZ bullet rewrites.',
          icon: FileText,
          link: '/dashboard/resume'
        },
        {
          title: 'Learning Paths & Syllabi',
          desc: 'Generate customized week-by-week curriculum roadmaps with estimated hours and 1-click printable PDF exports.',
          icon: Map,
          link: '/dashboard/roadmaps'
        },
        {
          title: 'Project Architect',
          desc: 'Synthesize production-ready folder layouts, database relational schemas (SQL/NoSQL), and REST endpoint blueprints.',
          icon: Cpu,
          link: '/dashboard/projects'
        }
      ]
    },
    {
      category: 'PRACTICE',
      tagline: 'Build technical confidence through deliberate practice.',
      features: [
        {
          title: 'Live Code Challenge IDE',
          desc: 'In-browser dark Monaco-style editor with automated Time O(N) and Space O(1) complexity audits and optimal refactors.',
          icon: Terminal,
          link: '/dashboard/coding'
        },
        {
          title: 'Mock Voice Interviews',
          desc: 'Practice technical screenings with Web Speech audio reading, live voice dictation, and strict architectural grading.',
          icon: UserCheck,
          link: '/dashboard/interviews'
        },
        {
          title: 'Daily Technical Drills',
          desc: '5-minute scenario drills covering distributed caching, concurrency, and system architecture to boost XP and streaks.',
          icon: Zap,
          link: '/dashboard'
        }
      ]
    },
    {
      category: 'GET HIRED',
      tagline: 'Turn your preparation into a real job search.',
      features: [
        {
          title: 'JD Compatibility Match',
          desc: 'Compare your resume against any target job description to highlight missing tech keywords and interview prep topics.',
          icon: FileCheck,
          link: '/dashboard/jd-match'
        },
        {
          title: 'Outreach Copilot',
          desc: 'Instantly generate 3 targeted cold DMs for Recruiters, Engineering Managers, and Founders to maximize response rates.',
          icon: Mail,
          link: '/dashboard/outreach'
        },
        {
          title: 'Public Developer Portfolio',
          desc: 'Showcase your verified skill profile, project blueprints, and roadmap certificates at a standalone public URL.',
          icon: Compass,
          link: '/p/developer'
        }
      ]
    },
    {
      category: 'CAREER & NEGOTIATION',
      tagline: 'Track progress and make informed career decisions.',
      features: [
        {
          title: 'Salary & Negotiation Copilot',
          desc: 'Benchmark 25th, 50th, 75th, and 90th percentile total compensation and generate tailored counter-offer email scripts.',
          icon: DollarSign,
          link: '/dashboard/compensation'
        },
        {
          title: 'Verified Career Badge',
          desc: 'Earn dark-mode certified readiness badges with 1-click Markdown embed code for GitHub READMEs and LinkedIn sharing.',
          icon: Award,
          link: '/dashboard'
        }
      ]
    }
  ];

  const faqs = [
    {
      q: 'What is VertexPath?',
      a: 'VertexPath is a complete Developer Career Operating System that unifies resume optimization, roadmaps, project blueprints, live coding challenges, voice mock interviews, and compensation negotiation into a single focused workspace.'
    },
    {
      q: 'How does the Google XYZ Resume Optimizer work?',
      a: 'It restructures passive bullet points into the format: "Accomplished [X], as measured by [Y], by doing [Z]" to produce metric-driven, impact-focused statements favored by top tech hiring teams.'
    },
    {
      q: 'Are the AI evaluations private and secure?',
      a: 'Yes. Your uploaded resumes, mock interview transcripts, and code submissions are processed securely through dedicated enterprise AI pipelines and stored in your private account database.'
    },
    {
      q: 'Can I share my public portfolio without forcing viewers to log in?',
      a: 'Yes. Public portfolios (/p/:username) are fully open and indexable, allowing recruiters to review your verified skills and project blueprints with 1 click.'
    }
  ];

  return (
    <div className="relative min-h-screen text-[var(--text-primary)] flex flex-col bg-[var(--bg-primary)] transition-colors duration-200">
      
      {/* 1. Header Navigation (Section 6) */}
      <header className="sticky top-0 z-40 w-full border-b border-[var(--border)] bg-[var(--bg-primary)]/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <img src={logoImg} alt="VertexPath Logo" className="w-7 h-7 object-contain" />
            <span className="text-base font-bold tracking-tight text-[var(--text-primary)] font-display">VertexPath</span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-xs font-medium text-[var(--text-secondary)]">
            <a href="#features" className="hover:text-[var(--text-primary)] transition-colors">Features</a>
            <a href="#journey" className="hover:text-[var(--text-primary)] transition-colors">How It Works</a>
            <a href="#faq" className="hover:text-[var(--text-primary)] transition-colors">FAQ</a>
            <a href="#contact" className="hover:text-[var(--text-primary)] transition-colors">Contact</a>
          </nav>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            {user ? (
              <button
                onClick={() => navigate('/dashboard')}
                className="btn-primary text-xs"
              >
                <span>Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <>
                <button
                  onClick={() => navigate('/auth')}
                  className="text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors px-2 py-1 cursor-pointer"
                >
                  Sign In
                </button>
                <button
                  onClick={() => navigate('/auth?mode=signup')}
                  className="btn-primary text-xs"
                >
                  <span>Get Started →</span>
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* 2. Hero Section (Section 6) */}
      <section className="relative w-full max-w-6xl mx-auto px-6 pt-24 pb-20 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        {/* Left Headline Column */}
        <div className="lg:col-span-7 space-y-6 text-left">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[var(--card)] border border-[var(--border)]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#8B5CF6]" />
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--text-secondary)]">
              Career Operating System
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-[1.05] tracking-tight font-display text-[var(--text-primary)]">
            YOUR CAREER<br />ISN'T A STRAIGHT LINE.
          </h1>

          <p className="text-base sm:text-lg text-[var(--brand-purple)] font-medium">
            Build skills. Ship projects. Practice interviews. Get hired.
          </p>

          <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed max-w-lg">
            VertexPath brings your developer career workflow into one intelligent workspace — from building your skills and projects to preparing for interviews and launching your job search.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={() => navigate(user ? '/dashboard' : '/auth?mode=signup')}
              className="btn-primary text-xs sm:text-sm py-2.5 px-5"
            >
              <span>Build My Career Path →</span>
            </button>
            <a
              href="#features"
              className="btn-secondary text-xs sm:text-sm py-2.5 px-5"
            >
              <span>Explore VertexPath</span>
            </a>
          </div>
        </div>

        {/* Right Subtle Career Journey Flow Visual (Section 6) */}
        <div className="lg:col-span-5 card-surface p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
            <span className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-wider">CAREER WORKFLOW</span>
            <span className="text-[10px] text-[#34D399] font-mono font-semibold">● ACTIVE SYSTEM</span>
          </div>

          <div className="space-y-3 relative pl-4 border-l border-[var(--border)]">
            {[
              { stage: 'PROFILE', title: 'Resume & Skill Benchmark', status: 'Completed', icon: '✓', done: true },
              { stage: 'BUILD', title: 'Learning Paths & Project Specs', status: 'Active', icon: '●', active: true },
              { stage: 'PRACTICE', title: 'Voice Mock Interviews & Code IDE', status: 'Ready', icon: '○' },
              { stage: 'GET HIRED', title: 'JD Matching & Recruiter DMs', status: 'Upcoming', icon: '○' },
              { stage: 'GROW', title: 'Salary Analytics & Public Portfolio', status: 'Upcoming', icon: '○' },
            ].map((step, idx) => (
              <div key={idx} className="relative flex items-start gap-3">
                <div className={`absolute -left-[21px] w-4 h-4 rounded-full border flex items-center justify-center text-[9px] font-bold ${
                  step.done 
                    ? 'bg-[#34D399]/20 border-[#34D399] text-[#34D399]'
                    : step.active
                    ? 'bg-[#8B5CF6]/20 border-[#8B5CF6] text-[var(--brand-purple)]'
                    : 'bg-[var(--card)] border-[var(--border)] text-[var(--text-muted)]'
                }`}>
                  {step.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold text-[var(--text-muted)] uppercase">{step.stage}</span>
                    {step.active && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#8B5CF6]/15 text-[var(--brand-purple)] font-mono">
                        Active Stage
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-semibold text-[var(--text-primary)] mt-0.5">{step.title}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </section>

      {/* 3. Structured Feature Sections (Section 7) */}
      <section id="features" className="w-full max-w-6xl mx-auto px-6 py-16 space-y-16">
        
        <div className="space-y-2 text-center max-w-2xl mx-auto">
          <p className="eyebrow-text">MODULAR SUITE</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] tracking-tight">
            Everything you need in one unified workspace.
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
            Feature-rich without being visually busy. Organize your developer preparation into four disciplined stages.
          </p>
        </div>

        <div className="space-y-14">
          {featureSections.map((sec, sIdx) => (
            <div key={sIdx} className="space-y-4">
              <div className="border-b border-[var(--border)] pb-2">
                <span className="text-[11px] font-mono font-bold text-[#8B5CF6] uppercase tracking-wider">
                  {sec.category}
                </span>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">{sec.tagline}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {sec.features.map((feat, fIdx) => {
                  const Icon = feat.icon;
                  return (
                    <div
                      key={fIdx}
                      onClick={() => navigate(user ? feat.link : '/auth?mode=signup')}
                      className="card-surface card-surface-hover p-5 space-y-3 cursor-pointer group flex flex-col justify-between"
                    >
                      <div className="space-y-2.5">
                        <div className="w-8 h-8 rounded-lg bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center text-[#8B5CF6] group-hover:border-[#8B5CF6]/40 transition-colors">
                          <Icon className="w-4 h-4" />
                        </div>
                        <h3 className="text-sm font-semibold text-[var(--text-primary)] tracking-tight group-hover:text-white">
                          {feat.title}
                        </h3>
                        <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                          {feat.desc}
                        </p>
                      </div>

                      <div className="pt-2 flex items-center gap-1 text-[11px] font-semibold text-[#8B5CF6] group-hover:text-[var(--brand-purple)] transition-colors">
                        <span>View module</span>
                        <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

      </section>

      {/* 4. FAQ Section */}
      <section id="faq" className="w-full max-w-4xl mx-auto px-6 py-16 space-y-6">
        <div className="text-center space-y-1">
          <p className="eyebrow-text">FAQ</p>
          <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)]">Frequently Asked Questions</h2>
        </div>

        <div className="space-y-2.5">
          {faqs.map((faq, idx) => (
            <div key={idx} className="card-surface overflow-hidden">
              <button
                onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                className="w-full text-left p-4 flex items-center justify-between text-xs sm:text-sm font-semibold text-[var(--text-primary)] hover:text-[var(--brand-purple)] transition-colors cursor-pointer"
              >
                <span>{faq.q}</span>
                <ChevronDown className={`w-4 h-4 text-[var(--text-muted)] transition-transform duration-200 ${
                  activeFaq === idx ? 'rotate-180 text-[#8B5CF6]' : ''
                }`} />
              </button>
              {activeFaq === idx && (
                <div className="px-4 pb-4 text-xs text-[var(--text-secondary)] leading-relaxed border-t border-[var(--border-subtle)] pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 5. Contact Section */}
      <section id="contact" className="w-full max-w-xl mx-auto px-6 py-16 space-y-4">
        <div className="text-center space-y-1">
          <p className="eyebrow-text">GET IN TOUCH</p>
          <h2 className="text-xl font-bold text-[var(--text-primary)]">Have a question or feedback?</h2>
        </div>

        <form onSubmit={handleContactSubmit} className="card-surface p-6 space-y-3.5">
          <div>
            <label className="text-[10px] font-mono text-[var(--text-muted)] uppercase">Your Name</label>
            <input
              type="text"
              placeholder="Alex Smith"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              className="w-full text-xs mt-1"
            />
          </div>
          <div>
            <label className="text-[10px] font-mono text-[var(--text-muted)] uppercase">Email Address</label>
            <input
              type="email"
              required
              placeholder="alex@example.com"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              className="w-full text-xs mt-1"
            />
          </div>
          <div>
            <label className="text-[10px] font-mono text-[var(--text-muted)] uppercase">Message</label>
            <textarea
              required
              rows={3}
              placeholder="Tell us what you need help with..."
              value={contactMessage}
              onChange={(e) => setContactMessage(e.target.value)}
              className="w-full text-xs mt-1 resize-none"
            />
          </div>

          <button type="submit" className="btn-primary w-full text-xs py-2">
            Send Message
          </button>

          {contactSuccess && (
            <div className="p-2.5 bg-[#34D399]/10 border border-[#34D399]/30 rounded text-xs text-[#34D399] flex items-center gap-2">
              <Check className="w-3.5 h-3.5 shrink-0" />
              <span>Message received! We will get back to you shortly.</span>
            </div>
          )}
        </form>
      </section>

      {/* 6. Footer */}
      <footer className="w-full border-t border-[var(--border)] py-8 bg-[var(--bg-secondary)]">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--text-muted)]">
          <div className="flex items-center gap-2">
            <img src={logoImg} alt="VertexPath Logo" className="w-5 h-5 object-contain" />
            <span className="font-bold text-[var(--text-primary)]">VertexPath</span>
            <span>• Career Operating System for Developers</span>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => {
                setActiveModalTab('terms');
                setShowTermsModal(true);
              }}
              className="hover:text-[var(--text-primary)] transition-colors cursor-pointer"
            >
              Terms
            </button>
            <button 
              onClick={() => {
                setActiveModalTab('privacy');
                setShowTermsModal(true);
              }}
              className="hover:text-[var(--text-primary)] transition-colors cursor-pointer"
            >
              Privacy
            </button>
            <span>© 2026 VertexPath. All rights reserved.</span>
          </div>
        </div>
      </footer>

      {/* Terms & Privacy Modal */}
      {showTermsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[var(--bg-primary)]/80 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
              <div className="flex items-center gap-3">
            <ThemeToggle />
                <button
                  onClick={() => setActiveModalTab('terms')}
                  className={`text-xs font-bold pb-1 cursor-pointer ${
                    activeModalTab === 'terms' ? 'text-[#8B5CF6] border-b-2 border-[#8B5CF6]' : 'text-[var(--text-muted)]'
                  }`}
                >
                  Terms of Service
                </button>
                <button
                  onClick={() => setActiveModalTab('privacy')}
                  className={`text-xs font-bold pb-1 cursor-pointer ${
                    activeModalTab === 'privacy' ? 'text-[#8B5CF6] border-b-2 border-[#8B5CF6]' : 'text-[var(--text-muted)]'
                  }`}
                >
                  Privacy Policy
                </button>
              </div>
              <button 
                onClick={() => setShowTermsModal(false)}
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)] p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-[var(--text-secondary)] space-y-2 max-h-72 overflow-y-auto custom-scrollbar leading-relaxed">
              {activeModalTab === 'terms' ? (
                <>
                  <p className="font-semibold text-[var(--text-primary)]">1. Acceptance of Terms</p>
                  <p>By accessing or using VertexPath, you agree to comply with our standard terms of service regarding developer career data and personal project workflows.</p>
                  <p className="font-semibold text-[var(--text-primary)] mt-2">2. Usage Rights</p>
                  <p>You retain full ownership of your uploaded resumes, generated project specifications, and public portfolio content.</p>
                </>
              ) : (
                <>
                  <p className="font-semibold text-[var(--text-primary)]">1. Data Protection</p>
                  <p>VertexPath processes your uploaded documents strictly for AI career coaching and ATS analysis. We do not sell your personal data or resume information to third parties.</p>
                  <p className="font-semibold text-[var(--text-primary)] mt-2">2. Account Security</p>
                  <p>Authentication utilizes secure OTP verification and industry-standard JWT session tokens.</p>
                </>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};