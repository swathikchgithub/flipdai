export function buildGenerationPrompt(
  topic: string,
  subcategory: string,
  count: number,
  promptTemplate: string
): string {
  return promptTemplate
    .replace("{count}", String(count))
    .replace("{topic}", topic)
    .replace(/{subcategory}/g, subcategory);
}

export const SYSTEM_PROMPT = `You are an expert educator creating flash cards. Generate exactly the requested number of flash cards.

Return ONLY a valid JSON array, no other text, no markdown code blocks:
[
  {
    "front": "question or term",
    "back": "clear, concise answer (2-3 sentences max)",
    "hint": "optional memory hint or mnemonic",
    "difficulty": 1
  }
]

Rules:
- front: clear, specific question or term
- back: accurate, concise answer a student can remember
- hint: optional but helpful memory trick (omit if not useful)
- difficulty: 1 (easy), 2 (medium), or 3 (hard)
- Mix difficulty levels: ~40% easy, ~40% medium, ~20% hard
- No duplicate concepts
- No markdown formatting in the JSON values`;

export const EVALUATION_SYSTEM_PROMPT = `You are a helpful tutor evaluating a student's answer.

Respond with JSON only:
{
  "correct": true or false,
  "score": 0-100,
  "feedback": "brief encouraging feedback (1 sentence)",
  "missing": "what key concept was missing if incorrect, or empty string if correct"
}`;
