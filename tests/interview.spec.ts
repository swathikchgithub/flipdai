import { test, expect } from "@playwright/test";
import { clearStorage } from "./helpers/mock-api";

test.describe("Mock Interview", () => {
  test.beforeEach(async ({ page }) => {
    await clearStorage(page);
    await page.goto("/");
  });

  test("can switch to Mock Interview mode", async ({ page }) => {
    const interviewBtn = page.getByRole("button", { name: "Mock Interview" });
    await interviewBtn.click();
    await expect(interviewBtn).toHaveCSS("background-color", "rgb(91, 156, 246)");
    
    // Select a topic
    await page.getByRole("button", { name: "Tech Topics" }).click();
    await page.getByRole("button", { name: "React" }).click();
    
    // Check button label
    await expect(page.getByRole("button", { name: "Start Mock Interview →" })).toBeVisible();
    // Check that card count is hidden
    await expect(page.getByText("Number of Cards")).not.toBeVisible();
  });

  test("navigates to interview session", async ({ page }) => {
    await page.getByRole("button", { name: "Mock Interview" }).click();
    await page.getByRole("button", { name: "Tech Topics" }).click();
    await page.getByRole("button", { name: "React" }).click();
    
    await page.getByRole("button", { name: "Start Mock Interview →" }).click();
    
    // Should be on interview page
    await expect(page).toHaveURL(/\/interview\/.+\?topic=tech-topics&sub=React/);
    await expect(page.getByText("Mock Interview")).toBeVisible();
  });
});
