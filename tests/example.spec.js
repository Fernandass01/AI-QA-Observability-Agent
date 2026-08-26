const { test, expect } = require("@playwright/test");

test("Example homepage loads successfully", async ({ page }) => {
    await page.goto("https://example.com/");

    await expect(page).toHaveTitle("Example Domain");
});
test("Intentional failing test for observability", async ({ page }) => {
    await page.goto("https://example.com/");

    await expect(page).toHaveTitle("Wrong Title");
});
test("Intentional URL failure for observability", async ({ page }) => {
    await page.goto("https://example.com/");

    await expect(page).toHaveURL("https://wrong-example.com/");
});