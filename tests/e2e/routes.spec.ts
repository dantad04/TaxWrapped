import { expect, test } from "@playwright/test";

const routes = [
  { path: "/", heading: "Your Australian Budget Wrapped" },
  { path: "/methodology", heading: "Methodology" },
  { path: "/sources", heading: "Sources" },
  { path: "/privacy", heading: "Privacy" },
  { path: "/share-preview", heading: "Sample share preview" },
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
    const taxEstimateTotal = page.locator(".story-card-tax .story-number");
    await expect(taxEstimateTotal).toContainText("$19,588");
    const displayedTaxTotal = (await taxEstimateTotal.textContent())?.trim();
    if (!displayedTaxTotal) {
      throw new Error("Tax estimate total did not render.");
    }
    expect(displayedTaxTotal).toBe("$19,588");

    await page.getByRole("button", { name: "Back" }).click();
    await expect(
      page.getByRole("heading", { name: "What should we wrap?" }),
    ).toBeVisible();
    await expect(page.getByLabel("Taxable income")).toHaveValue("90000");

    await page.getByRole("button", { name: "Next", exact: true }).click();
    await page.getByRole("button", { name: "Next", exact: true }).click();
    await expect(
      page.getByRole("heading", { name: "Bracket by bracket." }),
    ).toBeVisible();
    const bracketWalkCard = page.locator(".story-card-bracket-walk");
    await expect(bracketWalkCard).toContainText("How your tax was built");
    await expect(bracketWalkCard).toContainText("Total estimate");
    await expect(bracketWalkCard).toContainText(displayedTaxTotal);
    await expect(bracketWalkCard).not.toContainText(
      /exactly where your tax dollars went|fair|unfair/i,
    );

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
    await page.getByRole("button", { name: "Open breakdown" }).click();
    await expect(page.getByText("to Defence.")).toBeVisible();
    await expect(page.getByText("Workforce", { exact: true })).toBeVisible();
    await expect(
      page.getByText("Defence breakdown: Defence Portfolio Budget Statements 2025-26"),
    ).toBeVisible();
    await page
      .getByRole("button", {
        name: "Open Capability Acquisition Program breakdown",
      })
      .click();
    await expect(
      page.getByText("Military Equipment Acquisition Program"),
    ).toBeVisible();
    await page.getByRole("button", { name: "Done", exact: true }).click();
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
      page.getByRole("group", { name: /Final summary bar chart/ }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Sample share preview" }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Methodology" }),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: "Sources" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Privacy" })).toBeVisible();
    expect(page.url()).not.toContain("90000");
    expect(new URL(page.url()).search).toBe("");
    await expect
      .poll(() => page.evaluate(() => document.cookie))
      .toBe("");

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

test.describe("share preview", () => {
  test("renders a privacy-safe additive share card", async ({ page }) => {
    await page.goto("/share-preview");

    const shareCard = page.getByTestId("share-card");

    await expect(
      page.getByRole("heading", { name: "Sample share preview" }),
    ).toBeVisible();
    await expect(
      page.getByText(/fixed sample estimate/i),
    ).toBeVisible();
    await expect(shareCard).toContainText("Australian Budget Wrapped");
    await expect(shareCard).toContainText("$19,588");
    await expect(shareCard).toContainText("2025-26 Budget");
    await expect(shareCard).toContainText("Social security & welfare");
    await expect(shareCard).toContainText(
      "Illustrative estimate. Taxes are not hypothecated.",
    );
    await expect(shareCard).not.toContainText("90,000");
    await expect(shareCard).not.toContainText("$90,000");
    await expect(shareCard).not.toHaveAttribute("aria-label", /90,000/);
    expect(page.url()).not.toContain("90000");
    expect(new URL(page.url()).search).toBe("");
    await expect(shareCard).not.toContainText(
      "Revenue assistance to the States and Territories",
    );
  });
});
