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
  try {
    const { messages, topic, subcategory, model: modelId } = await req.json();
    const targetModel = modelId || DEFAULT_MODEL;

    console.log(`[CHAT-API ${timestamp}] 🚀 NATIVE BUDGET MODE: ${targetModel}`);

    const systemPromptPrefix = `You are Alex, an expert technical interviewer for ${topic || "Java"} (${subcategory || "General"}). 
    Your goal is a multi-turn progressive interview. 
    RULES:
    1. EVALUATE: Briefly acknowledge and critique the candidate's last answer. 
    2. CORRECT: If their answer was incomplete or wrong, provide the correct technical concept concisely.
    3. QUESTION: Ask exactly ONE follow-up or new question to keep the interview moving.
    4. STYLE: Professional, encouraging, but technically rigorous. Stay in character.
    \n\n`;

    let flatDialogue = systemPromptPrefix;
    messages.forEach((m: any) => {
      const actor = m.role === "user" ? "Candidate" : "Alex";
      flatDialogue += `${actor}: ${m.content}\n\n`;
    });
    flatDialogue += `Alex: `;

    // NATIVE FETCH: This is the ONLY way to guarantee a small max_tokens request
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://flipdai.vercel.app",
        "X-Title": "FlipDAI",
      },
      body: JSON.stringify({
        model: targetModel,
        messages: [{ role: "user", content: flatDialogue }],
        max_tokens: 800, // HARD BUDGET LIMIT
        stream: true,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("[NATIVE-ERROR]:", errText);
      try {
        const parsedError = JSON.parse(errText);
        return new Response(JSON.stringify({ error: parsedError.error?.message || "Credits Low" }), { status: 200 });
      } catch {
        return new Response(JSON.stringify({ error: "Communication Error or Low Credits" }), { status: 200 });
      }
    }

    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    
    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader();
        if (!reader) return controller.close();

        let buffer = "";
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";

            for (const line of lines) {
              const cleanLine = line.replace(/^data: /, "").trim();
              if (cleanLine === "" || cleanLine === "[DONE]") continue;

              try {
                const parsed = JSON.parse(cleanLine);
                const delta = parsed.choices?.[0]?.delta?.content;
                if (delta) {
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ delta })}\n\n`));
                }
              } catch (e) {}
            }
          }
        } catch (err: any) {
           controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: err.message })}\n\n`));
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: { 
        "Content-Type": "text/event-stream", 
        "Cache-Control": "no-cache",
        "Connection": "keep-alive"
      },
    });

  } catch (err: any) {
    console.error("[TOP-LEVEL ERROR]:", err.message);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

export async function HEAD() { return new Response(null, { status: 200 }); }

