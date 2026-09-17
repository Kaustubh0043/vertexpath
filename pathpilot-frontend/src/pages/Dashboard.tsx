import { UserAvatar } from '../components/UserAvatar';
import { AvatarPickerModal } from '../components/AvatarPickerModal';
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
  Award,
  CheckCircle2,
  Share2,
  Copy,
  Check,
  HelpCircle,
  X,
  Zap,
  Terminal,
  Cpu,
  UserCheck,
  Briefcase,
  ChevronRight
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
  const [showAvatarModal, setShowAvatarModal] = useState(false);
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
        <div className="w-7 h-7 border-2 border-[var(--border)] border-t-[#8B5CF6] rounded-full animate-spin" />
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

  let completedNodesCount = 1; // Profile is setup
  if (isResumeDone) completedNodesCount++;
  if (isSkillsDone) completedNodesCount++;
  if (isRoadmapsDone) completedNodesCount++;
  if (isProjectsDone) completedNodesCount++;
  if (isInterviewsDone) completedNodesCount++;
  if (isCodingDone || isOutreachDone) completedNodesCount++;

  const pathProgress = Math.min(Math.round((completedNodesCount / 7) * 100), 100);

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
  } else {
    activeStage = 'Launch';
  }

  // Dynamic Next Move definition based on real states
  let nextStepTitle = '';
  let nextStepDesc = '';
  let nextStepLink = '';
  let nextStepBtn = '';

  if (!isResumeDone) {
    nextStepTitle = 'Upload and optimize your resume.';
    nextStepDesc = 'VertexPath needs your baseline profile to calculate your ATS score and generate Google XYZ bullet rewrites.';
    nextStepLink = '/dashboard/resume';
    nextStepBtn = 'Upload Resume →';
  } else if (!isSkillsDone) {
    nextStepTitle = 'Map your technical skills.';
    nextStepDesc = 'Add your core engineering skills (e.g. Java, React, SQL) to personalize your curriculum roadmap.';
    nextStepLink = '#skills-section';
    nextStepBtn = 'Add First Skill →';
  } else if (!isRoadmapsDone) {
    nextStepTitle = 'Generate a 4-week Learning Path.';
    nextStepDesc = 'Create a structured syllabus checksheet with printable PDF export covering your target domain.';
    nextStepLink = '/dashboard/roadmaps';
    nextStepBtn = 'Build Roadmap →';
  } else if (!isProjectsDone) {
    nextStepTitle = 'Scaffold a Project Blueprint.';
    nextStepDesc = 'Synthesize complete file trees, relational database schemas, and REST controller endpoints.';
    nextStepLink = '/dashboard/projects';
    nextStepBtn = 'Open Project Architect →';
  } else if (!isInterviewsDone) {
    nextStepTitle = 'Practice your first Mock Interview.';
    nextStepDesc = 'Test your communication with real-time Web Speech audio prompts and strict architectural grading.';
    nextStepLink = '/dashboard/interviews';
    nextStepBtn = 'Start Mock Interview →';
  } else if (!isCodingDone) {
    nextStepTitle = 'Solve a Live Code Challenge.';
    nextStepDesc = 'Run your code through our in-browser IDE for automated Time O(N) and Space O(1) audits.';
    nextStepLink = '/dashboard/coding';
    nextStepBtn = 'Launch Code IDE →';
  } else if (!isOutreachDone) {
    nextStepTitle = 'Generate Cold Recruiter DMs.';
    nextStepDesc = 'Craft personalized outreach pitches for hiring managers and calculate compensation percentiles.';
    nextStepLink = '/dashboard/outreach';
    nextStepBtn = 'Generate Outreach →';
  } else {
    nextStepTitle = 'Share your Verified Public Portfolio.';
    nextStepDesc = 'Your career path is fully staged! Share your public portfolio (/p/:username) directly with recruiters.';
    nextStepLink = '/portfolio/me';
    nextStepBtn = 'View Public Portfolio →';
  }

  // Activity Heatmap generator
  const activityMap = stats?.dailyActivity || {};
  const getActivityColor = (level: number) => {
    switch (level) {
      case 0: return 'bg-[var(--card)] border border-[var(--border)]';
      case 1: return 'bg-[#8B5CF6]/20 border border-[#8B5CF6]/20';
      case 2: return 'bg-[#8B5CF6]/40 border border-[#8B5CF6]/30';
      case 3: return 'bg-[#8B5CF6]/70 border border-[#8B5CF6]/40';
      case 4: return 'bg-[#8B5CF6] border border-[#A78BFA]';
      default: return 'bg-[var(--card)]';
    }
  };

  const journeyMilestones = [
    { id: 'profile', name: 'Profile', desc: 'Initial setup', isDone: true, isActive: false, path: '/dashboard/profile' },
    { id: 'resume', name: 'Resume', desc: 'Resume optimized', isDone: isResumeDone, isActive: activeStage === 'Resume', path: '/dashboard/resume' },
    { id: 'skills', name: 'Skills', desc: 'Skill profile', isDone: isSkillsDone, isActive: activeStage === 'Skills', path: '#skills-section' },
    { id: 'roadmaps', name: 'Roadmaps', desc: 'Learning plan', isDone: isRoadmapsDone, isActive: activeStage === 'Roadmaps', path: '/dashboard/roadmaps' },
    { id: 'projects', name: 'Projects', desc: 'Build portfolio', isDone: isProjectsDone, isActive: activeStage === 'Projects', path: '/dashboard/projects' },
    { id: 'interviews', name: 'Interviews', desc: 'Mock screening', isDone: isInterviewsDone, isActive: activeStage === 'Interviews', path: '/dashboard/interviews' },
    { id: 'launch', name: 'Launch', desc: 'Job search', isDone: isOutreachDone, isActive: activeStage === 'Launch', path: '/dashboard/outreach' },
  ];

  return (
    <div className="space-y-8">
      
      {/* 1. Dashboard Hero Header (Section 12) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-[var(--border)]">
        <div className="space-y-1.5">
          <p className="eyebrow-text">OVERVIEW</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] tracking-tight">
            Good evening, {stats?.fullName || 'Developer'}.
          </h2>
          <div className="text-xs text-[var(--text-secondary)] flex items-center gap-2 flex-wrap">
            <span>Your VertexPath journey</span>
            <span className="text-[var(--text-muted)]">•</span>
            <span>Career profile completion — <span className="text-[#8B5CF6] font-semibold">{pathProgress}%</span></span>
            <span className="text-[var(--text-muted)]">•</span>
            <span className="text-[var(--text-muted)]">Target:</span>
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
              style={{ width: `${(careerGoal.length || 10) + 0.5}ch` }}
            />
          </div>
        </div>

        {/* Action Controls - responsive grid for mobile */}
        <div className="grid grid-cols-2 sm:flex sm:items-center gap-2.5 w-full sm:w-auto">
          <button
            onClick={() => window.dispatchEvent(new Event('startVertexTour'))}
            className="btn-secondary text-xs flex-1 sm:flex-initial justify-center py-2 px-3"
            title="Start Interactive Product Tour"
          >
            <Compass className="w-3.5 h-3.5 text-[#8B5CF6]" />
            <span>Take Tour</span>
          </button>

          <button
            id="career-badge"
            data-tour="tour-career-badge"
            onClick={() => setShowBadgeModal(true)}
            className="btn-secondary text-xs flex-1 sm:flex-initial justify-center py-2 px-3"
          >
            <Award className="w-3.5 h-3.5 text-[#F59E0B]" />
            <span>Career Badge</span>
          </button>

          <button
            onClick={() => incrementStreakMutation.mutate()}
            className="btn-primary text-xs col-span-2 sm:col-auto justify-center py-2 px-4"
          >
            <Flame className="w-3.5 h-3.5 text-[#F59E0B]" />
            <span>Sync Daily Log</span>
          </button>
        </div>
      </div>

      {/* 2. Professional Career Journey Bar (Section 13) */}
      <div data-tour="tour-route-tracker" className="card-surface p-5 space-y-3">
        <div className="flex items-center justify-between">
          <p className="eyebrow-text">CAREER JOURNEY</p>
          <span className="text-[11px] text-[var(--text-muted)] font-mono">
            {completedNodesCount} of 7 milestones active
          </span>
        </div>

        <div className="overflow-x-auto pb-1 pt-1">
          <div className="flex items-center justify-between min-w-[720px] relative px-2">
            
            {/* Background connecting track */}
            <div className="absolute top-3.5 left-4 right-4 h-[1px] bg-[var(--border)] z-0" />
            
            {journeyMilestones.map((m) => {
              return (
                <div 
                  key={m.id}
                  onClick={() => {
                    if (m.path.startsWith('#')) {
                      document.getElementById('skills-section')?.scrollIntoView({ behavior: 'smooth' });
                      setShowAddSkill(true);
                    } else {
                      navigate(m.path);
                    }
                  }}
                  className="flex flex-col items-center gap-2 relative z-10 cursor-pointer group"
                >
                  {/* Indicator Dot with solid opaque background */}
                  <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all duration-150 shadow-sm ${
                    m.isDone
                      ? 'bg-[var(--card)] border-[#34D399] text-[#34D399]'
                      : m.isActive
                      ? 'bg-[var(--card)] border-[#8B5CF6] text-[#8B5CF6] ring-4 ring-[#8B5CF6]/20'
                      : 'bg-[var(--card)] border-[var(--border)] text-[var(--text-muted)] group-hover:border-[var(--brand-purple)]'
                  }`}>
                    {m.isDone ? '✓' : m.isActive ? '●' : '○'}
                  </div>

                  {/* Label */}
                  <div className="text-center">
                    <p className={`text-xs font-medium transition-colors ${
                      m.isActive ? 'text-[var(--text-primary)] font-semibold' : m.isDone ? 'text-[var(--text-secondary)]' : 'text-[var(--text-muted)]'
                    }`}>
                      {m.name}
                    </p>
                    <p className="text-[10px] text-[var(--text-muted)]">
                      {m.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. Main Split Grid: Daily Drill & Skills Map */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Daily Drill & Next Step */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Daily 5-Minute Technical Drill (Section 14) */}
          <div id="daily-drill" data-tour="tour-daily-drill" className="card-surface p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded bg-[var(--surface)] border border-[var(--border)]">
                  <Zap className="w-3.5 h-3.5 text-[#F59E0B]" />
                </span>
                <span className="text-xs font-semibold text-[var(--text-primary)]">Daily Technical Drill</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--surface)] border border-[var(--border)] text-[var(--text-muted)]">
                SYSTEM ARCHITECTURE
              </span>
            </div>

            <p className="text-xs font-medium text-[var(--text-primary)] leading-relaxed">
              "What is the primary architectural tradeoff when introducing a distributed caching layer (like Redis) in front of PostgreSQL?"
            </p>

            <div className="space-y-2">
              {[
                "A. Caching guarantees ACID transactions across replicas automatically",
                "B. Read latency decreases significantly, but cache invalidation and data staleness complexity increases",
                "C. PostgreSQL queries execute faster without Redis involvement",
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
                  className={`w-full text-left p-3 rounded-lg text-xs transition-all cursor-pointer border ${
                    drillAnswered && idx === 1
                      ? 'bg-[#34D399]/10 border-[#34D399]/40 text-[#34D399]'
                      : drillAnswered && selectedDrillOption === idx && idx !== 1
                      ? 'bg-[#EF4444]/10 border-[#EF4444]/30 text-[#EF4444]'
                      : selectedDrillOption === idx
                      ? 'bg-[#8B5CF6]/15 border-[#8B5CF6] text-[var(--text-primary)]'
                      : 'bg-[var(--surface)] border-[var(--border)] text-[var(--text-secondary)] hover:border-[#353842] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>

            {drillAnswered && (
              <div className="p-3 bg-[#34D399]/10 border border-[#34D399]/20 rounded-lg text-xs text-[#34D399] flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <span>Correct! Cache invalidation and cache-aside synchronization are the primary engineering hurdles. +25 XP awarded!</span>
              </div>
            )}
          </div>

          {/* Next Recommended Step Card (Section 44) */}
          <div className="card-surface p-6 space-y-3">
            <p className="eyebrow-text">YOUR NEXT STEP</p>
            <h3 className="card-title text-[var(--text-primary)]">
              {nextStepTitle}
            </h3>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              {nextStepDesc}
            </p>
            <div className="pt-2">
              <Link
                to={nextStepLink.startsWith('#') ? '/dashboard' : nextStepLink}
                onClick={() => {
                  if (nextStepLink === '#skills-section') {
                    document.getElementById('skills-section')?.scrollIntoView({ behavior: 'smooth' });
                    setShowAddSkill(true);
                  }
                }}
                className="btn-primary text-xs"
              >
                <span>{nextStepBtn}</span>
              </Link>
            </div>
          </div>

        </div>

        {/* Right Column: Skill Map, Career Snapshot & Activity Heatmap */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Career Snapshot Card (Section 45) */}
          <div className="card-surface p-5 space-y-3">
            <p className="eyebrow-text">CAREER SNAPSHOT</p>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-[var(--surface)] border border-[var(--border)]">
                <p className="text-[var(--text-muted)] text-[10px] font-mono uppercase">Resume Status</p>
                <p className="font-semibold text-[var(--text-primary)] mt-1">{isResumeDone ? '✓ Optimized' : '○ Pending'}</p>
              </div>
              <div className="p-3 rounded-lg bg-[var(--surface)] border border-[var(--border)]">
                <p className="text-[var(--text-muted)] text-[10px] font-mono uppercase">Skills Tracked</p>
                <p className="font-semibold text-[var(--text-primary)] mt-1">{totalSkills} mapped</p>
              </div>
              <div className="p-3 rounded-lg bg-[var(--surface)] border border-[var(--border)]">
                <p className="text-[var(--text-muted)] text-[10px] font-mono uppercase">Roadmaps</p>
                <p className="font-semibold text-[var(--text-primary)] mt-1">{totalRoadmaps} generated</p>
              </div>
              <div className="p-3 rounded-lg bg-[var(--surface)] border border-[var(--border)]">
                <p className="text-[var(--text-muted)] text-[10px] font-mono uppercase">Streak</p>
                <p className="font-semibold text-[#F59E0B] mt-1">🔥 {stats?.streakCount || 1} days</p>
              </div>
            </div>
          </div>

          {/* Skill Map Section (Section 15) */}
          <div id="skills-section" className="card-surface p-5 space-y-4">
            <div className="flex items-center justify-between">
              <p className="eyebrow-text">YOUR SKILL MAP</p>
              <button
                onClick={() => setShowAddSkill(!showAddSkill)}
                className="text-xs text-[#8B5CF6] hover:text-[#A78BFA] transition-colors p-1"
                title="Add skill"
              >
                <PlusCircle className="w-4 h-4" />
              </button>
            </div>

            {showAddSkill && (
              <form onSubmit={handleAddSkill} className="p-3 bg-[var(--surface)] border border-[var(--border)] rounded-lg space-y-2.5">
                <input
                  type="text"
                  placeholder="Skill Name (e.g. Docker, Python, System Design)"
                  value={newSkillName}
                  onChange={(e) => setNewSkillName(e.target.value)}
                  className="w-full text-xs"
                />
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-[var(--text-muted)] font-mono">{newSkillProgress}%</span>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={newSkillProgress}
                    onChange={(e) => setNewSkillProgress(Number(e.target.value))}
                    className="flex-1 accent-[#8B5CF6]"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddSkill(false)}
                    className="btn-secondary text-[11px] py-1 px-2.5"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary text-[11px] py-1 px-2.5"
                  >
                    Add
                  </button>
                </div>
              </form>
            )}

            <div className="space-y-3">
              {stats?.skills && stats.skills.length > 0 ? (
                stats.skills.map((skill: any, idx: number) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-[var(--text-primary)]">{skill.skillName}</span>
                      <span className="text-[#8B5CF6] font-mono text-[11px]">{skill.progressPercentage}%</span>
                    </div>
                    <div className="w-full bg-[var(--surface)] h-1.5 rounded-full overflow-hidden border border-[var(--border)]">
                      <div
                        className="bg-[#8B5CF6] h-full rounded-full transition-all duration-300"
                        style={{ width: `${skill.progressPercentage}%` }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-xs text-[var(--text-muted)] space-y-1.5">
                  <p>No skills mapped yet.</p>
                  <button
                    onClick={() => setShowAddSkill(true)}
                    className="btn-tertiary text-xs"
                  >
                    + Add your first skill
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Activity Heatmap (Section 16) */}
          <div className="card-surface p-5 space-y-3">
            <div className="flex items-center justify-between">
              <p className="eyebrow-text">ACTIVITY HEATMAP</p>
              <span className="text-[10px] text-[var(--text-muted)] font-mono">35-day window</span>
            </div>
            
            <div className="grid grid-cols-7 gap-1.5">
              {Array.from({ length: 35 }).map((_, idx) => {
                const level = idx % 5;
                return (
                  <div
                    key={idx}
                    className={`w-full aspect-square rounded-sm ${getActivityColor(level)}`}
                    title={`Activity Level ${level}`}
                  />
                );
              })}
            </div>

            <div className="flex items-center justify-between text-[10px] text-[var(--text-muted)] font-mono pt-1">
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

      {/* Shareable Career Badge Modal */}
      {showBadgeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#09090B]/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-md bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-[#8B5CF6]" />
                <span className="text-xs font-mono uppercase tracking-wider text-[#8B5CF6] font-semibold">
                  Verified Readiness
                </span>
              </div>
              <button 
                onClick={() => setShowBadgeModal(false)}
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)] p-1 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Badge Preview */}
            <div className="p-5 bg-[var(--card)] border border-[var(--border)] rounded-lg text-center space-y-2.5">
              <div className="w-10 h-10 rounded-full bg-[#8B5CF6]/15 border border-[#8B5CF6]/30 flex items-center justify-center mx-auto text-[#A78BFA]">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[var(--text-primary)]">
                  {careerGoal} Ready
                </h4>
                <p className="text-[11px] text-[var(--text-muted)] font-mono mt-0.5">
                  {stats?.fullName || 'Verified Developer'} • {pathProgress}% Track Complete
                </p>
              </div>
              <div className="text-[10px] text-[#34D399] font-mono font-medium">
                ✓ VertexPath Neural Certified
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2.5">
              <button
                onClick={() => {
                  const badgeMarkdown = `[![VertexPath Certified](https://img.shields.io/badge/VertexPath-${encodeURIComponent(careerGoal)}_Ready-8A2BE2?style=for-the-badge&logo=shield)](https://pathpilot-ai-gilt.vercel.app)`;
                  navigator.clipboard.writeText(badgeMarkdown);
                  setCopiedBadge(true);
                  setTimeout(() => setCopiedBadge(false), 2000);
                }}
                className="btn-primary w-full text-xs"
              >
                {copiedBadge ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copiedBadge ? 'Markdown Badge Copied!' : 'Copy README Badge Code'}</span>
              </button>

              <button
                onClick={() => {
                  setShowBadgeModal(false);
                  navigate('/portfolio/me');
                }}
                className="btn-secondary w-full text-xs"
              >
                <Share2 className="w-4 h-4 text-[#8B5CF6]" />
                <span>View Public Portfolio</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};