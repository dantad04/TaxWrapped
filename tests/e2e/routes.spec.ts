import { expect, test } from "@playwright/test";

const routes = [
  { path: "/", heading: "Your Australian Budget Wrapped" },
  { path: "/methodology", heading: "Methodology" },
  { path: "/sources", heading: "Sources" },
  { path: "/privacy", heading: "Privacy" },
];

test.describe("placeholder routes", () => {
  for (const route of routes) {
    test(`${route.path} renders`, async ({ page }) => {
      await page.goto(route.path);

      await expect(
        page.getByRole("heading", { name: route.heading }),
      ).toBeVisible();
    });
  }
});
