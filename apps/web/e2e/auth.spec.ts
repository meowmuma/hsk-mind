import { expect, test } from "@playwright/test";

test("landing page exposes only the current HSK 1–4 journey", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /จำได้จริง/ })).toBeVisible();
  await expect(page.getByText("2,000 รายการ")).toBeVisible();
  await expect(
    page.locator(".scope-grid").getByText("HSK1", { exact: true }),
  ).toBeVisible();
  await expect(
    page.locator(".scope-grid").getByText("HSK4", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "เริ่มการฝึก" }).first(),
  ).toHaveAttribute("href", "/register");
  await expect(
    page.getByRole("link", { name: "เข้าสู่ระบบ" }).first(),
  ).toHaveAttribute("href", "/login");
});

test("register transitions to onboarding and completion transitions to protected map", async ({
  page,
}) => {
  let onboardingCompleted = false;
  await page.route("**/api/auth/register", async (route) =>
    route.fulfill({
      status: 201,
      contentType: "application/json",
      body: JSON.stringify({ next: "onboarding" }),
    }),
  );
  await page.route("**/api/onboarding/complete", async (route) => {
    onboardingCompleted = true;
    await route.fulfill({
      status: 201,
      contentType: "application/json",
      body: JSON.stringify({ unlockedHsk: ["HSK1"] }),
    });
  });
  await page.route("**/api/auth/me", async (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ user: { profile: { onboardingCompleted } } }),
    }),
  );
  await page.goto("/register");
  await page.getByLabel("อีเมล").fill("learner@example.com");
  await page.getByLabel("รหัสผ่าน", { exact: true }).fill("password123");
  await page.getByLabel("ยืนยันรหัสผ่าน", { exact: true }).fill("password123");
  await page.getByRole("button", { name: "สมัครสมาชิก" }).click();
  await expect(page).toHaveURL(/\/onboarding$/);
  await page.getByLabel("ชื่อผู้เล่น").fill("Learner");
  await page.getByRole("button", { name: "เริ่มการฝึก" }).click();
  await expect(page).toHaveURL(/\/map$/);
  await expect(
    page.getByRole("heading", { name: "เส้นทางการฝึกของคุณ" }),
  ).toBeVisible();
});

test("unauthenticated users cannot remain on the protected map", async ({
  page,
}) => {
  await page.route("**/api/auth/me", async (route) =>
    route.fulfill({
      status: 401,
      contentType: "application/json",
      body: JSON.stringify({ error: { message: "Authentication required" } }),
    }),
  );
  await page.goto("/map");
  await expect(page).toHaveURL(/\/login$/);
});
