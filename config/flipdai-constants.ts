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
  { value: "gpt-4o-mini", label: "GPT-4o Mini", provider: "OpenAI", badge: "⚡", color: "#10b981", desc: "Fast & cheap" },
  { value: "gpt-4o", label: "GPT-4o", provider: "OpenAI", badge: "🎯", color: "#10b981", desc: "Most accurate" },
  { value: "gpt-3.5-turbo", label: "GPT-3.5 Turbo", provider: "OpenAI", badge: "🟢", color: "#10b981", desc: "Classic & cheap" },

  // Anthropic
  { value: "claude-haiku-4-5-20251001", label: "Claude Haiku", provider: "Anthropic", badge: "🟠", color: "#f97316", desc: "Fast & smart" },
  { value: "claude-sonnet-4-6", label: "Claude Sonnet", provider: "Anthropic", badge: "🧠", color: "#f97316", desc: "Best quality" },

  // Groq
  { value: "llama-3.3-70b-versatile", label: "Llama 3.3 70B", provider: "Groq", badge: "🦙", color: "#a855f7", desc: "Open source" },
  { value: "mixtral-8x7b-32768", label: "Mixtral 8x7B", provider: "Groq", badge: "🟣", color: "#a855f7", desc: "Fast & free" },

  // Google
  { value: "gemini-2.5-flash-preview-04-17", label: "Gemini 2.5 Flash", provider: "Google", badge: "🔵", color: "#3b82f6", desc: "Balanced" },
  { value: "gemini-2.5-flash-lite", label: "Gemini 2.5 Flash Lite", provider: "Google", badge: "💙", color: "#3b82f6", desc: "Lightest" },

  // OpenRouter
  { value: "deepseek/deepseek-chat", label: "DeepSeek V3", provider: "OpenRouter", badge: "🐋", color: "#ec4899", desc: "Ultra cheap" },
  { value: "deepseek/deepseek-r1", label: "DeepSeek R1", provider: "OpenRouter", badge: "🧩", color: "#ec4899", desc: "Reasoner" },
  { value: "meta-llama/llama-4-maverick", label: "Llama 4 Maverick", provider: "OpenRouter", badge: "🦁", color: "#ec4899", desc: "Latest Llama" },
  { value: "google/gemini-2.5-pro", label: "Gemini 2.5 Pro", provider: "OpenRouter", badge: "💎", color: "#ec4899", desc: "Pro quality" },
  { value: "openai/gpt-oss-20b:free", label: "GPT-OSS 20B", provider: "OpenRouter", badge: "🆓", color: "#ec4899", desc: "Free & fast" },
  { value: "openai/gpt-oss-120b:free", label: "GPT-OSS 120B", provider: "OpenRouter", badge: "🆓", color: "#ec4899", desc: "Free & large" },
  { value: "google/gemma-4-31b-it", label: "Gemma 4 31B", provider: "OpenRouter", badge: "💠", color: "#ec4899", desc: "Google open" },
  { value: "google/gemma-4-26b-a4b-it", label: "Gemma 4 26B MoE", provider: "OpenRouter", badge: "🔷", color: "#ec4899", desc: "MoE efficient" },
];

export const DEFAULT_MODEL = "deepseek/deepseek-chat";

export const PROVIDER_COLORS: Record<string, string> = {
  OpenAI: "#10b981",
  Anthropic: "#f97316",
  Groq: "#a855f7",
  Google: "#3b82f6",
  OpenRouter: "#ec4899",
};