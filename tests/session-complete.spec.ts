import { test, expect } from "@playwright/test";
import { goToStudySession, clearStorage } from "./helpers/mock-api";
import { MOCK_CARDS } from "./fixtures/cards";

/** Helper: advance through all cards using keyboard */
async function completeAllCards(page: any) {
  for (let i = 0; i < MOCK_CARDS.length; i++) {
    await page.keyboard.press("ArrowRight");
    await page.waitForTimeout(100);
  }
  await page.waitForSelector("text=Session Complete", { timeout: 5000 });
}

/** Helper: complete with specific marks */
async function completeWithMarks(page: any, marks: ("known" | "review" | "skip")[]) {
  for (const mark of marks) {
    if (mark === "known") await page.keyboard.press("1");
    else if (mark === "review") await page.keyboard.press("2");
    else await page.getByRole("button", { name: /Skip/ }).click();
    await page.waitForTimeout(100);
  }
  await page.waitForSelector("text=Session Complete", { timeout: 5000 });
}

test.describe("Session Complete Screen", () => {
  test.beforeEach(async ({ page }) => {
    await clearStorage(page);
    await goToStudySession(page, { cards: MOCK_CARDS, count: 5 });
  });

  test("shows Session Complete heading after last card", async ({ page }) => {
    await completeAllCards(page);
    await expect(page.getByText(/Session Complete/)).toBeVisible();
  });

  test("shows emoji celebration", async ({ page }) => {
    await completeAllCards(page);
    await expect(page.getByText("🎉")).toBeVisible();
  });

  test("shows known, review, skipped breakdown", async ({ page }) => {
    await page.keyboard.press("1"); // known
    await page.keyboard.press("2"); // review
    await page.keyboard.press("2"); // review
    await page.keyboard.press("ArrowRight"); // skip
    await page.keyboard.press("ArrowRight"); // complete
    await page.waitForSelector("text=Session Complete", { timeout: 5000 });
    // Stats should show the counts
    await expect(page.getByText(/1 Known/i)).toBeVisible(); // 1 known
    await expect(page.getByText(/2 Review/i)).toBeVisible(); // 2 review
  });

  test("Study Again button restarts the session", async ({ page }) => {
    await completeAllCards(page);
    await page.getByRole("button", { name: /Study Again/ }).click();
    // Should be back in studying phase with first card
    await expect(page.getByText(MOCK_CARDS[0].front)).toBeVisible({ timeout: 5000 });
  });

  test("Review Cards button appears only when review cards exist", async ({ page }) => {
    // Complete all with arrow (no review marks)
    await completeAllCards(page);
    await expect(page.getByRole("button", { name: /Review Cards/ })).not.toBeVisible();
  });

  test("Review Cards button appears when cards are marked for review", async ({ page }) => {
    // Mark some cards as review
    await page.keyboard.press("2"); // review card 1
    await page.keyboard.press("2"); // review card 2
    await page.keyboard.press("ArrowRight"); // skip 3
    await page.keyboard.press("ArrowRight"); // skip 4
    await page.keyboard.press("ArrowRight"); // complete 5
    await page.waitForSelector("text=Session Complete", { timeout: 5000 });
    await expect(page.getByRole("button", { name: /Review Cards \(2\)/ })).toBeVisible();
  });

  test("Review Cards button studies only review-marked cards", async ({ page }) => {
    await page.keyboard.press("2"); // review card 1
    await page.keyboard.press("ArrowRight"); // skip rest
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("ArrowRight");
    await page.waitForSelector("text=Session Complete", { timeout: 5000 });
    await page.getByRole("button", { name: /Review Cards/ }).click();
    // Should now be studying just card 1
    await expect(page.getByText(MOCK_CARDS[0].front)).toBeVisible();
    await expect(page.getByText(/1\s*\/\s*1/).first()).toBeVisible();
  });

  test("New Topic link navigates to home", async ({ page }) => {
    await completeAllCards(page);
    await page.getByRole("link", { name: /New Topic/ }).click();
    await expect(page).toHaveURL("/");
  });

  test("session is saved to history after completion", async ({ page }) => {
    await completeAllCards(page);
    // Navigate to history to verify session was saved
    await page.goto("/history");
    await expect(page.getByText("Tech Topics")).toBeVisible();
    await expect(page.getByText("React")).toBeVisible();
  });

  test("score reflects proportion of known cards", async ({ page }) => {
    // Mark all 5 as known
    for (let i = 0; i < MOCK_CARDS.length; i++) {
      await page.keyboard.press("1");
      await page.waitForTimeout(100);
    }
    await page.waitForSelector("text=Session Complete", { timeout: 5000 });
    await page.goto("/history");
    // Score should be 100%
    await expect(page.getByText("100%").first()).toBeVisible();
  });
});
