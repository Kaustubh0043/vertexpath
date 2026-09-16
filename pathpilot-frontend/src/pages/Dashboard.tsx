import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { 
  Flame, 
  Map, 
  FileText, 
  Compass, 
  ArrowRight,
  PlusCircle,
  GraduationCap,
  Sparkles,
  Award,
  CheckCircle2,
  Share2,
  Copy,
  Check,
  HelpCircle,
  X,
  Zap,
  Terminal,
  Send,
  DollarSign,
  Cpu
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export const Dashboard: React.FC = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [showAddSkill, setShowAddSkill] = useState(false);
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillProgress, setNewSkillProgress] = useState(50);
  
  // Daily Drill State
  const [drillAnswered, setDrillAnswered] = useState(() => {
    const today = new Date().toISOString().split('T')[0];
    return localStorage.getItem(`daily_drill_${today}`) === 'completed';
  });
  const [selectedDrillOption, setSelectedDrillOption] = useState<number | null>(null);
  const [showBadgeModal, setShowBadgeModal] = useState(false);
  const [copiedBadge, setCopiedBadge] = useState(false);

  // Editable Career Goal from localStorage
  const [careerGoal, setCareerGoal] = useState(() => {
    return localStorage.getItem('careerGoal') || 'Software Engineer';
  });

  // Dynamic route ticks based on actual feature completions in user storage and DB
  const interviewCompleted = localStorage.getItem('interviewCompleted') === 'true';
  const jobMatchCompleted = localStorage.getItem('jobMatchCompleted') === 'true';
  const codingCompleted = localStorage.getItem('codingCompleted') === 'true';
  const outreachCompleted = localStorage.getItem('outreachCompleted') === 'true';
  const compensationCompleted = localStorage.getItem('compensationCompleted') === 'true';
  const projectCompleted = localStorage.getItem('projectCompleted') === 'true';

  // Fetch Dashboard statistics
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: async () => {
      const res = await api.get('/api/dashboard/stats');
      return res.data;
    },
  });

  // Mutate skills
  const addSkillMutation = useMutation({
    mutationFn: async (payload: { skillName: string; progressPercentage: number }) => {
      return api.post('/api/dashboard/skills', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
      setNewSkillName('');
      setShowAddSkill(false);
    },
  });

  // Increment Streak manually
  const incrementStreakMutation = useMutation({
    mutationFn: async () => {
      return api.post('/api/dashboard/streak');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
    },
  });

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;
    addSkillMutation.mutate({
      skillName: newSkillName,
      progressPercentage: newSkillProgress,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-2 border-slate-700 border-t-[#9B5CFF] rounded-full animate-spin" />
      </div>
    );
  }

  // Calculate dynamic, authentic progress based on actual user database statistics
  const totalRoadmaps = stats?.totalRoadmaps || 0;
  const totalDocuments = stats?.totalDocuments || 0;
  const totalSkills = stats?.skills?.length || 0;

  const isResumeDone = totalDocuments > 0;
  const isSkillsDone = totalSkills > 0;
  const isRoadmapsDone = totalRoadmaps > 0;
  const isProjectsDone = projectCompleted || (stats?.totalProjects && stats.totalProjects > 0);
  const isInterviewsDone = interviewCompleted || (stats?.totalInterviews && stats.totalInterviews > 0);
  const isCodingDone = codingCompleted;
  const isOutreachDone = outreachCompleted || compensationCompleted || jobMatchCompleted;

  let completedNodesCount = 1; // Start is always done
  if (isResumeDone) completedNodesCount++;
  if (isSkillsDone) completedNodesCount++;
  if (isRoadmapsDone) completedNodesCount++;
  if (isProjectsDone) completedNodesCount++;
  if (isInterviewsDone) completedNodesCount++;
  if (isCodingDone) completedNodesCount++;
  if (isOutreachDone) completedNodesCount++;

  const pathProgress = Math.min(Math.round((completedNodesCount / 8) * 100), 98);

  // Dynamic active navigation indicator stage mapping
  let activeStage = 'Resume';
  if (!isResumeDone) {
    activeStage = 'Resume';
  } else if (!isSkillsDone) {
    activeStage = 'Skills';
  } else if (!isRoadmapsDone) {
    activeStage = 'Roadmaps';
  } else if (!isProjectsDone) {
    activeStage = 'Projects';
  } else if (!isInterviewsDone) {
    activeStage = 'Interviews';
  } else if (!isCodingDone) {
    activeStage = 'Coding';
  } else if (!isOutreachDone) {
    activeStage = 'Outreach';
  } else {
    activeStage = 'Destination';
  }

  // Dynamic Next Move definition based on real states
  let nextMoveTitle = '';
  let nextMoveDesc = '';
  let nextMoveLink = '';
  let nextMoveButtonText = '';

  if (!isResumeDone) {
    nextMoveTitle = 'Upload your resume.';
    nextMoveDesc = 'VertexPath needs your baseline profile before it can calculate your ATS score.';
    nextMoveLink = '/dashboard/resume';
    nextMoveButtonText = 'UPLOAD RESUME →';
  } else if (!isSkillsDone) {
    nextMoveTitle = 'Map your technical skills.';
    nextMoveDesc = 'Add your first engineering or language skill to start mapping your career roadmap.';
    nextMoveLink = '#skills-section';
    nextMoveButtonText = 'ADD SKILL →';
  } else if (!isRoadmapsDone) {
    nextMoveTitle = 'Generate a Learning Path.';
    nextMoveDesc = 'Create a week-by-week curriculum checksheet covering database or microservice systems.';
    nextMoveLink = '/dashboard/roadmaps';
    nextMoveButtonText = 'BUILD ROADMAP →';
  } else if (!isProjectsDone) {
    nextMoveTitle = 'Scaffold a Project Blueprint.';
    nextMoveDesc = 'Synthesize complete file trees, database schemas, and API endpoints for your portfolio.';
    nextMoveLink = '/dashboard/projects';
    nextMoveButtonText = 'ARCHITECT PROJECT →';
  } else if (!isInterviewsDone) {
    nextMoveTitle = 'Complete a Mock Interview.';
    nextMoveDesc = 'Practice voice-powered technical and behavioral questions tailored to your goal.';
    nextMoveLink = '/dashboard/interviews';
    nextMoveButtonText = 'START INTERVIEW →';
  } else if (!isCodingDone) {
    nextMoveTitle = 'Solve a Live Code Challenge.';
    nextMoveDesc = 'Run your code through our in-browser IDE for automated Big-O complexity audits.';
    nextMoveLink = '/dashboard/coding';
    nextMoveButtonText = 'LAUNCH IDE →';
  } else if (!isOutreachDone) {
    nextMoveTitle = 'Generate Recruiter Outreach & Benchmark Salary.';
    nextMoveDesc = 'Craft personalized DMs for hiring managers and calculate compensation percentiles.';
    nextMoveLink = '/dashboard/outreach';
    nextMoveButtonText = 'START OUTREACH →';
  } else {
    nextMoveTitle = 'Consult AI Career Coach & Share Portfolio.';
    nextMoveDesc = 'Your career path is fully staged! Share your public portfolio with recruiters.';
    nextMoveLink = '/dashboard/chat';
    nextMoveButtonText = 'TALK TO COACH →';
  }

  // Activity map calendar rendering configurations
  const activityMap = stats?.dailyActivity || {};
  const activityKeys = Object.keys(activityMap).sort();

  const getActivityColor = (level: number) => {
    switch (level) {
      case 0: return 'bg-[#11151D] border border-slate-900';
      case 1: return 'bg-[#9B5CFF]/15 border border-[#9B5CFF]/10';
      case 2: return 'bg-[#9B5CFF]/35 border border-[#9B5CFF]/20';
      case 3: return 'bg-[#9B5CFF]/60 border border-[#9B5CFF]/30';
      case 4: return 'bg-[#9B5CFF] border border-[#C49AFF]/45';
      default: return 'bg-[#11151D]';
    }
  };

  const routeNodes = [
    { id: 'start', label: 'Start', path: '/dashboard', isDone: true, isActive: activeStage === 'Start' },
    { id: 'resume', label: 'Resume', path: '/dashboard/resume', isDone: isResumeDone, isActive: activeStage === 'Resume' },
    { id: 'skills', label: 'Skills', path: '#skills-section', isDone: isSkillsDone, isActive: activeStage === 'Skills' },
    { id: 'roadmaps', label: 'Roadmaps', path: '/dashboard/roadmaps', isDone: isRoadmapsDone, isActive: activeStage === 'Roadmaps' },
    { id: 'projects', label: 'Projects', path: '/dashboard/projects', isDone: isProjectsDone, isActive: activeStage === 'Projects' },
    { id: 'interviews', label: 'Interviews', path: '/dashboard/interviews', isDone: isInterviewsDone, isActive: activeStage === 'Interviews' },
    { id: 'coding', label: 'Live Code', path: '/dashboard/coding', isDone: isCodingDone, isActive: activeStage === 'Coding' },
    { id: 'outreach', label: 'Outreach', path: '/dashboard/outreach', isDone: isOutreachDone, isActive: activeStage === 'Outreach' },
    { id: 'destination', label: careerGoal.toUpperCase(), path: '#badge', isDone: false, isActive: activeStage === 'Destination', isDestination: true },
  ];

  return (
    <div className="space-y-12">
      
      {/* Editorial Dashboard Hero */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-900">
        <div className="space-y-2">
          <p className="eyebrow-text">Overview</p>
          <h2 className="text-3xl font-extrabold text-[#F4F1EA] tracking-tight">
            Good evening, {stats?.fullName || 'Developer'}.
          </h2>
          <div className="text-sm text-[#9299A8] max-w-xl font-medium flex items-center gap-1.5 flex-wrap">
            <span>Your path to</span>
            <input
              type="text"
              value={careerGoal}
              onChange={(e) => {
                const val = e.target.value;
                setCareerGoal(val);
                localStorage.setItem('careerGoal', val);
                window.dispatchEvent(new Event('careerGoalUpdated'));
              }}
              placeholder="e.g. Software Engineer"
              className="inline-editable-input focus:outline-none"
              style={{ 
                width: `${(careerGoal.length || 10) + 0.5}ch`
              }}
            />
            <span>is currently <span className="text-[#9B5CFF] font-bold">{pathProgress}%</span> complete.</span>
          </div>
          <div className="pt-2">
            <Link 
              to={nextMoveLink.startsWith('#') ? '/dashboard' : nextMoveLink}
              onClick={() => {
                if (nextMoveLink === '#skills-section') {
                  document.getElementById('skills-section')?.scrollIntoView({ behavior: 'smooth' });
                  setShowAddSkill(true);
                }
              }}
              className="inline-flex items-center gap-1.5 text-xs text-[#9B5CFF] hover:text-[#C49AFF] font-bold transition-all"
            >
              <span>Continue your path</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        <div className="self-start md:self-center flex items-center gap-3 flex-wrap">
          {/* Guided Tour Button */}
          <button
            onClick={() => window.dispatchEvent(new Event('startVertexTour'))}
            className="flex items-center gap-2 px-3.5 py-2 bg-[#11151D] hover:bg-[#1A202C] border border-slate-800 hover:border-[#9B5CFF]/40 text-[#F4F1EA] rounded-md text-xs font-bold transition-all cursor-pointer shadow-sm"
            title="Interactive Product Tour"
          >
            <Compass className="w-4 h-4 text-[#00E5FF]" />
            <span>Take Tour 🧭</span>
          </button>

          {/* Career Badge Modal Button */}
          <button
            onClick={() => setShowBadgeModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#11151D] hover:bg-[#1A202C] border border-slate-800 hover:border-[#9B5CFF]/40 text-[#F4F1EA] rounded-md text-xs font-bold transition-all cursor-pointer shadow-sm"
          >
            <Award className="w-4 h-4 text-[#9B5CFF]" />
            <span>Career Badge 🏆</span>
          </button>

          <button
            onClick={() => incrementStreakMutation.mutate()}
            className="flex items-center gap-2 px-4.5 py-2 bg-gradient-to-r from-[#9B5CFF]/10 to-[#FF6577]/10 hover:from-[#9B5CFF]/20 hover:to-[#FF6577]/20 border border-[#9B5CFF]/30 hover:border-[#9B5CFF]/60 text-[#F4F1EA] rounded-md text-xs font-bold transition-all duration-300 shadow-[0_0_15px_rgba(155,92,255,0.05)] hover:shadow-[0_0_20px_rgba(155,92,255,0.15)] cursor-pointer active:scale-95"
          >
            <Flame className="w-4 h-4 text-[#FF8A00] animate-pulse" />
            <span>Sync Daily Log</span>
          </button>
        </div>
      </div>

      {/* Signature Career Route Visual Tracker */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="eyebrow-text">Career Route Tracker</p>
          <span className="text-[11px] font-mono text-slate-500 font-bold hidden sm:inline">
            Click any milestone to open module
          </span>
        </div>

        <div className="relative bg-[#0D1016] border border-slate-900 p-6 rounded-xl overflow-x-auto shadow-inner">
          <div className="flex items-center justify-between min-w-[780px] relative px-4">
            
            {/* Background line indicator */}
            <div className="absolute top-1/2 left-8 right-8 h-[1px] bg-slate-800 -translate-y-1/2 z-0" />
            
            {routeNodes.map((node) => {
              const isChecked = node.isDone;
              const isActive = node.isActive;

              return (
                <div 
                  key={node.id} 
                  className="flex flex-col items-center gap-2 relative z-10 cursor-pointer group"
                  onClick={() => {
                    if (node.path === '#skills-section') {
                      document.getElementById('skills-section')?.scrollIntoView({ behavior: 'smooth' });
                      setShowAddSkill(true);
                    } else if (node.path === '#badge') {
                      setShowBadgeModal(true);
                    } else {
                      navigate(node.path);
                    }
                  }}
                >
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-300 group-hover:scale-125 ${
                    isChecked
                      ? 'bg-[#55D39A] border-[#55D39A] shadow-[0_0_12px_rgba(85,211,154,0.4)]'
                      : isActive 
                      ? 'border-[#9B5CFF] bg-[#07080C] ring-4 ring-[#9B5CFF]/20 shadow-[0_0_15px_rgba(155,92,255,0.4)]' 
                      : 'border-slate-800 bg-[#07080C] group-hover:border-slate-600'
                  }`}>
                    {isChecked && <span className="text-[9px] text-[#07080C] font-extrabold">✓</span>}
                    {!isChecked && isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#9B5CFF] animate-ping" />}
                  </div>

                  <span className={`text-[10px] font-bold uppercase tracking-wider transition-colors ${
                    isActive 
                      ? 'text-[#9B5CFF]' 
                      : isChecked 
                      ? 'text-slate-300 group-hover:text-white' 
                      : 'text-slate-500 group-hover:text-slate-400'
                  }`}>
                    {node.label}
                  </span>
                </div>
              );
            })}

          </div>
        </div>
      </div>

      {/* Main Split Grid (Whitespace offset composition) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column - Readiness & Next Move & Daily Drill */}
        <div className="lg:col-span-7 space-y-10">
          
          {/* Daily 5-Minute Technical Drill Widget */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="eyebrow-text">Daily Technical Drill</p>
              <span className="flex items-center gap-1 text-[11px] font-mono text-[#9B5CFF] font-bold">
                <Zap className="w-3.5 h-3.5 text-[#FF8A00] animate-pulse" />
                +1 Streak Booster
              </span>
            </div>

            <div className="p-6 bg-[#0D1016] border border-slate-900 rounded-lg space-y-5">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold bg-[#9B5CFF]/15 text-[#C49AFF] px-2 py-0.5 rounded uppercase">
                  {careerGoal} Drill
                </span>
                <span className="text-[10px] text-slate-500 font-mono">System Architecture</span>
              </div>

              <p className="text-sm font-semibold text-[#F4F1EA] leading-relaxed">
                "What is the primary architectural tradeoff when introducing a distributed caching layer (like Redis) in front of PostgreSQL?"
              </p>

              <div className="space-y-2">
                {[
                  "A. Caching guarantees ACID transactions across replicas",
                  "B. Read latency decreases significantly, but cache invalidation & data staleness complexity increases",
                  "C. PostgreSQL queries automatically run faster without Redis involvement",
                  "D. Redis replaces relational storage completely for primary keys"
                ].map((option, idx) => (
                  <button
                    key={idx}
                    disabled={drillAnswered}
                    onClick={() => {
                      setSelectedDrillOption(idx);
                      if (idx === 1) {
                        const today = new Date().toISOString().split('T')[0];
                        localStorage.setItem(`daily_drill_${today}`, 'completed');
                        setDrillAnswered(true);
                        incrementStreakMutation.mutate();
                      }
                    }}
                    className={`w-full text-left p-3 rounded text-xs font-medium border transition-all cursor-pointer ${
                      drillAnswered && idx === 1
                        ? 'bg-[#55D39A]/15 border-[#55D39A]/50 text-[#55D39A]'
                        : drillAnswered && selectedDrillOption === idx && idx !== 1
                        ? 'bg-rose-950/20 border-rose-800/40 text-rose-300'
                        : selectedDrillOption === idx
                        ? 'bg-[#9B5CFF]/15 border-[#9B5CFF] text-[#F4F1EA]'
                        : 'bg-[#11151D] border-slate-850 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>

              {drillAnswered && (
                <div className="p-3 bg-[#55D39A]/10 border border-[#55D39A]/30 rounded text-xs text-[#55D39A] font-medium flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Correct! Cache invalidation and cache-aside synchronization are the primary engineering hurdles. +1 Streak synced!</span>
                </div>
              )}
            </div>
          </div>

          {/* Dynamic Next Move Card */}
          <div className="p-8 bg-[#0D1016] border border-slate-900 rounded-lg space-y-6 relative overflow-hidden">
            <div className="space-y-2">
              <p className="eyebrow-text">Next Recommended Move</p>
              <h3 className="text-xl font-extrabold text-[#F4F1EA] tracking-tight">
                {nextMoveTitle}
              </h3>
              <p className="text-xs text-[#9299A8] leading-relaxed">
                {nextMoveDesc}
              </p>
            </div>

            <div className="pt-2">
              <Link
                to={nextMoveLink.startsWith('#') ? '/dashboard' : nextMoveLink}
                onClick={() => {
                  if (nextMoveLink === '#skills-section') {
                    document.getElementById('skills-section')?.scrollIntoView({ behavior: 'smooth' });
                    setShowAddSkill(true);
                  }
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#9B5CFF] hover:bg-[#C49AFF] text-[#07080C] text-xs font-bold rounded transition-all cursor-pointer"
              >
                <span>{nextMoveButtonText}</span>
              </Link>
            </div>
          </div>

        </div>

        {/* Right Column - Skill Map & Activity Heatmap */}
        <div className="lg:col-span-5 space-y-10">
          
          {/* Skill Map Section */}
          <div id="skills-section" className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="eyebrow-text">Your Skill Map</p>
              <button
                onClick={() => setShowAddSkill(!showAddSkill)}
                className="text-xs text-[#9B5CFF] hover:text-[#C49AFF] font-bold transition-colors cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
              </button>
            </div>

            {showAddSkill && (
              <form onSubmit={handleAddSkill} className="p-4 bg-[#0D1016] border border-slate-800 rounded-lg space-y-3">
                <input
                  type="text"
                  placeholder="Skill Name (e.g. Docker, Python, System Design)"
                  value={newSkillName}
                  onChange={(e) => setNewSkillName(e.target.value)}
                  className="w-full bg-[#11151D] border border-slate-800 p-2 text-xs rounded text-[#F4F1EA] focus:outline-none focus:border-[#9B5CFF]"
                />
                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-slate-500">Proficiency: {newSkillProgress}%</span>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={newSkillProgress}
                    onChange={(e) => setNewSkillProgress(Number(e.target.value))}
                    className="flex-1 accent-[#9B5CFF]"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddSkill(false)}
                    className="px-3 py-1 bg-slate-900 text-xs rounded text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1 bg-[#9B5CFF] text-[#07080C] text-xs font-bold rounded"
                  >
                    Add Skill
                  </button>
                </div>
              </form>
            )}

            <div className="p-6 bg-[#0D1016] border border-slate-900 rounded-lg space-y-4">
              {stats?.skills && stats.skills.length > 0 ? (
                stats.skills.map((skill: any, idx: number) => (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-300">{skill.skillName}</span>
                      <span className="text-[#9B5CFF] font-mono text-[11px] font-bold">{skill.progressPercentage}%</span>
                    </div>
                    <div className="w-full bg-[#11151D] h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-[#9B5CFF] to-[#C49AFF] h-full rounded-full transition-all duration-500"
                        style={{ width: `${skill.progressPercentage}%` }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-xs text-slate-500 space-y-2">
                  <p>No skills mapped yet.</p>
                  <button
                    onClick={() => setShowAddSkill(true)}
                    className="text-[#9B5CFF] hover:underline font-bold"
                  >
                    + Add your first skill
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Activity Heatmap */}
          <div className="space-y-4">
            <p className="eyebrow-text">Activity Heatmap</p>
            <div className="p-6 bg-[#0D1016] border border-slate-900 rounded-lg space-y-3">
              <div className="grid grid-cols-7 gap-1.5">
                {Array.from({ length: 35 }).map((_, idx) => {
                  const level = idx % 5;
                  return (
                    <div
                      key={idx}
                      className={`w-full aspect-square rounded-sm ${getActivityColor(level)}`}
                      title={`Activity level: ${level}`}
                    />
                  );
                })}
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono pt-1">
                <span>Less</span>
                <div className="flex items-center gap-1">
                  {[0, 1, 2, 3, 4].map((lvl) => (
                    <div key={lvl} className={`w-2.5 h-2.5 rounded-sm ${getActivityColor(lvl)}`} />
                  ))}
                </div>
                <span>More</span>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Shareable Career Badge Modal */}
      {showBadgeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#07080C]/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-[#0D1016] border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-[#9B5CFF]" />
                <span className="text-xs font-mono uppercase tracking-widest text-[#9B5CFF] font-bold">
                  Verified Readiness
                </span>
              </div>
              <button 
                onClick={() => setShowBadgeModal(false)}
                className="text-slate-500 hover:text-slate-300 p-1 rounded hover:bg-slate-900"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Badge Preview */}
            <div className="p-6 bg-[#11151D] border border-[#9B5CFF]/30 rounded-xl text-center space-y-3 relative overflow-hidden shadow-[0_0_30px_rgba(155,92,255,0.1)]">
              <div className="w-12 h-12 rounded-full bg-[#9B5CFF]/20 border border-[#9B5CFF]/40 flex items-center justify-center mx-auto text-[#C49AFF]">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-extrabold text-[#F4F1EA]">
                  {careerGoal} Ready
                </h4>
                <p className="text-[11px] text-slate-400 font-mono">
                  {stats?.fullName || 'Verified Developer'} • {pathProgress}% Track Complete
                </p>
              </div>
              <div className="text-[10px] text-[#55D39A] font-mono font-bold">
                ✓ VertexPath Neural Certified
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <button
                onClick={() => {
                  const badgeMarkdown = `[![VertexPath Certified](https://img.shields.io/badge/VertexPath-${encodeURIComponent(careerGoal)}_Ready-8A2BE2?style=for-the-badge&logo=shield)](https://pathpilot-ai-gilt.vercel.app)`;
                  navigator.clipboard.writeText(badgeMarkdown);
                  setCopiedBadge(true);
                  setTimeout(() => setCopiedBadge(false), 2000);
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#9B5CFF] hover:bg-[#C49AFF] text-[#07080C] text-xs font-bold rounded-lg transition-all cursor-pointer"
              >
                {copiedBadge ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copiedBadge ? 'Markdown Badge Copied!' : 'Copy README Badge Code'}</span>
              </button>

              <button
                onClick={() => {
                  setShowBadgeModal(false);
                  navigate('/portfolio/me');
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#11151D] hover:bg-[#1A202C] border border-slate-800 text-[#F4F1EA] text-xs font-bold rounded-lg transition-all cursor-pointer"
              >
                <Share2 className="w-4 h-4 text-[#9B5CFF]" />
                <span>View Public Shareable Portfolio</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};