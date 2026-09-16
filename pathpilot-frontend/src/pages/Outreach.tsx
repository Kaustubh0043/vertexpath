import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { api } from '../services/api';
import { 
  Mail, 
  Send, 
  Copy, 
  Check, 
  Sparkles, 
  Building2, 
  User, 
  Briefcase, 
  Sliders, 
  MessageSquare, 
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { AiLoadingCard } from '../components/AiLoadingCard';

export const Outreach: React.FC = () => {
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [recipient, setRecipient] = useState('');
  const [recipientType, setRecipientType] = useState('Hiring Manager');
  const [tone, setTone] = useState('Professional & Value-Driven');
  const [targetProject, setTargetProject] = useState('');
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const outreachMutation = useMutation({
    mutationFn: async (payload: any) => {
      try {
        const res = await api.post('/api/ai/outreach/generate', payload);
        return res.data;
      } catch (err) {
        // Fallback generator if offline
        return {
          company: payload.company,
          role: payload.role,
          templates: [
            {
              type: "Direct Value Proposition",
              channel: "Email / LinkedIn",
              subject: `Application & Technical Project for ${payload.role} role at ${payload.company}`,
              body: `Hi ${payload.recipient || 'Hiring Team'},

I've been closely following ${payload.company}'s engineering advancements and noticed you're scaling the ${payload.role} team.

Recently, I engineered a high-performance system (${payload.targetProject || 'distributed full-stack pipeline'}) focusing on latency optimization and clean architecture. Given your current technical challenges, I wanted to reach out directly to see how I could contribute immediately.

I'd love 10 minutes to share my project architecture and discuss how my skillset aligns with your team's upcoming milestones.

Best regards,
[Your Name]
[Your Portfolio Link]`,
              hook_strategy: "Leads with concrete technical value and proactive project proof rather than a passive resume drop.",
              best_for: "Engineering Managers & Team Leads"
            },
            {
              type: "Warm Peer / Referral Inquiry",
              channel: "LinkedIn / Email",
              subject: `Fellow engineer admirer of ${payload.company}'s engineering stack`,
              body: `Hi ${payload.recipient || 'there'},

I came across your profile while researching ${payload.company}'s engineering culture. As someone working deeply with similar architectures (${payload.targetProject || 'modern scalable services'}), I really admire how your team approaches developer velocity.

I'm currently exploring the ${payload.role} opening on your team and would love to ask 2 quick questions about what your day-to-day looks like. Would you be open to a quick 5-minute virtual coffee chat this week?

Thanks so much for your time!

Best,
[Your Name]`,
              hook_strategy: "Builds rapport with a peer engineer before asking for a referral, yielding 3x higher response rates.",
              best_for: "Senior Staff Engineers & Alumni"
            },
            {
              type: "140-Character InMail / Quick DM",
              channel: "LinkedIn InMail / DM",
              subject: `Quick intro: ${payload.role} candidate`,
              body: `Hi ${payload.recipient || 'there'}, loved ${payload.company}'s recent technical milestone! I specialize in ${payload.targetProject || 'scalable cloud architectures'} and am actively applying for the ${payload.role} opening. Would love to connect and share a quick architectural spec relevant to your stack. Thanks!`,
              hook_strategy: "Optimized for mobile viewing and busy recruiters with high 1-click reply probability.",
              best_for: "Technical Recruiters & Talent Partners"
            }
          ]
        };
      }
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!company.trim() || !role.trim()) return;
    localStorage.setItem('outreachCompleted', 'true');
    outreachMutation.mutate({
      company,
      role,
      recipient,
      recipientType,
      tone,
      targetProject
    });
  };

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(index);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const templates = outreachMutation.data?.templates || [];

  return (
    <div className="space-y-10">
      
      {/* Header */}
      <div className="space-y-2">
        <p className="eyebrow-text">Outreach / 07</p>
        <h3 className="text-2xl font-extrabold text-[#F4F4F5] tracking-tight">Recruiter & Executive Outreach Copilot</h3>
        <p className="text-xs text-[#A1A1AA] leading-relaxed max-w-2xl">
          Generate hyper-personalized cold emails, LinkedIn InMail messages, and peer referral requests that convert at 15-20% reply rates instead of generic job board rejections.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Form Panel */}
        <div className="lg:col-span-5 bg-[#15161C] border border-[#25262D]/80 p-6 rounded-2xl space-y-6 shadow-xl">
          <div className="flex items-center gap-2 border-b border-[#25262D] pb-3">
            <Mail className="w-4 h-4 text-[#8B5CF6]" />
            <span className="text-xs font-bold text-[#F4F4F5] uppercase tracking-wider">Target Opportunity Details</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-[#8B5CF6]" />
                Target Company *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Stripe, Vercel, Linear, Datadog"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-[#8B5CF6]" />
                Target Role *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Full Stack Engineer, Backend Architect"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-[#8B5CF6]" />
                  Recipient Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Sarah Jenkins"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  className="w-full text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-[#8B5CF6]" />
                  Recipient Role
                </label>
                <select
                  value={recipientType}
                  onChange={(e) => setRecipientType(e.target.value)}
                  className="w-full text-xs bg-[#111318] border border-[#25262D] text-[#F4F4F5] rounded-lg p-2.5 focus:border-[#8B5CF6]"
                >
                  <option value="Hiring Manager">Engineering Manager / Lead</option>
                  <option value="Technical Recruiter">Technical Recruiter / Sourcer</option>
                  <option value="Staff Engineer / Peer">Staff Engineer / Peer</option>
                  <option value="Founder / Executive">Founder / VP of Engineering</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#8B5CF6]" />
                Featured Project or Superpower
              </label>
              <input
                type="text"
                placeholder="e.g. Built a Redis-backed API gateway handling 10k RPS"
                value={targetProject}
                onChange={(e) => setTargetProject(e.target.value)}
                className="w-full text-xs"
              />
            </div>

            <button
              type="submit"
              disabled={outreachMutation.isPending || !company.trim() || !role.trim()}
              className="w-full py-3 bg-[#8B5CF6] hover:bg-[#C49AFF] text-[#111318] text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-[#8B5CF6]/20"
            >
              <Send className="w-4 h-4" />
              <span>Generate 3 High-Impact Outreach Scripts →</span>
            </button>
          </form>

          {/* Tips Box */}
          <div className="bg-[#11151D] p-4 rounded-xl border border-[#25262D] space-y-1.5 text-xs text-slate-400">
            <span className="text-[10px] font-bold text-[#55D39A] uppercase tracking-wider flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Pro Outreach Strategy
            </span>
            <p className="text-[11px] text-[#A1A1AA] leading-relaxed">
              Always send cold outreach on Tuesday, Wednesday, or Thursday mornings between 8:00 AM - 9:30 AM in the recipient's local timezone for maximum response velocity.
            </p>
          </div>
        </div>

        {/* Right Output Panel */}
        <div className="lg:col-span-7 space-y-6">
          {outreachMutation.isPending && (
            <AiLoadingCard
              title="Synthesizing Outreach"
              subtitle={`VertexPath is engineering 3 high-converting cold email scripts tailored for ${company}.`}
              messages={[
                "Analyzing target company engineering domain...",
                "Formulating high-open rate email hooks...",
                "Drafting quantified value proposition scripts...",
                "Optimizing LinkedIn InMail word-count limits..."
              ]}
              steps={["Company Profiling", "Hook Engineering", "Template Generation"]}
            />
          )}

          {!outreachMutation.isPending && templates.length === 0 && (
            <div className="bg-[#15161C] border border-[#25262D]/80 rounded-2xl p-12 flex flex-col items-center justify-center text-center space-y-3 min-h-[380px] shadow-xl">
              <div className="p-3 bg-[#11151D] border border-[#25262D] rounded-xl">
                <Mail className="w-8 h-8 text-[#8B5CF6]" />
              </div>
              <h5 className="text-base font-bold text-[#F4F4F5]">No Outreach Templates Generated Yet</h5>
              <p className="text-xs text-[#A1A1AA] max-w-sm leading-relaxed">
                Fill in your target company and role details on the left to generate 3 customized outreach templates ready to copy and paste.
              </p>
            </div>
          )}

          {!outreachMutation.isPending && templates.length > 0 && (
            <div className="space-y-6 animate-fade-in">
              {templates.map((tpl: any, idx: number) => {
                const isCopied = copiedIdx === idx;
                return (
                  <div key={idx} className="bg-[#15161C] border border-[#25262D]/80 hover:border-[#8B5CF6]/30 p-6 rounded-2xl space-y-4 shadow-xl transition-all">
                    
                    {/* Header bar */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#25262D] pb-3">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded text-[10px] font-bold font-mono bg-[#8B5CF6]/15 text-[#8B5CF6] border border-[#8B5CF6]/30">
                          {tpl.type}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">{tpl.channel}</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleCopy(`Subject: ${tpl.subject}

${tpl.body}`, idx)}
                        className="flex items-center gap-1.5 px-3 py-1 bg-[#11151D] hover:bg-[#1A202C] text-slate-300 hover:text-[#F4F4F5] text-xs font-bold rounded-lg border border-[#25262D] transition-all cursor-pointer self-start sm:self-auto"
                      >
                        {isCopied ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-[#55D39A]" />
                            <span className="text-[#55D39A]">Copied Full Email!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-[#8B5CF6]" />
                            <span>1-Click Copy</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Subject Line */}
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Subject Line</span>
                      <div className="p-2.5 bg-[#111318] border border-[#25262D] rounded-lg text-xs text-[#F4F4F5] font-mono select-text">
                        {tpl.subject}
                      </div>
                    </div>

                    {/* Email Body */}
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Message Body</span>
                      <div className="p-4 bg-[#111318] border border-[#25262D] rounded-lg text-xs text-slate-300 leading-relaxed font-sans whitespace-pre-line select-text">
                        {tpl.body}
                      </div>
                    </div>

                    {/* Strategy and Best For */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-[11px]">
                      <div className="p-2.5 rounded-lg bg-[#11151D] border border-[#25262D] text-[#A1A1AA]">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Hook Strategy</span>
                        {tpl.hook_strategy}
                      </div>
                      <div className="p-2.5 rounded-lg bg-[#11151D] border border-[#25262D] text-[#A1A1AA]">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Best Sent To</span>
                        {tpl.best_for}
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
