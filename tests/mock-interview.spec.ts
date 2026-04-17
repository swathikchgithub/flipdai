import { test, expect } from "@playwright/test";

test("Mock Interview Flow - Start and Receive Response", async ({ page }) => {
  // 1. Go to home page
  await page.goto("/");

  // 2. Switch to Mock Interview Mode
  await page.click('button:has-text("Mock Interview")');
  
  // 3. Select a topic (System Design)
  await page.click('button:has-text("System Design")');

  // 4. Click Generate and wait for navigation
  await Promise.all([
    page.waitForURL(/\/interview\//),
    page.click('button:has-text("Generate Interview")'),
  ]);

  // 5. Navigate through Setup
  await expect(page.locator("h1")).toContainText("Interview Setup");
  
  // Wait for voices to load (simulated)
  await page.waitForTimeout(1000);
  
  // Click Begin Interview
  await page.click('button:has-text("Begin Interview")');

  // 6. Verify Progress bar appears
  await expect(page.locator("p")).toContainText(/Reviewing your profile|Recruiter is joining/);

  // 7. Verify AI Response appears in transcript
  // We wait up to 20 seconds for the AI to respond
  const firstAIResponse = page.locator(".bg-transparent.text-\\[\\#8892a4\\]").first();
  await expect(firstAIResponse).toBeVisible({ timeout: 20000 });
  
  const content = await firstAIResponse.innerText();
  console.log("AI First Response:", content);
  expect(content.length).toBeGreaterThan(10);
});
