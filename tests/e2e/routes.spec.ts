import { expect, type Page, test } from "@playwright/test";
import fs from "node:fs/promises";

const SHARE_CARD_EXPORT_FILENAME = "australian-budget-wrapped-2025-26.png";

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

  async function enterTaxableIncome(page: Page) {
    await page.goto("/");
    await page.waitForFunction(
      () => document.documentElement.dataset.storyHydrated === "true",
    );
    await page.getByRole("button", { name: "Start", exact: true }).click();
    await page.getByLabel("Taxable income").fill("90000");
    await page.getByRole("button", { name: "Next", exact: true }).click();
  }

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
      page.getByRole("link", { name: "Share preview" }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Methodology" }),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: "Sources" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Privacy" })).toBeVisible();

    await page.getByRole("button", { name: "Next", exact: true }).click();
    await expect(
      page.getByRole("heading", {
        name: "Australia's 2025-26 Commonwealth bill.",
      }),
    ).toBeVisible();
    await expect(page.locator(".story-card-coda")).toContainText("$785.7B");
    await expect(page.locator(".story-card-coda")).toContainText(
      "Your illustrative slice: $19,588",
    );
    await expect(
      page.getByRole("link", { name: "Share preview" }),
    ).toBeVisible();
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

  test("renders sourced program callouts on category cards", async ({
    page,
  }) => {
    await enterTaxableIncome(page);

    await expect(
      page.getByRole("heading", { name: "Your tax estimate" }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Next", exact: true }).click();
    await expect(
      page.getByRole("heading", { name: "Bracket by bracket." }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Next", exact: true }).click();
    await expect(
      page.getByRole("heading", { name: "Mapped across the Budget" }),
    ).toBeVisible();

    await page.getByRole("button", { name: "Next", exact: true }).click();
    await expect(
      page.getByRole("heading", { name: "Social security & welfare" }),
    ).toBeVisible();
    await expect(page.getByTestId("program-callouts")).toContainText(
      "Assistance to families with children",
    );

    await page.getByRole("button", { name: "Next", exact: true }).click();
    await expect(page.getByRole("heading", { name: "Health" })).toBeVisible();
    await expect(page.getByTestId("program-callouts")).toContainText(
      "Assistance to the states for public hospitals",
    );

    await page.getByRole("button", { name: "Next", exact: true }).click();
    await expect(
      page.getByRole("heading", { name: "Education" }),
    ).toBeVisible();
    await expect(page.getByTestId("program-callouts")).toContainText("Schools");

    await page
      .getByTestId("program-callouts")
      .getByRole("link", { name: "Source" })
      .first()
      .click();
    await expect(page).toHaveURL(/\/sources/);
    await expect(
      page.getByRole("heading", { name: "Sources" }),
    ).toBeVisible();
  });
});

test.describe("share preview", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  async function goToFinalSummary(page: Page) {
    await page.addInitScript(() => {
      const originalCreateObjectURL = URL.createObjectURL.bind(URL);
      const blobRecords: { size: number; type: string }[] = [];

      Object.defineProperty(window, "__shareDownloadBlobRecords", {
        configurable: true,
        value: blobRecords,
      });

      URL.createObjectURL = (object: Blob | MediaSource) => {
        if (object instanceof Blob) {
          blobRecords.push({ size: object.size, type: object.type });
        }

        return originalCreateObjectURL(object);
      };
    });
    await page.goto("/");
    await page.waitForFunction(
      () => document.documentElement.dataset.storyHydrated === "true",
    );
    await page.getByRole("button", { name: "Start", exact: true }).click();
    await page.getByLabel("Taxable income").fill("90000");
    await page.getByRole("button", { name: "Next", exact: true }).click();

    for (let index = 0; index < 12; index += 1) {
      if (
        await page
          .getByRole("heading", { name: "Your illustrative receipt" })
          .isVisible()
          .catch(() => false)
      ) {
        return;
      }

      await page.getByRole("button", { name: "Next", exact: true }).click();
    }

    await expect(
      page.getByRole("heading", { name: "Your illustrative receipt" }),
    ).toBeVisible();
  }

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

  test("uses the in-memory estimate and downloads a privacy-safe PNG", async ({
    page,
    context,
  }) => {
    await goToFinalSummary(page);
    await page.getByRole("link", { name: "Share preview" }).click();

    const shareCard = page.getByTestId("share-card");

    await expect(
      page.getByRole("heading", { name: "Share preview" }),
    ).toBeVisible();
    await expect(page.getByText(/current estimated tax amount/i)).toBeVisible();
    await expect(shareCard).toContainText("$19,588");
    await expect(page.locator("body")).not.toContainText("90000");
    await expect(page.locator("body")).not.toContainText("90,000");
    await expect(shareCard).not.toHaveAttribute("aria-label", /90000|90,000/);
    expect(page.url()).not.toContain("90000");

    const privacyState = await page.evaluate(() => ({
      cookie: document.cookie,
      local: window.localStorage.length,
      search: window.location.search,
      session: window.sessionStorage.length,
    }));

    expect(privacyState).toEqual({
      cookie: "",
      local: 0,
      search: "",
      session: 0,
    });
    expect(await context.cookies()).toEqual([]);

    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: "Download PNG" }).click();
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toBe(SHARE_CARD_EXPORT_FILENAME);
    expect(download.suggestedFilename()).not.toContain("90000");
    expect(download.suggestedFilename()).not.toContain("90,000");

    const blobRecord = await page.evaluate(() => {
      const records =
        (
          window as unknown as {
            __shareDownloadBlobRecords?: { size: number; type: string }[];
          }
        ).__shareDownloadBlobRecords ?? [];

      return records.at(-1) ?? null;
    });

    expect(blobRecord?.type).toBe("image/png");
    expect(blobRecord?.size).toBeGreaterThan(0);

    const downloadedPath = await download.path();
    expect(downloadedPath).toBeTruthy();

    const downloadedPng = await fs.readFile(downloadedPath as string);

    expect(downloadedPng.length).toBeGreaterThan(0);
    expect(downloadedPng.subarray(0, 8).toString("hex")).toBe(
      "89504e470d0a1a0a",
    );
    expect(downloadedPng.readUInt32BE(16)).toBe(1080);
    expect(downloadedPng.readUInt32BE(20)).toBe(1920);
  });
});
