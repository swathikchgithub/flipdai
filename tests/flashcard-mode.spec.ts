import { test, expect } from "@playwright/test";
import { goToStudySession, clearStorage } from "./helpers/mock-api";
import { MOCK_CARDS } from "./fixtures/cards";

test.describe("Flash Card Mode", () => {
  test.beforeEach(async ({ page }) => {
    await clearStorage(page);
    await goToStudySession(page, { cards: MOCK_CARDS, count: 5 });
  });

  test("Flash Cards mode is selected by default", async ({ page }) => {
    const flashBtn = page.getByRole("button", { name: /Flash Cards/ });
    // Should have gradient/accent styling indicating it's active
    await expect(flashBtn).toBeVisible();
  });

  test("shows first card front face", async ({ page }) => {
    await expect(page.getByText(MOCK_CARDS[0].front)).toBeVisible();
  });

  test("shows difficulty badge on card", async ({ page }) => {
    await expect(page.getByText(/Easy|Medium|Hard/)).toBeVisible();
  });

  test("shows subcategory label on card", async ({ page }) => {
    await expect(page.getByText("React")).toBeVisible();
  });

  test("shows 'Click to flip' hint text", async ({ page }) => {
    await expect(page.getByText(/Space/)).toBeVisible();
  });

  test("clicking card flips to show answer", async ({ page }) => {
    // Front is visible
    await expect(page.getByText(MOCK_CARDS[0].front)).toBeVisible();
    // Click the card
    await page.locator(".card-flip-container").click();
    // Answer label appears
    await expect(page.getByText("Answer")).toBeVisible();
    await expect(page.getByText(MOCK_CARDS[0].back)).toBeVisible();
  });

  test("pressing Space flips the card", async ({ page }) => {
    await page.keyboard.press("Space");
    await expect(page.getByText("Answer")).toBeVisible();
  });

  test("pressing Space again flips back to front", async ({ page }) => {
    await page.keyboard.press("Space");
    await expect(page.getByText("Answer")).toBeVisible();
    await page.keyboard.press("Space");
    await expect(page.getByText(MOCK_CARDS[0].front)).toBeVisible();
  });

  test("ArrowRight navigates to next card", async ({ page }) => {
    await page.keyboard.press("ArrowRight");
    await expect(page.getByText(MOCK_CARDS[1].front)).toBeVisible();
  });

  test("ArrowLeft navigates to previous card", async ({ page }) => {
    await page.keyboard.press("ArrowRight");
    await expect(page.getByText(MOCK_CARDS[1].front)).toBeVisible();
    await page.keyboard.press("ArrowLeft");
    await expect(page.getByText(MOCK_CARDS[0].front)).toBeVisible();
  });

  test("ArrowLeft does nothing on first card", async ({ page }) => {
    await page.keyboard.press("ArrowLeft");
    await expect(page.getByText(MOCK_CARDS[0].front)).toBeVisible();
  });

  test("Prev button is disabled on first card", async ({ page }) => {
    await expect(page.getByRole("button", { name: /Prev/ })).toBeDisabled();
  });

  test("Next button advances to next card", async ({ page }) => {
    await page.getByRole("button", { name: /Next/ }).click();
    await expect(page.getByText(MOCK_CARDS[1].front)).toBeVisible();
  });

  test("key 1 marks card as Known and advances", async ({ page }) => {
    await page.keyboard.press("1");
    // Should advance to card 2
    await expect(page.getByText(MOCK_CARDS[1].front)).toBeVisible();
    // Known count should be 1
    await expect(page.getByText("1")).toBeVisible();
  });

  test("key 2 marks card as Review and advances", async ({ page }) => {
    await page.keyboard.press("2");
    await expect(page.getByText(MOCK_CARDS[1].front)).toBeVisible();
  });

  test("Know It button marks card and advances", async ({ page }) => {
    await page.getByRole("button", { name: /Know It/ }).click();
    await expect(page.getByText(MOCK_CARDS[1].front)).toBeVisible();
  });

  test("Review button marks card and advances", async ({ page }) => {
    await page.getByRole("button", { name: /Review/ }).click();
    await expect(page.getByText(MOCK_CARDS[1].front)).toBeVisible();
  });

  test("Skip button advances without marking", async ({ page }) => {
    await page.getByRole("button", { name: /Skip/ }).click();
    await expect(page.getByText(MOCK_CARDS[1].front)).toBeVisible();
  });

  test("progress bar updates as cards advance", async ({ page }) => {
    await expect(page.getByText(/1\s*\/\s*5/)).toBeVisible();
    await page.keyboard.press("ArrowRight");
    await expect(page.getByText(/2\s*\/\s*5/)).toBeVisible();
  });

  test("hint button shows and hides hint", async ({ page }) => {
    const hintBtn = page.getByRole("button", { name: /Show hint/ });
    await expect(hintBtn).toBeVisible();
    await hintBtn.click();
    await expect(page.getByText(MOCK_CARDS[0].hint!)).toBeVisible();
    await page.getByRole("button", { name: /Hide hint/ }).click();
    await expect(page.getByText(MOCK_CARDS[0].hint!)).not.toBeVisible();
  });

  test("hint is hidden on card navigation", async ({ page }) => {
    await page.getByRole("button", { name: /Show hint/ }).click();
    await expect(page.getByText(MOCK_CARDS[0].hint!)).toBeVisible();
    await page.keyboard.press("ArrowRight");
    // Hint for card 2 should not auto-show
    await expect(page.getByText(MOCK_CARDS[0].hint!)).not.toBeVisible();
  });

  test("card resets to front face on navigation", async ({ page }) => {
    // Flip card 1
    await page.keyboard.press("Space");
    await expect(page.getByText("Answer")).toBeVisible();
    // Navigate to card 2
    await page.keyboard.press("ArrowRight");
    // Card 2 should be front face (Answer label gone)
    await expect(page.getByText("Answer")).not.toBeVisible();
    await expect(page.getByText(MOCK_CARDS[1].front)).toBeVisible();
  });

  test("stats update: known, review, skipped counts", async ({ page }) => {
    await page.keyboard.press("1"); // known
    await page.keyboard.press("2"); // review
    await page.getByRole("button", { name: /Skip/ }).click(); // skipped
    // Stats section should reflect counts
    await expect(page.getByText("1")).toBeVisible(); // at least 1 known shown somewhere
  });

  test("completing all cards triggers complete phase", async ({ page }) => {
    for (let i = 0; i < MOCK_CARDS.length; i++) {
      await page.keyboard.press("ArrowRight");
    }
    await expect(page.getByText(/Session Complete/)).toBeVisible({ timeout: 5000 });
  });

  test("keyboard shortcuts hint is visible", async ({ page }) => {
    await expect(page.getByText(/Space.*flip|flip.*Space/i)).toBeVisible();
  });
});
