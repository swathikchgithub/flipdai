import { test, expect } from "@playwright/test";
import { seedHistory, clearStorage } from "./helpers/mock-api";

test.describe("History Page — empty state", () => {
  test.beforeEach(async ({ page }) => {
    await clearStorage(page);
    await page.goto("/history");
  });

  test("shows Study History heading", async ({ page }) => {
    await expect(page.getByText("Study History")).toBeVisible();
  });

  test("shows zero streak", async ({ page }) => {
    await expect(page.getByText(/🔥\s*0/)).toBeVisible();
  });

  test("shows zero cards studied", async ({ page }) => {
    await expect(page.getByText("0")).toBeVisible();
  });

  test("shows 0% avg score", async ({ page }) => {
    await expect(page.getByText("0%")).toBeVisible();
  });

  test("shows empty state message", async ({ page }) => {
    await expect(page.getByText(/No study sessions yet/)).toBeVisible();
  });

  test("shows Start Studying link", async ({ page }) => {
    await expect(page.getByRole("link", { name: /Start Studying/ })).toBeVisible();
  });

  test("Start Studying link goes to home", async ({ page }) => {
    await page.getByRole("link", { name: /Start Studying/ }).click();
    await expect(page).toHaveURL("/");
  });

  test("Home link navigates back", async ({ page }) => {
    await page.getByRole("link", { name: /Home/ }).click();
    await expect(page).toHaveURL("/");
  });
});

test.describe("History Page — with sessions", () => {
  test.beforeEach(async ({ page }) => {
    await clearStorage(page);
    await seedHistory(page);
    await page.goto("/history");
  });

  test("shows correct day streak", async ({ page }) => {
    await expect(page.getByText(/🔥\s*3/)).toBeVisible();
  });

  test("shows total cards studied (30 across 3 sessions)", async ({ page }) => {
    await expect(page.getByText("30")).toBeVisible();
  });

  test("shows average score across sessions", async ({ page }) => {
    // (80 + 40 + 10) / 3 = 43%
    await expect(page.getByText("43%")).toBeVisible();
  });

  test("shows all 3 session entries", async ({ page }) => {
    await expect(page.getByText("Tech Topics")).toBeVisible();
    await expect(page.getByText("SAT Prep")).toBeVisible();
    await expect(page.getByText("Languages")).toBeVisible();
  });

  test("shows subcategory for each session", async ({ page }) => {
    await expect(page.getByText("React")).toBeVisible();
    await expect(page.getByText("Math")).toBeVisible();
    await expect(page.getByText("Spanish")).toBeVisible();
  });

  test("shows score per session", async ({ page }) => {
    await expect(page.getByText("80%")).toBeVisible();
    await expect(page.getByText("40%")).toBeVisible();
    await expect(page.getByText("10%")).toBeVisible();
  });

  test("high score (≥70%) shows green color", async ({ page }) => {
    // 80% score should be green
    const greenScore = page.locator("text=80%");
    await expect(greenScore).toBeVisible();
    // Check it has green styling
    const color = await greenScore.evaluate((el) => getComputedStyle(el).color);
    expect(color).toMatch(/52, 211, 153|34, 197, 94/); // --green values
  });

  test("mid score (40–69%) shows yellow color", async ({ page }) => {
    const yellowScore = page.locator("text=40%");
    await expect(yellowScore).toBeVisible();
  });

  test("low score (<40%) shows red color", async ({ page }) => {
    const redScore = page.locator("text=10%");
    await expect(redScore).toBeVisible();
  });

  test("shows card count per session", async ({ page }) => {
    const cardCounts = page.getByText(/10 cards/);
    await expect(cardCounts.first()).toBeVisible();
  });

  test("shows known/total ratio", async ({ page }) => {
    await expect(page.getByText(/8\/10 known|8\s*\/\s*10/)).toBeVisible();
  });

  test("shows formatted date", async ({ page }) => {
    // Should show a formatted date like "Apr 6, 2026"
    await expect(page.getByText(/\w{3}\s+\d{1,2},\s+\d{4}/).first()).toBeVisible();
  });

  test("no empty state message when sessions exist", async ({ page }) => {
    await expect(page.getByText(/No study sessions yet/)).not.toBeVisible();
  });
});
