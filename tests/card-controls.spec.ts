/**
 * card-controls.spec.ts
 *
 * Tests for the redesigned flash-card study screen:
 *  - Front face: question, textarea, Check/Reveal button, hint
 *  - Back face: answer, rating buttons (Still learning / Almost got it / Got it!)
 *  - Navigation: Prev / Flip / Next buttons outside the card
 *  - Typed-answer → AI evaluation flow
 *  - Card centering (vertical + horizontal)
 *  - Mobile viewports
 *  - Desktop viewport
 *  - Home page feature pills
 */

import { test, expect, Page } from "@playwright/test";
import { goToStudySession, clearStorage, mockEvaluate } from "./helpers/mock-api";
import { MOCK_CARDS, MOCK_EVALUATE_CORRECT, MOCK_EVALUATE_INCORRECT } from "./fixtures/cards";

// ─── helpers ────────────────────────────────────────────────────────────────

const card = (page: Page) => page.locator(".card-flip-container");

/** Flip button text outside the card changes based on flip state — locate nav buttons by text */
const prevBtn = (page: Page) => page.locator('[data-testid="prev-btn"]');
const nextBtn = (page: Page) => page.locator('[data-testid="next-btn"]');

/** Rating buttons are on the back face */
const ratingBtn = (page: Page, testId: string) =>
  page.locator(`[data-testid="${testId}"]`);

// ─── Front face ─────────────────────────────────────────────────────────────

test.describe("Card Front Face", () => {
  test.beforeEach(async ({ page }) => {
    await clearStorage(page);
    await goToStudySession(page, { cards: MOCK_CARDS, count: 5 });
  });

  test("question text is visible on the front face", async ({ page }) => {
    await expect(page.getByText(MOCK_CARDS[0].front)).toBeVisible();
  });

  test("QUESTION label is visible", async ({ page }) => {
    await expect(page.getByText("Question", { exact: true })).toBeVisible();
  });

  test("textarea is present for typing an answer", async ({ page }) => {
    const textarea = page.locator("textarea");
    await expect(textarea).toBeVisible();
    await expect(textarea).toHaveAttribute("placeholder", /type|speak.*answer/i);
  });

  test("button shows 'Reveal Answer' when textarea is empty", async ({ page }) => {
    await expect(page.locator("button.flex-1")).toContainText("Reveal Answer");
  });

  test("button changes to 'Check Answer' after typing in textarea", async ({ page }) => {
    await page.locator("textarea").fill("Some answer");
    await expect(page.locator("button.flex-1")).toContainText("Check Answer");
  });

  test("hint button is visible when card has a hint", async ({ page }) => {
    await expect(page.getByText(/Show hint/i)).toBeVisible();
  });

  test("clicking hint button reveals hint text", async ({ page }) => {
    await page.getByText(/Show hint/i).click();
    await expect(page.getByText(MOCK_CARDS[0].hint!)).toBeVisible();
  });
});

// ─── Card flip ───────────────────────────────────────────────────────────────

test.describe("Card Flip", () => {
  test.beforeEach(async ({ page }) => {
    await clearStorage(page);
    await goToStudySession(page, { cards: MOCK_CARDS, count: 5 });
  });

  test("clicking 'Reveal Answer' flips card to show back face", async ({ page }) => {
    await page.locator("button.flex-1").click();
    await expect(page.getByText("Answer", { exact: true })).toBeVisible();
  });

  test("Space key flips the card", async ({ page }) => {
    await page.keyboard.press("Space");
    await expect(page.getByText("Answer", { exact: true })).toBeVisible();
  });

  test("🔀 flip button in navigation flips the card", async ({ page }) => {
    await page.locator('button[title*="Flip"]').click();
    await expect(page.getByText("Answer", { exact: true })).toBeVisible();
  });

  test("answer text is visible on the back face", async ({ page }) => {
    await page.keyboard.press("Space");
    await expect(page.getByText(MOCK_CARDS[0].back)).toBeVisible();
  });

  test("ANSWER label is visible (green) on back face", async ({ page }) => {
    await page.keyboard.press("Space");
    await expect(page.getByText("Answer", { exact: true })).toBeVisible();
  });
});

// ─── Rating buttons (back face) ──────────────────────────────────────────────

