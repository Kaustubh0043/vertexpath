import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  Sparkles, 
  Map, 
  Cpu, 
  CheckCircle2, 
  Award, 
  Share2, 
  Copy, 
  Check, 
  ExternalLink, 
  Terminal, 
  Mail,
  ArrowRight
} from 'lucide-react';

export const PublicPortfolio: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const [copied, setCopied] = useState(false);

  const displayName = username 
    ? username.charAt(0).toUpperCase() + username.slice(1).replace(/[-_.]/g, ' ')
    : 'Kaustubh Jadhav';

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="min-h-screen bg-[#07080C] text-[#F4F1EA] py-12 px-4 sm:px-6 lg:px-8 font-sans">
      
      {/* Top Brand Navbar */}
      <div className="max-w-4xl mx-auto flex items-center justify-between pb-8 border-b border-slate-900">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-[#9B5CFF] to-[#C49AFF] flex items-center justify-center shadow-[0_0_15px_rgba(155,92,255,0.4)]">
            <Sparkles className="w-4 h-4 text-[#07080C]" />
          </div>
          <span className="font-display font-extrabold text-lg tracking-tight">VertexPath</span>
          <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-[#9B5CFF]/15 text-[#9B5CFF] border border-[#9B5CFF]/30">
            VERIFIED PORTFOLIO
          </span>
        </Link>

        <button
          onClick={handleShare}
          className="flex items-center gap-2 px-4 py-2 bg-[#11151D] hover:bg-[#1A202C] text-[#F4F1EA] text-xs font-bold rounded-xl border border-slate-800 transition-all cursor-pointer shadow-sm"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-[#55D39A]" /> : <Share2 className="w-3.5 h-3.5 text-[#9B5CFF]" />}
          <span>{copied ? 'Link Copied!' : 'Share Portfolio'}</span>
        </button>
      </div>

      <div className="max-w-4xl mx-auto pt-10 space-y-10">
        
        {/* Profile Hero Card */}
        <div className="relative overflow-hidden rounded-3xl bg-[#0D1016] border border-slate-800/80 p-8 sm:p-10 shadow-2xl">
          <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-[#9B5CFF]/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-[#11151D] to-[#1A202C] border-2 border-[#9B5CFF]/40 flex items-center justify-center text-2xl font-extrabold font-display text-[#F4F1EA] shadow-xl">
                {displayName.charAt(0)}
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold font-display text-[#F4F1EA]">{displayName}</h1>
                  <ShieldCheck className="w-5 h-5 text-[#55D39A]" />
                </div>
                <p className="text-sm font-semibold text-[#9B5CFF]">Full Stack & Systems Software Engineer</p>
                <p className="text-xs text-[#9299A8]">Open to Software Engineering & Architecture Roles</p>
              </div>
            </div>

            {/* Readiness Score Pill */}
            <div className="p-4 rounded-2xl bg-[#11151D] border border-slate-800 text-center space-y-1 min-w-[140px] self-stretch sm:self-auto">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Readiness Grade</span>
              <p className="text-3xl font-mono font-extrabold text-[#55D39A]">94%</p>
              <span className="text-[10px] text-[#55D39A] font-semibold block">Top 5% Technical Tier</span>
            </div>
          </div>

          {/* Bio statement */}
          <div className="mt-6 pt-6 border-t border-slate-900/80 text-xs text-[#9299A8] leading-relaxed max-w-2xl">
            Passionate software engineer focused on building robust, scalable web architectures, resilient microservices, and AI-accelerated systems. Completed rigorous mock interview simulations and verified project architectural specifications on VertexPath.
          </div>

          {/* Core competencies */}
          <div className="mt-6 flex flex-wrap gap-2">
            {['React', 'TypeScript', 'Node.js', 'FastAPI / Python', 'Spring Boot', 'PostgreSQL', 'Redis', 'Docker', 'System Architecture'].map((tech) => (
              <span key={tech} className="px-3 py-1 rounded-lg text-xs font-semibold font-mono bg-[#11151D] border border-slate-800 text-slate-300">
                {tech}
              </span>
            ))}
          </div>
        </div>

        {/* Highlighted Project Blueprints */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold font-display text-[#F4F1EA] flex items-center gap-2">
              <Cpu className="w-5 h-5 text-[#9B5CFF]" />
              <span>Architectural Blueprints & Systems</span>
            </h3>
            <span className="text-xs text-slate-500 font-mono">Verified Specs</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[#0D1016] border border-slate-800/80 hover:border-[#9B5CFF]/40 rounded-2xl p-6 space-y-4 shadow-xl transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#F4F1EA]">Real-Time Analytics & Ingestion Gateway</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#9B5CFF]/15 text-[#9B5CFF]">FastAPI + Redis</span>
              </div>
              <p className="text-xs text-[#9299A8] leading-relaxed">
                Designed and scaffolded a high-throughput event ingestion gateway capable of handling 15k RPS with low-latency Redis caching and distributed worker queues.
              </p>
              <div className="p-3 bg-[#07080C] rounded-xl border border-slate-900 text-[11px] font-mono text-slate-400 space-y-1">
                <div>POST /api/v1/ingest/stream</div>
                <div>GET  /api/v1/analytics/realtime</div>
              </div>
            </div>

            <div className="bg-[#0D1016] border border-slate-800/80 hover:border-[#9B5CFF]/40 rounded-2xl p-6 space-y-4 shadow-xl transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#F4F1EA]">Enterprise E-Commerce Microservices</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#55D39A]/15 text-[#55D39A]">Spring Boot + Postgres</span>
              </div>
              <p className="text-xs text-[#9299A8] leading-relaxed">
                Multi-tenant catalog and order settlement pipeline with atomic database transactions, JWT security filters, and automated inventory reconciliation.
              </p>
              <div className="p-3 bg-[#07080C] rounded-xl border border-slate-900 text-[11px] font-mono text-slate-400 space-y-1">
                <div>POST /api/v1/orders/checkout</div>
                <div>GET  /api/v1/inventory/reconcile</div>
              </div>
            </div>
          </div>
        </div>

        {/* Verified Curriculums */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold font-display text-[#F4F1EA] flex items-center gap-2">
            <Map className="w-5 h-5 text-[#9B5CFF]" />
            <span>Mastered Learning Paths</span>
          </h3>

          <div className="bg-[#0D1016] border border-slate-800/80 rounded-2xl p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-bold text-[#F4F1EA]">Full Stack Cloud & Microservices Engineering</span>
              <span className="text-xs font-mono text-[#55D39A] font-bold">100% Completed</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
              <div className="p-3 rounded-xl bg-[#11151D] border border-slate-800">
                <span className="text-[10px] text-slate-500 font-bold block mb-1">Week 1</span>
                <span className="font-semibold text-slate-300">Clean Architecture</span>
              </div>
              <div className="p-3 rounded-xl bg-[#11151D] border border-slate-800">
                <span className="text-[10px] text-slate-500 font-bold block mb-1">Week 2</span>
                <span className="font-semibold text-slate-300">Postgres & Indexing</span>
              </div>
              <div className="p-3 rounded-xl bg-[#11151D] border border-slate-800">
                <span className="text-[10px] text-slate-500 font-bold block mb-1">Week 3</span>
                <span className="font-semibold text-slate-300">Auth & API Security</span>
              </div>
              <div className="p-3 rounded-xl bg-[#11151D] border border-slate-800">
                <span className="text-[10px] text-slate-500 font-bold block mb-1">Week 4</span>
                <span className="font-semibold text-slate-300">Docker & Production</span>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Footer */}
        <div className="p-8 rounded-3xl bg-gradient-to-r from-[#11151D] via-[#151A23] to-[#0D1016] border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <div className="space-y-1">
            <h4 className="text-base font-bold font-display text-[#F4F1EA]">Interested in hiring {displayName}?</h4>
            <p className="text-xs text-[#9299A8]">Reach out directly or build your own verified candidate profile.</p>
          </div>

          <Link
            to="/auth"
            className="px-6 py-3 bg-[#9B5CFF] hover:bg-[#C49AFF] text-[#07080C] text-xs font-bold rounded-xl transition-all shadow-lg shadow-[#9B5CFF]/20 flex items-center gap-2 cursor-pointer"
          >
            <span>Create Your Verified Profile</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>

    </div>
  );
};
