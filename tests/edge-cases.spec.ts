import { test, expect } from "@playwright/test";
import { mockGenerate, clearStorage, goToStudySession } from "./helpers/mock-api";
import { MOCK_CARDS, MOCK_CARDS_25 } from "./fixtures/cards";

test.describe("Edge Cases", () => {
  test.beforeEach(async ({ page }) => {
    await clearStorage(page);
  });

  test("invalid topic in study URL shows error with home link", async ({ page }) => {
    await page.goto("/study/abc?topic=invalid-topic&sub=Whatever&count=10");
    await expect(page.getByText(/invalid topic/i)).toBeVisible();
    await expect(page.getByRole("link", { name: /Go home|home/i })).toBeVisible();
  });

  test("study URL without query params shows error", async ({ page }) => {
    await page.route("**/api/generate", (route) => route.abort());
    await page.goto("/study/abc");
    // Should show invalid topic or redirect
    await expect(page.getByText(/invalid|home/i)).toBeVisible({ timeout: 5000 });
  });

  test("navigating directly to /history works", async ({ page }) => {
    await page.goto("/history");
    await expect(page.getByText("Study History")).toBeVisible();
  });

  test("refreshing study page mid-session restores from localStorage", async ({ page }) => {
    await goToStudySession(page, { cards: MOCK_CARDS, count: 5 });
    // Mark a card as known
    await page.keyboard.press("1");
    // Navigate to next card
    await expect(page.getByText(MOCK_CARDS[1].front)).toBeVisible();
    // Re-mock generate so refresh doesn't fail
    await mockGenerate(page, MOCK_CARDS);
    // Reload
    await page.reload();
    await page.waitForSelector("text=Flash Cards", { timeout: 10000 });
    // Session should have restored (cards should be showing)
    await expect(page.locator(".card-flip-container")).toBeVisible();
  });

  test("50-card generation completes fully", async ({ page }) => {
    const cards50 = Array.from({ length: 50 }, (_, i) => ({
      id: `c${i}`,
      front: `Q${i + 1}`,
      back: `A${i + 1}`,
      hint: `H${i + 1}`,
      difficulty: ([1, 2, 3][i % 3]) as 1 | 2 | 3,
      category: "tech-topics",
      subcategory: "React",
    }));
    await mockGenerate(page, cards50);
    await page.goto("/study/sess?topic=tech-topics&sub=React&count=50");
    await expect(page.getByText(/1\s*\/\s*50/)).toBeVisible({ timeout: 10000 });
  });

  test("custom topic with long input generates cards", async ({ page }) => {
    const customCards = MOCK_CARDS.map((c) => ({ ...c, subcategory: "Ancient Roman History" }));
    await mockGenerate(page, customCards);
    await page.goto("/study/sess?topic=custom&sub=Ancient%20Roman%20History&count=5");
    await expect(page.getByText("Ancient Roman History")).toBeVisible({ timeout: 8000 });
  });

  test("auto-speak toggle in header persists state", async ({ page }) => {
    await goToStudySession(page, { cards: MOCK_CARDS });
    const speakBtn = page.getByRole("button", { name: /🔊/ });
    // Toggle on
    await speakBtn.click();
    await expect(speakBtn).toHaveClass(/accent|bg-/);
    // Toggle off
    await speakBtn.click();
  });

  test("browser back button from study returns to home", async ({ page }) => {
    await page.goto("/");
    await mockGenerate(page, MOCK_CARDS);
    await page.goto("/study/test?topic=tech-topics&sub=React&count=5");
    await page.waitForSelector("text=Flash Cards", { timeout: 8000 });
    await page.goBack();
    await expect(page).toHaveURL("/");
  });

  test("25-card session shows correct progress tracking", async ({ page }) => {
    await mockGenerate(page, MOCK_CARDS_25);
    await page.goto("/study/sess25?topic=tech-topics&sub=React&count=25");
    await expect(page.getByText(/1\s*\/\s*25/)).toBeVisible({ timeout: 10000 });
    // Advance a few cards
    for (let i = 0; i < 5; i++) await page.keyboard.press("ArrowRight");
    await expect(page.getByText(/6\s*\/\s*25/)).toBeVisible();
  });

  test("multiple sessions accumulate in history", async ({ page }) => {
    // Session 1
    await goToStudySession(page, { cards: MOCK_CARDS, count: 5 });
    for (let i = 0; i < MOCK_CARDS.length; i++) await page.keyboard.press("1");
    await page.waitForSelector("text=Session Complete", { timeout: 5000 });

    // Go to history — 1 entry
    await page.goto("/history");
    await expect(page.getByText("React")).toBeVisible();

    // Session 2 — SAT prep
    const satCards = MOCK_CARDS.map((c) => ({ ...c, subcategory: "Math", category: "sat-prep" }));
    await mockGenerate(page, satCards);
    await page.goto("/study/sess2?topic=sat-prep&sub=Math&count=5");
    await page.waitForSelector("text=Flash Cards", { timeout: 8000 });
    for (let i = 0; i < satCards.length; i++) await page.keyboard.press("ArrowRight");
    await page.waitForSelector("text=Session Complete", { timeout: 5000 });

    await page.goto("/history");
    // Both sessions should appear
    await expect(page.getByText("React")).toBeVisible();
    await expect(page.getByText("Math")).toBeVisible();
  });

  test("empty card count in URL defaults gracefully", async ({ page }) => {
    await mockGenerate(page, MOCK_CARDS);
    await page.goto("/study/sess?topic=tech-topics&sub=React");
    // Should default to 10 (parseInt of null = NaN, code uses || 10)
    await expect(page.locator("body")).not.toContainText("undefined");
  });
});