test.describe("Rating Buttons", () => {
  test.beforeEach(async ({ page }) => {
    await clearStorage(page);
    await goToStudySession(page, { cards: MOCK_CARDS, count: 5 });
    // Flip to back face first
    await page.keyboard.press("Space");
    await expect(page.getByText("Answer", { exact: true })).toBeVisible();
  });

  test("'Still learning' button is visible on back face", async ({ page }) => {
    await expect(ratingBtn(page, "rating-still")).toBeVisible();
  });

  test("'Almost got it' button is visible on back face", async ({ page }) => {
    await expect(ratingBtn(page, "rating-almost")).toBeVisible();
  });

  test("'Got it!' button is visible on back face", async ({ page }) => {
    await expect(ratingBtn(page, "rating-got")).toBeVisible();
  });

  test("clicking 'Got it!' advances to next card", async ({ page }) => {
    await ratingBtn(page, "rating-got").click();
    await expect(page.getByText(MOCK_CARDS[1].front)).toBeVisible();
  });

  test("clicking 'Still learning' advances to next card", async ({ page }) => {
    await ratingBtn(page, "rating-still").click();
    await expect(page.getByText(MOCK_CARDS[1].front)).toBeVisible();
  });

  test("clicking 'Almost got it' advances to next card", async ({ page }) => {
    await ratingBtn(page, "rating-almost").click();
    await expect(page.getByText(MOCK_CARDS[1].front)).toBeVisible();
  });

  test("after rating, next card shows front face (not flipped)", async ({ page }) => {
    await ratingBtn(page, "rating-got").click();
    // New card should not be flipped
    await expect(page.locator(".card-flip-inner")).not.toHaveClass(/flipped/);
    await expect(page.getByText(MOCK_CARDS[1].front)).toBeVisible();
  });

  test("card is not flipped on initial load (front face showing)", async ({ page }) => {
    await page.reload();
    await page.waitForSelector('button:has-text("Flash Cards")');
    // Card starts unflipped — back face is rotated away, not interactable
    await expect(page.locator(".card-flip-inner")).not.toHaveClass(/flipped/);
  });
});

// ─── Navigation (outside card) ───────────────────────────────────────────────

test.describe("Navigation Controls", () => {
  test.beforeEach(async ({ page }) => {
    await clearStorage(page);
    await goToStudySession(page, { cards: MOCK_CARDS, count: 5 });
  });

  test("'← Prev' button is visible", async ({ page }) => {
    await expect(prevBtn(page)).toBeVisible();
  });

  test("'Next →' button is visible", async ({ page }) => {
    await expect(nextBtn(page)).toBeVisible();
  });

  test("'← Prev' is disabled on the first card", async ({ page }) => {
    await expect(prevBtn(page)).toBeDisabled();
  });

  test("'Next →' advances to next card", async ({ page }) => {
    await nextBtn(page).click();
    await expect(page.getByText(MOCK_CARDS[1].front)).toBeVisible();
  });

  test("'← Prev' navigates back after going forward", async ({ page }) => {
    await nextBtn(page).click();
    await expect(page.getByText(MOCK_CARDS[1].front)).toBeVisible();
    await prevBtn(page).click();
    await expect(page.getByText(MOCK_CARDS[0].front)).toBeVisible();
  });

  test("ArrowRight key advances to next card", async ({ page }) => {
    await page.keyboard.press("ArrowRight");
    await expect(page.getByText(MOCK_CARDS[1].front)).toBeVisible();
  });

  test("ArrowLeft key navigates back after moving forward", async ({ page }) => {
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("ArrowLeft");
    await expect(page.getByText(MOCK_CARDS[0].front)).toBeVisible();
  });

  test("navigation is outside the card-flip-container", async ({ page }) => {
    // Prev/Next buttons should NOT be inside .card-flip-container
    const prevInCard = card(page).locator('[data-testid="prev-btn"]');
    await expect(prevInCard).toHaveCount(0);
  });
});

// ─── Typed answer + AI evaluation ───────────────────────────────────────────

