import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Loader2, Check, Plus, RefreshCw, Sun, Moon, Laptop } from 'lucide-react';
import { ThemeToggle } from '../components/ThemeToggle';

export const Profile: React.FC = () => {
  const queryClient = useQueryClient();
  const { user, setUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Profile Form States
  const [careerGoal, setCareerGoal] = useState('');
  const [customCareerGoal, setCustomCareerGoal] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('');
  const [selectedTechs, setSelectedTechs] = useState<string[]>([]);
  const [customTechInput, setCustomTechInput] = useState('');
  const [careerObjective, setCareerObjective] = useState('');
  const [selectedGaps, setSelectedGaps] = useState<string[]>([]);
  const [weeklyCommitment, setWeeklyCommitment] = useState('');
  const [learningStyle, setLearningStyle] = useState('');
  const [jobPreference, setJobPreference] = useState('');

  // Fetch Career Profile
  const { data: profile, isLoading } = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const res = await api.get('/api/user/profile');
      return res.data;
    },
  });

  // Load backend profile data into local states on load
  useEffect(() => {
    if (profile) {
      // Determine if careerGoal matches predefined options or is custom
      const predefined = [
        'Frontend Developer', 'Backend Developer', 'Full Stack Developer',
        'Mobile Developer', 'Data Analyst', 'Data Scientist', 'AI / ML Engineer',
        'DevOps / Cloud Engineer', 'Cybersecurity Engineer', 'Not sure yet'
      ];
      
      if (profile.careerGoal) {
        if (predefined.includes(profile.careerGoal)) {
          setCareerGoal(profile.careerGoal);
          setCustomCareerGoal('');
        } else {
          setCareerGoal('Other');
          setCustomCareerGoal(profile.careerGoal);
        }
      }
      
      setExperienceLevel(profile.experienceLevel || '');
      setSelectedTechs(profile.technologies ? profile.technologies.split(',') : []);
      setCareerObjective(profile.careerObjective || '');
      setSelectedGaps(profile.skillGaps ? profile.skillGaps.split(',') : []);
      setWeeklyCommitment(profile.weeklyCommitment || '');
      setLearningStyle(profile.optionalLearningStyle || '');
      setJobPreference(profile.optionalJobPreference || '');
    }
  }, [profile]);

  // Update Profile Mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (payload: any) => {
      return api.post('/api/user/profile', payload);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
      
      // Update local storage and auth context state
      const targetRole = careerGoal === 'Other' ? customCareerGoal : careerGoal;
      localStorage.setItem('careerGoal', targetRole);
      window.dispatchEvent(new Event('careerGoalUpdated'));

      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        parsed.onboardingCompleted = true;
        localStorage.setItem('user', JSON.stringify(parsed));
      }

      if (user) {
        setUser({ ...user, onboardingCompleted: true });
      }

      setSuccessMsg('Career profile updated successfully!');
      setIsEditing(false);
      setTimeout(() => setSuccessMsg(null), 4000);
    }
  });

  const handleTechToggle = (tech: string) => {
    setSelectedTechs(prev => 
      prev.includes(tech) ? prev.filter(t => t !== tech) : [...prev, tech]
    );
  };

  const handleAddCustomTech = (e: React.FormEvent) => {
    e.preventDefault();
    const tech = customTechInput.trim();
    if (tech && !selectedTechs.includes(tech)) {
      setSelectedTechs(prev => [...prev, tech]);
      setCustomTechInput('');
    }
  };

  const handleGapToggle = (gap: string) => {
    setSelectedGaps(prev => 
      prev.includes(gap) ? prev.filter(g => g !== gap) : [...prev, gap]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!careerGoal) return;
    if (careerGoal === 'Other' && !customCareerGoal.trim()) return;

    const payload = {
      onboardingCompleted: true,
      careerGoal: careerGoal === 'Other' ? customCareerGoal : careerGoal,
      customCareerGoal: careerGoal === 'Other' ? customCareerGoal : '',
      experienceLevel,
      technologies: selectedTechs.join(','),
      careerObjective,
      skillGaps: selectedGaps.join(','),
      weeklyCommitment,
      optionalLearningStyle: learningStyle,
      optionalJobPreference: jobPreference
    };

    updateProfileMutation.mutate(payload);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[#8B5CF6]" />
      </div>
    );
  }

  const careerGoalOptions = [
    'Frontend Developer', 'Backend Developer', 'Full Stack Developer',
    'Mobile Developer', 'Data Analyst', 'Data Scientist', 'AI / ML Engineer',
    'DevOps / Cloud Engineer', 'Cybersecurity Engineer', 'Other', 'Not sure yet'
  ];

  const experienceOptions = [
    'Student', 'Beginner', '0–1 years experience', '1–3 years experience', '3+ years experience'
  ];

  const techOptions = [
    'Java', 'Python', 'JavaScript', 'TypeScript', 'React', 'Angular', 'Vue', 
    'Spring Boot', 'Django', 'Node.js', 'SQL', 'PostgreSQL', 'MySQL', 'MongoDB', 
    'Docker', 'AWS', 'Azure', 'Git', 'C++', 'C', 'Kotlin', 'Flutter'
  ];

  const objectiveOptions = [
    'Get my first internship', 'Get my first job', 'Prepare for campus placements',
    'Prepare for interviews', 'Switch careers', 'Switch to a better role',
    'Build a stronger portfolio', 'Upskill for my current role', 'Explore career options'
  ];

  const gapOptions = [
    'Resume', 'DSA', 'Technical Skills', 'Projects', 'System Design', 
    'SQL / Databases', 'Cloud / DevOps', 'Interview Preparation', 'Communication', 
    'Finding suitable jobs', 'Portfolio', "I don't know where to start"
  ];

  const commitmentOptions = [
    '2–4 hours / week', '5–8 hours / week', '9–15 hours / week', '15+ hours / week'
  ];

  return (
    <div className="space-y-8 max-w-4xl">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#25262D]">
        <div className="space-y-1">
          <p className="eyebrow-text">Profile / Career settings</p>
          <h3 className="text-2xl font-extrabold text-[#F4F4F5] tracking-tight font-display">Manage Career Profile</h3>
          <p className="text-xs text-slate-500 max-w-lg font-medium">
            Review and adjust your target goals, learning speeds, and engineering stack gaps to tune PathPilot's personalized guides.
          </p>
        </div>
        
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="self-start sm:self-center px-4 py-2 bg-[#8B5CF6] hover:bg-[#C49AFF] text-[#111318] rounded text-xs font-bold transition-all cursor-pointer"
          >
            Edit Career Profile
          </button>
        )}
      </div>

      {successMsg && (
        <div className="p-3.5 bg-[#55D39A]/10 border border-[#55D39A]/20 text-[#55D39A] text-xs rounded">
          <span>{successMsg}</span>
        </div>
      )}

      {isEditing ? (
        <form onSubmit={handleSubmit} className="space-y-8 bg-[#15161C]/30 border border-[#25262D] p-6 rounded-lg">
          
          {/* STEP 1: CAREER GOAL */}
          <div className="space-y-3">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">01 — Target Career Goal</span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {careerGoalOptions.map(opt => (
                <button
                  type="button"
                  key={opt}
                  onClick={() => setCareerGoal(opt)}
                  className={`p-2.5 text-left border rounded text-xs transition-all cursor-pointer ${
                    careerGoal === opt 
                      ? 'border-[#8B5CF6] bg-[#8B5CF6]/5 text-[#F4F4F5]' 
                      : 'border-[#25262D] bg-transparent text-slate-500 hover:border-[#25262D]'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>

            {careerGoal === 'Other' && (
              <div className="space-y-1 pt-2">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Custom Target Role</span>
                <input
                  type="text"
                  required
                  placeholder="e.g. Firmware Engineer"
                  value={customCareerGoal}
                  onChange={(e) => setCustomCareerGoal(e.target.value)}
                  className="w-full text-xs"
                />
              </div>
            )}
          </div>

          {/* STEP 2: EXPERIENCE & TECH */}
          <div className="space-y-4 pt-4 border-t border-[#25262D]/60">
            <div className="space-y-3">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">02 — Experience Level</span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {experienceOptions.map(opt => (
                  <button
                    type="button"
                    key={opt}
                    onClick={() => setExperienceLevel(opt)}
                    className={`p-2.5 text-left border rounded text-xs transition-all cursor-pointer ${
                      experienceLevel === opt 
                        ? 'border-[#8B5CF6] bg-[#8B5CF6]/5 text-[#F4F4F5]' 
                        : 'border-[#25262D] bg-transparent text-slate-500 hover:border-[#25262D]'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Current Technologies Stack</span>
              <div className="flex flex-wrap gap-2 max-h-[140px] overflow-y-auto p-1 border border-[#25262D] rounded bg-slate-950/20 custom-scrollbar">
                {techOptions.map(tech => {
                  const isSelected = selectedTechs.includes(tech);
                  return (
                    <button
                      type="button"
                      key={tech}
                      onClick={() => handleTechToggle(tech)}
                      className={`px-3 py-1.5 border rounded-full text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                        isSelected 
                          ? 'border-[#8B5CF6] bg-[#8B5CF6]/15 text-[#8B5CF6]' 
                          : 'border-[#25262D] bg-transparent text-slate-555 hover:border-[#25262D]'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3" />}
                      <span>{tech}</span>
                    </button>
                  );
                })}
              </div>

              <div className="flex gap-2 max-w-xs">
                <input
                  type="text"
                  placeholder="Add custom tech..."
                  value={customTechInput}
                  onChange={(e) => setCustomTechInput(e.target.value)}
                  className="flex-1 text-xs"
                />
                <button 
                  type="button"
                  onClick={handleAddCustomTech}
                  className="p-2 bg-[#8B5CF6] text-[#111318] hover:bg-[#C49AFF] rounded flex items-center justify-center cursor-pointer shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* STEP 3: CAREER OBJECTIVE */}
          <div className="space-y-3 pt-4 border-t border-[#25262D]/60">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">03 — Career Objective</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {objectiveOptions.map(opt => (
                <button
                  type="button"
                  key={opt}
                  onClick={() => setCareerObjective(opt)}
                  className={`p-2.5 text-left border rounded text-xs transition-all cursor-pointer ${
                    careerObjective === opt 
                      ? 'border-[#8B5CF6] bg-[#8B5CF6]/5 text-[#F4F4F5]' 
                      : 'border-[#25262D] bg-transparent text-slate-500 hover:border-[#25262D]'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* STEP 4: GAPS */}
          <div className="space-y-3 pt-4 border-t border-[#25262D]/60">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">04 — Gaps / Focus Areas</span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {gapOptions.map(opt => {
                const isSelected = selectedGaps.includes(opt);
                return (
                  <button
                    type="button"
                    key={opt}
                    onClick={() => handleGapToggle(opt)}
                    className={`p-2.5 text-left border rounded text-xs transition-all cursor-pointer ${
                      isSelected 
                        ? 'border-[#8B5CF6] bg-[#8B5CF6]/5 text-[#F4F4F5]' 
                        : 'border-[#25262D] bg-transparent text-slate-500 hover:border-[#25262D]'
                    }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>

          {/* STEP 5: COMMITMENT */}
          <div className="space-y-4 pt-4 border-t border-[#25262D]/60">
            <div className="space-y-3">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">05 — Weekly Commitment</span>
              <div className="grid grid-cols-2 gap-2">
                {commitmentOptions.map(opt => (
                  <button
                    type="button"
                    key={opt}
                    onClick={() => setWeeklyCommitment(opt)}
                    className={`p-2.5 text-center border rounded text-xs transition-all cursor-pointer ${
                      weeklyCommitment === opt 
                        ? 'border-[#8B5CF6] bg-[#8B5CF6]/5 text-[#F4F4F5]' 
                        : 'border-[#25262D] bg-transparent text-slate-500 hover:border-[#25262D]'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="space-y-1">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Learning Style Preference</span>
                <select
                  value={learningStyle}
                  onChange={(e) => setLearningStyle(e.target.value)}
                  className="w-full text-xs"
                >
                  <option value="">Select style...</option>
                  <option value="Hands-on projects">Hands-on projects</option>
                  <option value="Structured courses">Structured courses</option>
                  <option value="Practice problems">Practice problems</option>
                  <option value="Reading/documentation">Reading/documentation</option>
                  <option value="Mixed">Mixed</option>
                </select>
              </div>

              <div className="space-y-1">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Job Location Preference</span>
                <input
                  type="text"
                  placeholder="e.g. Remote, India"
                  value={jobPreference}
                  onChange={(e) => setJobPreference(e.target.value)}
                  className="w-full text-xs"
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex gap-4 pt-4 border-t border-[#25262D]">
            <button
              type="submit"
              disabled={updateProfileMutation.isPending}
              className="flex items-center gap-1.5 px-6 py-2.5 bg-[#8B5CF6] hover:bg-[#C49AFF] text-[#111318] text-xs font-bold rounded cursor-pointer transition-all"
            >
              {updateProfileMutation.isPending ? (
                <RefreshCw className="w-4 h-4 animate-spin text-[#111318]" />
              ) : (
                <>
                  <span>Save Profile</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-6 py-2.5 bg-transparent border border-[#25262D] hover:border-[#25262D] text-[#F4F4F5] text-xs font-bold rounded transition-all cursor-pointer"
            >
              Cancel
            </button>
          </div>

        </form>
      ) : (
        /* READ ONLY PROFILE VIEW */
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 bg-[#15161C]/20 border border-[#25262D] p-6 rounded-lg text-xs leading-relaxed">
          <div className="space-y-5">
            <div className="space-y-0.5">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Target Career Goal</span>
              <p className="font-semibold text-base text-[#F4F4F5]">{profile?.careerGoal || 'Not set'}</p>
            </div>
            <div className="space-y-0.5">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Experience Level</span>
              <p className="font-semibold text-sm text-[#F4F4F5]">{profile?.experienceLevel || 'Not set'}</p>
            </div>
            <div className="space-y-0.5">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Primary Objective</span>
              <p className="font-semibold text-[#F4F4F5]">{profile?.careerObjective || 'Not set'}</p>
            </div>
            <div className="space-y-0.5">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Weekly Time Commitment</span>
              <p className="font-semibold text-[#F4F4F5]">{profile?.weeklyCommitment || 'Not set'}</p>
            </div>
          </div>

          <div className="space-y-5">
            <div className="space-y-0.5">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Skill Gaps / Focus Areas</span>
              <p className="font-semibold text-[#F4F4F5]">{profile?.skillGaps || 'None set'}</p>
            </div>
            <div className="space-y-0.5">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Currently Working With (Technologies)</span>
              <p className="font-semibold text-[#F4F4F5]">{profile?.technologies || 'None'}</p>
            </div>
            <div className="space-y-0.5">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Learning Style Preference</span>
              <p className="font-semibold text-[#F4F4F5]">{profile?.optionalLearningStyle || 'Mixed'}</p>
            </div>
            <div className="space-y-0.5">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Job Location Preference</span>
              <p className="font-semibold text-[#F4F4F5]">{profile?.optionalJobPreference || 'Open'}</p>
            </div>
          </div>
        </div>
      )}

    
      {/* Appearance & Interface Theme Settings */}
      <div className="bg-[var(--card)] border border-[var(--border)] p-6 rounded-xl space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h4 className="text-sm font-bold text-[var(--text-primary)]">Interface Theme & Appearance</h4>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              Choose your preferred visual theme across all VertexPath tools and editors.
            </p>
          </div>
          <ThemeToggle variant="segmented" />
        </div>
      </div>
    </div>
  );
};