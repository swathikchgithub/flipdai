import { test, expect } from "@playwright/test";
import { mockGenerate, clearStorage } from "./helpers/mock-api";
import { MOCK_CARDS, MOCK_CARDS_25 } from "./fixtures/cards";

const SESSION_URL = (count = 10) =>
  `/study/test-session?topic=tech-topics&sub=React&count=${count}`;

test.describe("Card Generation", () => {
  test.beforeEach(async ({ page }) => {
    await clearStorage(page);
  });

  test("shows generating phase with spinner and progress bar", async ({ page }) => {
    // Delay the mock response so we can see the generating phase
    await page.route("**/api/generate", async (route) => {
      await new Promise((r) => setTimeout(r, 500));
      const { buildSSEResponse } = await import("./helpers/mock-api");
      await route.fulfill({
        status: 200,
        headers: { "Content-Type": "text/event-stream" },
        body: buildSSEResponse(MOCK_CARDS),
      });
    });

    await page.goto(SESSION_URL());
    await expect(page.getByText(/Generating your flash cards/)).toBeVisible();
    await expect(page.getByText(/Claude is crafting/)).toBeVisible();
  });

  test("shows correct count in generating message", async ({ page }) => {
    await page.route("**/api/generate", async (route) => {
      await new Promise((r) => setTimeout(r, 300));
      const { buildSSEResponse } = await import("./helpers/mock-api");
      route.fulfill({
        status: 200,
        headers: { "Content-Type": "text/event-stream" },
        body: buildSSEResponse(MOCK_CARDS),
      });
    });
    await page.goto(SESSION_URL(5));
    await expect(page.getByText(/5 cards/)).toBeVisible();
  });

  test("transitions to studying phase after generation", async ({ page }) => {
    await mockGenerate(page, MOCK_CARDS);
    await page.goto(SESSION_URL(5));
    await expect(page.getByText("Flash Cards")).toBeVisible({ timeout: 8000 });
    await expect(page.getByText("Quiz Mode")).toBeVisible();
  });

  test("displays first card after generation", async ({ page }) => {
    await mockGenerate(page, MOCK_CARDS);
    await page.goto(SESSION_URL(5));
    await expect(page.getByText(MOCK_CARDS[0].front)).toBeVisible({ timeout: 8000 });
  });

  test("generates 25 cards and shows them all", async ({ page }) => {
    await mockGenerate(page, MOCK_CARDS_25);
    await page.goto(SESSION_URL(25));
    // Progress bar should show 1/25
    await expect(page.getByText(/1\s*\/\s*25/)).toBeVisible({ timeout: 8000 });
  });

  test("shows error message on failed generation", async ({ page }) => {
    await page.route("**/api/generate", (route) =>
      route.fulfill({ status: 500, body: "Internal Server Error" })
    );
    await page.goto(SESSION_URL());
    await expect(page.getByText(/generation failed|error/i)).toBeVisible({ timeout: 8000 });
  });

  test("header shows topic and subcategory", async ({ page }) => {
    await mockGenerate(page, MOCK_CARDS);
    await page.goto(SESSION_URL());
    await expect(page.getByText("Tech Topics")).toBeVisible();
    await expect(page.getByText("React", { exact: true }).first()).toBeVisible();
  });

  test("Home link in header navigates back", async ({ page }) => {
    await mockGenerate(page, MOCK_CARDS);
    await page.goto(SESSION_URL());
    await page.getByRole("link", { name: /Home/ }).click();
    await expect(page).toHaveURL("/");
  });
});
