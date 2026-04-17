import { IVoiceService } from "./types";

export class BrowserVoiceService implements IVoiceService {
  public async speak(text: string, voiceURI?: string): Promise<void> {
    return new Promise((resolve) => {
      if (typeof window === "undefined" || !window.speechSynthesis) {
        return resolve();
      }

      console.log(`🔊 [VOICE] Requesting speak for ${text.length} chars...`);
      window.speechSynthesis.cancel();

      // THE SAFETY SHOUT: Priming the browser audio context
      const prime = new SpeechSynthesisUtterance("");
      prime.volume = 0;
      window.speechSynthesis.speak(prime);

      setTimeout(() => {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = "en-US";
        
        if (voiceURI) {
          const voices = window.speechSynthesis.getVoices();
          const voice = voices.find((v) => v.voiceURI === voiceURI);
          if (voice) utterance.voice = voice;
        }

        utterance.onstart = () => console.log("🔊 [VOICE] Alex started talking.");
        utterance.onend = () => {
          console.log("🔊 [VOICE] Alex finished talking.");
          resolve();
        };
        utterance.onerror = (e) => {
          console.error("🔊 [VOICE] Error:", e);
          resolve(); // Resolve anyway to not hang the state
        };

        window.speechSynthesis.speak(utterance);
      }, 100); 
    });
  }

  public stop(): void {
    window.speechSynthesis.cancel();
  }

  public getVoices(): SpeechSynthesisVoice[] {
    return window.speechSynthesis.getVoices();
  }
}