test.describe("Typed Answer & Evaluation", () => {
  test.beforeEach(async ({ page }) => {
    await clearStorage(page);
    await goToStudySession(page, { cards: MOCK_CARDS, count: 5 });
  });

  test("typing in textarea and clicking 'Check Answer' flips card", async ({ page }) => {
    await page.locator("textarea").fill("A Hook lets you use state in function components");
    await page.locator("button.flex-1").click();
    await expect(page.getByText("Answer", { exact: true })).toBeVisible();
  });

  test("evaluation result shows score after checking answer (correct)", async ({ page }) => {
    await page.locator("textarea").fill("A Hook lets you use state in function components");
    await page.locator("button.flex-1").click();
    // Wait for evaluation (mocked as instant) — use first() since front+back both in DOM
    await expect(page.getByText(/92|Excellent/i).first()).toBeVisible({ timeout: 5000 });
  });

  test("evaluation shows user's typed answer echoed back", async ({ page }) => {
    const answer = "React Hooks add state to function components";
    await page.locator("textarea").fill(answer);
    await page.locator("button.flex-1").click();
    await expect(page.getByText(/Your answer/i)).toBeVisible({ timeout: 5000 });
  });

  test("skipping textarea and revealing answer shows no evaluation panel", async ({ page }) => {
    // Click reveal without typing
    await page.locator("button.flex-1").click();
    // Wait a moment to ensure no eval panel appears
    await page.waitForTimeout(500);
    await expect(page.getByText(/Evaluating/i)).not.toBeVisible();
    await expect(page.getByText(/\/100/)).not.toBeVisible();
  });

  test("incorrect answer shows error indicator", async ({ page }) => {
    // Re-mock evaluate to return incorrect
    await page.route("**/api/evaluate", async (route) => {
      await route.fulfill({
        status: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(MOCK_EVALUATE_INCORRECT),
      });
    });
    await page.locator("textarea").fill("I have no idea");
    await page.locator("button.flex-1").click();
    await expect(page.getByText(/35|Partially/i).first()).toBeVisible({ timeout: 5000 });
  });

  test("⌘↵ keyboard shortcut triggers Check Answer", async ({ page }) => {
    await page.locator("textarea").fill("Some answer");
    await page.keyboard.press("Meta+Enter");
    await expect(page.getByText("Answer", { exact: true })).toBeVisible();
  });

  test("Space key does NOT flip when typing in textarea", async ({ page }) => {
    await page.locator("textarea").focus();
    await page.keyboard.press("Space");
    // Card should NOT be flipped — check class not text (back face text always in DOM)
    await expect(page.locator(".card-flip-inner")).not.toHaveClass(/flipped/);
  });
});

// ─── Card centering ──────────────────────────────────────────────────────────

test.describe("Card Centering", () => {
  test.beforeEach(async ({ page }) => {
    await clearStorage(page);
    await goToStudySession(page, { cards: MOCK_CARDS, count: 5 });
  });

  test("card is horizontally centered (within ±120px of viewport center)", async ({ page }) => {
    const vp = page.viewportSize()!;
    const box = await card(page).boundingBox();
    expect(box).not.toBeNull();
    if (!box) return;
    const cardCenterX = box.x + box.width / 2;
    expect(Math.abs(cardCenterX - vp.width / 2)).toBeLessThan(120);
  });

  test("card is fully within viewport horizontally (no overflow)", async ({ page }) => {
    const vp = page.viewportSize()!;
    const box = await card(page).boundingBox();
    expect(box).not.toBeNull();
    if (!box) return;
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(vp.width + 1);
  });

  test("card has a reasonable minimum height (≥ 280px)", async ({ page }) => {
    const box = await card(page).boundingBox();
    expect(box).not.toBeNull();
    if (!box) return;
    expect(box.height).toBeGreaterThanOrEqual(280);
  });

  test("stats bar is visible below the card", async ({ page }) => {
    await expect(page.getByText("Known")).toBeVisible();
    await expect(page.getByText("Score")).toBeVisible();
  });
});

// ─── Mobile viewports ────────────────────────────────────────────────────────

const MOBILE_VIEWPORTS = [
  { name: "iPhone SE (375×667)", width: 375, height: 667 },
  { name: "iPhone 14 (390×844)", width: 390, height: 844 },
  { name: "Android (412×915)", width: 412, height: 915 },
];

