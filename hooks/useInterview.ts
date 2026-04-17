import { useState, useCallback, useRef, useEffect } from "react";
import { DialogueState, Message, InterviewContext } from "@/lib/interview/types";
import { DialogueManager } from "@/lib/interview/DialogueManager";
import { BrowserVoiceService } from "@/lib/interview/VoiceService";
import { BrowserSpeechService } from "@/lib/interview/SpeechService";

export function useInterview(context: InterviewContext) {
  const [state, setState] = useState<DialogueState>({
    messages: [],
    isLoading: false,
    error: null,
    phase: "loading"
  });

  const [isListening, setIsListening] = useState(false);
  const isListeningRef = useRef(false); // Direct-drive ref to bypass state lag
  const [input, setInput] = useState("");
  const latestInputRef = useRef(""); // Buffer to avoid stale closure issues
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [voiceURI, setVoiceURI] = useState<string | null>(null);

  // Refs for services (Singleton instances per hook instance)
  const managerRef = useRef<DialogueManager | null>(null);
  const voiceRef = useRef<BrowserVoiceService | null>(null);
  const speechRef = useRef<BrowserSpeechService | null>(null);

  if (!managerRef.current) managerRef.current = new DialogueManager(setState);
  if (!voiceRef.current) voiceRef.current = new BrowserVoiceService();
  if (!speechRef.current) speechRef.current = new BrowserSpeechService();

  const handleSend = useCallback(async (text: string, displayText?: string) => {
    if (!managerRef.current || !voiceRef.current) return;
    
    // Clear any pending silence nudges
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);

    try {
      // Use the designated display text for the UI, or the raw text if not provided
      const aiResponse = await managerRef.current.sendMessage(text, context, displayText || text);
      if (aiResponse && isListeningRef.current) {
        await voiceRef.current.speak(aiResponse, voiceURI || undefined);
        
        // AUTO-WAKE: Start listening once Alex is done talking
        speechRef.current?.start();
        resetSilenceTimer();
        console.log("🎤 [AUTO-WAKE] Mic activated after Alex's turn.");
      }
    } catch (e) {}
  }, [context, voiceURI]);

  // Silence Detection Logic
  const resetSilenceTimer = useCallback(() => {
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    if (isListeningRef.current && !state.isLoading) {
      silenceTimerRef.current = setTimeout(() => {
        const spokenText = latestInputRef.current.trim();
        // AUTO-SEND: Only if user has actually said a significant amount (> 15 chars)
        if (spokenText.length > 15) {
           console.log("🤫 [SILENCE] Nudge triggered. Answer seems complete or user paused long.");
           handleSend(
             `${spokenText} (User paused for 6s. Alex: Evaluate what they said or ask if they have more to add.)`,
             spokenText
           );
           latestInputRef.current = "";
           setInput("");
        } else if (spokenText.length > 0) {
           console.log("🤫 [SILENCE] Minor pause/filler detected. Alex is waiting patiently.");
        }
      }, 6000); 
    }
  }, [state.isLoading, handleSend]);

  // Initialize Microphone
  useEffect(() => {
    const speech = speechRef.current;
    if (!speech) return;
    
    speech.onResult((text) => {
      setInput(text);
      latestInputRef.current = text;
      resetSilenceTimer(); 
    });
    speech.onError((err: any) => {
        if (err.error === "not-allowed") {
          setIsListening(false);
          isListeningRef.current = false;
          console.error("⛔ [MIC] Permission lost. Alex needs your help.");
        }
    });
    
    return () => {
      console.log("🧹 [CLEANUP] Ending Session. Silencing Alex and Mic.");
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      voiceRef.current?.stop();
      speechRef.current?.stop();
      if (typeof window !== "undefined") {
        window.speechSynthesis.cancel();
      }
    };
  }, [resetSilenceTimer]);

  const toggleListening = useCallback(() => {
    console.log("🔘 [UI] Mic Button Clicked. Current Ref:", isListeningRef.current);
    
    const nextState = !isListeningRef.current;
    isListeningRef.current = nextState;
    setIsListening(nextState);

    if (nextState) {
      voiceRef.current?.stop();
      speechRef.current?.start();
      resetSilenceTimer();
      console.log("🎤 [MICROPHONE] Started.");
    } else {
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      speechRef.current?.stop();
      
      const textToSend = latestInputRef.current.trim();
      console.log(`🎤 [MICROPHONE] Stopped. Buffer Content: "${textToSend}"`);
      
      if (textToSend) {
        handleSend(textToSend);
        latestInputRef.current = "";
        setInput("");
      }
    }
  }, [handleSend, resetSilenceTimer]);

  const startInterview = useCallback(async () => {
    try {
      const u = new SpeechSynthesisUtterance("");
      u.volume = 0;
      window.speechSynthesis.speak(u);
    } catch {}

    // Prime the listening state for the first question
    setIsListening(true);
    isListeningRef.current = true;
    
    const greeting = `[CONTEXT: Topic=${context.topic}, Subcategory=${context.subcategory}, Model=${context.model}] Hello! I am ready for the interview. Please introduce yourself and ask the first question for ${context.subcategory}.`;
    await handleSend(greeting);
  }, [context, handleSend]);

  return {
    ...state,
    input,
    isListening,
    toggleListening,
    startInterview,
    setPhase: (p: DialogueState["phase"]) => managerRef.current?.setPhase(p),
    setVoiceURI,
    getVoices: () => voiceRef.current?.getVoices() || []
  };
}
