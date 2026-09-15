import React, { useState, useEffect, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { api } from '../services/api';
import { 
  Loader2, 
  ArrowRight,
  HelpCircle,
  Clock,
  ArrowLeft,
  CheckCircle2,
  Award,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  RotateCcw,
  Sparkles,
  Radio,
  Timer
} from 'lucide-react';

export const Interviews: React.FC = () => {
  const [roleInput, setRoleInput] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState<string | null>(null);
  const [expectedPoints, setExpectedPoints] = useState<string | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [evaluation, setEvaluation] = useState<any>(null);
  const [questionIndex, setQuestionIndex] = useState(1);

  // Voice States
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const recognitionRef = useRef<any>(null);

  // Timer Mode (120 seconds default)
  const [timerEnabled, setTimerEnabled] = useState(true);
  const [timeLeft, setTimeLeft] = useState(120);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // Rotating loading messages
  const questionLoadingMessages = [
    "VertexPath is formulating simulated technical questions...",
    "Analyzing role domain requirements...",
    "Synthesizing key conceptual criteria & expected points...",
    "Constructing simulated interview room checkpoints..."
  ];

  const evaluationLoadingMessages = [
    "VertexPath is compiling your response evaluation...",
    "Analyzing response depth and syntax verification...",
    "Generating constructive grading feedback...",
    "Drafting ideal production-grade model answers..."
  ];

  const [qLoadingIndex, setQLoadingIndex] = useState(0);
  const [eLoadingIndex, setELoadingIndex] = useState(0);

  // Speech Recognition Setup
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            transcript += event.results[i][0].transcript + ' ';
          }
        }
        if (transcript.trim()) {
          setUserAnswer(prev => prev + (prev && !prev.endsWith(' ') ? ' ' : '') + transcript);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } else {
      setSpeechSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Text-to-Speech (AI Voice read question)
  const toggleSpeakQuestion = () => {
    if (!currentQuestion || !window.speechSynthesis) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(currentQuestion);
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      setIsSpeaking(true);
      window.speechSynthesis.speak(utterance);
    }
  };

  // Toggle Voice Input
  const toggleListening = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.warn('Failed to start recognition:', err);
      }
    }
  };

  // Timer Interval
  useEffect(() => {
    let timer: any;
    if (isTimerRunning && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0 && isTimerRunning) {
      setIsTimerRunning(false);
    }
    return () => clearInterval(timer);
  }, [isTimerRunning, timeLeft]);

  // Generate question mutation
  const generateQuestionMutation = useMutation({
    mutationFn: async (role: string) => {
      const res = await api.post('/api/ai/interview/generate', { role });
      return res.data;
    },
    onSuccess: (data) => {
      setCurrentQuestion(data.question);
      setExpectedPoints(data.expected_points);
      setEvaluation(null);
      setUserAnswer('');
      setTimeLeft(120);
      setIsTimerRunning(timerEnabled);
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      setIsSpeaking(false);
      setIsListening(false);
    },
  });

  // Evaluate answer mutation
  const evaluateAnswerMutation = useMutation({
    mutationFn: async (payload: { question: string; answer: string }) => {
      const res = await api.post('/api/ai/interview/evaluate', payload);
      return res.data;
    },
    onSuccess: (data) => {
      setEvaluation(data);
      setIsTimerRunning(false);
      if (recognitionRef.current && isListening) {
        recognitionRef.current.stop();
        setIsListening(false);
      }
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      setIsSpeaking(false);
      localStorage.setItem('interviewCompleted', 'true');
    },
  });

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleInput.trim()) return;
    setQuestionIndex(1);
    generateQuestionMutation.mutate(roleInput);
  };

  const handleEvaluate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userAnswer.trim() || !currentQuestion) return;
    evaluateAnswerMutation.mutate({
      question: currentQuestion,
      answer: userAnswer,
    });
  };

  const handleNext = () => {
    setQuestionIndex(prev => prev + 1);
    generateQuestionMutation.mutate(roleInput);
  };

  useEffect(() => {
    let interval: any;
    if (generateQuestionMutation.isPending) {
      setQLoadingIndex(0);
      interval = setInterval(() => {
        setQLoadingIndex((prev) => (prev + 1) % questionLoadingMessages.length);
      }, 2500);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [generateQuestionMutation.isPending]);

  useEffect(() => {
    let interval: any;
    if (evaluateAnswerMutation.isPending) {
      setELoadingIndex(0);
      interval = setInterval(() => {
        setELoadingIndex((prev) => (prev + 1) % evaluationLoadingMessages.length);
      }, 2500);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [evaluateAnswerMutation.isPending]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-[#55D39A]';
    if (score >= 60) return 'text-[#E9B84B]';
    return 'text-[#FF6577]';
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="space-y-10">
      
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <p className="eyebrow-text">Prepare / 05</p>
          <h3 className="text-2xl font-extrabold text-[#F4F1EA] tracking-tight flex items-center gap-2.5">
            <span>Voice-Powered Interview Simulator</span>
            <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-[#9B5CFF]/15 text-[#9B5CFF] border border-[#9B5CFF]/30 rounded">
              AI PRO
            </span>
          </h3>
          <p className="text-xs text-[#9299A8] leading-relaxed max-w-xl">
            Simulate real-world technical and HR screening rounds with AI voice questions, real-time speech dictation, and pressure timers.
          </p>
        </div>

        {currentQuestion && !evaluation && (
          <div className="flex items-center gap-3 bg-[#0D1016] border border-slate-800/80 px-4 py-2 rounded-lg">
            <Timer className={`w-4 h-4 ${timeLeft < 30 ? 'text-[#FF6577] animate-pulse' : 'text-[#9B5CFF]'}`} />
            <div className="text-left">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Time Remaining</span>
              <span className={`text-sm font-mono font-extrabold ${timeLeft < 30 ? 'text-[#FF6577]' : 'text-[#F4F1EA]'}`}>
                {formatTimer(timeLeft)}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Role configuration form */}
      {!currentQuestion ? (
        <div className="bg-[#0D1016] border border-slate-900 p-8 rounded-xl max-w-lg mx-auto space-y-6 text-center shadow-xl">
          <div className="space-y-2">
            <div className="p-3 bg-[#11151D] border border-slate-800 rounded-xl w-fit mx-auto shadow-inner">
              <Sparkles className="w-8 h-8 text-[#9B5CFF]" />
            </div>
            <h4 className="text-base font-bold text-[#F4F1EA]">Start Your Mock Screening</h4>
            <p className="text-xs text-[#9299A8] leading-relaxed max-w-sm mx-auto">
              Enter your target role and VertexPath will generate interactive audio questions, evaluate your answer structure, and score your performance.
            </p>
          </div>

          <form onSubmit={handleStart} className="space-y-5 text-left">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Target Role / Core Stack</label>
              <input
                type="text"
                required
                placeholder="e.g. Senior Java Developer, Full Stack Engineer, AWS DevOps"
                value={roleInput}
                onChange={(e) => setRoleInput(e.target.value)}
                className="w-full text-xs text-center py-2.5 bg-[#07080C] border border-slate-800 rounded focus:border-[#9B5CFF] text-[#F4F1EA]"
              />
            </div>

            {/* Quick role suggestions */}
            <div className="flex flex-wrap gap-1.5 justify-center">
              {['Full Stack Engineer', 'Backend Java Architect', 'React / Next.js Developer', 'DevOps / Kubernetes'].map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => setRoleInput(role)}
                  className="px-2.5 py-1 text-[10px] font-medium bg-[#11151D] hover:bg-[#1A202C] text-[#9299A8] hover:text-[#F4F1EA] border border-slate-800 rounded transition-all cursor-pointer"
                >
                  {role}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between px-3 py-2 bg-[#11151D] border border-slate-800/80 rounded text-xs">
              <span className="text-slate-400 font-medium text-[11px] flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#9B5CFF]" />
                Enable 2-Min Answer Timer
              </span>
              <input
                type="checkbox"
                checked={timerEnabled}
                onChange={(e) => setTimerEnabled(e.target.checked)}
                className="accent-[#9B5CFF] cursor-pointer"
              />
            </div>

            <button
              type="submit"
              disabled={generateQuestionMutation.isPending || !roleInput.trim()}
              className="w-full py-3 bg-[#9B5CFF] hover:bg-[#C49AFF] text-[#07080C] rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-[#9B5CFF]/20"
            >
              {generateQuestionMutation.isPending ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{questionLoadingMessages[qLoadingIndex]}</span>
                </div>
              ) : (
                <span>Launch Mock Interview Room →</span>
              )}
            </button>
          </form>

          {generateQuestionMutation.isError && (
            <div className="flex items-start gap-2 p-3 bg-[#FF6577]/10 border border-[#FF6577]/20 text-[#FF6577] text-xs rounded text-left animate-fade-in">
              <span>
                Error: {((generateQuestionMutation.error as any)?.response?.data?.message) || 
                       ((generateQuestionMutation.error as any)?.message) || 
                       "Failed to generate screening question. Please verify backend connectivity."}
              </span>
            </div>
          )}
        </div>
      ) : (
        /* Active Interview Viewport */
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start animate-fade-up-header">
          
          {/* Left Panel: Question & Response */}
          <div className="md:col-span-8 space-y-6">
            
            {/* Immersive Question Header with Audio Player */}
            <div className="bg-[#0D1016] border border-slate-800/80 p-6 rounded-xl space-y-4 shadow-xl">
              <div className="flex items-center justify-between text-[11px] font-mono text-[#9B5CFF]">
                <span className="flex items-center gap-1.5 font-bold">
                  <Radio className="w-3.5 h-3.5 animate-pulse text-[#55D39A]" />
                  QUESTION {String(questionIndex).padStart(2, '0')} / 10
                </span>
                
                <button
                  onClick={toggleSpeakQuestion}
                  type="button"
                  className={`flex items-center gap-1.5 px-3 py-1 text-[11px] font-bold rounded-md border transition-all cursor-pointer ${
                    isSpeaking 
                      ? 'bg-[#9B5CFF]/20 text-[#9B5CFF] border-[#9B5CFF] animate-pulse' 
                      : 'bg-[#11151D] text-slate-300 border-slate-800 hover:border-[#9B5CFF]/50'
                  }`}
                  title={isSpeaking ? 'Stop speaking' : 'Read question aloud'}
                >
                  {isSpeaking ? (
                    <>
                      <VolumeX className="w-3.5 h-3.5" />
                      <span>Stop Voice</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-3.5 h-3.5 text-[#9B5CFF]" />
                      <span>Listen to AI</span>
                    </>
                  )}
                </button>
              </div>

              <p className="text-base font-bold text-[#F4F1EA] leading-relaxed">
                {currentQuestion}
              </p>
            </div>

            {/* Answer Input Area */}
            {!evaluation && (
              <div className="space-y-4">
                <form onSubmit={handleEvaluate} className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                        Your Technical Response
                      </label>

                      {speechSupported && (
                        <button
                          type="button"
                          onClick={toggleListening}
                          className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                            isListening
                              ? 'bg-[#FF6577]/20 text-[#FF6577] border border-[#FF6577] animate-pulse'
                              : 'bg-[#11151D] hover:bg-[#1A202C] text-[#9B5CFF] border border-slate-800'
                          }`}
                        >
                          {isListening ? (
                            <>
                              <MicOff className="w-3.5 h-3.5" />
                              <span>Listening (Click to Stop)...</span>
                            </>
                          ) : (
                            <>
                              <Mic className="w-3.5 h-3.5" />
                              <span>Speak Answer (Voice Dictation)</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>

                    {isListening && (
                      <div className="flex items-center justify-center gap-1 py-2 px-3 bg-[#FF6577]/10 border border-[#FF6577]/20 rounded text-[11px] text-[#FF6577]">
                        <span className="w-2 h-2 rounded-full bg-[#FF6577] animate-ping mr-1" />
                        Microphone active. Speak clearly into your microphone...
                      </div>
                    )}

                    <textarea
                      required
                      rows={8}
                      placeholder="Type or speak your explanation, system architecture tradeoffs, code examples, or STAR framework response..."
                      value={userAnswer}
                      onChange={(e) => setUserAnswer(e.target.value)}
                      className="w-full text-xs font-sans leading-relaxed p-4 bg-[#07080C] border border-slate-800 rounded-lg focus:border-[#9B5CFF] text-[#F4F1EA] placeholder-slate-600"
                    />
                  </div>

                  <div className="flex justify-between items-center gap-4">
                    <button
                      type="button"
                      onClick={() => {
                        if (window.speechSynthesis) window.speechSynthesis.cancel();
                        if (recognitionRef.current && isListening) recognitionRef.current.stop();
                        setCurrentQuestion(null);
                      }}
                      className="flex items-center gap-1 px-4 py-2 border border-slate-800 text-slate-400 hover:text-[#FF6577] text-xs font-bold rounded-lg cursor-pointer transition-all"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Exit Room</span>
                    </button>
                    
                    <button
                      type="submit"
                      disabled={evaluateAnswerMutation.isPending || !userAnswer.trim()}
                      className="px-6 py-2.5 bg-[#9B5CFF] hover:bg-[#C49AFF] text-[#07080C] text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-2 shadow-lg shadow-[#9B5CFF]/20"
                    >
                      {evaluateAnswerMutation.isPending ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>{evaluationLoadingMessages[eLoadingIndex]}</span>
                        </div>
                      ) : (
                        <span>Submit for AI Evaluation →</span>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Active Evaluation Panel */}
            {evaluation && (
              <div className="space-y-6 animate-fade-in bg-[#0D1016] border border-slate-800/80 p-6 rounded-xl shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <h5 className="text-xs font-bold text-[#F4F1EA] uppercase tracking-wider flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-[#55D39A]" />
                    <span>Answer Evaluation & Scoring</span>
                  </h5>
                  
                  <div className="flex items-baseline gap-1.5 bg-[#11151D] px-3 py-1.5 rounded-lg border border-slate-800">
                    <span className={`text-2xl font-mono font-extrabold ${getScoreColor(evaluation.score)}`}>
                      {evaluation.score}%
                    </span>
                    <span className="text-[10px] text-slate-500 font-bold uppercase">Grade</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Coaching Critique</span>
                  <p className="text-xs text-[#9299A8] leading-relaxed bg-[#07080C] p-4 rounded-lg border border-slate-800/80">
                    {evaluation.feedback}
                  </p>
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Ideal Production Model Answer</span>
                  <pre className="p-4 overflow-auto font-mono text-[11px] text-[#cbd5e1] leading-relaxed select-text bg-[#07080C] border border-slate-800/80 rounded-lg max-h-[250px] custom-scrollbar">
                    <code>{evaluation.model_answer}</code>
                  </pre>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <button
                    onClick={() => setCurrentQuestion(null)}
                    className="px-4 py-2 border border-slate-800 text-slate-400 hover:text-slate-200 text-xs font-bold rounded-lg cursor-pointer transition-all"
                  >
                    Finish Session
                  </button>

                  <button
                    onClick={handleNext}
                    disabled={generateQuestionMutation.isPending}
                    className="flex items-center gap-1.5 px-5 py-2.5 bg-[#9B5CFF] hover:bg-[#C49AFF] text-[#07080C] text-xs font-bold rounded-lg cursor-pointer transition-all shadow-lg shadow-[#9B5CFF]/20"
                  >
                    <span>Next Question #{questionIndex + 1}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

          </div>

          {/* Right Panel: Criteria & Coaching Tips */}
          <div className="md:col-span-4 space-y-6">
            <div className="bg-[#0D1016] border border-slate-800/80 p-6 rounded-xl space-y-4 shadow-xl">
              <h5 className="text-xs font-bold text-[#F4F1EA] uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-800 pb-3">
                <Award className="w-4.5 h-4.5 text-[#9B5CFF]" />
                <span>Target Evaluation Criteria</span>
              </h5>
              
              <p className="text-xs text-[#9299A8] leading-relaxed">
                To maximize your evaluation grade, touch upon these specific concepts and architectural terms:
              </p>
              
              <div className="p-4 rounded-lg bg-[#07080C] border border-slate-800 text-xs text-[#9299A8] font-mono leading-relaxed select-text">
                {expectedPoints || "Launch a mock session to reveal targeted criteria."}
              </div>
            </div>

            <div className="bg-[#0D1016]/60 border border-slate-800/80 p-6 rounded-xl space-y-2 text-xs text-slate-400 leading-relaxed shadow-lg">
              <div className="flex items-center gap-2 font-bold text-[#F4F1EA]">
                <Sparkles className="w-4 h-4 text-[#9B5CFF]" />
                <span>Interview Mastery Pro-Tip</span>
              </div>
              <p className="text-[11px] text-[#9299A8] leading-relaxed">
                Structure your technical answers using the <strong>STAR method</strong> (Situation, Task, Action, Result) and explicitly mention performance metrics (e.g. latency, concurrency, time complexities).
              </p>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
