export type Role = "user" | "assistant" | "system";

export interface Message {
  id: string;
  role: Role;
  content: string;
}

export interface InterviewContext {
  topic: string;
  subcategory: string;
  model: string;
}

export interface DialogueState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  phase: "loading" | "intro" | "interviewing" | "closing" | "complete";
}

export interface IVoiceService {
  speak(text: string, voiceURI?: string): Promise<void>;
  stop(): void;
  getVoices(): SpeechSynthesisVoice[];
}

export interface ISpeechService {
  start(): void;
  stop(): void;
  onResult(callback: (text: string) => void): void;
  onError(callback: (error: any) => void): void;
}
