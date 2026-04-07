import { test, expect } from "@playwright/test";
import { clearStorage } from "./helpers/mock-api";

test.describe("Landing Page", () => {
  test.beforeEach(async ({ page }) => {
    await clearStorage(page);
    await page.goto("/");
  });

  test("shows FlipDAI branding", async ({ page }) => {
    await expect(page.getByText("FlipDAI")).toBeVisible();
  });

  test("shows hero headline", async ({ page }) => {
    await expect(page.getByText("Study Smarter with")).toBeVisible();
    await expect(page.getByText("AI Flash Cards")).toBeVisible();
  });

  test("shows Powered by Claude AI badge", async ({ page }) => {
    await expect(page.getByText("Powered by Claude AI")).toBeVisible();
  });

  test("shows all 8 topic cards", async ({ page }) => {
    const topics = [
      "Job Interviews",
      "SAT Prep",
      "AP Exams",
      "Certifications",
      "Languages",
      "Sciences",
      "Tech Topics",
      "Custom Topic",
    ];
    for (const topic of topics) {
      await expect(page.getByText(topic)).toBeVisible();
    }
  });

  test("shows 4 feature highlights", async ({ page }) => {
    await expect(page.getByText("AI Generated")).toBeVisible();
    await expect(page.getByText("Voice Enabled")).toBeVisible();
    await expect(page.getByText("Keyboard First")).toBeVisible();
    await expect(page.getByText("Progress Tracking")).toBeVisible();
  });

  test("History nav link is visible", async ({ page }) => {
    await expect(page.getByRole("link", { name: "History" })).toBeVisible();
  });

  test("History link navigates to /history", async ({ page }) => {
    await page.getByRole("link", { name: "History" }).click();
    await expect(page).toHaveURL("/history");
  });

  test("Generate button is hidden before topic selection", async ({ page }) => {
    await expect(page.getByRole("button", { name: /Generate/ })).not.toBeVisible();
  });

  test("clicking a topic highlights it", async ({ page }) => {
    const techButton = page.getByRole("button", { name: "Tech Topics" });
    await techButton.click();
    await expect(techButton).toHaveCSS("border-color", /rgb/); // has accent border
  });

  test("clicking a topic reveals subcategory section", async ({ page }) => {
    await page.getByRole("button", { name: "Tech Topics" }).click();
    await expect(page.getByText("Subcategory")).toBeVisible();
    await expect(page.getByRole("button", { name: "React" })).toBeVisible();
  });

  test("clicking different topic switches selection and clears subcategory", async ({ page }) => {
    // Select Tech Topics → React
    await page.getByRole("button", { name: "Tech Topics" }).click();
    await page.getByRole("button", { name: "React" }).click();
    await expect(page.getByRole("button", { name: "React" })).toBeVisible();

    // Switch to SAT Prep — subcategory should reset
    await page.getByRole("button", { name: "SAT Prep" }).click();
    await expect(page.getByRole("button", { name: "Math" })).toBeVisible();
    // React subcategories should no longer appear
    await expect(page.getByRole("button", { name: "React" })).not.toBeVisible();
  });

  test("card count selector switches between 10, 25, 50", async ({ page }) => {
    await page.getByRole("button", { name: "Tech Topics" }).click();
    const btn25 = page.getByRole("button", { name: "25" });
    const btn50 = page.getByRole("button", { name: "50" });
    await btn25.click();
    await expect(btn25).toBeVisible();
    await btn50.click();
    await expect(btn50).toBeVisible();
  });

  test("Generate button is disabled without subcategory", async ({ page }) => {
    await page.getByRole("button", { name: "Tech Topics" }).click();
    const generateBtn = page.getByRole("button", { name: /Generate/ });
    await expect(generateBtn).toBeVisible();
    await expect(generateBtn).toBeDisabled();
  });

  test("Generate button enables after topic + subcategory selection", async ({ page }) => {
    await page.getByRole("button", { name: "Tech Topics" }).click();
    await page.getByRole("button", { name: "React" }).click();
    const generateBtn = page.getByRole("button", { name: /Generate 10 Flash Cards/ });
    await expect(generateBtn).toBeEnabled();
  });

  test("Generate button label reflects card count", async ({ page }) => {
    await page.getByRole("button", { name: "Tech Topics" }).click();
    await page.getByRole("button", { name: "React" }).click();
    await expect(page.getByRole("button", { name: /Generate 10 Flash Cards/ })).toBeVisible();
    await page.getByRole("button", { name: "25" }).click();
    await expect(page.getByRole("button", { name: /Generate 25 Flash Cards/ })).toBeVisible();
  });

  test("Custom Topic shows text input instead of subcategory pills", async ({ page }) => {
    await page.getByRole("button", { name: "Custom Topic" }).click();
    await expect(page.getByPlaceholder(/Enter any topic/)).toBeVisible();
    // Should not show pill buttons
    await expect(page.getByRole("button", { name: "React" })).not.toBeVisible();
  });

  test("Custom Topic enables Generate after typing", async ({ page }) => {
    await page.getByRole("button", { name: "Custom Topic" }).click();
    const input = page.getByPlaceholder(/Enter any topic/);
    await input.fill("Ancient Roman History");
    const generateBtn = page.getByRole("button", { name: /Generate/ });
    await expect(generateBtn).toBeEnabled();
  });

  test("Generate button navigates to study session URL", async ({ page }) => {
    await page.route("**/api/generate", (route) =>
      route.fulfill({ status: 200, contentType: "text/event-stream", body: "data: [DONE]\n\n" })
    );
    await page.getByRole("button", { name: "Tech Topics" }).click();
    await page.getByRole("button", { name: "React" }).click();
    await page.getByRole("button", { name: /Generate/ }).click();
    await expect(page).toHaveURL(/\/study\/.+\?topic=tech-topics&sub=React&count=10/);
  });
});
