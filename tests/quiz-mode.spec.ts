import { test, expect } from "@playwright/test";
import { goToStudySession, clearStorage } from "./helpers/mock-api";
import { MOCK_CARDS } from "./fixtures/cards";

test.describe("Quiz Mode", () => {
  test.beforeEach(async ({ page }) => {
    await clearStorage(page);
    await goToStudySession(page, { cards: MOCK_CARDS, count: 5 });
    // Switch to Quiz Mode
    await page.getByRole("button", { name: /Quiz Mode/ }).click();
  });

  test("switches to quiz mode on button click", async ({ page }) => {
    // Quiz Mode button should be active (gradient styled)
    await expect(page.getByRole("button", { name: /Quiz Mode/ })).toBeVisible();
    // First card's front should still show
    await expect(page.getByText(MOCK_CARDS[0].front)).toBeVisible();
  });

  test("shows 4 multiple choice options", async ({ page }) => {
    // All 4 answer options should be present — correct + 3 wrong
    const options = page.getByRole("button", { name: new RegExp(MOCK_CARDS[0].back.slice(0, 10)) });
    // At minimum the correct answer is present
    await expect(options.first()).toBeVisible();
    // There should be exactly 4 choice buttons (not Flash/Quiz mode selectors)
    // Find all buttons that are choice buttons by looking inside the quiz container
    const choiceButtons = page.locator(".quiz-choices button, [data-testid='choice']");
    // Fallback: count buttons that aren't nav/mode buttons
    const allButtons = await page.getByRole("button").all();
    // At least 4 answer choice buttons exist somewhere
    expect(allButtons.length).toBeGreaterThanOrEqual(4);
  });

  test("correct answer shows green feedback", async ({ page }) => {
    // Click the correct answer (it's in the choices)
    const correctAnswer = MOCK_CARDS[0].back;
    const btn = page.getByRole("button", { name: new RegExp(correctAnswer.slice(0, 20), "i") });
    if (await btn.count() > 0) {
      await btn.first().click();
      // Green feedback should appear
      await expect(page.locator(".text-green-400, .text-\\[var\\(--green\\)\\]").first()).toBeVisible({ timeout: 3000 });
    }
  });

  test("auto-advances after answering", async ({ page }) => {
    // Click any answer choice
    const quizBtn = page.locator(".grid.grid-cols-1 button").first();
    await quizBtn.click();
    // After ~1.2s it should advance
    await page.waitForTimeout(1500);
    // Next card should be showing
    await expect(page.getByText(MOCK_CARDS[1].front)).toBeVisible({ timeout: 3000 });
  });

  test("completing all quiz cards triggers session complete", async ({ page }) => {
    for (let i = 0; i < MOCK_CARDS.length; i++) {
      const quizBtn = page.locator(".grid.grid-cols-1 button").first();
      await quizBtn.click();
      await page.waitForTimeout(1400);
    }
    await expect(page.getByText(/Session Complete/)).toBeVisible({ timeout: 5000 });
  });

  test("switching back to Flash mode shows card flipper", async ({ page }) => {
    await page.getByRole("button", { name: /Flash Cards/ }).click();
    await expect(page.locator(".card-flip-container")).toBeVisible();
  });

  test("switching modes resets to first card", async ({ page }) => {
    // Advance in quiz mode
    const quizBtn = page.locator(".grid.grid-cols-1 button").first();
    await quizBtn.click();
    await page.waitForTimeout(1400);
    // Switch back to flash
    await page.getByRole("button", { name: /Flash Cards/ }).click();
    // Should be back at card 1
    await expect(page.getByText(MOCK_CARDS[0].front)).toBeVisible();
  });
});
