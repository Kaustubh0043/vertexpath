import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { 
  Compass, 
  ArrowRight, 
  Mail,
  Phone,
  RefreshCw
} from 'lucide-react';
import logoImg from '../assets/logo.png';

export const Landing: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Authenticated database progress state
  const [userStats, setUserStats] = useState<any>(null);

  useEffect(() => {
    if (user) {
      api.get('/api/dashboard/stats')
        .then(res => {
          setUserStats(res.data);
        })
        .catch(err => console.error("Failed to fetch landing stats", err));
    }
  }, [user]);

  const getDotStyle = (node: 'start' | 'resume' | 'skills' | 'projects' | 'interviews' | 'destination') => {
    if (!user) {
      if (node === 'start') return activeSection !== 'hero' ? 'bg-[#55D39A]' : 'bg-slate-800';
      if (node === 'resume') {
        return activeSection === 'resume' ? 'bg-[#9B5CFF] ring-4 ring-[#9B5CFF]/15' :
               ['gaps', 'roadmap', 'blueprint', 'interview', 'destination'].includes(activeSection) ? 'bg-[#55D39A]' : 'bg-slate-800';
      }
      if (node === 'skills') {
        return activeSection === 'gaps' ? 'bg-[#9B5CFF] ring-4 ring-[#9B5CFF]/15' :
               ['roadmap', 'blueprint', 'interview', 'destination'].includes(activeSection) ? 'bg-[#55D39A]' : 'bg-slate-800';
      }
      if (node === 'projects') {
        return ['roadmap', 'blueprint'].includes(activeSection) ? 'bg-[#9B5CFF] ring-4 ring-[#9B5CFF]/15' :
               ['interview', 'destination'].includes(activeSection) ? 'bg-[#55D39A]' : 'bg-slate-800';
      }
      if (node === 'interviews') {
        return activeSection === 'interview' ? 'bg-[#9B5CFF] ring-4 ring-[#9B5CFF]/15' :
               activeSection === 'destination' ? 'bg-[#55D39A]' : 'bg-slate-800';
      }
      return activeSection === 'destination' ? 'bg-[#9B5CFF] ring-4 ring-[#9B5CFF]/15' : 'bg-slate-800';
    }

    const totalDocs = userStats?.totalDocuments || 0;
    const totalSkills = userStats?.totalSkills || 0;
    const totalRoadmaps = userStats?.totalRoadmaps || 0;
    const interviewCompleted = localStorage.getItem('interviewCompleted') === 'true';
    const jobMatchCompleted = localStorage.getItem('jobMatchCompleted') === 'true';

    if (node === 'start') return 'bg-[#55D39A]';
    if (node === 'resume') {
      if (totalDocs > 0) return 'bg-[#55D39A]';
      return 'bg-[#9B5CFF] ring-4 ring-[#9B5CFF]/15';
    }
    if (node === 'skills') {
      if (totalSkills > 0) return 'bg-[#55D39A]';
      if (totalDocs > 0) return 'bg-[#9B5CFF] ring-4 ring-[#9B5CFF]/15';
      return 'bg-slate-800';
    }
    if (node === 'projects') {
      if (totalRoadmaps > 0) return 'bg-[#55D39A]';
      if (totalSkills > 0) return 'bg-[#9B5CFF] ring-4 ring-[#9B5CFF]/15';
      return 'bg-slate-800';
    }
    if (node === 'interviews') {
      if (interviewCompleted) return 'bg-[#55D39A]';
      if (totalRoadmaps > 0) return 'bg-[#9B5CFF] ring-4 ring-[#9B5CFF]/15';
      return 'bg-slate-800';
    }
    if (jobMatchCompleted) return 'bg-[#55D39A]';
    if (interviewCompleted) return 'bg-[#9B5CFF] ring-4 ring-[#9B5CFF]/15';
    return 'bg-slate-800';
  };

  const getNodeOpacity = (node: 'start' | 'resume' | 'skills' | 'projects' | 'interviews' | 'destination') => {
    if (!user) {
      if (node === 'start') return activeSection !== 'hero' ? 'opacity-100' : 'opacity-40';
      if (node === 'resume') return ['resume', 'gaps', 'roadmap', 'blueprint', 'interview', 'destination'].includes(activeSection) ? 'opacity-100' : 'opacity-40';
      if (node === 'skills') return ['gaps', 'roadmap', 'blueprint', 'interview', 'destination'].includes(activeSection) ? 'opacity-100' : 'opacity-40';
      if (node === 'projects') return ['roadmap', 'blueprint', 'interview', 'destination'].includes(activeSection) ? 'opacity-100' : 'opacity-40';
      if (node === 'interviews') return ['interview', 'destination'].includes(activeSection) ? 'opacity-100' : 'opacity-40';
      return activeSection === 'destination' ? 'opacity-100' : 'opacity-40';
    }
    
    const totalDocs = userStats?.totalDocuments || 0;
    const totalSkills = userStats?.totalSkills || 0;
    const totalRoadmaps = userStats?.totalRoadmaps || 0;
    const interviewCompleted = localStorage.getItem('interviewCompleted') === 'true';

    if (node === 'start') return 'opacity-100';
    if (node === 'resume') return 'opacity-100';
    if (node === 'skills') return totalDocs > 0 ? 'opacity-100' : 'opacity-40';
    if (node === 'projects') return totalSkills > 0 ? 'opacity-100' : 'opacity-40';
    if (node === 'interviews') return totalRoadmaps > 0 ? 'opacity-100' : 'opacity-40';
    return interviewCompleted ? 'opacity-100' : 'opacity-40';
  };
  
  // Terms & Privacy Modals (Preserving existing logic)
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [activeModalTab, setActiveModalTab] = useState<'terms' | 'privacy'>('terms');

  // Contact Form states (Preserving existing logic)
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactLoading, setContactLoading] = useState(false);
  const [contactSuccess, setContactSuccess] = useState<string | null>(null);
  const [contactError, setContactError] = useState<string | null>(null);

  // FAQ Accordion State (Preserving existing logic)
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  // --------------------------------------------------
  // Motion and Interactive Scroll States (Points 1, 2, 3, 16)
  // --------------------------------------------------
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeSection, setActiveSection] = useState<'hero' | 'problem' | 'resume' | 'gaps' | 'roadmap' | 'blueprint' | 'interview' | 'destination'>('hero');
  const [resumeScore, setResumeScore] = useState(0);
  const [gapsScore, setGapsScore] = useState(0);
  const [visibleSections, setVisibleSections] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // Immediate entrance trigger
    const t = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    // Respect accessibility settings (Point 16)
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setResumeScore(84);
      setGapsScore(78);
      setVisibleSections({
        problem: true,
        resume: true,
        gaps: true,
        roadmap: true,
        blueprint: true,
        interview: true,
        destination: true,
      });
      return;
    }

    const observerOptions = {
      root: null,
      rootMargin: '-25% 0px -25% 0px',
      threshold: 0.1,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          setVisibleSections(prev => ({ ...prev, [id]: true }));
          
          if (id === 'problem') {
            setActiveSection('problem');
          } else if (id === 'resume') {
            setActiveSection('resume');
            // Animate ATS Score from 0 to 84 (Point 5)
            let currentScore = 0;
            const interval = setInterval(() => {
              currentScore += 3;
              if (currentScore >= 84) {
                setResumeScore(84);
                clearInterval(interval);
              } else {
                setResumeScore(currentScore);
              }
            }, 25);
          } else if (id === 'gaps') {
            setActiveSection('gaps');
            // Animate Job Match Score from 0 to 78 (Point 6)
            let currentScore = 0;
            const interval = setInterval(() => {
              currentScore += 3;
              if (currentScore >= 78) {
                setGapsScore(78);
                clearInterval(interval);
              } else {
                setGapsScore(currentScore);
              }
            }, 25);
          } else if (id === 'roadmap') {
            setActiveSection('roadmap');
          } else if (id === 'blueprint') {
            setActiveSection('blueprint');
          } else if (id === 'interview') {
            setActiveSection('interview');
          } else if (id === 'destination') {
            setActiveSection('destination');
          }
        }
      });
    }, observerOptions);

    const sections = ['problem', 'resume', 'gaps', 'roadmap', 'blueprint', 'interview', 'destination'];
    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setContactLoading(true);
    setContactSuccess(null);
    setContactError(null);

    try {
      await api.post('/api/auth/contact', {
        name: contactName,
        email: contactEmail,
        message: contactMessage
      });
      setContactSuccess('Your message has been sent successfully to the developer inbox!');
      setContactName('');
      setContactEmail('');
      setContactMessage('');
    } catch (err: any) {
      setContactError(
        err.response?.data?.message || 
        'Failed to send message. Please verify your inputs and try again.'
      );
    } finally {
      setContactLoading(false);
    }
  };

  const openModal = (tab: 'terms' | 'privacy') => {
    setActiveModalTab(tab);
    setShowTermsModal(true);
  };

  const faqs = [
    {
      q: 'How does the ATS Resume Analyzer score my profile?',
      a: 'The analyzer processes your uploaded document, extracts key technical stacks, and runs crosschecks against a curated database of core industry job requirements. It evaluates match scores and drafts specific line-by-line recommendations.'
    },
    {
      q: 'What is the RAG Context tool?',
      a: 'RAG (Retrieval-Augmented Generation) allows you to index your own local files (PDF lectures, study notes, slide decks). The Career Coach references this data directly during conversations to answer questions based only on your uploads.'
    },
    {
      q: 'How does Project Architect work?',
      a: 'When you specify your target features and tech stacks, the AI generator maps out modular file trees, database relational schemas (SQL/NoSQL), and controller endpoint boilerplate structures to jumpstart your development sandbox.'
    },
    {
      q: 'Why are interview mock scores strict?',
      a: 'To prepare you for actual screenings, the AI interviewer checks response completeness. Lax, short, or ambiguous answers are graded stringently to encourage comprehensive explanations of technical problems.'
    }
  ];

  return (
    <div className="relative min-h-screen text-[#F4F1EA] flex flex-col overflow-hidden selection:bg-[#9B5CFF]/30 selection:text-[#C49AFF] bg-[#07080C]">
      
      {/* Navbar (Point 9, 2) */}
      <header className={`relative z-10 w-full max-w-7xl mx-auto px-6 md:px-12 h-24 flex items-center justify-between border-b border-slate-900 bg-[#07080C]/40 backdrop-blur-md transition-all duration-700 ${
        isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
      }`}>
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => navigate('/')}>
          <img src={logoImg} alt="VertexPath Logo" className="w-24 h-24 object-contain -mr-6" />
          <span className="text-xl font-extrabold tracking-tight text-[#F4F1EA] font-display">VertexPath</span>
        </div>

        <nav className="hidden lg:flex items-center gap-10 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">
          <a href="#problem" className="hover:text-[#F4F1EA] transition-colors">01 / The Problem</a>
          <a href="#chapters" className="hover:text-[#F4F1EA] transition-colors">02 / Path</a>
          <a href="#faq" className="hover:text-[#F4F1EA] transition-colors">03 / FAQ</a>
          <a href="#contact" className="hover:text-[#F4F1EA] transition-colors">04 / Contact</a>
        </nav>

        <div className="flex items-center gap-5">
          {user ? (
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#9B5CFF] hover:bg-[#C49AFF] text-[#07080C] text-[11px] font-bold rounded transition-all cursor-pointer"
            >
              <span>Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <>
              <button
                onClick={() => navigate('/auth')}
                className="text-[11px] font-bold text-slate-450 hover:text-white transition-colors cursor-pointer"
              >
                Sign In
              </button>
              <button
                onClick={() => navigate('/auth?mode=signup')}
                className="px-4 py-2 bg-[#9B5CFF] hover:bg-[#C49AFF] text-[#07080C] text-[11px] font-bold rounded transition-all cursor-pointer"
              >
                Get Started
              </button>
            </>
          )}
        </div>
      </header>

      {/* Hero Section (Points 1, 2, 3, 10, 12, 11) */}
      <section className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-12 pt-24 pb-32 grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
        
        {/* Left Side: Staggered Entrance (Point 2) */}
        <div className="lg:col-span-7 space-y-8 text-left">
          <p className={`eyebrow-text transition-all duration-700 delay-200 ${
            isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
          }`}>
            VERTEXPATH / CAREER OPERATING SYSTEM
          </p>
          <h1 className={`text-5xl sm:text-6xl md:text-7xl font-extrabold leading-[1.05] tracking-tight font-display text-[#F4F1EA] transition-all duration-700 delay-300 ${
            isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
          }`}>
            YOUR CAREER<br />ISN'T A STRAIGHT LINE.
          </h1>
          <p className={`text-sm text-[#9299A8] leading-relaxed max-w-md font-medium transition-all duration-700 delay-400 ${
            isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
          }`}>
            VertexPath helps you navigate the developer journey. Track progress, optimize skills, and prepare for interviews in one single system.
          </p>

          <div className={`flex flex-col sm:flex-row gap-4 pt-4 transition-all duration-700 delay-500 ${
            isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
          }`}>
            {user ? (
              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center justify-center gap-1.5 px-6 py-3.5 bg-[#9B5CFF] hover:bg-[#C49AFF] text-[#07080C] text-xs font-bold rounded cursor-pointer transition-all hover:translate-x-1 group"
              >
                <span>Access Dashboard</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
            ) : (
              <>
                <button
                  onClick={() => navigate('/auth?mode=signup')}
                  className="flex items-center justify-center gap-1.5 px-6 py-3.5 bg-[#9B5CFF] hover:bg-[#C49AFF] text-[#07080C] text-xs font-bold rounded cursor-pointer transition-all hover:translate-x-1 group"
                >
                  <span>Build my path →</span>
                </button>
                <a
                  href="#chapters"
                  className="flex items-center justify-center gap-1.5 px-6 py-3.5 bg-[#11151D] hover:bg-[#151A23] border border-slate-900 text-[#F4F1EA] text-xs font-bold rounded transition-all hover:translate-x-1 group"
                >
                  <span>Explore VertexPath</span>
                </a>
              </>
            )}
          </div>
        </div>

        {/* Right Side: Scroll-Synced Dynamic Career Route (Point 2, 3) */}
        <div className={`lg:col-span-5 bg-[#0D1016]/45 border border-slate-900 p-8 rounded-lg space-y-6 relative overflow-hidden select-none transition-all duration-1000 delay-500 ${
          isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}>
          <div className="absolute top-0 right-0 p-4 text-[9px] font-mono font-bold text-slate-600">
            METAPHOR // ROUTE
          </div>
          
          <div className="space-y-4">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Navigation Map</span>
            
            <div className="flex flex-col gap-6 relative pl-4 border-l border-slate-800/80">
              
              {/* START Node */}
              <div className={`flex items-center gap-3 relative transition-opacity duration-500 ${getNodeOpacity('start')}`}>
                <div className={`absolute -left-[21px] w-2.5 h-2.5 rounded-full transition-all duration-500 ${getDotStyle('start')}`} />
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-[#F4F1EA]">START</p>
                  <p className="text-[10px] text-slate-550">Initial checkout</p>
                </div>
              </div>

              {/* Resume Node */}
              <div className={`flex items-center gap-3 relative transition-opacity duration-500 ${getNodeOpacity('resume')}`}>
                <div className={`absolute -left-[21px] w-2.5 h-2.5 rounded-full transition-all duration-500 ${getDotStyle('resume')}`} />
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-[#F4F1EA]">Resume</p>
                  <p className="text-[10px] text-slate-550">Evaluation uploaded</p>
                </div>
              </div>

              {/* Skills Node */}
              <div className={`flex items-center gap-3 relative transition-opacity duration-500 ${getNodeOpacity('skills')}`}>
                <div className={`absolute -left-[21px] w-2.5 h-2.5 rounded-full transition-all duration-500 ${getDotStyle('skills')}`} />
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-[#F4F1EA]">Skills Map</p>
                  <p className="text-[10px] text-slate-550">Active Checkpoint (Spring Boot)</p>
                </div>
              </div>

              {/* Projects Node */}
              <div className={`flex items-center gap-3 relative transition-opacity duration-500 ${getNodeOpacity('projects')}`}>
                <div className={`absolute -left-[21px] w-2.5 h-2.5 rounded-full transition-all duration-500 ${getDotStyle('projects')}`} />
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-[#F4F1EA]">Project Blueprint</p>
                  <p className="text-[10px] text-slate-550">Scaffolding sandbox</p>
                </div>
              </div>

              {/* Interviews Node */}
              <div className={`flex items-center gap-3 relative transition-opacity duration-500 ${getNodeOpacity('interviews')}`}>
                <div className={`absolute -left-[21px] w-2.5 h-2.5 rounded-full transition-all duration-500 ${getDotStyle('interviews')}`} />
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-[#F4F1EA]">Interviews</p>
                  <p className="text-[10px] text-slate-555">Mock prep simulation</p>
                </div>
              </div>

              {/* Destination Node */}
              <div className={`flex items-center gap-3 relative transition-opacity duration-500 ${getNodeOpacity('destination')}`}>
                <div className={`absolute -left-[21px] w-2.5 h-2.5 rounded-full transition-all duration-500 ${getDotStyle('destination')}`} />
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-[#F4F1EA]">Destination</p>
                  <p className="text-[10px] text-slate-550">Target role</p>
                </div>
              </div>

            </div>
          </div>
        </div>

      </section>

      {/* Chapter 01 — THE PROBLEM: Large Editorial Statement (Points 4, 12, 13) */}
      <section id="problem" className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-12 py-32">
        <div className={`h-[1px] bg-slate-900 transition-all duration-1000 origin-left mb-16 ${
          visibleSections.problem ? 'scale-x-100' : 'scale-x-0'
        }`} />
        <div className={`space-y-8 max-w-3xl text-left transition-all duration-700 ${
          visibleSections.problem ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <p className="eyebrow-text">CAREER OPERATING SYSTEM / 01</p>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-[#F4F1EA] leading-tight font-display">
            The developer journey is fragmented. challenges and portfolios exist in isolation.
          </h2>
          <p className="text-sm text-[#9299A8] leading-relaxed max-w-xl">
            VertexPath bridges these tools under a unified system. By aligning your resume directly with syllabus roadmaps, blueprints, and interviews, it creates a single cohesive journey.
          </p>
        </div>
      </section>

      {/* Chapters Feature Narrative (Points 4, 5, 12, 13) */}
      <section id="chapters" className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-12 py-16 space-y-40">
        
        {/* Chapter 02 — Starting Point: Asymmetric 2-Column with score display (Point 4, 5) */}
        <div id="resume" className="space-y-16">
          <div className={`h-[1px] bg-slate-900 transition-all duration-1000 origin-left ${
            visibleSections.resume ? 'scale-x-100' : 'scale-x-0'
          }`} />
          <div className={`grid grid-cols-1 lg:grid-cols-12 gap-12 items-start transition-all duration-700 ${
            visibleSections.resume ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            <div className="lg:col-span-5 space-y-4">
              <p className="font-mono text-xs font-bold text-[#9B5CFF]">02 — YOUR STARTING POINT</p>
              <h3 className="text-3xl font-extrabold text-[#F4F1EA] font-display">Know what you're bringing with you.</h3>
            </div>
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-8">
              <p className="text-xs text-[#9299A8] leading-relaxed">
                VertexPath reads your resume, identifies your strongest signals, and shows where your profile needs work. It turns your resume into a clear starting point for the journey ahead.
              </p>
              <div className="bg-[#0D1016] border border-slate-900 p-5 rounded-lg space-y-3">
                <div className="text-[9px] font-mono font-bold text-[#9B5CFF] uppercase tracking-wider mb-1">EXAMPLE ANALYSIS</div>
                <div className="flex justify-between text-[11px] font-bold text-[#9299A8]">
                  <span>ATS SCORE</span>
                  <span>{resumeScore} / 100</span>
                </div>
                <div className="w-full h-1 bg-[#11151D] rounded overflow-hidden">
                  <div className="h-full bg-[#55D39A] transition-all duration-500" style={{ width: `${resumeScore}%` }} />
                </div>
                <p className="text-[10px] text-slate-500 leading-normal">
                  +12 increase from baseline after resolving Docker terminology recommendations.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Chapter 03 — Find Gaps: Large Number + Visual Grid representation (Point 4, 6) */}
        <div id="gaps" className="space-y-16">
          <div className={`h-[1px] bg-slate-900 transition-all duration-1000 origin-left ${
            visibleSections.gaps ? 'scale-x-100' : 'scale-x-0'
          }`} />
          <div className={`grid grid-cols-1 lg:grid-cols-12 gap-12 items-center transition-all duration-700 ${
            visibleSections.gaps ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            <div className="lg:col-span-5 space-y-4">
              <p className="font-mono text-xs font-bold text-[#9B5CFF]">03 — FIND THE GAPS</p>
              <h3 className="text-3xl font-extrabold text-[#F4F1EA] font-display">Know what's missing.</h3>
              <p className="text-xs text-[#9299A8] leading-relaxed">
                Compare your profile against target role requirements. We extract direct matches and stack gaps, so you know exactly where you stand.
              </p>
            </div>
            <div className="lg:col-span-7 flex flex-col sm:flex-row items-center gap-8 justify-around">
              <div className="text-center space-y-1">
                <span className="font-display font-black text-7xl sm:text-8xl text-[#9B5CFF] transition-all duration-500">
                  {gapsScore}%
                </span>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Compatibility Fit</p>
              </div>
              <div className={`space-y-4 w-full max-w-[280px] transition-all duration-700 delay-300 ${
                visibleSections.gaps ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
              }`}>
                <div className="space-y-0.5">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Matches</span>
                  <p className="text-xs text-[#55D39A] font-semibold">Java · Spring Boot · REST APIs</p>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Gaps</span>
                  <p className="text-xs text-[#FF6577] font-semibold">Docker · AWS · Testing</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Chapter 04 — Build the Path: Career Route visual timeline (Point 4, 7) */}
        <div id="roadmap" className="space-y-16">
          <div className={`h-[1px] bg-slate-900 transition-all duration-1000 origin-left ${
            visibleSections.roadmap ? 'scale-x-100' : 'scale-x-0'
          }`} />
          <div className={`grid grid-cols-1 lg:grid-cols-12 gap-12 items-start transition-all duration-700 ${
            visibleSections.roadmap ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            <div className="lg:col-span-5 space-y-4">
              <p className="font-mono text-xs font-bold text-[#9B5CFF]">04 — BUILD THE PATH</p>
              <h3 className="text-3xl font-extrabold text-[#F4F1EA] font-display">Chapter-based learning roadmaps.</h3>
              <p className="text-xs text-[#9299A8] leading-relaxed">
                Generate target checksheets broken down by week and hours. Follow structured timelines designed to fill core engineering gaps.
              </p>
            </div>
            <div className={`lg:col-span-7 space-y-4 w-full max-w-md bg-[#0D1016] border border-slate-900 p-6 rounded-lg transition-all duration-700 delay-200 ${
              visibleSections.roadmap ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
            }`}>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">SPRING DEVELOPER TIMELINE</span>
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between text-xs border-b border-slate-900 pb-2">
                  <span className="text-[#9299A8] font-bold">01 FOUNDATIONS</span>
                  <span className="text-[#55D39A] font-bold text-[10px]">✓ Completed</span>
                </div>
                <div className="flex items-center justify-between text-xs border-b border-slate-900 pb-2">
                  <span className="text-[#9299A8] font-bold">02 SPRING INITIALIZER</span>
                  <span className="text-[#55D39A] font-bold text-[10px]">✓ Completed</span>
                </div>
                <div className="space-y-2 pt-1 pb-1">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-[#F4F1EA]">03 EXCEPTION HANDLERS</span>
                    <span className="text-[#9B5CFF] text-[10px] font-extrabold animate-pulse">◉ Active week</span>
                  </div>
                  <p className="text-[10px] text-slate-500 leading-normal pl-4">
                    DTO mapping validations and custom global response mappings.
                  </p>
                  <div className="flex items-center justify-between text-[9px] font-mono text-slate-600 pl-4 pt-1">
                    <span>2h 40m remaining</span>
                    <span className="text-[#9B5CFF] font-bold">Continue →</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Chapter 05 — Build Proof: Monospace technical directory structure (Point 4, 8) */}
        <div id="blueprint" className="space-y-16">
          <div className={`h-[1px] bg-slate-900 transition-all duration-1000 origin-left ${
            visibleSections.blueprint ? 'scale-x-100' : 'scale-x-0'
          }`} />
          <div className={`grid grid-cols-1 lg:grid-cols-12 gap-12 items-center transition-all duration-700 ${
            visibleSections.blueprint ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            <div className="lg:col-span-5 space-y-4">
              <p className="font-mono text-xs font-bold text-[#9B5CFF]">05 — BUILD PROOF</p>
              <h3 className="text-3xl font-extrabold text-[#F4F1EA] font-display">Generate blueprint directories.</h3>
              <p className="text-xs text-[#9299A8] leading-relaxed">
                Stop guessing file patterns. Model clean folders, schema structures, and api controller templates based directly on stack setups.
              </p>
            </div>
            
            {/* Sequential terminal lines reveal (Point 8) */}
            <div className="lg:col-span-7 bg-[#07080C] border border-slate-900 rounded p-6 font-mono text-[11px] text-[#cbd5e1] leading-relaxed overflow-x-auto shadow-inner max-w-md w-full">
              <span className={`text-slate-500 block transition-all duration-500 delay-100 ${visibleSections.blueprint ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'}`}>// Project Blueprint scaffold</span>
              <span className={`block transition-all duration-500 delay-200 ${visibleSections.blueprint ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'}`}>Backend</span>
              <span className={`block transition-all duration-500 delay-300 ${visibleSections.blueprint ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'}`}>├── Controllers</span>
              <span className={`block transition-all duration-500 delay-400 ${visibleSections.blueprint ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'}`}>│   └── UserController.java</span>
              <span className={`block transition-all duration-500 delay-500 ${visibleSections.blueprint ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'}`}>├── Services</span>
              <span className={`block transition-all duration-500 delay-600 ${visibleSections.blueprint ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'}`}>│   └── UserService.java</span>
              <span className={`block transition-all duration-500 delay-700 ${visibleSections.blueprint ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'}`}>└── Repositories</span>
              <span className={`block transition-all duration-500 delay-800 ${visibleSections.blueprint ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'}`}>    └── UserRepository.java</span>
            </div>
          </div>
        </div>

        {/* Chapter 06 — Prepare: Mock screening preview dialog view (Point 4, 9) */}
        <div id="interview" className="space-y-16">
          <div className={`h-[1px] bg-slate-900 transition-all duration-1000 origin-left ${
            visibleSections.interview ? 'scale-x-100' : 'scale-x-0'
          }`} />
          <div className={`grid grid-cols-1 lg:grid-cols-12 gap-12 items-start transition-all duration-700 ${
            visibleSections.interview ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            <div className="lg:col-span-5 space-y-4">
              <p className="font-mono text-xs font-bold text-[#9B5CFF]">06 — PREPARE</p>
              <h3 className="text-3xl font-extrabold text-[#F4F1EA] font-display">Speak technical concepts clearly.</h3>
              <p className="text-xs text-[#9299A8] leading-relaxed">
                Practice mock developer sessions. Short or generic explanations are graded strictly, prompting you to justify tradeoffs and details.
              </p>
            </div>
            
            {/* Sequential question/feedback reveal (Point 9) */}
            <div className={`lg:col-span-7 space-y-4 w-full max-w-md bg-[#0D1016] border border-slate-900 p-6 rounded-lg transition-all duration-700 delay-100 ${
              visibleSections.interview ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
            }`}>
              <div className="border-b border-slate-900 pb-3 flex justify-between text-[10px] font-bold text-[#9B5CFF]">
                <span>MOCK SIMULATION</span>
                <span>QUESTION 03 / 10</span>
              </div>
              <p className={`text-xs font-bold text-[#F4F1EA] leading-relaxed transition-all duration-500 delay-300 ${
                visibleSections.interview ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
              }`}>
                "Explain how heap space memory builds in O(N) complexity."
              </p>
              <div className={`p-3.5 bg-[#07080C] border border-slate-900 rounded space-y-2 transition-all duration-500 delay-500 ${
                visibleSections.interview ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
              }`}>
                <div className="text-[9px] font-mono font-bold text-[#FF6577] uppercase tracking-wider">AI FEEDBACK</div>
                <p className="text-[11px] text-[#FF6577] font-semibold">"Needs more depth"</p>
                <p className="text-[10px] text-slate-500 leading-relaxed font-medium">"Explain the relationship between heap height and the number of nodes."</p>
              </div>
            </div>
          </div>
        </div>

        {/* Chapter 07 — Destination: Large Destination statement (Point 4, 10) */}
        <div id="destination" className="space-y-16">
          <div className={`h-[1px] bg-slate-900 transition-all duration-1000 origin-left ${
            visibleSections.destination ? 'scale-x-100' : 'scale-x-0'
          }`} />
          <div className="pt-20 pb-10 text-center max-w-3xl mx-auto space-y-6">
            <p className="font-mono text-xs font-bold text-[#9B5CFF]">07 — DESTINATION</p>
            <h2 className={`text-4xl sm:text-5xl font-extrabold text-[#F4F1EA] leading-tight font-display tracking-tight transition-all duration-700 delay-200 ${
              visibleSections.destination ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}>
              Be ready when the call comes.
            </h2>
            <p className={`text-xs text-[#9299A8] max-w-md mx-auto leading-relaxed font-medium transition-all duration-700 delay-400 ${
              visibleSections.destination ? 'opacity-100' : 'opacity-0'
            }`}>
              VertexPath organizes your preparation so you can approach your target software engineering roles with structured confidence.
            </p>
            
            <div className={`pt-4 transition-all duration-700 delay-600 ${
              visibleSections.destination ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
            }`}>
              <button
                onClick={() => navigate('/auth?mode=signup')}
                className="flex items-center justify-center gap-1.5 px-6 py-3 bg-[#9B5CFF] hover:bg-[#C49AFF] text-[#07080C] text-xs font-bold rounded cursor-pointer transition-all hover:translate-x-1 group mx-auto"
              >
                <span>Get Started →</span>
              </button>
            </div>
          </div>
        </div>

      </section>

      {/* Editorial FAQ Section (Point 6, 12) */}
      <section id="faq" className="relative z-10 w-full max-w-5xl mx-auto px-6 md:px-12 py-32 border-t border-slate-900 grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        
        {/* Left column statement */}
        <div className="lg:col-span-5 space-y-3 text-left">
          <p className="eyebrow-text">03 / FAQ</p>
          <h2 className="text-4xl font-extrabold text-[#F4F1EA] font-display leading-none">
            QUESTIONS,<br />BEFORE YOU<br />START.
          </h2>
        </div>

        {/* Right column Accordions */}
        <div className="lg:col-span-7 space-y-3 w-full">
          {faqs.map((faq, index) => (
            <div 
              key={index}
              className="border-b border-slate-900 pb-4"
            >
              <button
                onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                className="w-full flex items-center justify-between text-left py-3 text-xs font-bold text-[#F4F1EA] hover:text-[#9B5CFF] transition-colors focus:outline-none cursor-pointer"
              >
                <span>{faq.q}</span>
                <span className={`text-slate-500 font-mono text-sm transition-transform duration-300 ${
                  activeFaq === index ? 'rotate-45 text-[#9B5CFF]' : 'rotate-0'
                }`}>+</span>
              </button>
              <div 
                className={`transition-all duration-300 ease-in-out overflow-hidden ${
                  activeFaq === index ? 'max-h-40 opacity-100 pt-2 pb-1' : 'max-h-0 opacity-0'
                }`}
              >
                <p className="text-xs text-[#9299A8] leading-relaxed">{faq.a}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Editorial Contact & Feedback Form Section (Point 7) */}
      <section id="contact" className="relative z-10 w-full max-w-5xl mx-auto px-6 md:px-12 py-32 border-t border-slate-900 grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        
        {/* Left Column title */}
        <div className="lg:col-span-5 space-y-3 text-left">
          <p className="eyebrow-text">04 / Contact</p>
          <h2 className="text-4xl font-extrabold text-[#F4F1EA] font-display leading-none">
            LET'S TALK.
          </h2>
          <p className="text-xs text-[#9299A8] leading-relaxed max-w-xs pt-2">
            Questions, feedback, or ideas? Send them directly to the developer.
          </p>
        </div>

        {/* Right Column minimal form fields */}
        <div className="lg:col-span-7 w-full space-y-6">
          {contactSuccess && (
            <div className="p-3.5 bg-[#55D39A]/10 border border-[#55D39A]/20 text-[#55D39A] text-xs rounded">
              <span>{contactSuccess}</span>
            </div>
          )}

          {contactError && (
            <div className="p-3.5 bg-[#FF6577]/10 border border-[#FF6577]/20 text-[#FF6577] text-xs rounded">
              <span>{contactError}</span>
            </div>
          )}

          <form onSubmit={handleContactSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-1">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Name</span>
                <input
                  type="text"
                  required
                  placeholder="Your Name"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="w-full text-xs bg-transparent border-0 border-b border-slate-900 focus:border-[#9B5CFF] focus:ring-0 px-0 py-2 rounded-none transition-all placeholder-slate-700"
                />
              </div>
              <div className="space-y-1">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Email</span>
                <input
                  type="email"
                  required
                  placeholder="name@domain.com"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="w-full text-xs bg-transparent border-0 border-b border-slate-900 focus:border-[#9B5CFF] focus:ring-0 px-0 py-2 rounded-none transition-all placeholder-slate-700"
                />
              </div>
            </div>
            
            <div className="space-y-1">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Message</span>
              <textarea
                required
                rows={4}
                placeholder="Write your feedback here..."
                value={contactMessage}
                onChange={(e) => setContactMessage(e.target.value)}
                className="w-full text-xs bg-transparent border-0 border-b border-slate-900 focus:border-[#9B5CFF] focus:ring-0 px-0 py-2 rounded-none transition-all resize-none placeholder-slate-700"
              />
            </div>
            
            <button
              type="submit"
              disabled={contactLoading}
              className="flex items-center gap-1.5 px-6 py-2.5 bg-[#9B5CFF] hover:bg-[#C49AFF] text-[#07080C] text-xs font-bold rounded transition-all cursor-pointer"
            >
              {contactLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin text-[#07080C]" />
              ) : (
                <span>Submit Message</span>
              )}
            </button>
          </form>
        </div>
      </section>

      {/* Spacious Footer (Point 8, 10) */}
      <footer className="relative z-10 w-full border-t border-slate-900 bg-[#07080C] py-20 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-4 gap-12">
          
          <div className="space-y-4 text-left">
            <div className="flex items-center gap-2">
              <img src={logoImg} alt="VertexPath Logo" className="w-18 h-18 object-contain -mr-4" />
              <span className="text-lg font-extrabold text-[#F4F1EA] tracking-tight font-display">VertexPath</span>
            </div>
            <p className="leading-relaxed text-[11px] text-slate-600 max-w-xs">
              A career operating system for developers — from your first resume scan to the interview that matters.
            </p>
            <div className="space-y-1.5 text-[11px] text-slate-600 pt-1 font-medium">
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#9B5CFF] opacity-60" />
                <span>+91 8805565585</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#9B5CFF] opacity-60" />
                <span>kaustubhjadhav0043@gmail.com</span>
              </div>
            </div>
          </div>

          <div className="space-y-4 text-left">
            <h4 className="font-bold text-[#F4F1EA] uppercase text-[10px] tracking-[0.15em]">Navigation</h4>
            <ul className="space-y-2.5 font-bold text-slate-655 text-[11px]">
              <li><a href="#problem" className="hover:text-white transition-colors">01 / The Problem</a></li>
              <li><a href="#chapters" className="hover:text-white transition-colors">02 / Path</a></li>
              <li><a href="#faq" className="hover:text-white transition-colors">03 / FAQ</a></li>
              <li><a href="#contact" className="hover:text-white transition-colors">04 / Contact</a></li>
            </ul>
          </div>

          <div className="space-y-4 text-left">
            <h4 className="font-bold text-[#F4F1EA] uppercase text-[10px] tracking-[0.15em]">Developer</h4>
            <div className="space-y-2">
              <p className="font-bold text-[#F4F1EA] text-[11px]">Kaustubh Jadhav</p>
              <div className="flex gap-2">
                <a 
                  href="https://www.linkedin.com/in/kaustubh-jadhav-6a2216248/" 
                  target="_blank" 
                  rel="noreferrer"
                  className="hover:text-white transition-colors p-1.5 rounded bg-[#0D1016] border border-slate-900 flex items-center justify-center cursor-pointer"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                    <rect x="2" y="9" width="4" height="12"></rect>
                    <circle cx="4" cy="4" r="2"></circle>
                  </svg>
                </a>
                <a 
                  href="https://github.com/Kaustubh0043" 
                  target="_blank" 
                  rel="noreferrer"
                  className="hover:text-white transition-colors p-1.5 rounded bg-[#0D1016] border border-slate-900 flex items-center justify-center cursor-pointer"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
                  </svg>
                </a>
                <a 
                  href="https://www.instagram.com/kaustubhh.jadhav/?hl=en" 
                  target="_blank" 
                  rel="noreferrer"
                  className="hover:text-white transition-colors p-1.5 rounded bg-[#0D1016] border border-slate-900 flex items-center justify-center cursor-pointer"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                  </svg>
                </a>
              </div>
            </div>
          </div>

          <div className="space-y-4 text-left">
            <h4 className="font-bold text-[#F4F1EA] uppercase text-[10px] tracking-[0.15em]">Legals</h4>
            <div className="space-y-2.5 font-bold text-slate-550 flex flex-col text-[11px]">
              <span 
                onClick={() => openModal('terms')} 
                className="hover:text-white transition-colors cursor-pointer"
              >
                Terms of Service
              </span>
              <span 
                onClick={() => openModal('privacy')} 
                className="hover:text-white transition-colors cursor-pointer"
              >
                Privacy Policy
              </span>
            </div>
          </div>

        </div>

        <div className="max-w-7xl mx-auto px-6 md:px-12 border-t border-slate-900 mt-16 pt-8 flex flex-col sm:flex-row items-center justify-between text-slate-600 text-[10px] font-bold uppercase tracking-wider">
          <span>VertexPath is an independent career preparation platform.</span>
          <span>© {new Date().getFullYear()} VertexPath. All Rights Reserved.</span>
        </div>
      </footer>

      {/* Terms & Privacy Modal (Preserving logic, styling as outline) */}
      {showTermsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#0D1016] border border-slate-900 w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden rounded-lg z-50 shadow-2xl">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-900 bg-[#11151D]/30">
              <div className="flex gap-4">
                <button
                  onClick={() => setActiveModalTab('terms')}
                  className={`text-xs font-bold pb-1 uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
                    activeModalTab === 'terms' ? 'border-[#9B5CFF] text-[#F4F1EA]' : 'border-transparent text-slate-550 hover:text-white'
                  }`}
                >
                  Terms of Service
                </button>
                <button
                  onClick={() => setActiveModalTab('privacy')}
                  className={`text-xs font-bold pb-1 uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
                    activeModalTab === 'privacy' ? 'border-[#9B5CFF] text-[#F4F1EA]' : 'border-transparent text-slate-555 hover:text-white'
                  }`}
                >
                  Privacy Policy
                </button>
              </div>
              <button
                onClick={() => setShowTermsModal(false)}
                className="text-slate-500 hover:text-white text-xs cursor-pointer p-1"
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-[#9299A8] leading-relaxed custom-scrollbar">
              {activeModalTab === 'terms' ? (
                <div className="space-y-4">
                  <h3 className="text-[#F4F1EA] font-bold text-sm">1. Acceptance of Terms</h3>
                  <p>
                    Welcome to VertexPath. By accessing or using our platform, you agree to be bound by these Terms of Service. If you do not agree, please do not use the Service.
                  </p>
                  <h3 className="text-[#F4F1EA] font-bold text-sm">2. Description of Service</h3>
                  <p>
                    VertexPath is a career development ecosystem designed to assist users with roadmaps, resume score evaluation, mock interviews, and reference context question answering. AI suggestions are generated by LLMs and are intended solely for educational purposes.
                  </p>
                  <h3 className="text-[#F4F1EA] font-bold text-sm">3. User Obligations & Account</h3>
                  <p>
                    You agree to provide true, accurate, and complete information during registration. You are responsible for keeping your account password secure.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <h3 className="text-[#F4F1EA] font-bold text-sm">1. Information We Collect</h3>
                  <p>
                    We collect personal information that you provide directly, such as your name, email address, password hash, and files/resumes you upload to the platform.
                  </p>
                  <h3 className="text-[#F4F1EA] font-bold text-sm">2. How We Use Your Information</h3>
                  <p>
                    We use information to maintain your career dashboard, generate roadmaps, and review resumes.
                  </p>
                  <h3 className="text-[#F4F1EA] font-bold text-sm">3. Data Sharing & Third-Party APIs</h3>
                  <p>
                    We use enterprise-grade AI neural models and isolated vector storage to power intelligent career features. Resumes and context files are indexed and processed with end-to-end encryption. We do not sell your personal data.
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-slate-900 flex justify-end bg-[#11151D]/20">
              <button
                onClick={() => setShowTermsModal(false)}
                className="px-4 py-2 bg-[#9B5CFF] hover:bg-[#C49AFF] text-[#07080C] text-xs font-bold rounded cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