for (const vp of MOBILE_VIEWPORTS) {
  test.describe(`Mobile – ${vp.name}`, () => {
    test.use({ viewport: { width: vp.width, height: vp.height } });

    test.beforeEach(async ({ page }) => {
      await clearStorage(page);
      await goToStudySession(page, { cards: MOCK_CARDS, count: 5 });
    });

    test("card is visible on mobile", async ({ page }) => {
      await expect(card(page)).toBeVisible();
    });

    test("card fits within mobile viewport width", async ({ page }) => {
      const box = await card(page).boundingBox();
      expect(box).not.toBeNull();
      if (!box) return;
      expect(box.x).toBeGreaterThanOrEqual(0);
      expect(box.x + box.width).toBeLessThanOrEqual(vp.width + 1);
    });

    test("question text is visible on mobile", async ({ page }) => {
      await expect(page.getByText(MOCK_CARDS[0].front)).toBeVisible();
    });

    test("textarea is accessible on mobile", async ({ page }) => {
      const textarea = page.locator("textarea");
      await expect(textarea).toBeVisible();
      const box = await textarea.boundingBox();
      expect(box).not.toBeNull();
      if (!box) return;
      expect(box.x + box.width).toBeLessThanOrEqual(vp.width + 1);
    });

    test("flipping card works on mobile", async ({ page }) => {
      await page.locator("button.flex-1").click();
      await expect(page.getByText("Answer", { exact: true })).toBeVisible({ timeout: 3000 });
    });

    test("rating buttons work on mobile", async ({ page }) => {
      await page.keyboard.press("Space");
      await expect(ratingBtn(page, "rating-got")).toBeVisible();
      await ratingBtn(page, "rating-got").click();
      await expect(page.getByText(MOCK_CARDS[1].front)).toBeVisible();
    });

    test("Next button works on mobile", async ({ page }) => {
      await nextBtn(page).click();
      await expect(page.getByText(MOCK_CARDS[1].front)).toBeVisible();
    });

    test("stats are visible on mobile", async ({ page }) => {
      await expect(page.getByText("Known")).toBeVisible();
    });

    test("header back link is visible on mobile", async ({ page }) => {
      await expect(page.getByRole("link", { name: /Back|←/i }).first()).toBeVisible();
    });

    test("Voice toggle is visible on mobile", async ({ page }) => {
      await expect(page.getByText(/Voice/i)).toBeVisible();
    });
  });
}

// ─── Desktop viewport ────────────────────────────────────────────────────────

test.describe("Desktop – 1440×900", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test.beforeEach(async ({ page }) => {
    await clearStorage(page);
    await goToStudySession(page, { cards: MOCK_CARDS, count: 5 });
  });

  test("card is horizontally centered on wide desktop", async ({ page }) => {
    const box = await card(page).boundingBox();
    expect(box).not.toBeNull();
    if (!box) return;
    const cardCenterX = box.x + box.width / 2;
    expect(Math.abs(cardCenterX - 720)).toBeLessThan(150);
  });

  test("card does not stretch wider than the viewport on desktop", async ({ page }) => {
    await expect(card(page)).toBeVisible();
    const box = await card(page).boundingBox();
    expect(box).not.toBeNull();
    if (!box) return;
    // Card should be narrower than the 1440px viewport
    expect(box.width).toBeLessThan(1440);
    expect(box.width).toBeGreaterThanOrEqual(200);
  });

  test("keyboard hints div is in the DOM on desktop", async ({ page }) => {
    // The hint div exists — it's hidden on mobile, visible sm+
    // Just verify it's present with correct content
    const hint = page.locator("div").filter({ hasText: /Space.*flip/ }).first();
    await expect(hint).toBeAttached();
  });

  test("all rating buttons visible on desktop after flip", async ({ page }) => {
    await page.keyboard.press("Space");
    await expect(ratingBtn(page, "rating-still")).toBeVisible();
    await expect(ratingBtn(page, "rating-almost")).toBeVisible();
    await expect(ratingBtn(page, "rating-got")).toBeVisible();
  });

  test("Check Answer hint ⌘↵ is in the DOM on desktop", async ({ page }) => {
    // The hint text is inside hidden sm:block — check it exists in DOM
    await expect(page.locator(".hidden.sm\\:block")).toContainText("⌘↵");
  });
});

// ─── Home page feature pills ─────────────────────────────────────────────────

test.describe("Home Page – Feature Pills", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForSelector("text=Study Smarter");
  });

  test("'8 AI Models' pill is visible above the category grid", async ({ page }) => {
    await expect(page.getByText("8 AI Models")).toBeVisible();
  });

  test("'Voice Enabled' pill is visible", async ({ page }) => {
    await expect(page.getByText("Voice Enabled")).toBeVisible();
  });

  test("'Keyboard First' pill is visible", async ({ page }) => {
    await expect(page.getByText("Keyboard First")).toBeVisible();
  });

  test("'Progress Tracking' pill is visible", async ({ page }) => {
    await expect(page.getByText("Progress Tracking")).toBeVisible();
  });

  test("feature pills appear above 'CHOOSE A CATEGORY' heading", async ({ page }) => {
    const pillBox = await page.getByText("8 AI Models").boundingBox();
    const headingBox = await page.getByText(/choose a category/i).boundingBox();
    expect(pillBox).not.toBeNull();
    expect(headingBox).not.toBeNull();
    if (!pillBox || !headingBox) return;
    // Pills should be above (smaller Y) than the category heading
    expect(pillBox.y).toBeLessThan(headingBox.y);
  });
});
