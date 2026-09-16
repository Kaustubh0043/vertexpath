import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '../services/api';
import { 
  Loader2, 
  Terminal,
  AlertCircle,
  CheckCircle,
  HelpCircle,
  ArrowRight
} from 'lucide-react';

export const JdMatch: React.FC = () => {
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [jdText, setJdText] = useState('');
  const [result, setResult] = useState<any>(null);

  // Fetch resumes list (Preserving existing query)
  const { data: documents } = useQuery({
    queryKey: ['documents'],
    queryFn: async () => {
      const res = await api.get('/api/documents');
      return res.data;
    },
  });

  const resumes = documents?.filter((d: any) => d.fileType === 'RESUME') || [];

  // Match Job Description mutation (Preserving existing logic)
  const matchJdMutation = useMutation({
    mutationFn: async (payload: { resumeId: string; jdText: string }) => {
      const res = await api.post(`/api/documents/${payload.resumeId}/compare-jd`, {
        jdText: payload.jdText,
      });
      return res.data;
    },
    onSuccess: (data) => {
      setResult(data);
      localStorage.setItem('jobMatchCompleted', 'true');
      setTimeout(() => {
        const el = document.getElementById('jd-results');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedResumeId || !jdText.trim()) return;
    matchJdMutation.mutate({
      resumeId: selectedResumeId,
      jdText,
    });
  };

  const getMatchColor = (percent: number) => {
    if (percent >= 75) return 'text-[#55D39A]';
    if (percent >= 50) return 'text-[#E9B84B]';
    return 'text-[#FF6577]';
  };

  return (
    <div className="space-y-12">
      
      {/* Title Header (Point 31) */}
      <div className="space-y-2">
        <p className="eyebrow-text">Career / 04</p>
        <h3 className="text-2xl font-extrabold text-[#F4F4F5] tracking-tight">See how your skills fit the role</h3>
        <p className="text-xs text-[#A1A1AA] leading-relaxed max-w-xl">
          Compare your active profile resume against target job description criteria. VertexPath will map matching skills and highlight development gaps.
        </p>
      </div>

      {/* Input panel Form (Point 31) */}
      <div className="bg-[#15161C] border border-[#25262D] p-6 rounded-lg space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
            {/* Resume Selector */}
            <div className="space-y-1.5 md:col-span-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Select Resume Profile</label>
              <select
                required
                value={selectedResumeId}
                onChange={(e) => setSelectedResumeId(e.target.value)}
                className="w-full px-3 py-2.5 bg-[#111318] border border-[#25262D] rounded text-xs text-[#F4F4F5] focus:outline-none focus:border-[#8B5CF6]"
              >
                <option value="">-- Choose Profile --</option>
                {resumes.map((doc: any) => (
                  <option key={doc.id} value={doc.id}>{doc.filename}</option>
                ))}
              </select>
            </div>

            {/* Hint message */}
            <div className="md:col-span-2 text-xs text-[#A1A1AA] pb-1.5 leading-relaxed">
              Ensure your uploaded file contains the latest stack milestones for an accurate gap alignment comparison.
            </div>
          </div>

          {/* Job Description Textarea */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Target Job Description</label>
            <textarea
              required
              rows={6}
              placeholder="Paste the complete job description details, requirements, or core stack criteria..."
              value={jdText}
              onChange={(e) => setJdText(e.target.value)}
              className="w-full text-xs font-sans leading-relaxed"
            />
          </div>

          <button
            type="submit"
            disabled={matchJdMutation.isPending || !selectedResumeId || !jdText.trim()}
            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-[#8B5CF6] hover:bg-[#C49AFF] text-[#111318] text-xs font-bold rounded transition-all cursor-pointer"
          >
            {matchJdMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <span>Run analysis →</span>
            )}
          </button>
        </form>
      </div>

      {/* Results panel Display (Point 31) */}
      {result && (
        <div id="jd-results" className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start animate-fade-up-header border-t border-[#25262D] pt-8">
          
          {/* Left Column: Match Score Scorecard */}
          <div className="md:col-span-4 bg-[#15161C] border border-[#25262D] p-6 rounded-lg space-y-4">
            <p className="eyebrow-text">Compatibility Fit</p>
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Match Score</span>
              <div className="text-4xl font-extrabold tracking-tight">
                <span className={getMatchColor(result.match_percentage)}>{result.match_percentage}%</span>
              </div>
            </div>
            <div className="w-full h-1 bg-[#11151D] rounded overflow-hidden">
              <div 
                className="h-full bg-[#8B5CF6] transition-all duration-500" 
                style={{ width: `${result.match_percentage}%` }}
              />
            </div>
            <p className="text-xs text-[#A1A1AA] leading-relaxed">
              Your profile shares a {result.match_percentage}% keyword alignment with the target description.
            </p>
          </div>

          {/* Right Column: Key Details, Gaps, and Recommended Actions */}
          <div className="md:col-span-8 space-y-8">
            
            {/* Missing Tech / Gaps */}
            <div className="space-y-3">
              <h5 className="text-xs font-bold text-[#F4F4F5] uppercase tracking-wider flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-[#FF6577]" />
                <span>Gaps / Missing Technologies</span>
              </h5>
              <div className="flex flex-wrap gap-1.5">
                {result.missing_technologies && result.missing_technologies.length > 0 ? (
                  result.missing_technologies.map((tech: string, idx: number) => (
                    <span 
                      key={idx}
                      className="px-2 py-0.5 bg-[#FF6577]/10 border border-[#FF6577]/20 text-[#FF6577] text-[10px] font-bold rounded"
                    >
                      {tech}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-500">No major stack gaps detected.</span>
                )}
              </div>
            </div>

            {/* Bulletins Analysis */}
            <div className="space-y-3">
              <h5 className="text-xs font-bold text-[#F4F4F5] uppercase tracking-wider">
                <span>Gap Details</span>
              </h5>
              <ul className="space-y-2">
                {result.skill_gap_analysis?.map((gap: string, idx: number) => (
                  <li key={idx} className="flex gap-2 items-start text-xs text-[#A1A1AA] leading-relaxed">
                    <span className="w-1.5 h-1.5 bg-[#FF6577] rounded-full shrink-0 mt-1.5" />
                    <span>{gap}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Recovery Pathways & Prep */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-[#25262D]/60">
              
              <div className="space-y-3">
                <h5 className="text-xs font-bold text-[#F4F4F5] uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-[#55D39A]" />
                  <span>Next Steps / Learning Paths</span>
                </h5>
                <ul className="space-y-2">
                  {result.recommended_learning_path?.map((path: string, idx: number) => (
                    <li key={idx} className="flex gap-2 items-start text-xs text-[#A1A1AA] leading-relaxed">
                      <span className="w-1 h-1 bg-[#8B5CF6] rounded-full shrink-0 mt-2" />
                      <span>{path}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-3">
                <h5 className="text-xs font-bold text-[#F4F4F5] uppercase tracking-wider flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-[#55C8E8]" />
                  <span>Interview Preparation</span>
                </h5>
                <ul className="space-y-2">
                  {result.interview_prep_topics?.map((topic: string, idx: number) => (
                    <li key={idx} className="flex gap-2 items-start text-xs text-[#A1A1AA] leading-relaxed">
                      <span className="w-1 h-1 bg-[#55C8E8] rounded-full shrink-0 mt-2" />
                      <span>{topic}</span>
                    </li>
                  ))}
                </ul>
              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
};
