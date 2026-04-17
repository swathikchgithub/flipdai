"use client";
// FLIPDAI SOLID ENGINE V9 [STABLE-PREMIUM]


import { useEffect, useRef, useState } from "react";
import { useInterview } from "@/hooks/useInterview";
import Link from "next/link";
import { speakText } from "@/lib/voice-utils";

interface InterviewSuiteProps {
  topic: string;
  subcategory: string;
  model: string;
}

export default function InterviewSuite({ topic, subcategory, model }: InterviewSuiteProps) {
  // 1. All logic is now encapsulated in this one hook
  const {
    messages,
    isLoading,
    isListening,
    input,
    error,
    phase,
    toggleListening,
    startInterview,
    setPhase,
    setVoiceURI,
    getVoices
  } = useInterview({ topic, subcategory, model });

  const [startupProgress, setStartupProgress] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Loading bar animation (The only logic left in the UI)
  useEffect(() => {
    if (phase === "loading") {
      const interval = setInterval(() => {
        setStartupProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setPhase("intro");
            return 100;
          }
          return prev + 20;
        });
      }, 300);
      return () => clearInterval(interval);
    }
  }, [phase, setPhase]);

  // Handle voices initialization
  useEffect(() => {
    const voices = getVoices();
    if (voices.length > 0) setVoiceURI(voices[0].voiceURI);
  }, [getVoices, setVoiceURI]);

  return (
    <div className="flex flex-col items-center justify-between min-h-[80vh] w-full max-w-4xl mx-auto py-12 px-6">
      {phase === "loading" ? (
        /* ── LOADING SCREEN ── */
        <div className="flex flex-col items-center justify-center space-y-8 animate-in fade-in duration-700">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-[#5b9cf6] to-[#8b6fe0] flex items-center justify-center shadow-2xl shadow-blue-500/20 rotate-3">
             <span className="text-3xl text-white font-bold">AI</span>
          </div>
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold text-white tracking-tight">Mock Interview</h1>
            <p className="text-sm text-[#8892a4] font-medium tracking-wide">Ready for {subcategory}?</p>
          </div>
          <div className="w-64 h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
            <div 
              className="h-full bg-[#5b9cf6] transition-all duration-500"
              style={{ width: `${startupProgress}%` }}
            />
          </div>
          <p className="text-[10px] text-[#5b9cf6] font-bold tracking-widest uppercase animate-pulse">Initializing AI Environment...</p>
          <p className="text-[9px] text-[#4a5568] mt-4 max-w-[200px] text-center opacity-60 italic">Experimental Pilot: AI behavior and latency may vary during peak hours.</p>
        </div>
      ) : (
        /* ── INTERVIEW ROOM ── */
        <>
          <div className="w-full flex justify-between items-center mb-12">
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-white tracking-tight">Mock Interview</h1>
                <span className="text-[9px] bg-indigo-500/20 border border-indigo-500/40 px-2 py-0.5 rounded-full text-indigo-400 font-black tracking-[0.1em] shadow-[0_0_15px_rgba(99,102,241,0.2)] animate-pulse">PILOT</span>
              </div>
              <p className="text-xs text-[#8892a4] font-medium tracking-wide">{topic} • {subcategory}</p>
            </div>
            <Link href="/" className="px-5 py-2 rounded-xl border border-white/5 bg-white/5 text-[#8892a4] text-xs font-bold hover:bg-white/10 transition-all">
              End Session
            </Link>
          </div>

          <div className="flex flex-col items-center justify-center w-full flex-grow mb-12">
            <div className="relative">
              {/* THE PREMIUM ORB */}
              <div className={`w-48 h-48 rounded-full flex items-center justify-center relative transition-all duration-1000 ${
                isLoading ? "scale-95" : isListening ? "scale-105" : "scale-100"
              }`}>
                {/* Pulsing Aura */}
                <div className={`absolute inset-0 rounded-full blur-3xl transition-all duration-1000 ${
                  isLoading ? "bg-blue-600/40 animate-pulse" : isListening ? "bg-emerald-500/40 animate-pulse" : "bg-white/5"
                }`} />
                
                {/* Core Sphere / Start Button */}
                <div className="w-full h-full rounded-full bg-gradient-to-tr from-[#1d1e26] to-[#2a2d3d] border border-white/10 flex items-center justify-center overflow-hidden shadow-2xl relative z-20">
                   {messages.length === 0 ? (
                      <button 
                        onClick={startInterview}
                        disabled={isLoading}
                        className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#5b9cf6] to-[#8b6fe0] hover:scale-110 active:scale-95 transition-all duration-500 group relative overflow-hidden"
                      >
                         <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                         <span className="text-4xl mb-2 relative z-10">🚀</span>
                         <span className="text-[10px] text-white font-black uppercase tracking-[0.2em] relative z-10">Start Session</span>
                      </button>
                   ) : (
                      <>
                        <div className={`absolute inset-0 bg-gradient-to-tr from-[#5b9cf6]/10 to-[#8b6fe0]/10 opacity-50`} />
                        <span className="text-5xl relative z-20">🤖</span>
                      </>
                   )}
                </div>

                {/* Status Indicator Bubble */}
                {messages.length > 0 && (
                  <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap">
                    {isLoading ? (
                      <div className="flex items-center gap-2 bg-blue-500/10 border border-blue-500/30 px-4 py-1.5 rounded-full">
                         <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-ping" />
                         <span className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">Alex is thinking...</span>
                      </div>
                    ) : isListening ? (
                      <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 px-4 py-1.5 rounded-full">
                         <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                         <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">Listening to you</span>
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* CHAT HISTORY AREA */}
          <div ref={scrollRef} className="w-full h-72 overflow-y-auto mb-10 space-y-6 px-4 mask-fade-top scrollbar-hide">
            {messages.map((m, i) => {
              const cleanContent = m.content.replace(/\[CONTEXT:.*?\]/g, "").replace(/\(User paused.*?\)/g, "").trim();
              if (!cleanContent) return null;
              return (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-2 duration-500`}>
                  <div className={`max-w-[80%] rounded-[24px] px-6 py-4 text-sm leading-relaxed relative group transition-all duration-300 ${
                    m.role === "user" 
                      ? "bg-white/10 backdrop-blur-xl text-white border border-white/10 shadow-xl" 
                      : "bg-[#1d1e26]/40 text-[#8892a4] border border-white/5"
                  }`}>
                    {cleanContent}
                  </div>
                </div>
              );
            })}
            {input && (
              <div className="flex justify-end animate-pulse opacity-40 italic">
                <div className="bg-white/5 rounded-[20px] px-6 py-3 text-sm border border-white/5">
                  {input}...
                </div>
              </div>
            )}
            
            {error && (
              <div className="flex justify-center my-6">
                <div className="bg-red-500/10 border border-red-500/50 text-red-500 px-6 py-4 rounded-[28px] text-sm max-w-md text-center shadow-lg backdrop-blur-md">
                   <p className="font-bold text-xs uppercase tracking-widest mb-2">⚠️ System Alert</p>
                   <p className="opacity-80 text-xs mb-3 truncate">{error}</p>
                   {error.toString().includes("limit") || error.toString().includes("429") ? (
                      <Link href="/" className="inline-block px-4 py-1.5 bg-red-500 text-white rounded-full font-bold text-[9px] uppercase tracking-widest hover:bg-red-600">
                        Change Model
                      </Link>
                   ) : null}
                </div>
              </div>
            )}
          </div>

          {/* ACTION DOCK */}
          {messages.length > 0 && (
            <div className="w-full flex justify-center pb-8 animate-in slide-in-from-bottom-10 duration-700">
              <div className="bg-[#1d1e26]/60 backdrop-blur-2xl border border-white/10 rounded-[32px] p-2 flex items-center gap-4 shadow-2xl">
                <button
                  onClick={toggleListening}
                  className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
                    isListening 
                      ? "bg-red-500 text-white shadow-xl shadow-red-500/30 ring-4 ring-red-500/20" 
                      : "bg-white/5 text-[#8892a4] hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                    <line x1="12" y1="19" x2="12" y2="22"/>
                  </svg>
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
