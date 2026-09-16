import React, { useState, useEffect } from 'react';
import { Sparkles, Bot, Cpu, Zap, CheckCircle2 } from 'lucide-react';

interface AiLoadingCardProps {
  title?: string;
  messages?: string[];
  subtitle?: string;
  steps?: string[];
  className?: string;
}

const DEFAULT_MESSAGES = [
  "Analyzing context and technical parameters...",
  "Consulting Gemini neural intelligence model...",
  "Structuring production patterns & schema...",
  "Formatting output and validating quality...",
  "Finalizing response..."
];

export const AiLoadingCard: React.FC<AiLoadingCardProps> = ({
  title = "AI Neural Engine Processing",
  messages = DEFAULT_MESSAGES,
  subtitle = "VertexPath is compiling your custom intelligence data.",
  steps = ["Parameter Ingestion", "Gemini AI Synthesis", "Schema Validation"],
  className = ""
}) => {
  const [msgIndex, setMsgIndex] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const [progress, setProgress] = useState(15);

  useEffect(() => {
    const msgInterval = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % messages.length);
    }, 2400);

    const stepInterval = setInterval(() => {
      setStepIndex((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 3200);

    const progressInterval = setInterval(() => {
      setProgress((prev) => (prev < 92 ? prev + Math.floor(Math.random() * 8 + 4) : 94));
    }, 600);

    return () => {
      clearInterval(msgInterval);
      clearInterval(stepInterval);
      clearInterval(progressInterval);
    };
  }, [messages.length, steps.length]);

  return (
    <div className={`relative overflow-hidden rounded-2xl border border-purple-500/25 bg-[#0D1016]/90 p-8 shadow-[0_8px_32px_rgba(155,92,255,0.12)] backdrop-blur-xl transition-all ${className}`}>
      {/* Background Ambient Glow */}
      <div className="absolute -top-24 -left-24 h-48 w-48 rounded-full bg-[#9B5CFF]/15 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 h-48 w-48 rounded-full bg-[#55C8E8]/10 blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center text-center space-y-6 max-w-lg mx-auto">
        
        {/* Animated AI Orbital Core */}
        <div className="relative flex items-center justify-center">
          {/* Outer Pulsing Glow */}
          <div className="absolute h-20 w-20 rounded-full bg-[#9B5CFF]/20 animate-ping opacity-60" />
          
          {/* Rotating Ring */}
          <div className="h-16 w-16 rounded-full border-2 border-dashed border-[#9B5CFF]/60 animate-[spin_8s_linear_infinite] flex items-center justify-center" />
          
          {/* Inner Glowing Orb */}
          <div className="absolute h-12 w-12 rounded-full bg-gradient-to-tr from-[#9B5CFF] to-[#C49AFF] flex items-center justify-center shadow-[0_0_20px_rgba(155,92,255,0.6)]">
            <Sparkles className="h-6 w-6 text-[#07080C] animate-pulse" />
          </div>
        </div>

        {/* Title & Dynamic Status Message */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#9B5CFF]/10 border border-[#9B5CFF]/20 text-[11px] font-bold text-[#C49AFF] tracking-wide uppercase">
            <Zap className="w-3 h-3 text-[#9B5CFF]" />
            <span>{title}</span>
          </div>

          <h4 className="text-base sm:text-lg font-bold text-[#F4F1EA] font-display min-h-[28px] transition-all duration-300">
            {messages[msgIndex]}
          </h4>

          <p className="text-xs text-[#9299A8] max-w-md leading-relaxed">
            {subtitle}
          </p>
        </div>

        {/* Step Progression Pills */}
        <div className="grid grid-cols-3 gap-2 w-full pt-1">
          {steps.map((step, idx) => {
            const isDone = idx < stepIndex;
            const isCurrent = idx === stepIndex;
            return (
              <div
                key={step}
                className={`flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold border transition-all duration-300 ${
                  isDone
                    ? 'bg-[#55D39A]/10 border-[#55D39A]/30 text-[#55D39A]'
                    : isCurrent
                    ? 'bg-[#9B5CFF]/15 border-[#9B5CFF]/40 text-[#C49AFF] shadow-[0_0_12px_rgba(155,92,255,0.2)]'
                    : 'bg-[#11151D] border-white/5 text-[#606979]'
                }`}
              >
                {isDone ? (
                  <CheckCircle2 className="w-3 h-3 text-[#55D39A] shrink-0" />
                ) : isCurrent ? (
                  <Cpu className="w-3 h-3 text-[#9B5CFF] animate-spin shrink-0" />
                ) : (
                  <div className="w-1.5 h-1.5 rounded-full bg-[#606979]" />
                )}
                <span className="truncate">{step}</span>
              </div>
            );
          })}
        </div>

        {/* Shimmering Progress Bar */}
        <div className="w-full space-y-1.5 pt-1">
          <div className="w-full h-1.5 bg-[#11151D] rounded-full overflow-hidden border border-white/5 relative">
            <div
              className="h-full bg-gradient-to-r from-[#9B5CFF] via-[#C49AFF] to-[#55C8E8] rounded-full transition-all duration-300 relative"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute inset-0 bg-white/20 animate-pulse" />
            </div>
          </div>
          <div className="flex justify-between items-center text-[10px] text-[#606979] px-0.5">
            <span>Synthesizing output</span>
            <span className="font-mono text-[#9B5CFF]">{progress}%</span>
          </div>
        </div>

        {/* Footer Badge */}
        <div className="pt-2 flex items-center gap-1.5 text-[10px] text-[#9299A8]">
          <Bot className="w-3.5 h-3.5 text-[#9B5CFF]" />
          <span>VertexPath Intelligent Engine &bull; Gemini 2.0 / Flash</span>
        </div>

      </div>
    </div>
  );
};
