import { streamText } from "ai";
import { openai, createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { google } from "@ai-sdk/google";
import { DEFAULT_MODEL } from "@/config/flipdai-constants";

const anthropic = createAnthropic({
  baseURL: "https://api.anthropic.com/v1",
  apiKey: process.env.FLIPDAI_ANTHROPIC_KEY || process.env.ANTHROPIC_API_KEY,
});

const groq = createOpenAI({
  baseURL: "https://api.groq.com/openai/v1",
  apiKey: process.env.GROQ_API_KEY,
});

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

export async function POST(req: Request) {
  const timestamp = new Date().toISOString();
  console.log(`[INTERVIEW-API ${timestamp}] 🚀 NEW HANDLER V4 ACTIVE`);

  try {
    const body = await req.json();
    const topicText = body.topic || body.topicId || "the selected topic";
    const subText = body.subcategory || body.sub || "this area";
    const { messages, model: modelId = DEFAULT_MODEL } = body;

    const formattedMessages = (messages || []).map((m: any) => {
      let text = m.content || "";
      if (!text && m.parts) {
        text = m.parts.map((p: any) => p.text || "").join("");
      }
      return {
        role: m.role || "user",
        content: text,
      };
    });

    const systemPrompt = `
      You are an expert interviewer for the field of ${topicText} (${subText}).
      Your goal is to conduct a professional, engaging, and challenging mock interview.

      Rules:
      1. Start by introducing yourself and asking the first question.
      2. Listen to the user's response. Provide brief, constructive feedback or a relevant follow-up question if their answer was incomplete.
      3. Stay in character. Do not break the fourth wall.
      4. Keep your responses concise (under 3 sentences) to keep the conversation flowing naturally.
      5. If the user asks for help, provide a hint but steer them back to answering the question.
      6. Once you've covered about 5-7 questions, or if the user asks to end, provide a very brief closing statement.
    `;

    const aiModel = getModel(modelId);
    const result = streamText({
      model: aiModel,
      system: systemPrompt,
      messages: formattedMessages,
    });

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const part of result.fullStream) {
            if (part.type === "text-delta") {
              controller.enqueue(encoder.encode(`0:${JSON.stringify(part.text)}\n`));
            }
          }
        } catch (err: any) {
          controller.enqueue(encoder.encode(`3:${JSON.stringify({ error: err.message })}\n`));
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "x-vercel-ai-data-stream": "v1",
      },
    });

  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { 
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}

export async function HEAD() {
  console.log(`[INTERVIEW-API] 🔍 Ping Received (HEAD)`);
  return new Response(null, { status: 200 });
}
