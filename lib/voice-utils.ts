export function speakText(text: string, rate = 1.0, voiceURI?: string, onEnd?: () => void): void {
  const DEBUG = true; 
  if (DEBUG) console.log("🔊 [VOICE-UTILS] speakText called.");

  if (typeof window === "undefined" || !window.speechSynthesis) {
    return;
  }
  
  // CLEAR THE DECK: Stop any previous speaking to prevent conflicts
  window.speechSynthesis.cancel();

  // SMALL DELAY: Give the hardware a moment to reset
  setTimeout(() => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rate;
    utterance.lang = "en-US";

    if (voiceURI) {
      const voices = window.speechSynthesis.getVoices();
      const voice = voices.find((v) => v.voiceURI === voiceURI);
      if (voice) utterance.voice = voice;
    }

    utterance.onstart = () => {
      if (DEBUG) console.log("🔊 [VOICE-UTILS] Started.");
    };

    utterance.onend = () => {
      if (onEnd) onEnd();
    };

    utterance.onerror = (e: any) => {
      // Ignore 'interrupted' errors as they are expected when skipping cards
      if (e.error === "interrupted") return;
      console.warn("🔊 [VOICE-UTILS] Voice engine busy or error:", e.error);
      if (onEnd) onEnd();
    };

    window.speechSynthesis.speak(utterance);
  }, 50);
}

export function stopSpeaking(): void {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
}

export function isSpeaking(): boolean {
  if (typeof window === "undefined" || !window.speechSynthesis) return false;
  return window.speechSynthesis.speaking;
}

export function getVoices(): SpeechSynthesisVoice[] {
  if (typeof window === "undefined" || !window.speechSynthesis) return [];
  return window.speechSynthesis.getVoices();
}

/**
 * Start continuous speech recognition.
 *
 * Fixes vs the old implementation:
 *  - `continuous = true`  → doesn't stop on a short pause mid-sentence
 *  - Accumulates final   → multiple sentences build up instead of replacing
 *  - Auto-restart        → Chrome/Safari sometimes drop the session silently;
 *                          we restart automatically unless the user manually stopped
 *  - `lang` param        → callers can pass en-IN / en-GB / es-ES etc.
 */
export function startListening(
  onResult: (transcript: string, isFinal: boolean) => void,
  onEnd: () => void,
  onError: (error: string) => void,
  lang = "en-US"
): (() => void) | null {
  if (typeof window === "undefined") return null;

  const SpeechRecognition =
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

  if (!SpeechRecognition) {
    onError("Speech recognition not supported in this browser.");
    return null;
  }

  let committed = "";   // finalised sentences we've already locked in
  let manualStop = false;

  const recognition = new SpeechRecognition();
  recognition.continuous     = true;   // stay alive through pauses
  recognition.interimResults = true;   // show live text while speaking
  recognition.lang           = lang;

  recognition.onresult = (e: any) => {
    let interim = "";
    // Walk only the new results since last event
    for (let i = e.resultIndex; i < e.results.length; i++) {
      const r = e.results[i];
      if (r.isFinal) {
        committed += r[0].transcript + " ";
      } else {
        interim += r[0].transcript;
      }
    }
    onResult(committed + interim, false);
  };

  recognition.onend = () => {
    if (!manualStop) {
      // Browser dropped the session unexpectedly (common in Chrome) — restart
      try { recognition.start(); } catch {}
    } else {
      onEnd();
    }
  };

  recognition.onerror = (e: any) => {
    // "aborted" fires when we call .stop() — ignore it
    if (e.error === "aborted" || e.error === "no-speech") return;
    onError(e.error as string);
  };

  recognition.start();

  return () => {
    manualStop = true;
    try { recognition.stop(); } catch {}
  };
}

/** Available speech recognition languages for the picker */
export const SPEECH_LANGUAGES = [
  { code: "en-US", label: "English (US)" },
  { code: "en-GB", label: "English (UK)" },
  { code: "en-IN", label: "English (India)" },
  { code: "en-AU", label: "English (Australia)" },
  { code: "en-CA", label: "English (Canada)" },
  { code: "es-ES", label: "Spanish (Spain)" },
  { code: "es-MX", label: "Spanish (Mexico)" },
  { code: "fr-FR", label: "French" },
  { code: "de-DE", label: "German" },
  { code: "hi-IN", label: "Hindi" },
  { code: "zh-CN", label: "Chinese (Mandarin)" },
  { code: "ja-JP", label: "Japanese" },
  { code: "ko-KR", label: "Korean" },
  { code: "pt-BR", label: "Portuguese (Brazil)" },
  { code: "ar-SA", label: "Arabic" },
];
