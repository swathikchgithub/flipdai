"use client";

import { useState, useEffect } from "react";
import { speakText, stopSpeaking, getVoices, startListening } from "@/lib/voice-utils";

interface VoiceControlsProps {
  text: string;
  onTranscript?: (transcript: string) => void;
  showMic?: boolean;
  autoSpeak?: boolean;
}

export default function VoiceControls({
  text,
  onTranscript,
  showMic = true,
  autoSpeak = false,
}: VoiceControlsProps) {
  const [rate, setRate] = useState(1.0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>("");
  const [stopFn, setStopFn] = useState<(() => void) | null>(null);

  useEffect(() => {
    const loadVoices = () => {
      const v = getVoices();
      setVoices(v);
    };
    loadVoices();
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  useEffect(() => {
    if (autoSpeak && text) {
      handleSpeak();
    }
    return () => stopSpeaking();
  }, [text, autoSpeak]);

  const handleSpeak = () => {
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
      return;
    }
    setIsSpeaking(true);
    speakText(text, rate, selectedVoice || undefined);
    const checkInterval = setInterval(() => {
      if (!window.speechSynthesis.speaking) {
        setIsSpeaking(false);
        clearInterval(checkInterval);
      }
    }, 200);
  };

  const handleListen = () => {
    if (isListening) {
      stopFn?.();
      setIsListening(false);
      return;
    }
    setTranscript("");
    setIsListening(true);
    const stop = startListening(
      (t, isFinal) => {
        setTranscript(t);
        if (isFinal && onTranscript) {
          onTranscript(t);
        }
      },
      () => setIsListening(false),
      (err) => {
        console.error("STT error:", err);
        setIsListening(false);
      }
    );
    setStopFn(() => stop);
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={handleSpeak}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            isSpeaking
              ? "bg-[var(--accent)] text-white"
              : "bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-white hover:bg-[var(--bg-card-hover)]"
          }`}
          title="Read aloud"
        >
          {isSpeaking ? "⏸ Stop" : "🔊 Read"}
        </button>

        <div className="flex items-center gap-1">
          <span className="text-xs text-[var(--text-secondary)]">Speed:</span>
          <input
            type="range"
            min="0.5"
            max="2"
            step="0.1"
            value={rate}
            onChange={(e) => setRate(parseFloat(e.target.value))}
            className="w-20 accent-[var(--accent)]"
          />
          <span className="text-xs text-[var(--text-secondary)] w-8">{rate}x</span>
        </div>

        {voices.length > 0 && (
          <select
            value={selectedVoice}
            onChange={(e) => setSelectedVoice(e.target.value)}
            className="text-xs bg-[var(--bg-secondary)] border border-[var(--border)] rounded px-2 py-1 text-[var(--text-secondary)]"
          >
            <option value="">Default Voice</option>
            {voices.filter(v => v.lang.startsWith("en")).map((v) => (
              <option key={v.voiceURI} value={v.voiceURI}>
                {v.name}
              </option>
            ))}
          </select>
        )}

        {showMic && (
          <button
            onClick={handleListen}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors pulse-glow ${
              isListening
                ? "bg-red-500 text-white animate-pulse"
                : "bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-white hover:bg-[var(--bg-card-hover)]"
            }`}
            title="Speak your answer"
          >
            {isListening ? "🎤 Listening..." : "🎤 Speak Answer"}
          </button>
        )}
      </div>

      {transcript && (
        <div className="text-sm bg-[var(--bg-secondary)] rounded-lg p-2 text-[var(--text-secondary)]">
          <span className="text-xs text-[var(--accent)] uppercase tracking-wide mr-2">You said:</span>
          {transcript}
        </div>
      )}
    </div>
  );
}
