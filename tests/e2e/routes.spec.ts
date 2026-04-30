import { expect, test } from "@playwright/test";

const routes = [
  { path: "/", heading: "Your Australian Budget Wrapped" },
  { path: "/methodology", heading: "Methodology" },
  { path: "/sources", heading: "Sources" },
  { path: "/privacy", heading: "Privacy" },
];

test.describe("routes", () => {
  for (const route of routes) {
    test(`${route.path} renders`, async ({ page }) => {
      await page.goto(route.path);

      await expect(
        page.getByRole("heading", { name: route.heading }),
      ).toBeVisible();
    });
  }
});

test.describe("mobile story flow", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("accepts taxable income and advances through story cards", async ({
    page,
  }) => {
    await page.goto("/");

    await expect(
      page.getByRole("heading", { name: "Your Australian Budget Wrapped" }),
    ).toBeVisible();
    await page.waitForFunction(
      () => document.documentElement.dataset.storyHydrated === "true",
    );

    await expect(
      page.getByRole("button", { name: "Start", exact: true }),
    ).toBeEnabled();
    await page.getByRole("button", { name: "Start", exact: true }).click();
    await expect(
      page.getByRole("heading", { name: "What should we wrap?" }),
    ).toBeVisible();

    await page.getByLabel("Taxable income").fill("90000");
    await page.getByRole("button", { name: "Next", exact: true }).click();
    await expect(
      page.getByRole("heading", { name: "Your tax estimate" }),
    ).toBeVisible();
    await expect(page.getByText("$19,588")).toBeVisible();

    await page.getByRole("button", { name: "Back" }).click();
    await expect(
      page.getByRole("heading", { name: "What should we wrap?" }),
    ).toBeVisible();
    await expect(page.getByLabel("Taxable income")).toHaveValue("90000");

    await page.getByRole("button", { name: "Next", exact: true }).click();
    await page.getByRole("button", { name: "Next", exact: true }).click();
    await expect(
      page.getByRole("heading", { name: "Mapped across the Budget" }),
    ).toBeVisible();
    await expect(
      page.getByRole("img", { name: /Big-picture allocation chart/ }),
    ).toBeVisible();
    await expect(
      page
        .locator(".allocation-chart-key")
        .getByText(/Social security\s+and welfare/),
    ).toBeVisible();
    await expect(page.getByText(/Taxes are not hypothecated/)).toBeVisible();

    await page.getByRole("button", { name: "Next", exact: true }).click();
    await expect(
      page.getByRole("heading", { name: "Social security & welfare" }),
    ).toBeVisible();
    await expect(
      page.getByRole("img", {
        name: /Social security & welfare share chart/,
      }),
    ).toBeVisible();
    await expect(page.getByText(/Additive function/)).toBeVisible();

    await page.getByRole("button", { name: "Next", exact: true }).click();
    await expect(page.getByRole("heading", { name: "Health" })).toBeVisible();
    await expect(
      page.getByRole("img", { name: /Health share chart/ }),
    ).toBeVisible();

    await page.getByRole("button", { name: "Next", exact: true }).click();
    await expect(
      page.getByRole("heading", { name: "Education" }),
    ).toBeVisible();

    await page.getByRole("button", { name: "Next", exact: true }).click();
    await expect(page.getByRole("heading", { name: "Defence" })).toBeVisible();

    await page.getByRole("button", { name: "Next", exact: true }).click();
    await expect(
      page.getByRole("heading", { name: "Energy & resources" }),
    ).toBeVisible();

    await page.getByRole("button", { name: "Next", exact: true }).click();
    await expect(
      page.getByRole("heading", { name: "States and territories" }),
    ).toBeVisible();
    await expect(
      page.getByRole("img", {
        name: /States and territories non-additive spotlight chart/,
      }),
    ).toBeVisible();
    await expect(
      page.getByText("Non-additive spotlight", { exact: true }),
    ).toBeVisible();

    await page.getByRole("button", { name: "Next", exact: true }).click();
    await expect(
      page.getByRole("heading", { name: "Debt interest" }),
    ).toBeVisible();
    await expect(
      page.getByText(/not included in the final summary/),
    ).toBeVisible();

    await page.getByRole("button", { name: "Next", exact: true }).click();
    await expect(
      page.getByRole("heading", { name: "Your illustrative receipt" }),
    ).toBeVisible();
    await expect(
      page.getByRole("img", { name: /Final summary bar chart/ }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Methodology" }),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: "Sources" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Privacy" })).toBeVisible();

    await page.getByRole("button", { name: "Restart" }).click();
    await expect(
      page.getByRole("heading", { name: "Your Australian Budget Wrapped" }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Start", exact: true }),
    ).toBeEnabled();
    await page.getByRole("button", { name: "Start", exact: true }).click();
    await expect(page.getByLabel("Taxable income")).toHaveValue("");

    const storageLengths = await page.evaluate(() => ({
      local: window.localStorage.length,
      session: window.sessionStorage.length,
    }));

    expect(storageLengths).toEqual({ local: 0, session: 0 });
  });
});
