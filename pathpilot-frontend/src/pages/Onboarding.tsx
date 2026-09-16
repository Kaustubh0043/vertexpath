import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  Plus, 
  Loader2, 
  Compass
} from 'lucide-react';
import logoImg from '../assets/logo.png';

export const Onboarding: React.FC = () => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

  // --- Step 1: Career Goal ---
  const [careerGoal, setCareerGoal] = useState('');
  const [customCareerGoal, setCustomCareerGoal] = useState('');

  // --- Step 2: Current Level & Technologies ---
  const [experienceLevel, setExperienceLevel] = useState('');
  const [selectedTechs, setSelectedTechs] = useState<string[]>([]);
  const [customTechInput, setCustomTechInput] = useState('');

  // --- Step 3: Career Objective ---
  const [careerObjective, setCareerObjective] = useState('');

  // --- Step 4: Identify Gaps ---
  const [selectedGaps, setSelectedGaps] = useState<string[]>([]);

  // --- Step 5: Weekly Commitment ---
  const [weeklyCommitment, setWeeklyCommitment] = useState('');

  // --- Step Optional: Styles & Locations ---
  const [learningStyle, setLearningStyle] = useState('');
  const [jobPreference, setJobPreference] = useState('');

  // Load draft progress from localStorage if it exists (Point 1)
  useEffect(() => {
    const draft = localStorage.getItem('onboarding_draft');
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        if (parsed.currentStep) setCurrentStep(parsed.currentStep);
        if (parsed.careerGoal) setCareerGoal(parsed.careerGoal);
        if (parsed.customCareerGoal) setCustomCareerGoal(parsed.customCareerGoal);
        if (parsed.experienceLevel) setExperienceLevel(parsed.experienceLevel);
        if (parsed.selectedTechs) setSelectedTechs(parsed.selectedTechs);
        if (parsed.careerObjective) setCareerObjective(parsed.careerObjective);
        if (parsed.selectedGaps) setSelectedGaps(parsed.selectedGaps);
        if (parsed.weeklyCommitment) setWeeklyCommitment(parsed.weeklyCommitment);
        if (parsed.learningStyle) setLearningStyle(parsed.learningStyle);
        if (parsed.jobPreference) setJobPreference(parsed.jobPreference);
      } catch (e) {
        console.error('Error loading onboarding draft', e);
      }
    }
  }, []);

  // Save draft progress to localStorage on any state changes
  useEffect(() => {
    const draft = {
      currentStep,
      careerGoal,
      customCareerGoal,
      experienceLevel,
      selectedTechs,
      careerObjective,
      selectedGaps,
      weeklyCommitment,
      learningStyle,
      jobPreference,
    };
    localStorage.setItem('onboarding_draft', JSON.stringify(draft));
  }, [
    currentStep,
    careerGoal,
    customCareerGoal,
    experienceLevel,
    selectedTechs,
    careerObjective,
    selectedGaps,
    weeklyCommitment,
    learningStyle,
    jobPreference
  ]);

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep(prev => prev + 1);
    } else {
      setShowSummary(true);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

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

  const handleComplete = async () => {
    setIsSubmitting(true);
    try {
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

      const res = await api.post('/api/user/profile', payload);
      
      // Update local storage user session
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        parsed.onboardingCompleted = true;
        localStorage.setItem('user', JSON.stringify(parsed));
      }

      if (user) {
        setUser({ ...user, onboardingCompleted: true });
      }

      localStorage.removeItem('onboarding_draft'); // Clear draft on success
      navigate('/dashboard');
    } catch (err) {
      console.error('Error saving onboarding profile', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Validation logic to enable/disable NEXT buttons (Point 3, 22)
  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        if (!careerGoal) return false;
        if (careerGoal === 'Other' && !customCareerGoal.trim()) return false;
        return true;
      case 2:
        return !!experienceLevel;
      case 3:
        return !!careerObjective;
      case 4:
        return selectedGaps.length > 0;
      case 5:
        return !!weeklyCommitment;
      default:
        return false;
    }
  };

  const careerGoalOptions = [
    'Frontend Developer',
    'Backend Developer',
    'Full Stack Developer',
    'Mobile Developer',
    'Data Analyst',
    'Data Scientist',
    'AI / ML Engineer',
    'DevOps / Cloud Engineer',
    'Cybersecurity Engineer',
    'Other',
    'Not sure yet'
  ];

  const experienceOptions = [
    'Student',
    'Beginner',
    '0–1 years experience',
    '1–3 years experience',
    '3+ years experience'
  ];

  const techOptions = [
    'Java', 'Python', 'JavaScript', 'TypeScript', 'React', 'Angular', 'Vue', 
    'Spring Boot', 'Django', 'Node.js', 'SQL', 'PostgreSQL', 'MySQL', 'MongoDB', 
    'Docker', 'AWS', 'Azure', 'Git', 'C++', 'C', 'Kotlin', 'Flutter'
  ];

  const objectiveOptions = [
    'Get my first internship',
    'Get my first job',
    'Prepare for campus placements',
    'Prepare for interviews',
    'Switch careers',
    'Switch to a better role',
    'Build a stronger portfolio',
    'Upskill for my current role',
    'Explore career options'
  ];

  const gapOptions = [
    'Resume',
    'DSA',
    'Technical Skills',
    'Projects',
    'System Design',
    'SQL / Databases',
    'Cloud / DevOps',
    'Interview Preparation',
    'Communication',
    'Finding suitable jobs',
    'Portfolio',
    "I don't know where to start"
  ];

  const commitmentOptions = [
    '2–4 hours / week',
    '5–8 hours / week',
    '9–15 hours / week',
    '15+ hours / week'
  ];

  const progressSteps = [
    { num: '01', name: 'CAREER GOAL' },
    { num: '02', name: 'CURRENT LEVEL' },
    { num: '03', name: 'TARGET' },
    { num: '04', name: 'GAPS' },
    { num: '05', name: 'COMMITMENT' }
  ];

  if (showSummary) {
    return (
      <div className="min-h-screen text-[#F4F4F5] flex flex-col items-center justify-center p-6 bg-[#111318] relative selection:bg-[#8B5CF6]/30 selection:text-[#C49AFF]">
        <div className="aurora-container">
          <div className="cyber-grid-2d" />
        </div>

        <div className="w-full max-w-2xl bg-[#15161C]/45 border border-[#25262D] rounded-lg p-8 space-y-8 relative z-10 animate-fade-up-header backdrop-blur-md">
          <div className="space-y-2 text-center pb-4 border-b border-[#25262D]">
            <span className="text-[10px] font-mono font-bold text-[#8B5CF6] tracking-[0.25em] uppercase">onboarding complete</span>
            <h2 className="text-3xl font-extrabold text-[#F4F4F5] font-display">YOUR PATH IS READY.</h2>
            <p className="text-xs text-[#A1A1AA] max-w-md mx-auto">
              VertexPath has configured a personalized dashboard, checklist blueprint, and interview mock coach to align with your targets.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs border-b border-[#25262D] pb-6">
            <div className="space-y-4">
              <div className="space-y-0.5">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Target Role</span>
                <p className="font-semibold text-[#F4F4F5]">{careerGoal === 'Other' ? customCareerGoal : careerGoal}</p>
              </div>
              <div className="space-y-0.5">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Experience Level</span>
                <p className="font-semibold text-[#F4F4F5]">{experienceLevel}</p>
              </div>
              <div className="space-y-0.5">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Primary Objective</span>
                <p className="font-semibold text-[#F4F4F5]">{careerObjective}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-0.5">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Focus Areas / Gaps</span>
                <p className="font-semibold text-[#F4F4F5]">{selectedGaps.slice(0, 3).join(', ')}</p>
              </div>
              <div className="space-y-0.5">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Weekly Time Commitment</span>
                <p className="font-semibold text-[#F4F4F5]">{weeklyCommitment}</p>
              </div>
              <div className="space-y-0.5">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Draft Technologies</span>
                <p className="font-semibold text-[#F4F4F5] truncate max-w-[200px]">
                  {selectedTechs.length > 0 ? selectedTechs.join(', ') : 'None selected'}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <span className="text-[10px] font-mono font-bold text-[#8B5CF6] tracking-wider uppercase">YOUR FIRST PATH</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3.5 bg-[#111318] border border-[#25262D] rounded flex gap-3 items-start">
                <span className="text-[#8B5CF6] font-mono text-xs font-bold">01</span>
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-[#F4F4F5]">Analyze Baseline Profile</p>
                  <p className="text-[10px] text-slate-500">Scan technical signals on your resume</p>
                </div>
              </div>
              <div className="p-3.5 bg-[#111318] border border-[#25262D] rounded flex gap-3 items-start">
                <span className="text-[#8B5CF6] font-mono text-xs font-bold">02</span>
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-[#F4F4F5]">Close Skill Gaps</p>
                  <p className="text-[10px] text-slate-500">Build structure around {selectedGaps[0] || 'Technical Skills'}</p>
                </div>
              </div>
              <div className="p-3.5 bg-[#111318] border border-[#25262D] rounded flex gap-3 items-start">
                <span className="text-[#8B5CF6] font-mono text-xs font-bold">03</span>
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-[#F4F4F5]">Build Blueprint Proof</p>
                  <p className="text-[10px] text-slate-500">Generate scaffolding for a target stack</p>
                </div>
              </div>
              <div className="p-3.5 bg-[#111318] border border-[#25262D] rounded flex gap-3 items-start">
                <span className="text-[#8B5CF6] font-mono text-xs font-bold">04</span>
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-[#F4F4F5]">Technical Simulations</p>
                  <p className="text-[10px] text-slate-500">Practice mock questions with strict grader</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button
              onClick={handleComplete}
              disabled={isSubmitting}
              className="flex-1 flex items-center justify-center gap-1.5 px-6 py-3.5 bg-[#8B5CF6] hover:bg-[#C49AFF] text-[#111318] text-xs font-bold rounded cursor-pointer transition-all"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>START MY PATH</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
            <button
              onClick={() => setShowSummary(false)}
              disabled={isSubmitting}
              className="px-6 py-3.5 bg-transparent border border-[#25262D] hover:border-[#25262D] text-[#F4F4F5] text-xs font-bold rounded transition-all cursor-pointer"
            >
              EDIT MY ANSWERS
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-[#F4F4F5] flex flex-col items-center justify-center p-6 bg-[#111318] relative selection:bg-[#8B5CF6]/30 selection:text-[#C49AFF]">
      
      {/* Background patterns */}
      <div className="aurora-container">
        <div className="cyber-grid-2d" />
      </div>

      <div className="w-full max-w-3xl bg-[#15161C]/45 border border-[#25262D] rounded-lg p-8 space-y-8 relative z-10 animate-fade-up-header backdrop-blur-md">
        
        {/* Onboarding Header */}
        <div className="flex justify-between items-center border-b border-[#25262D] pb-4">
          <div className="flex items-center gap-2">
            <img src={logoImg} alt="VertexPath Logo" className="w-18 h-18 object-contain -mr-4" />
            <span className="text-xs font-extrabold tracking-tight text-[#F4F4F5] font-display">VertexPath Setup</span>
          </div>
          <span className="text-[11px] font-mono text-slate-500 font-bold">{progressSteps[currentStep - 1].num} / 05</span>
        </div>

        {/* Minimal Progress Line (Point 3) */}
        <div className="w-full h-[1px] bg-slate-900 relative">
          <div 
            className="absolute left-0 top-0 h-full bg-[#8B5CF6] transition-all duration-300"
            style={{ width: `${(currentStep / 5) * 100}%` }}
          />
        </div>

        {/* Dynamic Wizard Steps (Points 4, 5, 6, 7, 8) */}
        <div className="min-h-[280px] flex flex-col justify-center py-4">
          
          {/* STEP 1: CAREER GOAL */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="space-y-1.5 text-left">
                <h3 className="text-xl font-extrabold text-[#F4F4F5] tracking-tight font-display">WHERE DO YOU WANT YOUR CAREER TO GO?</h3>
                <p className="text-xs text-slate-500 font-medium">Choose the direction you're currently aiming for. You can change this later.</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {careerGoalOptions.map(opt => (
                  <button
                    key={opt}
                    onClick={() => setCareerGoal(opt)}
                    className={`p-3 text-left border rounded text-xs transition-all cursor-pointer ${
                      careerGoal === opt 
                        ? 'border-[#8B5CF6] bg-[#8B5CF6]/5 text-[#F4F4F5]' 
                        : 'border-[#25262D] bg-transparent text-slate-400 hover:border-[#25262D]'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>

              {careerGoal === 'Other' && (
                <div className="space-y-1 text-left animate-fade-in">
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">What role are you targeting?</span>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Embedded Firmware Engineer"
                    value={customCareerGoal}
                    onChange={(e) => setCustomCareerGoal(e.target.value)}
                    className="w-full text-xs"
                  />
                </div>
              )}
            </div>
          )}

          {/* STEP 2: CURRENT LEVEL */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="space-y-1.5 text-left">
                <h3 className="text-xl font-extrabold text-[#F4F4F5] tracking-tight font-display">WHERE ARE YOU RIGHT NOW?</h3>
                <p className="text-xs text-slate-500 font-medium">Select your experience level parameters.</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {experienceOptions.map(opt => (
                  <button
                    key={opt}
                    onClick={() => setExperienceLevel(opt)}
                    className={`p-3 text-left border rounded text-xs transition-all cursor-pointer ${
                      experienceLevel === opt 
                        ? 'border-[#8B5CF6] bg-[#8B5CF6]/5 text-[#F4F4F5]' 
                        : 'border-[#25262D] bg-transparent text-slate-400 hover:border-[#25262D]'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>

              <div className="space-y-3 text-left border-t border-[#25262D] pt-6">
                <div>
                  <h4 className="text-xs font-bold text-[#F4F4F5]">WHAT ARE YOU CURRENTLY WORKING WITH?</h4>
                  <p className="text-[10px] text-slate-500 font-medium">Select languages or frameworks you know. (Optional)</p>
                </div>

                <div className="flex flex-wrap gap-2 max-h-[140px] overflow-y-auto p-1 border border-[#25262D] rounded bg-slate-950/20 custom-scrollbar">
                  {techOptions.map(tech => {
                    const isSelected = selectedTechs.includes(tech);
                    return (
                      <button
                        key={tech}
                        onClick={() => handleTechToggle(tech)}
                        className={`px-3 py-1.5 border rounded-full text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                          isSelected 
                            ? 'border-[#8B5CF6] bg-[#8B5CF6]/15 text-[#8B5CF6]' 
                            : 'border-[#25262D] bg-transparent text-slate-500 hover:border-[#25262D]'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3" />}
                        <span>{tech}</span>
                      </button>
                    );
                  })}
                </div>

                <form onSubmit={handleAddCustomTech} className="flex gap-2 max-w-xs">
                  <input
                    type="text"
                    placeholder="Add custom tech..."
                    value={customTechInput}
                    onChange={(e) => setCustomTechInput(e.target.value)}
                    className="flex-1 text-xs"
                  />
                  <button 
                    type="submit"
                    className="p-2 bg-[#8B5CF6] text-[#111318] hover:bg-[#C49AFF] rounded flex items-center justify-center cursor-pointer shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* STEP 3: CAREER OBJECTIVE */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="space-y-1.5 text-left">
                <h3 className="text-xl font-extrabold text-[#F4F4F5] tracking-tight font-display">WHAT ARE YOU TRYING TO ACHIEVE NEXT?</h3>
                <p className="text-xs text-slate-500 font-medium">Choose your primary next destination goal.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {objectiveOptions.map(opt => (
                  <button
                    key={opt}
                    onClick={() => setCareerObjective(opt)}
                    className={`p-3 text-left border rounded text-xs transition-all cursor-pointer ${
                      careerObjective === opt 
                        ? 'border-[#8B5CF6] bg-[#8B5CF6]/5 text-[#F4F4F5]' 
                        : 'border-[#25262D] bg-transparent text-slate-400 hover:border-[#25262D]'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 4: IDENTIFY THE GAPS */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="space-y-1.5 text-left">
                <h3 className="text-xl font-extrabold text-[#F4F4F5] tracking-tight font-display">WHAT'S HOLDING YOU BACK?</h3>
                <p className="text-xs text-slate-500 font-medium">Choose the areas where you want VertexPath to help most.</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {gapOptions.map(opt => {
                  const isSelected = selectedGaps.includes(opt);
                  return (
                    <button
                      key={opt}
                      onClick={() => handleGapToggle(opt)}
                      className={`p-3 text-left border rounded text-xs transition-all cursor-pointer ${
                        isSelected 
                          ? 'border-[#8B5CF6] bg-[#8B5CF6]/5 text-[#F4F4F5]' 
                          : 'border-[#25262D] bg-transparent text-slate-400 hover:border-[#25262D]'
                      }`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 5: WEEKLY COMMITMENT */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div className="space-y-1.5 text-left">
                <h3 className="text-xl font-extrabold text-[#F4F4F5] tracking-tight font-display">HOW MUCH TIME CAN YOU REALISTICALLY COMMIT?</h3>
                <p className="text-xs text-slate-500 font-medium">Choose what you can consistently maintain, not your ideal schedule.</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {commitmentOptions.map(opt => (
                  <button
                    key={opt}
                    onClick={() => setWeeklyCommitment(opt)}
                    className={`p-3 text-center border rounded text-xs transition-all cursor-pointer ${
                      weeklyCommitment === opt 
                        ? 'border-[#8B5CF6] bg-[#8B5CF6]/5 text-[#F4F4F5]' 
                        : 'border-[#25262D] bg-transparent text-slate-400 hover:border-[#25262D]'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-[#25262D] pt-6 text-left">
                <div className="space-y-1">
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Preferred Learning Style (Optional)</span>
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
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Job Location Preference (Optional)</span>
                  <input
                    type="text"
                    placeholder="e.g. Remote, India, Relocation"
                    value={jobPreference}
                    onChange={(e) => setJobPreference(e.target.value)}
                    className="w-full text-xs"
                  />
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Wizard Controls */}
        <div className="flex justify-between items-center border-t border-[#25262D] pt-4">
          <button
            onClick={handleBack}
            disabled={currentStep === 1}
            className="flex items-center gap-1 text-xs font-bold text-slate-450 hover:text-white disabled:opacity-30 disabled:pointer-events-none cursor-pointer transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>BACK</span>
          </button>

          <button
            onClick={handleNext}
            disabled={!isStepValid()}
            className="flex items-center gap-1 px-4 py-2 bg-[#8B5CF6] hover:bg-[#C49AFF] text-[#111318] text-xs font-bold rounded disabled:opacity-30 disabled:pointer-events-none cursor-pointer transition-all"
          >
            <span>{currentStep === 5 ? 'SUMMARY' : 'NEXT'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
};
