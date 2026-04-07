import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { SYSTEM_PROMPT, buildGenerationPrompt } from "@/lib/flashcard-prompts";
import { TOPICS } from "@/config/topics";
import { v4 as uuidv4 } from "uuid";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { topicId, subcategory, count } = await req.json();

    const topic = TOPICS.find((t) => t.id === topicId);
    if (!topic) {
      return NextResponse.json({ error: "Invalid topic" }, { status: 400 });
    }

    const userPrompt = buildGenerationPrompt(
      topic.label,
      subcategory,
      count,
      topic.promptTemplate
    );

    const encoder = new TextEncoder();
    let buffer = "";

    const stream = new ReadableStream({
      async start(controller) {
        try {
          const messageStream = await client.messages.stream({
            model: "claude-opus-4-6",
            max_tokens: 8000,
            system: SYSTEM_PROMPT,
            messages: [{ role: "user", content: userPrompt }],
          });

          for await (const chunk of messageStream) {
            if (
              chunk.type === "content_block_delta" &&
              chunk.delta.type === "text_delta"
            ) {
              buffer += chunk.delta.text;
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ delta: chunk.delta.text })}\n\n`)
              );
            }
          }

          // Parse the complete JSON
          try {
            const jsonMatch = buffer.match(/\[[\s\S]*\]/);
            if (!jsonMatch) throw new Error("No JSON array found");
            const rawCards = JSON.parse(jsonMatch[0]);
            const cards = rawCards.map((c: any) => ({
              ...c,
              id: uuidv4(),
              category: topicId,
              subcategory,
              difficulty: Math.min(3, Math.max(1, parseInt(c.difficulty) || 1)) as 1 | 2 | 3,
            }));
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ cards })}\n\n`)
            );
          } catch (e) {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ error: "Failed to parse cards" })}\n\n`)
            );
          }

          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        } catch (error: any) {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ error: error.message })}\n\n`)
          );
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
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
