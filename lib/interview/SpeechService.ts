import { ISpeechService } from "./types";

export class BrowserSpeechService implements ISpeechService {
  private recognition: any;
  private resultCallback: (text: string) => void = () => {};
  private errorCallback: (error: any) => void = () => {};
  private isActive = false;

  private init() {
    if (typeof window === "undefined") return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    if (this.recognition) {
       this.recognition.onresult = null;
       this.recognition.onerror = null;
       this.recognition.onend = null;
       try { this.recognition.stop(); } catch {}
    }

    this.recognition = new SpeechRecognition();
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = "en-US";

    this.recognition.onresult = (event: any) => {
      let transcript = "";
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        transcript += event.results[i][0].transcript;
      }
      if (transcript) {
        console.log(`🎤 [HEARING] "${transcript.slice(0, 30)}..."`);
        this.resultCallback(transcript);
      }
    };

    this.recognition.onend = () => {
      if (this.isActive) {
        console.log("🎤 [MIC-RESTART] Refreshing connection...");
        try { this.recognition.start(); } catch {}
      }
    };

    this.recognition.onerror = (e: any) => {
      if (e.error === "no-speech" || e.error === "aborted") return;
      if (e.error === "not-allowed") {
         this.isActive = false; 
         console.error("🎤 [SPEECH] Permission Denied!");
      }
      this.errorCallback(e);
    };
  }

  public start(): void {
    this.isActive = true;
    this.init();
    console.log("🎤 [SYSTEM] Microphone Nuclear Reset Complete.");
    try { this.recognition?.start(); } catch {}
  }

  public stop(): void {
    this.isActive = false;
    try { this.recognition?.stop(); } catch {}
  }

  public onResult(callback: (text: string) => void): void {
    this.resultCallback = callback;
  }

  public onError(callback: (error: any) => void): void {
    this.errorCallback = callback;
  }
}
