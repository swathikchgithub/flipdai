import { NextRequest } from "next/server";
import { streamText } from "ai";
import { openai, createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { google } from "@ai-sdk/google";
import { TOPICS } from "@/config/topics";
import { DEFAULT_MODEL } from "@/config/flipdai-constants";
import { v4 as uuidv4 } from "uuid";

// Anthropic — explicit baseURL+key to avoid Claude Desktop env var conflicts
// Claude Desktop sets ANTHROPIC_BASE_URL (without /v1) and blanks ANTHROPIC_API_KEY
const anthropic = createAnthropic({
  baseURL: "https://api.anthropic.com/v1",
  apiKey: process.env.FLIPDAI_ANTHROPIC_KEY || process.env.ANTHROPIC_API_KEY,
});

// Groq — OpenAI-compatible endpoint
const groq = createOpenAI({
  baseURL: "https://api.groq.com/openai/v1",
  apiKey: process.env.GROQ_API_KEY,
});

// OpenRouter — OpenAI-compatible endpoint
const openrouter = createOpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
  headers: {
    "HTTP-Referer": "https://flipdai.vercel.app",
    "X-Title": "FlipDAI",
  },
});

function getModel(modelId: string) {
  if (modelId.includes("/")) return openrouter(modelId);
  if (modelId.startsWith("claude")) return anthropic(modelId);
  if (modelId.startsWith("gemini")) return google(modelId);
  if (modelId.startsWith("llama") || modelId.startsWith("mixtral")) return groq(modelId);
  return openai(modelId);
}

function buildSystemPrompt(count: number, topic: string, subcategory: string) {
  return `You are an expert educator creating flash cards.
Generate exactly ${count} flash cards for: ${topic} — ${subcategory}.

You MUST return ONLY a raw JSON array. No markdown. No code fences. No explanation. No preamble. Start your response with [ and end with ].

Format:
[
  {
    "front": "clear question or term",
    "back": "concise answer (2-3 sentences max)",
    "hint": "memory trick or mnemonic, or empty string",
    "difficulty": 1
  }
]

Rules:
- difficulty: 1=easy, 2=medium, 3=hard (mix ~40/40/20)
- No duplicate concepts
- No markdown in JSON values`;
}

/**
 * Robustly extracts a JSON array from a model response.
 * Handles: raw JSON, markdown fences, preamble text, trailing text.
 */
function extractCards(raw: string): any[] {
  // 1. Strip markdown code fences (```json ... ``` or ``` ... ```)
  const stripped = raw
    .replace(/```(?:json)?\s*/gi, "")
    .replace(/```/g, "")
    .trim();

  // 2. Try parsing the entire stripped string
  try {
    const parsed = JSON.parse(stripped);
    if (Array.isArray(parsed)) return parsed;
  } catch {}

  // 3. Find the first [ and last ] and extract that slice
  const start = stripped.indexOf("[");
  const end = stripped.lastIndexOf("]");
  if (start !== -1 && end !== -1 && end > start) {
    try {
      const parsed = JSON.parse(stripped.slice(start, end + 1));
      if (Array.isArray(parsed)) return parsed;
    } catch {}
  }

  // 4. Nothing worked — throw with context so the user sees what happened
  const preview = stripped.slice(0, 300);
  throw new Error(`Could not parse flash cards. Model responded with: "${preview}"`);
}

export async function POST(req: NextRequest) {
  try {
    const { topicId, subcategory, count = 10, model: modelId = DEFAULT_MODEL } = await req.json();

    const topic = TOPICS.find((t) => t.id === topicId);
    if (!topic) {
      return new Response(
        `data: ${JSON.stringify({ error: "Invalid topic" })}\n\ndata: [DONE]\n\n`,
        { headers: { "Content-Type": "text/event-stream" } }
      );
    }

    const aiModel = getModel(modelId);
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        let buffer = "";

        try {
          const result = streamText({
            model: aiModel,
            system: buildSystemPrompt(count, topic.label, subcategory),
            prompt: `Generate ${count} flash cards for: ${topic.label} — ${subcategory}`,
            maxOutputTokens: 8000,
          });

          for await (const part of result.fullStream) {
            if (part.type === "text-delta") {
              buffer += part.text;
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ delta: part.text })}\n\n`)
              );
            } else if (part.type === "error") {
              const errMsg = part.error instanceof Error
                ? part.error.message
                : String(part.error);
              throw new Error(`Model error: ${errMsg}`);
            }
          }

          const rawCards = extractCards(buffer);
          const cards = rawCards.map((c: any) => ({
            ...c,
            id: uuidv4(),
            category: topicId,
            subcategory,
            difficulty: Math.min(3, Math.max(1, parseInt(String(c.difficulty)) || 2)) as 1 | 2 | 3,
            hint: c.hint || "",
          }));

          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ cards })}\n\n`)
          );
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        } catch (err: any) {
          console.error("[generate] Error:", err.message, "\nBuffer:", buffer.slice(0, 500));
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ error: err.message || "Generation failed" })}\n\n`)
          );
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (err: any) {
    return new Response(
      `data: ${JSON.stringify({ error: err.message })}\n\ndata: [DONE]\n\n`,
      { headers: { "Content-Type": "text/event-stream" } }
    );
  }
}
