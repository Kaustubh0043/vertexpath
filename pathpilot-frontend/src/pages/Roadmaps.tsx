import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { 
  Map, 
  Plus, 
  Trash2, 
  ChevronDown, 
  ChevronRight,
  CheckSquare, 
  Square, 
  Loader2, 
  Clock, 
  Calendar,
  Printer,
  Download,
  Share2
} from 'lucide-react';

export const Roadmaps: React.FC = () => {
  const queryClient = useQueryClient();
  const [activeRoadmapId, setActiveRoadmapId] = useState<string | null>(null);
  const [topicInput, setTopicInput] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [expandedNodeId, setExpandedNodeId] = useState<string | null>(null);
  
  // Rotating loading messages
  const roadmapLoadingMessages = [
    "VertexPath is contacting Gemini AI...",
    "Structuring progressive weekly learning modules...",
    "Drafting curriculum descriptions & syllabus tracks...",
    "Compiling weekly tasks & reference study resources...",
    "Polishing estimated time frames & study hours..."
  ];
  const [rmLoadingIndex, setRmLoadingIndex] = useState(0);

  // Reset scroll of parent main layout when roadmap changes
  useEffect(() => {
    const mainEl = document.querySelector('main');
    if (mainEl) {
      mainEl.scrollTop = 0;
    }
  }, [activeRoadmapId, isCreating]);

  // Fetch all roadmaps (Preserving query)
  const { data: roadmaps, isLoading: loadingList } = useQuery({
    queryKey: ['roadmaps'],
    queryFn: async () => {
      const res = await api.get('/api/roadmaps');
      return res.data;
    },
  });

  // Fetch details of active roadmap (Preserving query)
  const { data: roadmapDetails, isLoading: loadingDetails } = useQuery({
    queryKey: ['roadmapDetails', activeRoadmapId],
    queryFn: async () => {
      if (!activeRoadmapId) return null;
      const res = await api.get(`/api/roadmaps/${activeRoadmapId}`);
      return res.data;
    },
    enabled: !!activeRoadmapId,
  });

  // Generate roadmap mutation (Preserving mutation)
  const generateRoadmapMutation = useMutation({
    mutationFn: async (topic: string) => {
      const res = await api.post('/api/roadmaps/generate', { topic });
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['roadmaps'] });
      setActiveRoadmapId(data.id);
      setTopicInput('');
      setIsCreating(false);
    },
  });

  // Toggle task checklist with optimistic updates (Preserving mutation)
  const toggleTaskMutation = useMutation({
    mutationFn: async (taskId: string) => {
      return api.patch(`/api/roadmaps/tasks/${taskId}/toggle`);
    },
    onMutate: async (taskId: string) => {
      await queryClient.cancelQueries({ queryKey: ['roadmapDetails', activeRoadmapId] });
      const previousDetails = queryClient.getQueryData(['roadmapDetails', activeRoadmapId]);

      if (previousDetails) {
        const updatedDetails = JSON.parse(JSON.stringify(previousDetails));
        if (updatedDetails.nodes) {
          updatedDetails.nodes.forEach((node: any) => {
            if (node.tasks) {
              node.tasks.forEach((t: any) => {
                if (t.id === taskId) {
                  const nextState = !(t.isCompleted || t.completed);
                  t.isCompleted = nextState;
                  t.completed = nextState;
                }
              });
            }
          });
        }
        queryClient.setQueryData(['roadmapDetails', activeRoadmapId], updatedDetails);
      }

      return { previousDetails };
    },
    onError: (err, taskId, context) => {
      if (context?.previousDetails) {
        queryClient.setQueryData(['roadmapDetails', activeRoadmapId], context.previousDetails);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['roadmapDetails', activeRoadmapId] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
    },
  });

  // Delete roadmap (Preserving mutation)
  const deleteRoadmapMutation = useMutation({
    mutationFn: async (id: string) => {
      return api.delete(`/api/roadmaps/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roadmaps'] });
      if (activeRoadmapId) setActiveRoadmapId(null);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topicInput.trim()) return;
    generateRoadmapMutation.mutate(topicInput);
  };

  // Automatically expand current week when active roadmap details load
  useEffect(() => {
    if (roadmapDetails?.nodes) {
      const nodesWithStatus = getNodesWithStatus(roadmapDetails.nodes);
      const current = nodesWithStatus.find((n: any) => n.status === 'current');
      if (current) {
        setExpandedNodeId(current.id);
      } else if (nodesWithStatus.length > 0) {
        setExpandedNodeId(nodesWithStatus[0].id);
      }
    }
  }, [roadmapDetails]);

  // Calculate task completions percentage
  const calculateProgress = (nodes: any[]) => {
    if (!nodes || nodes.length === 0) return 0;
    let totalTasks = 0;
    let completedTasks = 0;
    nodes.forEach(node => {
      node.tasks?.forEach((task: any) => {
        totalTasks++;
        if (task.isCompleted || task.completed) completedTasks++;
      });
    });
    return totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  };

  // Dynamically classify module node states (Point 29)
  const getNodesWithStatus = (nodes: any[]) => {
    if (!nodes) return [];
    let foundCurrent = false;
    return nodes.map(node => {
      const allCompleted = node.tasks && node.tasks.length > 0 && node.tasks.every((t: any) => t.isCompleted || t.completed);
      let status = 'upcoming';
      if (allCompleted) {
        status = 'completed';
      } else if (!foundCurrent) {
        status = 'current';
        foundCurrent = true;
      }
      return { ...node, status };
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 min-h-[500px] items-start">
      
      {/* Sidebar - Roadmaps lists (Clean architectural list, Point 2) */}
      <div className="bg-[#0D1016] border border-slate-900 p-4 rounded-lg flex flex-col h-full md:col-span-1 space-y-4">
        <button
          onClick={() => { setIsCreating(true); setActiveRoadmapId(null); }}
          className="w-full flex items-center justify-center gap-2 py-2 bg-[#9B5CFF] hover:bg-[#C49AFF] text-[#07080C] rounded text-xs font-bold transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Path</span>
        </button>

        <div className="overflow-y-auto space-y-1 pr-1 custom-scrollbar max-h-[400px]">
          {loadingList ? (
            <Loader2 className="w-5 h-5 animate-spin text-[#9B5CFF] mx-auto py-4" />
          ) : !roadmaps || roadmaps.length === 0 ? (
            <p className="text-[11px] text-slate-500 text-center py-4">No roadmaps generated yet.</p>
          ) : (
            roadmaps.map((r: any) => (
              <div
                key={r.id}
                onClick={() => { setActiveRoadmapId(r.id); setIsCreating(false); }}
                className={`
                  flex items-center justify-between px-3 py-2.5 rounded text-xs font-semibold cursor-pointer border transition-all group
                  ${activeRoadmapId === r.id 
                    ? 'bg-[#11151D] border-slate-800 text-[#F4F1EA]' 
                    : 'text-[#9299A8] bg-transparent border-transparent hover:text-[#F4F1EA] hover:bg-[#11151D]/40'}
                `}
              >
                <div className="flex items-center gap-2 truncate">
                  <Map className="w-4 h-4 shrink-0 text-[#9B5CFF]" />
                  <span className="truncate">{r.title}</span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteRoadmapMutation.mutate(r.id);
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

      {/* Main Panel Detail View */}
      <div className="md:col-span-3 min-h-[400px] flex flex-col">
        {isCreating ? (
          /* Generation Panel form (Point 35, 36) */
          <div className="flex-1 flex flex-col justify-center max-w-md w-full py-8 space-y-6">
            <div className="space-y-2">
              <p className="eyebrow-text">Learning / 03</p>
              <h3 className="text-2xl font-extrabold text-[#F4F1EA] tracking-tight">What do you want to learn?</h3>
              <p className="text-xs text-[#9299A8] leading-relaxed">
                Provide a career domain, technology stack, or target role. VertexPath will generate a week-by-week checksheet roadmap.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Target Stack / Domain</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AWS Solutions Architect, Spring Boot Developer"
                  value={topicInput}
                  onChange={(e) => setTopicInput(e.target.value)}
                  className="w-full text-xs"
                />
              </div>

              <button
                type="submit"
                disabled={generateRoadmapMutation.isPending}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#9B5CFF] hover:bg-[#C49AFF] text-[#07080C] rounded text-xs font-bold transition-all cursor-pointer"
              >
                {generateRoadmapMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <span>Generate roadmap →</span>
                )}
              </button>
            </form>
            {generateRoadmapMutation.isError && (
              <div className="flex items-start gap-2 p-3 bg-[#FF6577]/10 border border-[#FF6577]/20 text-[#FF6577] text-xs rounded max-w-md mt-4 animate-fade-in">
                <span>
                  Error: {((generateRoadmapMutation.error as any)?.response?.data?.message) || 
                         ((generateRoadmapMutation.error as any)?.message) || 
                         "Failed to generate learning roadmap. Please verify backend connectivity."}
                </span>
              </div>
            )}
          </div>
        ) : !activeRoadmapId ? (
          /* Landing Empty View (Point 38) */
          <div className="flex-1 flex flex-col items-center justify-center text-center py-16 space-y-3">
            <div className="p-3 bg-[#11151D] border border-slate-900 rounded-lg">
              <Map className="w-8 h-8 text-[#9B5CFF]" />
            </div>
            <h4 className="text-base font-bold text-[#F4F1EA]">Select a Learning Path</h4>
            <p className="text-xs text-[#9299A8] max-w-xs leading-normal">
              Select an existing roadmap from the sidebar or click 'New Path' to generate a curriculum checksheet.
            </p>
          </div>
        ) : loadingDetails ? (
          /* Loading Detail View */
          <div className="flex-1 flex flex-col items-center justify-center py-16 space-y-2">
            <Loader2 className="w-6 h-6 animate-spin text-[#9B5CFF]" />
            <span className="text-xs text-slate-400">Loading syllabus data...</span>
          </div>
        ) : !roadmapDetails ? (
          <div className="flex-1 flex flex-col items-center justify-center py-16">
            <p className="text-xs text-slate-400">Curriculum not found.</p>
          </div>
        ) : (
          /* Detail Syllabus Panel (Point 29) */
          <div className="space-y-8 animate-fade-in">
            
            {/* Header Title / Description / Progress */}
            <div className="space-y-4 pb-6 border-b border-slate-900">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <p className="eyebrow-text">Syllabus Path</p>
                  <h3 className="text-2xl font-extrabold text-white tracking-tight">{roadmapDetails.title}</h3>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const content = `# ${roadmapDetails.title}\n\n${roadmapDetails.description}\n\n` +
                        roadmapDetails.nodes.map((n: any, idx: number) => 
                          `## Week ${idx + 1}: ${n.title}\n${n.description || ''}\n\n` +
                          (n.tasks || []).map((t: any) => `- [${t.isCompleted ? 'x' : ' '}] ${t.title} (${t.estimatedHours || 1}h)`).join('\n')
                        ).join('\n\n');
                      const blob = new Blob([content], { type: 'text/markdown' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `${roadmapDetails.title.replace(/\s+/g, '_')}_Roadmap.md`;
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#11151D] hover:bg-[#1A202C] text-slate-300 text-xs font-bold rounded-md border border-slate-800 transition-all cursor-pointer"
                    title="Export as Markdown"
                  >
                    <Download className="w-3.5 h-3.5 text-[#9B5CFF]" />
                    <span>Export MD</span>
                  </button>

                  <button
                    onClick={() => window.print()}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#9B5CFF]/15 hover:bg-[#9B5CFF]/25 text-[#9B5CFF] text-xs font-bold rounded-md border border-[#9B5CFF]/30 transition-all cursor-pointer"
                    title="Print or Save as PDF"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print / PDF</span>
                  </button>
                </div>
              </div>

              <p className="text-xs text-[#9299A8] leading-relaxed max-w-2xl">{roadmapDetails.description}</p>
              
              {/* Progress indicator */}
              <div className="space-y-2 max-w-md pt-2">
                <div className="flex justify-between text-[11px] font-semibold">
                  <span className="text-[#9299A8]">Path Progress</span>
                  <span className="text-[#9B5CFF]">{calculateProgress(roadmapDetails.nodes)}% Completed</span>
                </div>
                <div className="w-full h-1.5 bg-[#11151D] rounded overflow-hidden">
                  <div 
                    className="h-full bg-[#9B5CFF] transition-all duration-500" 
                    style={{ width: `${calculateProgress(roadmapDetails.nodes)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Chapter Timeline List (Point 29) */}
            <div className="space-y-6">
              {getNodesWithStatus(roadmapDetails.nodes).map((node: any, idx: number) => {
                const isCurrent = node.status === 'current';
                const isCompleted = node.status === 'completed';
                const isExpanded = expandedNodeId === node.id;
                
                // Format chapter header: e.g. "01 FOUNDATIONS"
                const prefixIndex = String(idx + 1).padStart(2, '0');
                const headingText = `${prefixIndex} ${node.title.toUpperCase()}`;

                return (
                  <div 
                    key={node.id}
                    onClick={() => setExpandedNodeId(isExpanded ? null : node.id)}
                    className={`p-5 rounded-lg border transition-all space-y-3 cursor-pointer
                      ${isCurrent 
                        ? 'border-[#9B5CFF]/30 bg-[#0D1016] border-l-2 border-l-[#9B5CFF]' 
                        : 'border-slate-900 bg-transparent text-slate-500'}`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold ${isCurrent ? 'text-[#F4F1EA]' : 'text-slate-500'}`}>
                          {headingText}
                        </span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          isCompleted 
                            ? 'bg-[#55D39A]/10 text-[#55D39A]' 
                            : isCurrent ? 'bg-[#9B5CFF]/10 text-[#9B5CFF]' : 'bg-slate-900 text-slate-600'
                        }`}>
                          {isCompleted ? '✓ Completed' : isCurrent ? '◉ Current' : '○ Upcoming'}
                        </span>
                      </div>
                      
                      <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                        Week {node.weekNumber}
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="space-y-3 pt-3 border-t border-slate-900/60" onClick={(e) => e.stopPropagation()}>
                        <p className="text-xs text-[#9299A8] leading-relaxed max-w-xl">{node.description}</p>
                        
                        {/* Tasks Checklist Sub-list (Point 29) */}
                        <div className="space-y-2 pt-2">
                          {node.tasks?.map((task: any) => {
                            const isTaskCompleted = task.isCompleted || task.completed;
                            return (
                              <div 
                                key={task.id}
                                onClick={() => toggleTaskMutation.mutate(task.id)}
                                className="flex items-start justify-between p-2.5 rounded bg-[#11151D] border border-slate-900 hover:border-slate-800 text-xs cursor-pointer transition-all group"
                              >
                                <div className="flex items-start gap-3 min-w-0 pr-4">
                                  {isTaskCompleted ? (
                                    <CheckSquare className="w-4 h-4 text-[#55D39A] shrink-0 mt-0.5" />
                                  ) : (
                                    <Square className="w-4 h-4 text-slate-500 group-hover:text-slate-400 shrink-0 mt-0.5" />
                                  )}
                                  <span className={`break-words whitespace-normal font-medium leading-normal ${isTaskCompleted ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                                    {task.title}
                                  </span>
                                </div>
                                
                                <div className="flex items-center gap-1 text-[10px] text-slate-500 shrink-0 mt-0.5">
                                  <Clock className="w-3.5 h-3.5" />
                                  <span>{task.estimatedHours}h</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
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
  );
};
