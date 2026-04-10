import { Page, Route } from "@playwright/test";
import { FlashCard } from "../../lib/flashcard-types";
import { MOCK_CARDS, MOCK_EVALUATE_CORRECT } from "../fixtures/cards";

/**
 * Builds a Server-Sent Events response body that mirrors /api/generate.
 * Sends delta events (progress) then the final cards payload.
 */
export function buildSSEResponse(cards: FlashCard[]): string {
  const lines: string[] = [];
  for (let i = 0; i < cards.length - 1; i++) {
    lines.push(`data: ${JSON.stringify({ delta: true })}\n\n`);
  }
  lines.push(`data: ${JSON.stringify({ cards })}\n\n`);
  lines.push("data: [DONE]\n\n");
  return lines.join("");
}

/** Mock /api/generate — returns cards immediately via SSE */
export async function mockGenerate(page: Page, cards: FlashCard[] = MOCK_CARDS) {
  await page.route("**/api/generate", async (route: Route) => {
    await route.fulfill({
      status: 200,
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
      body: buildSSEResponse(cards),
    });
  });
}

/** Mock /api/evaluate */
export async function mockEvaluate(page: Page, response = MOCK_EVALUATE_CORRECT) {
  await page.route("**/api/evaluate", async (route: Route) => {
    await route.fulfill({
      status: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(response),
    });
  });
}

/** Mock both API routes in one call */
export async function mockAllAPIs(page: Page, cards: FlashCard[] = MOCK_CARDS) {
  await mockGenerate(page, cards);
  await mockEvaluate(page);
}

/**
 * Clear localStorage via addInitScript — runs on the NEXT navigation,
 * no extra page load needed. Call this before goto().
 */
export async function clearStorage(page: Page) {
  await page.addInitScript(() => {
    localStorage.removeItem("flipdai_history");
    localStorage.removeItem("flipdai_streak");
    localStorage.removeItem("flipdai_last_study");
    Object.keys(localStorage)
      .filter((k) => k.startsWith("flipdai_session_"))
      .forEach((k) => localStorage.removeItem(k));
  });
}

/**
 * Seed localStorage via addInitScript — no extra page load.
 * Call this before goto().
 */
export async function seedHistory(page: Page) {
  await page.addInitScript(() => {
    const now = Date.now();
    const history = [
      {
        id: "hist-1",
        topic: "tech-topics",
        subcategory: "React",
        cardCount: 10,
        knownCount: 8,
        reviewCount: 2,
        date: new Date(now - 86400000).toISOString(),
        score: 80,
      },
      {
        id: "hist-2",
        topic: "sat-prep",
        subcategory: "Math",
        cardCount: 10,
        knownCount: 4,
        reviewCount: 6,
        date: new Date(now - 172800000).toISOString(),
        score: 40,
      },
      {
        id: "hist-3",
        topic: "languages",
        subcategory: "Spanish",
        cardCount: 10,
        knownCount: 1,
        reviewCount: 9,
        date: new Date(now - 259200000).toISOString(),
        score: 10,
      },
    ];
    localStorage.setItem("flipdai_history", JSON.stringify(history));
    localStorage.setItem("flipdai_streak", "3");
    localStorage.setItem(
      "flipdai_last_study",
      new Date(now - 86400000).toISOString().split("T")[0]
    );
  });
}

/**
 * Navigate to a study session with pre-mocked API.
 * Resolves once cards are loaded (studying phase visible).
 */
export async function goToStudySession(
  page: Page,
  options: {
    topic?: string;
    sub?: string;
    count?: number;
    cards?: FlashCard[];
  } = {}
) {
  const {
    topic = "tech-topics",
    sub = "React",
    count = 5,
    cards = MOCK_CARDS,
  } = options;

  await mockGenerate(page, cards);
  await mockEvaluate(page);

  await page.goto(
    `/study/test-session?topic=${encodeURIComponent(topic)}&sub=${encodeURIComponent(sub)}&count=${count}`
  );

  await page.waitForSelector('button:has-text("Flash Cards")', { timeout: 12000 });
}
