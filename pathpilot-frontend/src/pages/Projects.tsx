import React, { useState } from 'react';
import { AiLoadingCard } from '../components/AiLoadingCard';
import { useMutation } from '@tanstack/react-query';
import { api } from '../services/api';
import { 
  Terminal, 
  Database, 
  Cpu, 
  FolderTree, 
  Loader2, 
  Copy,
  Check,
  Download,
  Sparkles
} from 'lucide-react';

export const Projects: React.FC = () => {
  const [stackInput, setStackInput] = useState('');
  const [result, setResult] = useState<any>(null);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  
  // Rotating loading messages
  const projectLoadingMessages = [
    "VertexPath Neural Engine is modeling directory patterns...",
    "Analyzing your target tech stack structure...",
    "Modeling folder layouts & directory architecture...",
    "Designing normalized PostgreSQL entity relationships...",
    "Formulating REST controller router mappings...",
    "Polishing production-grade architectural guidelines..."
  ];
  const [loadingMsgIndex, setLoadingMsgIndex] = useState(0);

  // Generate project design mutation (Preserving existing logic)
  const generateProjectMutation = useMutation({
    mutationFn: async (stack: string) => {
      const res = await api.post('/api/ai/project', { stack });
      return res.data;
    },
    onSuccess: (data) => {
      setResult(data);
      setTimeout(() => {
        const el = document.getElementById('project-results');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!stackInput.trim()) return;
    generateProjectMutation.mutate(stackInput);
  };

  const copyText = (text: string, section: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  React.useEffect(() => {
    let interval: any;
    if (generateProjectMutation.isPending) {
      setLoadingMsgIndex(0);
      interval = setInterval(() => {
        setLoadingMsgIndex((prev) => (prev + 1) % projectLoadingMessages.length);
      }, 2500);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [generateProjectMutation.isPending]);

  return (
    <div className="space-y-12">
      
      {/* Title & Query Box (Points 30, 35, 36) */}
      <div className="space-y-6">
        <div className="space-y-2">
          <p className="eyebrow-text">Build / 06</p>
          <h3 className="text-2xl font-extrabold text-[#F4F1EA] tracking-tight">What do you want to build?</h3>
          <p className="text-xs text-[#9299A8] leading-relaxed max-w-xl">
            Provide a stack definition or specific product idea. VertexPath will model the directory layouts, relational SQL database schemas, and REST API controller gateway endpoints.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-2xl bg-[#0D1016] p-2 border border-slate-900 rounded-lg">
          <input
            type="text"
            required
            placeholder="e.g. ecommerce app with React, Spring Boot, and PostgreSQL"
            value={stackInput}
            onChange={(e) => setStackInput(e.target.value)}
            className="flex-1 bg-[#07080C] border-none text-xs text-[#F4F1EA] px-3 focus:outline-none placeholder-slate-600 focus:ring-0 focus:border-none"
          />
          <button
            type="submit"
            disabled={generateProjectMutation.isPending || !stackInput.trim()}
            className="px-5 py-2 bg-[#9B5CFF] hover:bg-[#C49AFF] text-[#07080C] text-xs font-bold rounded transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            {generateProjectMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <span>Generate architecture →</span>
            )}
          </button>
        </form>
        {generateProjectMutation.isError && (
          <div className="flex items-start gap-2 p-3 bg-[#FF6577]/10 border border-[#FF6577]/20 text-[#FF6577] text-xs rounded max-w-2xl mt-4 animate-fade-in">
            <span>
              Error: {((generateProjectMutation.error as any)?.response?.data?.message) || 
                     ((generateProjectMutation.error as any)?.message) || 
                     "Failed to generate project architecture. Please verify backend connectivity."}
            </span>
          </div>
        )}
      </div>

      {generateProjectMutation.isPending && (
        <div className="animate-fade-in my-6">
          <AiLoadingCard
            title="Architecting Blueprint"
            subtitle={`VertexPath is modeling folder layouts, database schemas, and REST endpoints for "${stackInput}".`}
            messages={projectLoadingMessages}
            steps={["Analyzing Stack", "Synthesizing Schema", "Generating REST APIs"]}
          />
        </div>
      )}

      {/* Blueprint Visual Workspace Results (Point 30) */}
      {result && !generateProjectMutation.isPending && (
        <div id="project-results" className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start animate-fade-up-header">
          
          {/* Concept Overview Box */}
          <div className="bg-[#0D1016] border border-slate-900 p-6 rounded-lg md:col-span-2 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/60 pb-3">
              <h5 className="text-xs font-bold text-[#F4F1EA] flex items-center gap-2">
                <Cpu className="w-4.5 h-4.5 text-[#9B5CFF]" />
                <span>Project Concept & Overview</span>
              </h5>

              <button
                onClick={() => {
                  const content = `# Architecture Blueprint: ${stackInput}\n\n` +
                    `## 💡 Concept & Ideas\n${result.ideas}\n\n` +
                    `## 📁 Directory Structure\n\`\`\`\n${result.folder_structure}\n\`\`\`\n\n` +
                    `## 🌐 REST Controllers Gateway\n\`\`\`\n${result.api_suggestions}\n\`\`\`\n\n` +
                    `## 🗄️ Relational Schema (SQL / DDL)\n\`\`\`sql\n${result.database_design}\n\`\`\`\n`;
                  const blob = new Blob([content], { type: 'text/markdown' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `Architecture_Blueprint_${stackInput.replace(/[^a-zA-Z0-9]/g, '_')}.md`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#9B5CFF]/15 hover:bg-[#9B5CFF]/25 text-[#9B5CFF] text-xs font-bold rounded-md border border-[#9B5CFF]/30 transition-all cursor-pointer w-fit"
                title="Download Blueprint Scaffold"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Spec (.MD)</span>
              </button>
            </div>
            <p className="text-xs text-[#9299A8] leading-relaxed font-sans select-text">
              {result.ideas}
            </p>
          </div>

          {/* Directory Blueprint */}
          <div className="bg-[#0D1016] border border-slate-900 flex flex-col h-[380px] rounded-lg">
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-900 bg-[#11151D]/40">
              <h5 className="text-[11px] font-bold text-[#9299A8] flex items-center gap-2 uppercase tracking-wide">
                <FolderTree className="w-4 h-4 text-[#9B5CFF]" />
                <span>Directory Layout</span>
              </h5>
              <button 
                onClick={() => copyText(result.folder_structure, 'folder')}
                className="text-[10px] text-slate-500 hover:text-[#F4F1EA] flex items-center gap-1 cursor-pointer transition-colors font-semibold"
              >
                {copiedSection === 'folder' ? (
                  <span className="text-[#55D39A]">Copied</span>
                ) : (
                  <span>Copy</span>
                )}
              </button>
            </div>
            <pre className="p-4 overflow-auto flex-1 font-mono text-[11px] text-[#C49AFF] leading-relaxed select-text bg-[#07080C] custom-scrollbar">
              <code>{result.folder_structure}</code>
            </pre>
          </div>

          {/* API Controller Specs */}
          <div className="bg-[#0D1016] border border-slate-900 flex flex-col h-[380px] rounded-lg">
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-900 bg-[#11151D]/40">
              <h5 className="text-[11px] font-bold text-[#9299A8] flex items-center gap-2 uppercase tracking-wide">
                <Terminal className="w-4 h-4 text-[#55C8E8]" />
                <span>REST Controllers Gateway</span>
              </h5>
              <button 
                onClick={() => copyText(result.api_suggestions, 'api')}
                className="text-[10px] text-slate-500 hover:text-[#F4F1EA] flex items-center gap-1 cursor-pointer transition-colors font-semibold"
              >
                {copiedSection === 'api' ? (
                  <span className="text-[#55D39A]">Copied</span>
                ) : (
                  <span>Copy</span>
                )}
              </button>
            </div>
            <pre className="p-4 overflow-auto flex-1 font-mono text-[11px] text-[#CBD5E1] leading-relaxed select-text bg-[#07080C] custom-scrollbar">
              <code>{result.api_suggestions}</code>
            </pre>
          </div>

          {/* Database SQL Design Schema */}
          <div className="bg-[#0D1016] border border-slate-900 flex flex-col h-[380px] md:col-span-2 rounded-lg">
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-900 bg-[#11151D]/40">
              <h5 className="text-[11px] font-bold text-[#9299A8] flex items-center gap-2 uppercase tracking-wide">
                <Database className="w-4 h-4 text-[#E9B84B]" />
                <span>Relational Schema (SQL / DDL)</span>
              </h5>
              <button 
                onClick={() => copyText(result.database_design, 'db')}
                className="text-[10px] text-slate-500 hover:text-[#F4F1EA] flex items-center gap-1 cursor-pointer transition-colors font-semibold"
              >
                {copiedSection === 'db' ? (
                  <span className="text-[#55D39A]">Copied</span>
                ) : (
                  <span>Copy</span>
                )}
              </button>
            </div>
            <pre className="p-4 overflow-auto flex-1 font-mono text-[11px] text-[#E9B84B]/90 leading-relaxed select-text bg-[#07080C] custom-scrollbar">
              <code>{result.database_design}</code>
            </pre>
          </div>

        </div>
      )}

    </div>
  );
};
