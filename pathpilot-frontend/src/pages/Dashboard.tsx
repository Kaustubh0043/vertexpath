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
  Zap
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

  // Dynamic route ticks based on actual feature completions
  const interviewCompleted = localStorage.getItem('interviewCompleted') === 'true';
  const jobMatchCompleted = localStorage.getItem('jobMatchCompleted') === 'true';

  // Fetch Dashboard statistics (Preserving existing query)
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: async () => {
      const res = await api.get('/api/dashboard/stats');
      return res.data;
    },
  });

  // Mutate skills (Preserving existing mutation)
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

  // Increment Streak manually (Preserving existing mutation)
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

  // Calculate dynamic, authentic progress based on actual user database statistics (Points 22, 44)
  const totalRoadmaps = stats?.totalRoadmaps || 0;
  const totalDocuments = stats?.totalDocuments || 0;
  const totalSkills = stats?.skills?.length || 0;

  const resumeWeight = totalDocuments ? Math.min(totalDocuments * 15, 30) : 10;
  const skillWeight = totalSkills ? Math.min(totalSkills * 10, 30) : 0;
  const roadmapWeight = totalRoadmaps ? Math.min(totalRoadmaps * 15, 20) : 0;
  const pathProgress = Math.min(18 + resumeWeight + skillWeight + roadmapWeight, 95);

  // Dynamic active navigation indicator stage mapping (Point 15)
  let activeStage = 'Resume';
  if (totalDocuments === 0) {
    activeStage = 'Resume';
  } else if (totalSkills === 0) {
    activeStage = 'Skills';
  } else if (totalRoadmaps === 0) {
    activeStage = 'Projects';
  } else if (!interviewCompleted) {
    activeStage = 'Interviews';
  } else if (!jobMatchCompleted) {
    activeStage = 'Applications';
  } else {
    activeStage = 'Destination';
  }

  // Dynamic Next Move definition based on real states (Point 23)
  let nextMoveTitle = '';
  let nextMoveDesc = '';
  let nextMoveLink = '';
  let nextMoveButtonText = '';

  if (totalDocuments === 0) {
    nextMoveTitle = 'Upload your resume.';
    nextMoveDesc = 'VertexPath needs your baseline profile before it can calculate your ATS score.';
    nextMoveLink = '/dashboard/resume';
    nextMoveButtonText = 'UPLOAD RESUME →';
  } else if (totalSkills === 0) {
    nextMoveTitle = 'Map your technical skills.';
    nextMoveDesc = 'Add your first engineering or language skill to start mapping your career roadmap.';
    nextMoveLink = '#skills-section';
    nextMoveButtonText = 'ADD SKILL →';
  } else if (totalRoadmaps === 0) {
    nextMoveTitle = 'Generate a Learning Path.';
    nextMoveDesc = 'Create a week-by-week curriculum checksheet covering database or microservice systems.';
    nextMoveLink = '/dashboard/roadmaps';
    nextMoveButtonText = 'BUILD ROADMAP →';
  } else if (!interviewCompleted) {
    nextMoveTitle = 'Complete your first mock interview.';
    nextMoveDesc = 'Practice technical and behavioral questions tailored to your career goal.';
    nextMoveLink = '/dashboard/interviews';
    nextMoveButtonText = 'START INTERVIEW →';
  } else if (!jobMatchCompleted) {
    nextMoveTitle = 'Run a Job Match analysis.';
    nextMoveDesc = 'Compare your resume against a target job description to identify skill gaps.';
    nextMoveLink = '/dashboard/jd-match';
    nextMoveButtonText = 'COMPARE JOB →';
  } else {
    nextMoveTitle = 'Consult AI Career Coach.';
    nextMoveDesc = 'Ask about custom project designs or architecture reviews.';
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

  return (
    <div className="space-y-12">
      
      {/* Editorial Dashboard Hero (Point 21) */}
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

      {/* Signature Career Route Visual Tracker (Point 24) */}
      <div className="space-y-4">
        <p className="eyebrow-text">Career Route Tracker</p>
        <div className="relative bg-[#0D1016] border border-slate-900 p-6 rounded-lg overflow-x-auto">
          <div className="flex items-center justify-between min-w-[700px] relative px-4">
            
            {/* Background line indicator */}
            <div className="absolute top-1/2 left-8 right-8 h-[1px] bg-slate-800 -translate-y-1/2 z-0" />
            
            {/* START Node */}
            <div className="flex flex-col items-center gap-2 relative z-10">
              <div className="w-4 h-4 rounded-full bg-[#55D39A] flex items-center justify-center text-[8px] text-[#07080C] font-bold">✓</div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Start</span>
            </div>

            {/* Resume Node */}
            <div className="flex flex-col items-center gap-2 relative z-10">
              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
                totalDocuments > 0 
                  ? 'bg-[#55D39A] border-[#55D39A]' 
                  : activeStage === 'Resume' ? 'border-[#9B5CFF] bg-[#07080C] ring-4 ring-[#9B5CFF]/15' : 'border-slate-800 bg-[#07080C]'
              }`}>
                {totalDocuments > 0 && <span className="text-[8px] text-[#07080C] font-bold">✓</span>}
                {totalDocuments === 0 && activeStage === 'Resume' && <span className="w-1.5 h-1.5 rounded-full bg-[#9B5CFF]" />}
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-wider ${activeStage === 'Resume' ? 'text-[#9B5CFF]' : 'text-slate-500'}`}>Resume</span>
            </div>

            {/* Skills Node */}
            <div className="flex flex-col items-center gap-2 relative z-10">
              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
                totalSkills > 0 
                  ? 'bg-[#55D39A] border-[#55D39A]' 
                  : activeStage === 'Skills' ? 'border-[#9B5CFF] bg-[#07080C] ring-4 ring-[#9B5CFF]/15' : 'border-slate-800 bg-[#07080C]'
              }`}>
                {totalSkills > 0 && <span className="text-[8px] text-[#07080C] font-bold">✓</span>}
                {totalSkills === 0 && activeStage === 'Skills' && <span className="w-1.5 h-1.5 rounded-full bg-[#9B5CFF]" />}
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-wider ${activeStage === 'Skills' ? 'text-[#9B5CFF]' : 'text-slate-500'}`}>Skills</span>
            </div>

            {/* Projects Node */}
            <div className="flex flex-col items-center gap-2 relative z-10">
              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
                totalRoadmaps > 0 
                  ? 'bg-[#55D39A] border-[#55D39A]' 
                  : activeStage === 'Projects' ? 'border-[#9B5CFF] bg-[#07080C] ring-4 ring-[#9B5CFF]/15' : 'border-slate-800 bg-[#07080C]'
              }`}>
                {totalRoadmaps > 0 && <span className="text-[8px] text-[#07080C] font-bold">✓</span>}
                {totalRoadmaps === 0 && activeStage === 'Projects' && <span className="w-1.5 h-1.5 rounded-full bg-[#9B5CFF]" />}
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-wider ${activeStage === 'Projects' ? 'text-[#9B5CFF]' : 'text-slate-500'}`}>Projects</span>
            </div>

            {/* Interviews Node */}
            <div className="flex flex-col items-center gap-2 relative z-10">
              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
                interviewCompleted 
                  ? 'bg-[#55D39A] border-[#55D39A]' 
                  : activeStage === 'Interviews' ? 'border-[#9B5CFF] bg-[#07080C] ring-4 ring-[#9B5CFF]/15' : 'border-slate-800 bg-[#07080C]'
              }`}>
                {interviewCompleted && <span className="text-[8px] text-[#07080C] font-bold">✓</span>}
                {!interviewCompleted && activeStage === 'Interviews' && <span className="w-1.5 h-1.5 rounded-full bg-[#9B5CFF]" />}
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-wider ${activeStage === 'Interviews' ? 'text-[#9B5CFF]' : 'text-slate-500'}`}>Interviews</span>
            </div>

            {/* Applications Node */}
            <div className="flex flex-col items-center gap-2 relative z-10">
              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
                jobMatchCompleted 
                  ? 'bg-[#55D39A] border-[#55D39A]' 
                  : activeStage === 'Applications' ? 'border-[#9B5CFF] bg-[#07080C] ring-4 ring-[#9B5CFF]/15' : 'border-slate-800 bg-[#07080C]'
              }`}>
                {jobMatchCompleted && <span className="text-[8px] text-[#07080C] font-bold">✓</span>}
                {!jobMatchCompleted && activeStage === 'Applications' && <span className="w-1.5 h-1.5 rounded-full bg-[#9B5CFF]" />}
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-wider ${activeStage === 'Applications' ? 'text-[#9B5CFF]' : 'text-slate-500'}`}>Applications</span>
            </div>

            {/* DESTINATION Node */}
            <div className="flex flex-col items-center gap-2 relative z-10">
              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
                activeStage === 'Destination' ? 'border-[#9B5CFF] bg-[#07080C] ring-4 ring-[#9B5CFF]/15' : 'border-slate-800 bg-[#07080C]'
              }`}>
                {activeStage === 'Destination' && <span className="w-1.5 h-1.5 rounded-full bg-[#9B5CFF]" />}
              </div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                {careerGoal.toUpperCase()}
              </span>
            </div>

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

            <div className="bg-[#0D1016] border border-slate-800/80 p-6 rounded-xl space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-[#9B5CFF]/15 text-[#9B5CFF] border border-[#9B5CFF]/30">
                    {careerGoal} Drill
                  </span>
                  <span className="text-[10px] text-slate-500 font-semibold uppercase">System Architecture</span>
                </div>
                {drillAnswered && (
                  <span className="flex items-center gap-1 text-[11px] text-[#55D39A] font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Drill Completed Today!
                  </span>
                )}
              </div>

              <p className="text-xs font-bold text-[#F4F1EA] leading-relaxed">
                "What is the primary architectural tradeoff when introducing a distributed caching layer (like Redis) in front of PostgreSQL?"
              </p>

              {/* 4 Options */}
              <div className="space-y-2">
                {[
                  { text: "A. Caching guarantees ACID transactions across replicas", correct: false },
                  { text: "B. Read latency decreases significantly, but cache invalidation & data staleness complexity increases", correct: true },
                  { text: "C. It completely eliminates the need for database indexes", correct: false },
                  { text: "D. Write operations become twice as fast without database writes", correct: false }
                ].map((opt, oIdx) => {
                  const isSelected = selectedDrillOption === oIdx;
                  let optStyle = "bg-[#11151D] border-slate-800 text-[#cbd5e1] hover:border-[#9B5CFF]/50 hover:bg-[#1A202C]";
                  
                  if (drillAnswered || isSelected) {
                    if (opt.correct) {
                      optStyle = "bg-[#55D39A]/15 border-[#55D39A] text-[#55D39A] font-bold";
                    } else if (isSelected && !opt.correct) {
                      optStyle = "bg-[#FF6577]/15 border-[#FF6577] text-[#FF6577] font-semibold";
                    }
                  }

                  return (
                    <button
                      key={oIdx}
                      type="button"
                      disabled={drillAnswered}
                      onClick={() => {
                        setSelectedDrillOption(oIdx);
                        setDrillAnswered(true);
                        const today = new Date().toISOString().split('T')[0];
                        localStorage.setItem(`daily_drill_${today}`, 'completed');
                        if (opt.correct) {
                          incrementStreakMutation.mutate();
                        }
                      }}
                      className={`w-full p-3 rounded-lg border text-left text-xs transition-all flex items-center justify-between cursor-pointer ${optStyle}`}
                    >
                      <span>{opt.text}</span>
                      {drillAnswered && opt.correct && <CheckCircle2 className="w-4 h-4 text-[#55D39A] shrink-0 ml-2" />}
                    </button>
                  );
                })}
              </div>

              {drillAnswered && (
                <div className="p-3.5 rounded-lg bg-[#07080C] border border-slate-800/80 text-[11px] text-[#9299A8] leading-relaxed animate-fade-in space-y-1">
                  <span className="font-bold text-[#F4F1EA] block">💡 Engineering Takeaway:</span>
                  <span>
                    Redis stores in-memory key-value items providing sub-millisecond read access, but requires robust invalidation strategies (TTL, write-through, or cache-aside) to prevent serving stale data when the primary database updates.
                  </span>
                </div>
              )}
            </div>
          </div>
          
          {/* Career Readiness Metrics (Point 22) */}
          <div className="space-y-4">
            <p className="eyebrow-text">Career Readiness</p>
            <div className="bg-[#0D1016] border border-slate-900 p-6 rounded-lg space-y-6">
              
              {/* Resume Meter */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold text-[#F4F1EA]">
                  <span>Resume Quality</span>
                  <span className="font-mono">{totalDocuments ? '80%' : '20%'}</span>
                </div>
                <div className="w-full h-1.5 bg-[#11151D] rounded overflow-hidden">
                  <div 
                    className="h-full bg-[#9B5CFF] transition-all duration-500" 
                    style={{ width: totalDocuments ? '80%' : '20%' }}
                  />
                </div>
              </div>

              {/* Skills Meter */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold text-[#F4F1EA]">
                  <span>Technical Skills Map</span>
                  <span className="font-mono">{totalSkills > 0 ? `${Math.min(totalSkills * 20, 90)}%` : '0%'}</span>
                </div>
                <div className="w-full h-1.5 bg-[#11151D] rounded overflow-hidden">
                  <div 
                    className="h-full bg-[#9B5CFF] transition-all duration-500" 
                    style={{ width: totalSkills > 0 ? `${Math.min(totalSkills * 20, 90)}%` : '0%' }}
                  />
                </div>
              </div>

              {/* Projects Meter */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold text-[#F4F1EA]">
                  <span>Applied Projects Proof</span>
                  <span className="font-mono">{totalRoadmaps > 0 ? '70%' : '10%'}</span>
                </div>
                <div className="w-full h-1.5 bg-[#11151D] rounded overflow-hidden">
                  <div 
                    className="h-full bg-[#9B5CFF] transition-all duration-500" 
                    style={{ width: totalRoadmaps > 0 ? '70%' : '10%' }}
                  />
                </div>
              </div>

              {/* Interview Readiness Meter */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold text-[#F4F1EA]">
                  <span>Interview Readiness</span>
                  <span className="font-mono">{interviewCompleted ? '80%' : '0%'}</span>
                </div>
                <div className="w-full h-1.5 bg-[#11151D] rounded overflow-hidden">
                  <div 
                    className="h-full bg-[#9B5CFF] transition-all duration-500" 
                    style={{ width: interviewCompleted ? '80%' : '0%' }} 
                  />
                </div>
              </div>

              {/* Applications Meter */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold text-[#F4F1EA]">
                  <span>Career Applications</span>
                  <span className="font-mono">{jobMatchCompleted ? '60%' : '0%'}</span>
                </div>
                <div className="w-full h-1.5 bg-[#11151D] rounded overflow-hidden">
                  <div 
                    className="h-full bg-[#9B5CFF] transition-all duration-500" 
                    style={{ width: jobMatchCompleted ? '60%' : '0%' }} 
                  />
                </div>
              </div>

            </div>
          </div>

          {/* Next Move Callout Action Panel (Point 23) */}
          <div className="space-y-4">
            <p className="eyebrow-text">Next Move</p>
            <div className="bg-[#0D1016] border-l-2 border-[#9B5CFF] border-y border-r border-slate-900 p-6 rounded-r-lg space-y-4">
              <div className="space-y-1">
                <h4 className="text-base font-bold text-[#F4F1EA] tracking-tight">{nextMoveTitle}</h4>
                <p className="text-xs text-[#9299A8] leading-relaxed">{nextMoveDesc}</p>
              </div>
              <div>
                {nextMoveLink.startsWith('#') ? (
                  <button
                    onClick={() => {
                      document.getElementById('skills-section')?.scrollIntoView({ behavior: 'smooth' });
                      setShowAddSkill(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#9B5CFF] hover:bg-[#C49AFF] text-[#07080C] text-xs font-bold rounded transition-all cursor-pointer"
                  >
                    <span>{nextMoveButtonText}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <Link
                    to={nextMoveLink}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#9B5CFF] hover:bg-[#C49AFF] text-[#07080C] text-xs font-bold rounded transition-all"
                  >
                    <span>{nextMoveButtonText}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>
            </div>
          </div>

        </div>

        {/* Right Column - Tracked Skills & Activity */}
        <div className="lg:col-span-5 space-y-12">
          
          {/* Skills Track List (Point 26) */}
          <div id="skills-section" className="space-y-4 scroll-mt-20">
            <div className="flex items-center justify-between border-b border-slate-900 pb-2">
              <p className="eyebrow-text">Your Skill Map</p>
              <button
                onClick={() => setShowAddSkill(!showAddSkill)}
                className="text-[#9B5CFF] hover:text-[#C49AFF] p-1 rounded transition-all cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
              </button>
            </div>

            {showAddSkill && (
              <form onSubmit={handleAddSkill} className="p-4 rounded bg-[#0D1016] border border-slate-900 space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Skill Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Spring Boot, Java, PostgreSQL"
                    value={newSkillName}
                    onChange={(e) => setNewSkillName(e.target.value)}
                    className="w-full text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[10px] text-slate-400">Progress: {newSkillProgress}%</span>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={newSkillProgress}
                      onChange={(e) => setNewSkillProgress(Number(e.target.value))}
                      className="flex-1 accent-[#9B5CFF] h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 text-[10px] font-semibold pt-1">
                  <button 
                    type="button" 
                    onClick={() => setShowAddSkill(false)}
                    className="px-2.5 py-1 border border-slate-800 text-slate-400 rounded hover:bg-[#11151D] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="px-2.5 py-1 bg-[#9B5CFF] text-[#07080C] rounded hover:bg-[#C49AFF] cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              </form>
            )}

            <div className="space-y-4 bg-[#0D1016] border border-slate-900 p-6 rounded-lg max-h-[220px] overflow-y-auto custom-scrollbar">
              {!stats?.skills || stats.skills.length === 0 ? (
                <div className="text-center py-6 space-y-3">
                  <p className="text-xs text-slate-400">Nothing here yet.</p>
                  <p className="text-[11px] text-[#606979] leading-normal max-w-[200px] mx-auto">
                    Add your first skill and VertexPath will begin mapping your technical profile.
                  </p>
                  <button
                    onClick={() => setShowAddSkill(true)}
                    className="px-3 py-1 bg-[#11151D] hover:bg-[#151A23] border border-slate-800 text-[#F4F1EA] text-[10px] font-bold rounded cursor-pointer"
                  >
                    Add Skill
                  </button>
                </div>
              ) : (
                stats.skills.map((skill: any) => (
                  <div key={skill.id} className="space-y-1.5 pb-3 border-b border-slate-900/60 last:border-b-0 last:pb-0">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-slate-200">{skill.skillName}</span>
                      <span className="text-[#9B5CFF] font-mono text-[11px]">{skill.progressPercentage}%</span>
                    </div>
                    <div className="w-full h-1 bg-slate-950 roundedoverflow-hidden">
                      <div 
                        className="h-full bg-[#9B5CFF] transition-all duration-500" 
                        style={{ width: `${skill.progressPercentage}%` }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Simple Study Activity Streak calendar heatmap (Point 25) */}
          <div className="space-y-4">
            <p className="eyebrow-text">Activity Heatmap</p>
            <div className="bg-[#0D1016] border border-slate-900 p-6 rounded-lg">
              <div className="grid grid-cols-10 gap-1.5">
                {activityKeys.map((date) => {
                  const count = activityMap[date] || 0;
                  return (
                    <div 
                      key={date}
                      className={`w-6 h-6 rounded transition-all hover:scale-110 relative group cursor-pointer ${getActivityColor(count)}`}
                    >
                      {/* Tooltip */}
                      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 scale-0 group-hover:scale-100 bg-slate-950 text-slate-200 text-[10px] px-2 py-1 rounded border border-slate-800 shadow-xl pointer-events-none whitespace-nowrap z-20 transition-all font-semibold">
                        {date}: {count} contribution{count !== 1 ? 's' : ''}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between mt-4 text-[10px] text-slate-500 font-bold border-t border-slate-900/60 pt-3">
                <span>Intensity scale:</span>
                <div className="flex items-center gap-1">
                  <span>Less</span>
                  <div className="w-3 h-3 rounded bg-[#11151D] border border-slate-900" />
                  <div className="w-3 h-3 rounded bg-[#9B5CFF]/15" />
                  <div className="w-3 h-3 rounded bg-[#9B5CFF]/35" />
                  <div className="w-3 h-3 rounded bg-[#9B5CFF]/60" />
                  <div className="w-3 h-3 rounded bg-[#9B5CFF]" />
                  <span>More</span>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Shareable Career Readiness Badge / Certificate Modal */}
      {showBadgeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-[#0D1016] border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-6 shadow-2xl relative">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-[#9B5CFF]" />
                <h4 className="text-sm font-bold text-[#F4F1EA]">Career Readiness Certificate</h4>
              </div>
              <button
                onClick={() => setShowBadgeModal(false)}
                className="text-slate-400 hover:text-[#F4F1EA] p-1 cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Dark Mode Branded Certificate Card */}
            <div className="p-6 bg-gradient-to-br from-[#11151D] via-[#07080C] to-[#151025] border-2 border-[#9B5CFF]/30 rounded-xl space-y-5 relative overflow-hidden shadow-inner">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#9B5CFF]/10 rounded-full blur-2xl pointer-events-none" />
              
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold tracking-widest text-[#9B5CFF] uppercase">
                  VERTEXPATH OFFICIAL BADGE
                </span>
                <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-[#55D39A]/15 text-[#55D39A] border border-[#55D39A]/30">
                  VERIFIED CANDIDATE
                </span>
              </div>

              <div className="space-y-1">
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Certified Candidate</p>
                <h3 className="text-xl font-extrabold text-[#F4F1EA] tracking-tight">
                  {stats?.fullName || "Software Developer"}
                </h3>
                <p className="text-xs text-[#9B5CFF] font-semibold">
                  Track: {careerGoal}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3 pt-2 border-t border-slate-800/80">
                <div className="bg-[#07080C] p-2.5 rounded-lg border border-slate-800 text-center">
                  <span className="text-[9px] text-slate-500 font-bold uppercase block">Readiness</span>
                  <span className="text-sm font-bold text-[#55D39A]">{pathProgress}%</span>
                </div>
                <div className="bg-[#07080C] p-2.5 rounded-lg border border-slate-800 text-center">
                  <span className="text-[9px] text-slate-500 font-bold uppercase block">Active Streak</span>
                  <span className="text-sm font-bold text-[#FF8A00]">{stats?.streakCount || 1} Days</span>
                </div>
                <div className="bg-[#07080C] p-2.5 rounded-lg border border-slate-800 text-center">
                  <span className="text-[9px] text-slate-500 font-bold uppercase block">Curriculum</span>
                  <span className="text-sm font-bold text-[#9B5CFF]">{totalRoadmaps} Paths</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono pt-1">
                <span>Verified by VertexPath Engine</span>
                <span>vertexpath.vercel.app</span>
              </div>
            </div>

            {/* Clean Live Badge Preview & Actions */}
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3.5 bg-[#07080C] border border-slate-800/90 rounded-xl">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">GitHub Badge Preview</span>
                  <p className="text-[11px] text-[#9299A8]">Embed in your profile README</p>
                </div>
                
                {/* Visual Pill Badge */}
                <div className="flex items-center rounded overflow-hidden text-[10px] font-bold shadow-md">
                  <span className="bg-[#20232A] text-[#F4F1EA] px-2.5 py-1 flex items-center gap-1">
                    <Award className="w-3 h-3 text-[#9B5CFF]" />
                    VertexPath
                  </span>
                  <span className="bg-[#9B5CFF] text-[#07080C] px-2.5 py-1">
                    {careerGoal}
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    const badgeCode = `[![VertexPath Verified](https://img.shields.io/badge/VertexPath-${encodeURIComponent(careerGoal)}-9B5CFF?style=for-the-badge&logo=codeforces&logoColor=white)](https://vertexpath.vercel.app)`;
                    navigator.clipboard.writeText(badgeCode);
                    setCopiedBadge(true);
                    setTimeout(() => setCopiedBadge(false), 2000);
                  }}
                  className="flex-1 py-2.5 bg-[#9B5CFF] hover:bg-[#C49AFF] text-[#07080C] text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-lg shadow-[#9B5CFF]/20"
                >
                  {copiedBadge ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Copied Badge Code!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Badge for GitHub</span>
                    </>
                  )}
                </button>

                <a
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.origin || 'https://pathpilot-ai-gilt.vercel.app')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 bg-[#11151D] hover:bg-[#1A202C] text-[#F4F1EA] text-xs font-bold rounded-lg border border-slate-800 transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
                >
                  <Share2 className="w-3.5 h-3.5 text-[#55C8E8]" />
                  <span>Share on LinkedIn</span>
                </a>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
