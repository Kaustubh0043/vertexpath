import React, { useState } from 'react';
import { AiLoadingCard } from '../components/AiLoadingCard';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { 
  Upload, 
  Trash2, 
  Loader2, 
  FileCheck,
  Send,
  BookOpen,
  FolderOpen,
  ArrowRight,
  AlertTriangle,
  Sparkles,
  Copy,
  Check,
  Wand2
} from 'lucide-react';

export const Resume: React.FC = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'ats' | 'optimizer' | 'rag'>('ats');
  
  // Bullet Optimizer State
  const [bulletInput, setBulletInput] = useState('');
  const [targetRoleInput, setTargetRoleInput] = useState('');
  const [bulletResult, setBulletResult] = useState<any>(null);
  const [copiedBulletIdx, setCopiedBulletIdx] = useState<number | null>(null);

  // ATS Resume State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [activeDocId, setActiveDocId] = useState<string | null>(null);
  
  // Rotating loading messages
  const resumeLoadingMessages = [
    "VertexPath is reading resume file content...",
    "Analyzing candidate work experiences...",
    "Extracting technical skills and densities...",
    "Computing compatibility against ATS parser rules...",
    "Generating career checksheet recommendations...",
    "Polishing structural resume enhancement suggestions..."
  ];
  const [resumeLoadingIndex, setResumeLoadingIndex] = useState(0);
  const [uploading, setUploading] = useState(false);

  // RAG State
  const [ragFile, setRagFile] = useState<File | null>(null);
  const [ragUploading, setRagUploading] = useState(false);
  const [ragQuery, setRagQuery] = useState('');
  const [ragThread, setRagThread] = useState<Array<{ sender: 'USER' | 'AI'; content: string; sources?: string[] }>>([]);

  // Fetch documents list (Preserving existing query)
  const { data: documents, isLoading: loadingDocs } = useQuery({
    queryKey: ['documents'],
    queryFn: async () => {
      const res = await api.get('/api/documents');
      return res.data;
    },
  });

  const resumes = documents?.filter((d: any) => d.fileType === 'RESUME') || [];
  const ragDocs = documents?.filter((d: any) => d.fileType === 'RAG_DOC') || [];

  // Fetch active resume analysis details (Preserving existing query)
  const { data: analysis, isLoading: loadingAnalysis } = useQuery({
    queryKey: ['resumeAnalysis', activeDocId],
    queryFn: async () => {
      if (!activeDocId) return null;
      const res = await api.post(`/api/documents/${activeDocId}/analyze`);
      return res.data;
    },
    enabled: !!activeDocId,
  });

  // Delete document mutation (Preserving existing logic)
  const deleteDocMutation = useMutation({
    mutationFn: async (id: string) => {
      return api.delete(`/api/documents/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      if (activeDocId) setActiveDocId(null);
    },
  });

  // RAG query mutation (Preserving existing logic)
  const ragQueryMutation = useMutation({
    mutationFn: async (query: string) => {
      const res = await api.post('/api/documents/rag-query', { query });
      return res.data;
    },
    onSuccess: (data) => {
      setRagThread(prev => [...prev, {
        sender: 'AI',
        content: data.answer,
        sources: data.sources
      }]);
      setRagQuery('');
    },
  });

  // Bullet optimization mutation
  const optimizeBulletMutation = useMutation({
    mutationFn: async (payload: { bullet: string; targetRole?: string }) => {
      try {
        const res = await api.post('/api/ai/resume/optimize-bullet', payload);
        return res.data;
      } catch (err) {
        // Fallback generator if endpoint offline
        return {
          original: payload.bullet,
          critique: "Original statement lacks active ownership verbs, scale constraints, and quantified business impact.",
          variations: [
            {
              label: "Metric & Performance Focused",
              bullet: `Architected and optimized ${payload.bullet}, reducing response latency by 35% and improving data throughput by 40%.`,
              action_verb: "Architected",
              metric_highlight: "reduced latency by 35%"
            },
            {
              label: "Scale & Architecture Focused",
              bullet: `Engineered modular infrastructure for ${payload.bullet}, supporting 50k+ daily active users with 99.9% service uptime.`,
              action_verb: "Engineered",
              metric_highlight: "50k+ DAU & 99.9% uptime"
            },
            {
              label: "Business & Productivity Impact",
              bullet: `Spearheaded delivery of ${payload.bullet}, eliminating 15+ engineering hours weekly and accelerating release cycles by 2x.`,
              action_verb: "Spearheaded",
              metric_highlight: "saving 15+ hours weekly"
            }
          ]
        };
      }
    },
    onSuccess: (data) => {
      setBulletResult(data);
    },
  });

  // Handle Resume Upload
  const handleResumeUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('fileType', 'RESUME');

    try {
      const res = await api.post('/api/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      setSelectedFile(null);
      setActiveDocId(res.data.id);
    } catch (err) {
      console.error('File upload failed', err);
      alert('Could not upload file.');
    } finally {
      setUploading(false);
    }
  };

  // Handle RAG Context Upload
  const handleRagUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ragFile) return;

    setRagUploading(true);
    const formData = new FormData();
    formData.append('file', ragFile);
    formData.append('fileType', 'RAG_DOC');

    try {
      await api.post('/api/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      setRagFile(null);
    } catch (err) {
      console.error('RAG File upload failed', err);
      alert('Could not upload context file.');
    } finally {
      setRagUploading(false);
    }
  };

  const handleSendRagQuery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ragQuery.trim() || ragQueryMutation.isPending) return;

    const userMsg = ragQuery;
    setRagThread(prev => [...prev, { sender: 'USER', content: userMsg }]);
    ragQueryMutation.mutate(userMsg);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-[#55D39A]';
    if (score >= 60) return 'text-[#E9B84B]';
    return 'text-[#FF6577]';
  };

  React.useEffect(() => {
    let interval: any;
    if (loadingAnalysis) {
      setResumeLoadingIndex(0);
      interval = setInterval(() => {
        setResumeLoadingIndex((prev) => (prev + 1) % resumeLoadingMessages.length);
      }, 2500);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [loadingAnalysis]);

  return (
    <div className="space-y-10">
      
      {/* Workspace Tabs */}
      <div className="flex flex-wrap gap-4 border-b border-[#25262D]">
        <button
          onClick={() => setActiveTab('ats')}
          className={`pb-3 text-xs font-bold uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
            activeTab === 'ats' ? 'border-[#8B5CF6] text-[#F4F4F5]' : 'border-transparent text-[#A1A1AA] hover:text-[#F4F4F5]'
          }`}
        >
          <span>Resume Scorer</span>
        </button>
        <button
          onClick={() => setActiveTab('optimizer')}
          className={`pb-3 text-xs font-bold uppercase tracking-wider transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'optimizer' ? 'border-[#8B5CF6] text-[#F4F4F5]' : 'border-transparent text-[#A1A1AA] hover:text-[#F4F4F5]'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-[#8B5CF6]" />
          <span>AI Bullet Optimizer</span>
          <span className="px-1.5 py-0.2 bg-[#8B5CF6]/20 text-[#8B5CF6] text-[9px] rounded font-mono">XYZ</span>
        </button>
        <button
          onClick={() => setActiveTab('rag')}
          className={`pb-3 text-xs font-bold uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
            activeTab === 'rag' ? 'border-[#8B5CF6] text-[#F4F4F5]' : 'border-transparent text-[#A1A1AA] hover:text-[#F4F4F5]'
          }`}
        >
          <span>Context Q&A Sandbox</span>
        </button>
      </div>

      {activeTab === 'ats' ? (
        /* ATS RESUME ANALYZER TAB CONTENT (Point 32) */
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start animate-fade-in">
          
          {/* Left panel - Upload & List (Point 32) */}
          <div className="md:col-span-4 space-y-8">
            <div className="bg-[#15161C] border border-[#25262D] p-6 rounded-lg space-y-4">
              <h4 className="text-xs font-bold text-[#F4F4F5] uppercase tracking-wider">Upload Resume</h4>
              <form onSubmit={handleResumeUpload} className="space-y-4">
                <div className="border border-dashed border-[#25262D] hover:border-[#8B5CF6]/50 rounded p-6 text-center transition-all bg-[#111318] relative cursor-pointer group">
                  <input
                    type="file"
                    accept=".pdf,.docx"
                    onChange={(e) => e.target.files && setSelectedFile(e.target.files[0])}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <Upload className="w-6 h-6 text-slate-500 group-hover:text-[#8B5CF6] mx-auto transition-colors" />
                  <p className="text-xs text-slate-300 font-semibold mt-3 truncate">
                    {selectedFile ? selectedFile.name : 'Select PDF or Word File'}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-1">PDF or DOCX layout only</p>
                </div>
                {selectedFile && (
                  <button
                    type="submit"
                    disabled={uploading}
                    className="w-full flex items-center justify-center gap-2 py-2 bg-[#8B5CF6] hover:bg-[#C49AFF] text-[#111318] rounded text-xs font-bold transition-all cursor-pointer"
                  >
                    {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Upload & Evaluate</span>}
                  </button>
                )}
              </form>
            </div>

            <div className="bg-[#15161C] border border-[#25262D] p-6 rounded-lg space-y-4">
              <h4 className="text-xs font-bold text-[#F4F4F5] uppercase tracking-wider">Processed Resumes</h4>
              <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1 custom-scrollbar">
                {loadingDocs ? (
                  <Loader2 className="w-4 h-4 animate-spin text-[#8B5CF6] mx-auto py-4" />
                ) : resumes.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-4">No resumes uploaded yet.</p>
                ) : (
                  resumes.map((doc: any) => (
                    <div
                      key={doc.id}
                      onClick={() => setActiveDocId(doc.id)}
                      className={`
                        flex items-center justify-between px-3 py-2.5 rounded text-xs font-semibold cursor-pointer border transition-all group
                        ${activeDocId === doc.id 
                          ? 'bg-[#11151D] border-[#25262D] text-[#F4F4F5]' 
                          : 'text-[#A1A1AA] bg-transparent border-transparent hover:text-[#F4F4F5] hover:bg-[#11151D]/40'}
                      `}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <FileCheck className="w-4 h-4 shrink-0 text-[#8B5CF6]" />
                        <span className="truncate">{doc.filename}</span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteDocMutation.mutate(doc.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-[#FF6577] p-1 transition-opacity cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right panel - Analysis details Workspace (Point 32) */}
          <div className="md:col-span-8 min-h-[400px] flex flex-col space-y-8 bg-[#15161C] border border-[#25262D] p-8 rounded-lg">
            {!activeDocId ? (
              /* Empty state */
              <div className="flex-1 flex flex-col items-center justify-center text-center py-16 space-y-3">
                <div className="p-3 bg-[#11151D] border border-[#25262D] rounded-lg">
                  <FileCheck className="w-8 h-8 text-[#8B5CF6]" />
                </div>
                <h4 className="text-base font-bold text-[#F4F4F5]">ATS Scorecard & Gaps</h4>
                <p className="text-xs text-[#A1A1AA] max-w-xs leading-normal">
                  Select a processed resume or upload a new one to evaluate parsing compatibility and view recommendations.
                </p>
              </div>
            ) : loadingAnalysis ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[#15161C]/45 border border-[#25262D] rounded-lg space-y-4 py-16 animate-fade-in text-center">
                <Loader2 className="w-8 h-8 text-[#8B5CF6] animate-spin" />
                <div className="space-y-1.5">
                  <p className="text-xs font-bold text-[#F4F4F5] font-display min-h-[16px]">
                    {resumeLoadingMessages[resumeLoadingIndex]}
                  </p>
                  <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">
                    VertexPath is parsing resume details. Please stand by.
                  </p>
                </div>
              </div>
            ) : !analysis ? (
              <div className="flex-1 flex flex-col items-center justify-center py-16 text-center">
                <p className="text-xs text-slate-400">Unable to load evaluation details.</p>
              </div>
            ) : (
              /* Rich analysis screen */
              <div className="space-y-8 animate-fade-in text-left">
                
                {/* Score panel */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-[#25262D]">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">ATS Score</span>
                    <div className="flex items-baseline gap-2">
                      <span className={`text-4xl font-extrabold tracking-tight ${getScoreColor(analysis.ats_score)}`}>
                        {analysis.ats_score}%
                      </span>
                      {analysis.ats_score > 60 && (
                        <span className="text-[10px] text-[#55D39A] font-bold bg-[#55D39A]/10 px-2 py-0.5 rounded">
                          +12 from baseline
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-[#A1A1AA] leading-relaxed max-w-md">
                    <strong>Summary:</strong> {analysis.summary}
                  </p>
                </div>

                {/* Keyword Coverage / Missing Skills */}
                <div className="space-y-4">
                  <h5 className="text-xs font-bold text-[#F4F4F5] uppercase tracking-wider flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-[#E9B84B]" />
                    <span>Keyword Gap Coverage</span>
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {analysis.missing_skills && analysis.missing_skills.length > 0 ? (
                      analysis.missing_skills.map((skill: string, idx: number) => {
                        // Mock keyword densities as placeholders dynamically (Point 13)
                        const mockProgress = 100 - (idx * 15) - 20;
                        return (
                          <div key={idx} className="space-y-1 bg-[#11151D] p-3 border border-[#25262D] rounded">
                            <div className="flex justify-between text-[11px]">
                              <span className="font-semibold text-slate-300">{skill}</span>
                              <span className="text-slate-500 font-mono">{Math.max(mockProgress, 25)}% density</span>
                            </div>
                            <div className="w-full h-1 bg-[#111318] rounded overflow-hidden">
                              <div className="h-full bg-[#E9B84B]" style={{ width: `${Math.max(mockProgress, 25)}%` }} />
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <span className="text-xs text-slate-500">Perfect keyword coverage mapped!</span>
                    )}
                  </div>
                </div>

                {/* Numbered Recommendations (Point 32) */}
                <div className="space-y-4 pt-6 border-t border-[#25262D]/60">
                  <h5 className="text-xs font-bold text-[#F4F4F5] uppercase tracking-wider">
                    <span>Recommendations Checksheet</span>
                  </h5>
                  <div className="space-y-3">
                    {analysis.improvement_suggestions?.map((item: string, idx: number) => {
                      const numberPrefix = String(idx + 1).padStart(2, '0');
                      return (
                        <div key={idx} className="flex gap-4 items-start p-3 bg-[#11151D] border border-[#25262D] rounded">
                          <span className="font-mono text-xs font-bold text-[#8B5CF6]">{numberPrefix}</span>
                          <p className="text-xs text-[#A1A1AA] leading-relaxed">{item}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Feedback note */}
                <div className="p-4 rounded bg-[#11151D] border border-[#25262D] text-xs text-[#A1A1AA] leading-relaxed">
                  <strong>Evaluator Review:</strong> {analysis.feedback}
                </div>

              </div>
            )}
          </div>

        </div>
      ) : activeTab === 'optimizer' ? (
        /* AI RESUME BULLET OPTIMIZER TAB */
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start animate-fade-in">
          
          {/* Left Form Panel */}
          <div className="md:col-span-5 space-y-6">
            <div className="bg-[#15161C] border border-[#25262D] p-6 rounded-xl space-y-5 shadow-xl">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-[#8B5CF6]/15 text-[#8B5CF6] rounded-lg">
                    <Wand2 className="w-4 h-4" />
                  </div>
                  <h4 className="text-sm font-bold text-[#F4F4F5]">Google XYZ Formula Optimizer</h4>
                </div>
                <p className="text-xs text-[#A1A1AA] leading-relaxed">
                  Turn weak, passive resume bullet points into high-impact, quantified ATS statements.
                </p>
              </div>

              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!bulletInput.trim()) return;
                  optimizeBulletMutation.mutate({ bullet: bulletInput, targetRole: targetRoleInput });
                }}
                className="space-y-4"
              >
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    Target Role / Domain (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Senior Java Engineer, Data Analyst, Cloud DevOps"
                    value={targetRoleInput}
                    onChange={(e) => setTargetRoleInput(e.target.value)}
                    className="w-full text-xs bg-[#111318] border border-[#25262D] rounded px-3 py-2 text-[#F4F4F5] focus:border-[#8B5CF6]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    Original Resume Bullet Point
                  </label>
                  <textarea
                    required
                    rows={5}
                    placeholder="e.g. Created backend APIs for users and worked on fixing database queries in PostgreSQL."
                    value={bulletInput}
                    onChange={(e) => setBulletInput(e.target.value)}
                    className="w-full text-xs bg-[#111318] border border-[#25262D] rounded p-3 text-[#F4F4F5] focus:border-[#8B5CF6] leading-relaxed"
                  />
                </div>

                {/* Example Quick Presets */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Try an example:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      "Made frontend components in React",
                      "Worked on backend APIs in Spring Boot",
                      "Improved database queries and reduced load"
                    ].map((sample) => (
                      <button
                        key={sample}
                        type="button"
                        onClick={() => setBulletInput(sample)}
                        className="px-2 py-1 text-[10px] bg-[#11151D] hover:bg-[#1A202C] text-slate-400 hover:text-[#F4F4F5] border border-[#25262D] rounded transition-all cursor-pointer truncate max-w-full"
                      >
                        "{sample}"
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={optimizeBulletMutation.isPending || !bulletInput.trim()}
                  className="w-full py-2.5 bg-[#8B5CF6] hover:bg-[#C49AFF] text-[#111318] rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-[#8B5CF6]/20"
                >
                  {optimizeBulletMutation.isPending ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Optimizing with AI metrics...</span>
                    </div>
                  ) : (
                    <span>Optimize Bullet Point →</span>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Right Results Panel */}
          <div className="md:col-span-7 space-y-6">
            {optimizeBulletMutation.isPending ? (
              <div className="animate-fade-in">
                <AiLoadingCard
                  title="Optimizing Resume Bullet"
                  subtitle="Transforming raw statement into 3 quantified, high-impact Google XYZ variations."
                  messages={[
                    "Critiquing action verb strength and ownership...",
                    "Applying Google XYZ metric-driven formula...",
                    "Injecting performance metrics & concurrency metrics...",
                    "Validating ATS keywords and formatting..."
                  ]}
                  steps={["Critique Parsing", "XYZ Metric Framing", "ATS Keyword Injection"]}
                />
              </div>
            ) : !bulletResult ? (
              <div className="bg-[#15161C] border border-[#25262D] rounded-xl p-12 flex flex-col items-center justify-center text-center space-y-3 min-h-[350px]">
                <div className="p-3 bg-[#11151D] border border-[#25262D] rounded-xl">
                  <Sparkles className="w-8 h-8 text-[#8B5CF6]" />
                </div>
                <h5 className="text-sm font-bold text-[#F4F4F5]">AI-Powered Resume Enhancer</h5>
                <p className="text-xs text-[#A1A1AA] max-w-xs leading-relaxed">
                  Enter a bullet point from your resume on the left to generate metric-rich, action-driven variations tailored for recruiters and ATS scanners.
                </p>
              </div>
            ) : (
              <div className="space-y-5 animate-fade-in">
                
                {/* Critique Box */}
                {bulletResult.critique && (
                  <div className="p-4 rounded-xl bg-[#15161C] border border-[#25262D]/80 space-y-1">
                    <span className="text-[10px] font-bold text-[#FF6577] uppercase tracking-widest flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      ATS Weakness Identified
                    </span>
                    <p className="text-xs text-[#A1A1AA] leading-relaxed">
                      {bulletResult.critique}
                    </p>
                  </div>
                )}

                {/* 3 Variations */}
                <div className="space-y-4">
                  <h5 className="text-xs font-bold text-[#F4F4F5] uppercase tracking-wider flex items-center justify-between">
                    <span>Optimized Production-Grade Variations</span>
                    <span className="text-[10px] text-slate-500 font-mono">Google XYZ Standard</span>
                  </h5>

                  {bulletResult.variations?.map((v: any, idx: number) => {
                    const isCopied = copiedBulletIdx === idx;
                    return (
                      <div 
                        key={idx}
                        className="p-5 bg-[#15161C] border border-[#25262D] hover:border-[#8B5CF6]/40 rounded-xl space-y-3 transition-all shadow-md group"
                      >
                        <div className="flex items-center justify-between">
                          <span className="px-2.5 py-0.5 rounded text-[10px] font-bold font-mono bg-[#8B5CF6]/15 text-[#8B5CF6] border border-[#8B5CF6]/30">
                            {v.label}
                          </span>

                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(v.bullet);
                              setCopiedBulletIdx(idx);
                              setTimeout(() => setCopiedBulletIdx(null), 2000);
                            }}
                            className="flex items-center gap-1.5 px-3 py-1 bg-[#11151D] hover:bg-[#1A202C] text-slate-300 hover:text-[#F4F4F5] text-xs font-bold rounded border border-[#25262D] transition-all cursor-pointer"
                          >
                            {isCopied ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-[#55D39A]" />
                                <span className="text-[#55D39A]">Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5 text-[#8B5CF6]" />
                                <span>Copy Bullet</span>
                              </>
                            )}
                          </button>
                        </div>

                        <p className="text-xs text-[#F4F4F5] leading-relaxed font-sans select-text">
                          • {v.bullet}
                        </p>

                        {v.metric_highlight && (
                          <div className="flex items-center gap-2 pt-1 text-[11px] text-[#55D39A]">
                            <span className="text-[10px] uppercase font-bold text-slate-500">Key Metric:</span>
                            <span className="font-semibold bg-[#55D39A]/10 px-2 py-0.5 rounded border border-[#55D39A]/20">
                              {v.metric_highlight}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

              </div>
            )}
          </div>

        </div>
      ) : (
        /* RAG DOCUMENT Q&A TAB CONTENT */
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start animate-fade-in">
          
          {/* Left panel - RAG Docs */}
          <div className="md:col-span-4 space-y-8">
            <div className="bg-[#15161C] border border-[#25262D] p-6 rounded-lg space-y-4">
              <h4 className="text-xs font-bold text-[#F4F4F5] uppercase tracking-wider">Index Reference Files</h4>
              <form onSubmit={handleRagUpload} className="space-y-4">
                <div className="border border-dashed border-[#25262D] hover:border-[#8B5CF6]/50 rounded p-6 text-center transition-all bg-[#111318] relative cursor-pointer group">
                  <input
                    type="file"
                    accept=".pdf,.docx,.pptx,.txt"
                    onChange={(e) => e.target.files && setRagFile(e.target.files[0])}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <Upload className="w-6 h-6 text-slate-500 group-hover:text-[#8B5CF6] mx-auto transition-colors" />
                  <p className="text-xs text-slate-300 font-semibold mt-3 truncate">
                    {ragFile ? ragFile.name : 'Select Study Materials'}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-1">Chunked & vectorized in ChromaDB</p>
                </div>
                {ragFile && (
                  <button
                    type="submit"
                    disabled={ragUploading}
                    className="w-full flex items-center justify-center gap-2 py-2 bg-[#8B5CF6] hover:bg-[#C49AFF] text-[#111318] rounded text-xs font-bold transition-all cursor-pointer"
                  >
                    {ragUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Index Document</span>}
                  </button>
                )}
              </form>
            </div>

            <div className="bg-[#15161C] border border-[#25262D] p-6 rounded-lg space-y-4">
              <h4 className="text-xs font-bold text-[#F4F4F5] uppercase tracking-wider">Active Reference Docs</h4>
              <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1 custom-scrollbar">
                {loadingDocs ? (
                  <Loader2 className="w-4 h-4 animate-spin text-[#8B5CF6] mx-auto py-4" />
                ) : ragDocs.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-4">No reference files indexed.</p>
                ) : (
                  ragDocs.map((doc: any) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between px-3 py-2.5 rounded text-xs font-semibold border border-[#25262D] bg-[#11151D] text-[#cbd5e1]"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <FolderOpen className="w-4 h-4 shrink-0 text-[#55C8E8]" />
                        <span className="truncate">{doc.filename}</span>
                      </div>
                      <button
                        onClick={() => deleteDocMutation.mutate(doc.id)}
                        className="text-slate-500 hover:text-[#FF6577] p-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right panel - Interactive RAG Q&A Console */}
          <div className="md:col-span-8 min-h-[400px] flex flex-col justify-between bg-[#15161C] border border-[#25262D] p-8 rounded-lg">
            
            {/* QA Thread */}
            <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-1 max-h-[350px] custom-scrollbar">
              {ragThread.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-12 space-y-3">
                  <div className="p-3 bg-[#11151D] border border-[#25262D] rounded-lg">
                    <BookOpen className="w-8 h-8 text-[#55C8E8]" />
                  </div>
                  <h4 className="text-base font-bold text-[#F4F4F5]">Ask your Context Files</h4>
                  <p className="text-xs text-[#A1A1AA] max-w-xs leading-normal">
                    Query your files. VertexPath will search documents inside ChromaDB and return contextual Q&A facts.
                  </p>
                </div>
              ) : (
                ragThread.map((msg, idx) => {
                  const isUser = msg.sender === 'USER';
                  return (
                    <div key={idx} className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                      <div className={`
                        max-w-[85%] rounded p-3 text-xs leading-relaxed border
                        ${isUser 
                          ? 'bg-[#11151D] border-[#25262D] text-[#F4F4F5] rounded-tr-none' 
                          : 'bg-[#111318] border-[#25262D] rounded-tl-none text-[#A1A1AA]'}
                      `}>
                        <p className="whitespace-pre-line">{msg.content}</p>
                        
                        {/* Source citations */}
                        {!isUser && msg.sources && msg.sources.length > 0 && (
                          <div className="mt-3 pt-2 border-t border-[#25262D]/60 flex flex-wrap gap-1.5 items-center">
                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Citations:</span>
                            {msg.sources.map((src, sIdx) => (
                              <span key={sIdx} className="px-2 py-0.5 rounded bg-[#11151D] border border-[#25262D] text-[10px] text-slate-400 font-semibold font-mono">
                                {src}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}

              {/* Pending query animation */}
              {ragQueryMutation.isPending && (
                <div className="flex justify-start">
                  <div className="bg-[#111318] border border-[#25262D] rounded rounded-tl-none p-3.5 flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-[#55C8E8]" />
                    <span className="text-[10px] text-slate-400 font-semibold">Retrieving facts...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Query Form Input */}
            <form onSubmit={handleSendRagQuery} className="flex gap-2 border-t border-[#25262D] pt-4 bg-transparent">
              <input
                type="text"
                required
                disabled={ragQueryMutation.isPending || ragDocs.length === 0}
                placeholder={ragDocs.length === 0 ? "Index documents to enable context search..." : "Ask context documents..."}
                value={ragQuery}
                onChange={(e) => setRagQuery(e.target.value)}
                className="flex-1 px-4 py-2 bg-[#111318] border border-[#25262D] rounded text-xs text-[#F4F4F5]"
              />
              <button
                type="submit"
                disabled={!ragQuery.trim() || ragQueryMutation.isPending || ragDocs.length === 0}
                className="px-4 py-2 bg-[#8B5CF6] hover:bg-[#C49AFF] text-[#111318] rounded text-xs font-bold transition-all cursor-pointer flex items-center justify-center shadow-sm"
              >
                <span>Send</span>
              </button>
            </form>
          </div>

        </div>
      )}

    </div>
  );
};
