import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { EVALUATION_SYSTEM_PROMPT } from "@/lib/flashcard-prompts";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { front, back, studentAnswer } = await req.json();

    const userPrompt = `Card question: ${front}
Correct answer: ${back}
Student's answer: ${studentAnswer}`;

    const response = await client.messages.create({
      model: "claude-opus-4-6",
      max_tokens: 512,
      system: EVALUATION_SYSTEM_PROMPT,
      messages: [{ role: "user", content: userPrompt }],
    });

    const text = response.content.find((b) => b.type === "text")?.text || "{}";

    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      const result = JSON.parse(jsonMatch?.[0] || "{}");
      return NextResponse.json(result);
    } catch {
      return NextResponse.json({ correct: false, score: 0, feedback: "Could not evaluate answer.", missing: "" });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
