export interface ModelConfig {
  value: string;
  label: string;
  provider: "OpenAI" | "Anthropic" | "Groq" | "Google" | "OpenRouter";
  badge: string;
  color: string;
  desc: string;
}

export const FLIPDAI_MODELS: ModelConfig[] = [
  // OpenAI
  {
    value: "gpt-4o-mini",
    label: "GPT-4o Mini",
    provider: "OpenAI",
    badge: "⚡",
    color: "#10b981",
    desc: "Fast & cheap",
  },
  {
    value: "gpt-4o",
    label: "GPT-4o",
    provider: "OpenAI",
    badge: "🎯",
    color: "#10b981",
    desc: "Most accurate",
  },

  // Anthropic
  {
    value: "claude-haiku-4-5-20251001",
    label: "Claude Haiku",
    provider: "Anthropic",
    badge: "🟠",
    color: "#f97316",
    desc: "Fast & smart",
  },
  {
    value: "claude-sonnet-4-6",
    label: "Claude Sonnet",
    provider: "Anthropic",
    badge: "🧠",
    color: "#f97316",
    desc: "Best quality",
  },

  // Groq
  {
    value: "llama-3.3-70b-versatile",
    label: "Llama 3.3 70B",
    provider: "Groq",
    badge: "🦙",
    color: "#a855f7",
    desc: "Open source",
  },
  {
    value: "mixtral-8x7b-32768",
    label: "Mixtral 8x7B",
    provider: "Groq",
    badge: "🟣",
    color: "#a855f7",
    desc: "Fast & free",
  },

  // Google
  {
    value: "gemini-2.5-flash-preview-04-17",
    label: "Gemini 2.5 Flash",
    provider: "Google",
    badge: "🔵",
    color: "#3b82f6",
    desc: "Balanced",
  },

  // OpenRouter (DeepSeek)
  {
    value: "deepseek/deepseek-chat",
    label: "DeepSeek V3",
    provider: "OpenRouter",
    badge: "🐋",
    color: "#ec4899",
    desc: "Ultra cheap",
  },
];

export const DEFAULT_MODEL = "claude-sonnet-4-6";

export const PROVIDER_COLORS: Record<string, string> = {
  OpenAI: "#10b981",
  Anthropic: "#f97316",
  Groq: "#a855f7",
  Google: "#3b82f6",
  OpenRouter: "#ec4899",
};
