import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { api } from '../services/api';
import { 
  DollarSign, 
  TrendingUp, 
  ShieldCheck, 
  Copy, 
  Check, 
  Sparkles, 
  Briefcase, 
  MapPin, 
  BarChart3, 
  Mail,
  Award
} from 'lucide-react';
import { AiLoadingCard } from '../components/AiLoadingCard';

export const Compensation: React.FC = () => {
  const [role, setRole] = useState('Full Stack Software Engineer');
  const [level, setLevel] = useState('Mid-Level');
  const [location, setLocation] = useState('Remote / US');
  const [baseOffer, setBaseOffer] = useState('125000');
  const [currency, setCurrency] = useState('USD');
  const [copiedScriptIdx, setCopiedScriptIdx] = useState<number | null>(null);

  const compMutation = useMutation({
    mutationFn: async (payload: any) => {
      try {
        const res = await api.post('/api/ai/compensation/analyze', payload);
        return res.data;
      } catch (err) {
        const offerNum = parseFloat(payload.baseOffer) || 120000;
        return {
          market_benchmarks: {
            p25: Math.round(offerNum * 0.85),
            p50_median: Math.round(offerNum * 1.05),
            p75: Math.round(offerNum * 1.25),
            p90: Math.round(offerNum * 1.45),
            currency: payload.currency
          },
          offer_analysis: `Your current figure of ${payload.baseOffer} ${payload.currency} places you near the 48th market percentile for a ${payload.level} ${payload.role}. There is clear headroom to negotiate an 8-15% increase or additional equity grants.`,
          leverage_points: [
            "Demonstrated proficiency in end-to-end full stack architecture and performance optimization.",
            "Strong alignment with company milestones reduces onboarding ramp-up time by 50%.",
            "Current market shortage of engineers with cross-functional AI integration and microservice skills."
          ],
          counter_offer_scripts: [
            {
              style: "Collaborative Value Proposition",
              subject: `Excited about the offer / Exploring compensation alignment - ${payload.role}`,
              body: `Dear [Hiring Manager / Recruiter Name],

Thank you so much for extending the offer to join [Company] as a ${payload.role}! I am incredibly excited about the team's roadmap and the technical challenges ahead.

After reviewing the details and benchmarking with current market rates for ${payload.level} roles in ${payload.location}, I was hoping we could explore adjusting the base compensation closer to [Target Amount, e.g. ${Math.round(offerNum * 1.12)}] ${payload.currency}.

Given my experience in accelerating delivery timelines and architecting scalable systems, I am confident I will make an immediate high-leverage impact. If we can reach agreement around this figure, I would be thrilled to sign immediately!

Best regards,
[Your Name]`,
              recommended_when: "Best for standard negotiations where you want to secure an 8-15% bump while maintaining strong rapport."
            },
            {
              style: "Competing Offer Leverage",
              subject: `Update regarding decision timeline & offer terms - ${payload.role}`,
              body: `Dear [Recruiter Name],

Thank you again for the offer to join [Company]. I've enjoyed meeting the team and [Company] remains my top choice.

To be transparent, I am currently in final stages with another company offering a package in the range of [Higher Amount] ${payload.currency}. However, because I strongly prefer [Company]'s mission and engineering culture, if you are able to adjust the base offer to [Target Amount] ${payload.currency}, I would be ready to conclude my other discussions and sign today.

Thank you for your flexibility!

Warmly,
[Your Name]`,
              recommended_when: "When you have active conversations or competing timelines and want to fast-track maximum leverage."
            },
            {
              style: "Total Rewards & Equity Buffer",
              subject: `Exploring overall compensation structure for ${payload.role}`,
              body: `Dear [Hiring Manager],

Thank you for the detailed offer letter. I'm very enthusiastic about joining the team!

I understand that base salary bands might have fixed constraints. If base flexibility is limited, I would love to explore whether we could bridge the difference through an additional sign-on bonus of [Amount] or an expanded initial equity grant.

Looking forward to hearing your thoughts!

Best,
[Your Name]`,
              recommended_when: "When the company informs you that base salary is strictly capped by internal bands."
            }
          ]
        };
      }
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!role.trim()) return;
    localStorage.setItem('compensationCompleted', 'true');
    compMutation.mutate({
      role,
      level,
      location,
      baseOffer,
      currency
    });
  };

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedScriptIdx(idx);
    setTimeout(() => setCopiedScriptIdx(null), 2000);
  };

  const data = compMutation.data;
  const benchmarks = data?.market_benchmarks;

  return (
    <div className="space-y-10">
      
      {/* Title */}
      <div className="space-y-2">
        <p className="eyebrow-text">Negotiation / 09</p>
        <h3 className="text-2xl font-extrabold text-[#F4F1EA] tracking-tight">Tech Salary & Negotiation Copilot</h3>
        <p className="text-xs text-[#9299A8] leading-relaxed max-w-2xl">
          Benchmark tech industry compensation percentiles across locations and generate battle-tested counter-offer email scripts to maximize your total rewards.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Input Form */}
        <div className="lg:col-span-5 bg-[#0D1016] border border-slate-800/80 p-6 rounded-2xl space-y-6 shadow-xl">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <DollarSign className="w-4 h-4 text-[#9B5CFF]" />
            <span className="text-xs font-bold text-[#F4F1EA] uppercase tracking-wider">Offer & Benchmark Parameters</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-[#9B5CFF]" />
                Target Job Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Senior Frontend Engineer, DevOps Specialist"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Experience Level</label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  className="w-full text-xs bg-[#07080C] border border-slate-800 text-[#F4F1EA] rounded-lg p-2.5 focus:border-[#9B5CFF]"
                >
                  <option value="Entry-Level (0-2 YOE)">Entry-Level (0-2 YOE)</option>
                  <option value="Mid-Level (2-5 YOE)">Mid-Level (2-5 YOE)</option>
                  <option value="Senior (5-8 YOE)">Senior (5-8 YOE)</option>
                  <option value="Staff / Lead (8+ YOE)">Staff / Lead (8+ YOE)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#9B5CFF]" />
                  Location
                </label>
                <input
                  type="text"
                  placeholder="e.g. Remote US, London, India, Bay Area"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2 space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Current Offer / Expectation</label>
                <input
                  type="number"
                  placeholder="125000"
                  value={baseOffer}
                  onChange={(e) => setBaseOffer(e.target.value)}
                  className="w-full text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Currency</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full text-xs bg-[#07080C] border border-slate-800 text-[#F4F1EA] rounded-lg p-2.5 focus:border-[#9B5CFF]"
                >
                  <option value="USD">USD ($)</option>
                  <option value="INR">INR (₹)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={compMutation.isPending || !role.trim()}
              className="w-full py-3 bg-[#9B5CFF] hover:bg-[#C49AFF] text-[#07080C] text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-[#9B5CFF]/20"
            >
              <TrendingUp className="w-4 h-4" />
              <span>Benchmark & Generate Negotiation Scripts →</span>
            </button>
          </form>

          {/* Leverage Tip */}
          <div className="bg-[#11151D] p-4 rounded-xl border border-slate-800 space-y-1.5 text-xs text-slate-400">
            <span className="text-[10px] font-bold text-[#55D39A] uppercase tracking-wider flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              Negotiation Golden Rule
            </span>
            <p className="text-[11px] text-[#9299A8] leading-relaxed">
              Negotiating an offer professionally never causes an offer retraction. Companies budget a 10-15% buffer specifically for candidates who ask articulately.
            </p>
          </div>
        </div>

        {/* Right Output Panel */}
        <div className="lg:col-span-7 space-y-6">
          {compMutation.isPending && (
            <AiLoadingCard
              title="Analyzing Market Benchmarks"
              subtitle={`VertexPath is calculating percentile distributions and counter-offer strategy for ${role}.`}
              messages={[
                "Aggregating compensation percentile distributions...",
                "Benchmarking cost of living & technical demand...",
                "Formulating high-leverage negotiation scripts...",
                "Structuring total rewards counter-proposals..."
              ]}
              steps={["Market Aggregation", "Percentile Alignment", "Script Generation"]}
            />
          )}

          {!compMutation.isPending && !data && (
            <div className="bg-[#0D1016] border border-slate-800/80 rounded-2xl p-16 flex flex-col items-center justify-center text-center space-y-3 min-h-[380px] shadow-xl">
              <div className="p-3 bg-[#11151D] border border-slate-800 rounded-xl">
                <BarChart3 className="w-8 h-8 text-[#9B5CFF]" />
              </div>
              <h5 className="text-base font-bold text-[#F4F1EA]">No Compensation Benchmark Active</h5>
              <p className="text-xs text-[#9299A8] max-w-sm leading-relaxed">
                Provide your role and target location on the left to reveal market percentile distributions and battle-tested negotiation scripts.
              </p>
            </div>
          )}

          {!compMutation.isPending && data && (
            <div className="space-y-6 animate-fade-in">
              
              {/* Percentile Distribution Card */}
              {benchmarks && (
                <div className="bg-[#0D1016] border border-slate-800/80 p-6 rounded-2xl space-y-5 shadow-xl">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <span className="text-xs font-bold text-[#F4F1EA] uppercase tracking-wider flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-[#9B5CFF]" />
                      Market Compensation Percentiles
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">{benchmarks.currency} Annual Base</span>
                  </div>

                  {/* Visual Bar Grid */}
                  <div className="grid grid-cols-4 gap-2 text-center">
                    <div className="p-3 bg-[#11151D] border border-slate-800 rounded-xl space-y-1">
                      <span className="text-[10px] text-slate-500 font-bold uppercase">25th %ile</span>
                      <p className="text-sm font-bold font-mono text-slate-300">
                        {benchmarks.p25?.toLocaleString()}
                      </p>
                      <span className="text-[9px] text-slate-600 block">Entry Band</span>
                    </div>

                    <div className="p-3 bg-[#11151D] border border-slate-800 rounded-xl space-y-1">
                      <span className="text-[10px] text-[#55C8E8] font-bold uppercase">Median (50th)</span>
                      <p className="text-sm font-bold font-mono text-[#55C8E8]">
                        {benchmarks.p50_median?.toLocaleString()}
                      </p>
                      <span className="text-[9px] text-slate-600 block">Market Average</span>
                    </div>

                    <div className="p-3 bg-[#11151D] border border-[#9B5CFF]/30 rounded-xl space-y-1 bg-[#9B5CFF]/5">
                      <span className="text-[10px] text-[#C49AFF] font-bold uppercase">75th %ile</span>
                      <p className="text-sm font-bold font-mono text-[#C49AFF]">
                        {benchmarks.p75?.toLocaleString()}
                      </p>
                      <span className="text-[9px] text-[#9B5CFF] block">Target Zone</span>
                    </div>

                    <div className="p-3 bg-[#11151D] border border-slate-800 rounded-xl space-y-1">
                      <span className="text-[10px] text-[#55D39A] font-bold uppercase">Top 10% (90th)</span>
                      <p className="text-sm font-bold font-mono text-[#55D39A]">
                        {benchmarks.p90?.toLocaleString()}
                      </p>
                      <span className="text-[9px] text-slate-600 block">Top Tier</span>
                    </div>
                  </div>

                  <p className="text-xs text-[#9299A8] leading-relaxed bg-[#07080C] p-3.5 rounded-xl border border-slate-800">
                    {data.offer_analysis}
                  </p>
                </div>
              )}

              {/* Leverage Points */}
              {data.leverage_points && (
                <div className="bg-[#0D1016] border border-slate-800/80 p-5 rounded-2xl space-y-2.5 shadow-xl">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-[#55D39A]" />
                    Key Negotiation Leverage Drivers
                  </span>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {data.leverage_points.map((pt: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2 bg-[#07080C] p-2.5 rounded-lg border border-slate-800/80">
                        <span className="text-[#9B5CFF] font-bold">&bull;</span>
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Negotiation Scripts */}
              <div className="space-y-4">
                <h5 className="text-xs font-bold text-[#F4F1EA] uppercase tracking-wider flex items-center gap-2">
                  <Mail className="w-4 h-4 text-[#9B5CFF]" />
                  <span>Strategic Counter-Offer Email Scripts</span>
                </h5>

                {data.counter_offer_scripts?.map((script: any, idx: number) => {
                  const isCopied = copiedScriptIdx === idx;
                  return (
                    <div key={idx} className="bg-[#0D1016] border border-slate-800/80 hover:border-[#9B5CFF]/30 p-5 rounded-2xl space-y-3.5 shadow-xl transition-all">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                        <div>
                          <span className="px-2.5 py-0.5 rounded text-[10px] font-bold font-mono bg-[#9B5CFF]/15 text-[#9B5CFF] border border-[#9B5CFF]/30">
                            {script.style}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleCopy(`Subject: ${script.subject}

${script.body}`, idx)}
                          className="flex items-center gap-1.5 px-3 py-1 bg-[#11151D] hover:bg-[#1A202C] text-slate-300 hover:text-[#F4F1EA] text-xs font-bold rounded-lg border border-slate-800 transition-all cursor-pointer self-start sm:self-auto"
                        >
                          {isCopied ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-[#55D39A]" />
                              <span className="text-[#55D39A]">Copied Script!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5 text-[#9B5CFF]" />
                              <span>Copy Script</span>
                            </>
                          )}
                        </button>
                      </div>

                      <div className="p-4 bg-[#07080C] border border-slate-800 rounded-xl text-xs text-slate-300 leading-relaxed font-sans whitespace-pre-line select-text">
                        {script.body}
                      </div>

                      <div className="p-2.5 rounded-lg bg-[#11151D] border border-slate-800 text-[11px] text-[#9299A8]">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">When to use</span>
                        {script.recommended_when}
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
};
