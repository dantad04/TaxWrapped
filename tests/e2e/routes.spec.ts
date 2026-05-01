import { expect, type Page, test } from "@playwright/test";
import fs from "node:fs/promises";

const SHARE_CARD_EXPORT_FILENAME = "australian-budget-wrapped-2025-26.png";
const HERO_FIT_SELECTOR = "[data-hero-fit]";
const HERO_FIT_INCOMES = [0, 5, 18200, 90000, 250000, 1000000] as const;
const HERO_FIT_VIEWPORT_WIDTHS = [360, 390, 430] as const;
const FLOW_VIEWPORT_FIT_INCOMES = [5, 90000, 1000000] as const;
const INTRO_VIEWPORTS = [
  { width: 360, height: 780 },
  { width: 390, height: 844 },
  { width: 430, height: 932 },
] as const;
const DESKTOP_CONTAINMENT_VIEWPORTS = [
  { width: 1280, height: 800 },
  { width: 1366, height: 768 },
  { width: 1440, height: 900 },
] as const;

const routes = [
  { path: "/", heading: "Your Australian Budget Wrapped" },
  { path: "/methodology", heading: "Methodology" },
  { path: "/sources", heading: "Sources" },
  { path: "/privacy", heading: "Privacy" },
  { path: "/share-preview", heading: "Sample share preview" },
];

async function clickStoryButton(page: Page, name: string) {
  const button = page.getByRole("button", { name, exact: true });

  await expect(button).toBeEnabled();
  await button.click({ force: true });
}

async function waitForStoryHydration(page: Page) {
  await page.waitForFunction(
    () => document.documentElement.dataset.storyHydrated === "true",
  );
}

async function waitForAnimationFrame(page: Page) {
  await page.waitForFunction(
    () =>
      new Promise<void>((resolve) => {
        requestAnimationFrame(() => resolve());
      }),
  );
}

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
  test.setTimeout(60_000);
  test.use({ viewport: { width: 390, height: 844 } });

  async function enterTaxableIncome(page: Page) {
    await page.goto("/");
    await waitForStoryHydration(page);
    await clickStoryButton(page, "Start");
    await page.getByLabel("Taxable income").fill("90000");
    await clickStoryButton(page, "Next");
  }

  test("accepts taxable income and advances through story cards", async ({
    page,
  }) => {
    await page.goto("/");

    await expect(
      page.getByRole("heading", { name: "Your Australian Budget Wrapped" }),
    ).toBeVisible();
    await waitForStoryHydration(page);

    await expect(
      page.getByRole("button", { name: "Start", exact: true }),
    ).toBeEnabled();
    await clickStoryButton(page, "Start");
    await expect(
      page.getByRole("heading", { name: "What should we wrap?" }),
    ).toBeVisible();

    await page.getByLabel("Taxable income").fill("90000");
    await clickStoryButton(page, "Next");
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

    await clickStoryButton(page, "Next");
    await clickStoryButton(page, "Next");
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

    await clickStoryButton(page, "Next");
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
    await expect(
      page.locator(".story-content .story-caveat").getByText(
        /Taxes are not hypothecated/,
      ),
    ).toBeVisible();

    await clickStoryButton(page, "Next");
    await expect(
      page.getByRole("heading", { name: "Social security & welfare" }),
    ).toBeVisible();
    await expect(
      page.getByRole("img", {
        name: /Social security & welfare share chart/,
      }),
    ).toBeVisible();
    await expect(page.getByText(/Additive function/)).toBeVisible();

    await clickStoryButton(page, "Next");
    await expect(page.getByRole("heading", { name: "Health" })).toBeVisible();
    await expect(
      page.getByRole("img", { name: /Health share chart/ }),
    ).toBeVisible();

    await clickStoryButton(page, "Next");
    await expect(
      page.getByRole("heading", { name: "Education" }),
    ).toBeVisible();

    await clickStoryButton(page, "Next");
    await expect(page.getByRole("heading", { name: "Defence" })).toBeVisible();
    await clickStoryButton(page, "Open breakdown");
    await expect(page.getByText("to Defence.")).toBeVisible();
    await expect(page.getByText("Workforce", { exact: true })).toBeVisible();
    await expect(
      page.getByText("Defence breakdown: Defence Portfolio Budget Statements 2025-26"),
    ).toBeVisible();
    await page
      .getByRole("button", {
        name: "Open Capability Acquisition Program breakdown",
      })
      .click({ force: true });
    await expect(
      page.getByText("Military Equipment Acquisition Program"),
    ).toBeVisible();
    await clickStoryButton(page, "Done");
    await expect(page.getByRole("heading", { name: "Defence" })).toBeVisible();

    await clickStoryButton(page, "Next");
    await expect(
      page.getByRole("heading", { name: "Energy & resources" }),
    ).toBeVisible();

    await clickStoryButton(page, "Next");
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

    await clickStoryButton(page, "Next");
    await expect(
      page.getByRole("heading", { name: "Debt interest" }),
    ).toBeVisible();
    await expect(
      page.getByText(/not included in the final summary/),
    ).toBeVisible();

    await clickStoryButton(page, "Next");
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

    await clickStoryButton(page, "Next");
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

    await clickStoryButton(page, "Restart");
    await expect(
      page.getByRole("heading", { name: "Your Australian Budget Wrapped" }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Start", exact: true }),
    ).toBeEnabled();
    await clickStoryButton(page, "Start");
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
    await clickStoryButton(page, "Next");
    await expect(
      page.getByRole("heading", { name: "Bracket by bracket." }),
    ).toBeVisible();
    await clickStoryButton(page, "Next");
    await expect(
      page.getByRole("heading", { name: "Mapped across the Budget" }),
    ).toBeVisible();

    await clickStoryButton(page, "Next");
    await expect(
      page.getByRole("heading", { name: "Social security & welfare" }),
    ).toBeVisible();
    await expect(page.getByTestId("program-callouts")).toContainText(
      "Assistance to families with children",
    );

    await clickStoryButton(page, "Next");
    await expect(page.getByRole("heading", { name: "Health" })).toBeVisible();
    await expect(page.getByTestId("program-callouts")).toContainText(
      "Assistance to the states for public hospitals",
    );

    await clickStoryButton(page, "Next");
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

  test("shows author credit links only on the coda card", async ({ page }) => {
    await enterTaxableIncome(page);
    await expect(page.getByTestId("coda-credit")).toHaveCount(0);

    const stepsBeforeCoda = [
      "Bracket by bracket.",
      "Mapped across the Budget",
      "Social security & welfare",
      "Health",
      "Education",
      "Defence",
      "Energy & resources",
      "States and territories",
      "Debt interest",
      "Your illustrative receipt",
    ];

    for (const heading of stepsBeforeCoda) {
      await clickStoryButton(page, "Next");
      await expect(page.getByRole("heading", { name: heading })).toBeVisible();
      await expect(page.getByTestId("coda-credit")).toHaveCount(0);
    }

    await clickStoryButton(page, "Next");
    await expect(
      page.getByRole("heading", {
        name: "Australia's 2025-26 Commonwealth bill.",
      }),
    ).toBeVisible();

    const codaCredit = page.locator(".story-card-coda").getByTestId("coda-credit");

    await expect(codaCredit).toContainText(
      "Made by Dan Tadmore · ASX Director Trades · LinkedIn · Email",
    );
    await expect(
      page.locator(".story-card:not(.story-card-coda)").getByTestId("coda-credit"),
    ).toHaveCount(0);

    const asxLink = codaCredit.getByRole("link", {
      name: "ASX Director Trades",
    });
    const linkedInLink = codaCredit.getByRole("link", { name: "LinkedIn" });
    const emailLink = codaCredit.getByRole("link", { name: "Email" });

    await expect(asxLink).toHaveAttribute(
      "href",
      "https://asxdirectortrades.com.au/",
    );
    await expect(asxLink).toHaveAttribute("target", "_blank");
    expect((await asxLink.getAttribute("rel"))?.split(/\s+/)).toEqual(
      expect.arrayContaining(["noopener"]),
    );

    await expect(linkedInLink).toHaveAttribute(
      "href",
      "https://www.linkedin.com/in/dan-tadmore-158077210",
    );
    await expect(linkedInLink).toHaveAttribute("target", "_blank");
    expect((await linkedInLink.getAttribute("rel"))?.split(/\s+/)).toEqual(
      expect.arrayContaining(["noopener"]),
    );

    await expect(emailLink).toHaveAttribute(
      "href",
      "mailto:dan.tadmore@gmail.com",
    );
    await expect(emailLink).not.toHaveAttribute("target", "_blank");
  });
});

test.describe("mobile intro viewport fit", () => {
  for (const viewport of INTRO_VIEWPORTS) {
    test.describe(`${viewport.width}x${viewport.height}`, () => {
      test.use({ viewport });

      test("keeps the start button fully inside the first viewport", async ({
        page,
      }) => {
        await page.goto("/");
        await waitForStoryHydration(page);

        const startButton = page.getByRole("button", {
          name: "Start",
          exact: true,
        });

        await expect(startButton).toBeVisible();

        const rect = await startButton.evaluate((element) => {
          const bounds = element.getBoundingClientRect();

          return {
            bottom: bounds.bottom,
            top: bounds.top,
          };
        });

        expect(rect.top, "START top edge").toBeGreaterThanOrEqual(0);
        expect(rect.bottom, "START bottom edge").toBeLessThanOrEqual(
          viewport.height,
        );

        const pageScrolls = await page.evaluate(
          () =>
            document.documentElement.scrollHeight > window.innerHeight + 1 ||
            document.body.scrollHeight > window.innerHeight + 1,
        );

        expect(pageScrolls, "intro page scroll").toBe(false);
      });
    });
  }
});

async function expectMobileStepToFitViewport(
  page: Page,
  viewport: (typeof INTRO_VIEWPORTS)[number],
  context: string,
) {
  await waitForHeroFitCycle(page);
  await waitForAnimationFrame(page);

  const metrics = await page.evaluate(() => {
    const card = document.querySelector(".story-card") as HTMLElement | null;
    const step = card?.dataset.step ?? "unknown";
    const isVisible = (element: Element | null): element is HTMLElement => {
      if (!(element instanceof HTMLElement)) {
        return false;
      }

      const style = window.getComputedStyle(element);
      const rect = element.getBoundingClientRect();

      return (
        style.display !== "none" &&
        style.visibility !== "hidden" &&
        rect.width > 0 &&
        rect.height > 0
      );
    };
    const detailButton =
      step === "category"
        ? Array.from(document.querySelectorAll(".story-detail-button")).find(
            isVisible,
          )
        : null;
    const restartButton =
      step === "coda"
        ? document.querySelector('.story-icon-button[aria-label="Restart"]')
        : null;
    const mainButton = document.querySelector(".story-main-button");
    const cta = detailButton ?? restartButton ?? mainButton;
    const ctaRect = cta instanceof HTMLElement ? cta.getBoundingClientRect() : null;

    return {
      bodyScrollHeight: document.body.scrollHeight,
      cta: ctaRect
        ? {
            bottom: ctaRect.bottom,
            label:
              cta instanceof HTMLButtonElement
                ? cta.textContent?.trim() || cta.getAttribute("aria-label")
                : cta?.textContent?.trim() ?? null,
            top: ctaRect.top,
          }
        : null,
      documentScrollHeight: document.documentElement.scrollHeight,
      step,
    };
  });

  expect(metrics.bodyScrollHeight, `${context} body scroll height`).toBeLessThanOrEqual(
    viewport.height + 1,
  );
  expect(
    metrics.documentScrollHeight,
    `${context} document scroll height`,
  ).toBeLessThanOrEqual(viewport.height + 1);
  expect(metrics.cta, `${context} primary CTA`).not.toBeNull();
  expect(metrics.cta?.top, `${context} primary CTA top`).toBeGreaterThanOrEqual(
    0,
  );
  expect(metrics.cta?.bottom, `${context} primary CTA bottom`).toBeLessThanOrEqual(
    viewport.height,
  );
}

async function waitForHeroFitCycle(page: Page) {
  await page.waitForFunction(
    (selector) => {
      const elements = Array.from(document.querySelectorAll(selector));

      if (elements.length === 0) {
        return false;
      }

      return elements.every((element) => {
        const htmlElement = element as HTMLElement;
        const style = window.getComputedStyle(htmlElement);

        return style.display === "none" || htmlElement.dataset.fitReady === "true";
      });
    },
    HERO_FIT_SELECTOR,
  );
}

async function captureFirstFitFrameAfterClick(
  page: Page,
  buttonName: string,
  fitSelector: string,
) {
  const firstFramePromise = page.evaluate(
    ({ buttonName: pageButtonName, fitSelector: pageFitSelector }) =>
      new Promise<{
        fontSize: number | null;
        maxPx: number | null;
        opacity: number | null;
        present: boolean;
        ready: string | null;
        visibility: string | null;
      }>((resolve) => {
        const button = Array.from(document.querySelectorAll("button")).find(
          (candidate) =>
            candidate.textContent?.trim() === pageButtonName &&
            !candidate.disabled,
        );

        if (!button) {
          resolve({
            fontSize: null,
            maxPx: null,
            opacity: null,
            present: false,
            ready: null,
            visibility: null,
          });
          return;
        }

        button.addEventListener(
          "click",
          () => {
            requestAnimationFrame(() => {
              const element = document.querySelector(
                pageFitSelector,
              ) as HTMLElement | null;

              if (!element) {
                resolve({
                  fontSize: null,
                  maxPx: null,
                  opacity: null,
                  present: false,
                  ready: null,
                  visibility: null,
                });
                return;
              }

              const style = window.getComputedStyle(element);

              resolve({
                fontSize: Number.parseFloat(style.fontSize),
                maxPx: Number(element.dataset.fitMaxPx),
                opacity: Number.parseFloat(style.opacity),
                present: true,
                ready: element.dataset.fitReady ?? null,
                visibility: style.visibility,
              });
            });
          },
          { once: true },
        );
      }),
    { buttonName, fitSelector },
  );

  await clickStoryButton(page, buttonName);

  return firstFramePromise;
}

async function captureFirstHeroFitFrameAfterClick(
  page: Page,
  buttonName: string,
) {
  const firstFramePromise = page.evaluate(
    (pageButtonName) =>
      new Promise<
        {
          fitId: string | null;
          opacity: number;
          ready: string | null;
          visibility: string;
        }[]
      >((resolve) => {
        const button = Array.from(document.querySelectorAll("button")).find(
          (candidate) =>
            candidate.textContent?.trim() === pageButtonName &&
            !candidate.disabled,
        );

        if (!button) {
          resolve([]);
          return;
        }

        button.addEventListener(
          "click",
          () => {
            requestAnimationFrame(() => {
              const elements = Array.from(
                document.querySelectorAll(".story-content [data-hero-fit]"),
              ) as HTMLElement[];

              resolve(
                elements.map((element) => {
                  const style = window.getComputedStyle(element);

                  return {
                    fitId: element.dataset.heroFit ?? null,
                    opacity: Number.parseFloat(style.opacity),
                    ready: element.dataset.fitReady ?? null,
                    visibility: style.visibility,
                  };
                }),
              );
            });
          },
          { once: true },
        );
      }),
    buttonName,
  );

  await clickStoryButton(page, buttonName);

  return firstFramePromise;
}

async function clickAndAssertTransitionHidesHero(
  page: Page,
  buttonName: string,
  context: string,
) {
  const firstFrame = await captureFirstHeroFitFrameAfterClick(page, buttonName);

  expect(firstFrame.length, `${context} first-frame heroes`).toBeGreaterThan(0);
  expect(
    firstFrame.some(
      (hero) => hero.visibility === "hidden" || hero.opacity === 0,
    ),
    `${context} hidden or transparent first-frame hero`,
  ).toBe(true);

  await waitForHeroFitCycle(page);
  await page.waitForFunction(() => {
    const elements = Array.from(
      document.querySelectorAll(".story-content [data-hero-fit]"),
    );

    return elements.every((element) => {
      const style = window.getComputedStyle(element);

      return style.visibility === "visible" && Number.parseFloat(style.opacity) > 0;
    });
  });

  const stillHidden = await page
    .locator(".story-content [data-hero-fit]")
    .evaluateAll((elements) =>
      elements.flatMap((element) => {
        const htmlElement = element as HTMLElement;
        const style = window.getComputedStyle(htmlElement);

        return style.visibility === "hidden" || Number.parseFloat(style.opacity) === 0
          ? [htmlElement.dataset.heroFit ?? htmlElement.textContent?.trim() ?? ""]
          : [];
      }),
    );

  expect(stillHidden, `${context} revealed heroes`).toEqual([]);
}

async function expectVisibleHeroesToFit(page: Page, context: string) {
  await waitForHeroFitCycle(page);

  const failures = await page.locator(HERO_FIT_SELECTOR).evaluateAll(
    (elements) =>
      elements.flatMap((element) => {
        const htmlElement = element as HTMLElement;
        const rect = htmlElement.getBoundingClientRect();
        const style = window.getComputedStyle(htmlElement);

        if (
          style.display === "none" ||
          style.visibility === "hidden" ||
          rect.width === 0 ||
          rect.height === 0
        ) {
          return [];
        }

        const parent = htmlElement.parentElement;
        const parentRect = parent?.getBoundingClientRect();
        const scrollOverflow =
          htmlElement.scrollWidth > htmlElement.clientWidth + 1;
        const parentOverflow =
          parentRect !== undefined &&
          (rect.left < parentRect.left - 1 || rect.right > parentRect.right + 1);

        if (!scrollOverflow && !parentOverflow) {
          return [];
        }

        return [
          {
            clientWidth: htmlElement.clientWidth,
            fitId: htmlElement.dataset.heroFit,
            fontSize: style.fontSize,
            parentLeft: parentRect?.left,
            parentRight: parentRect?.right,
            rectLeft: rect.left,
            rectRight: rect.right,
            scrollWidth: htmlElement.scrollWidth,
            text: htmlElement.textContent,
          },
        ];
      }),
  );

  expect(failures, context).toEqual([]);
}

async function startStoryWithIncome(page: Page, income: number) {
  await page.goto("/");
  await waitForStoryHydration(page);
  await expectVisibleHeroesToFit(page, `intro income ${income}`);
  await clickStoryButton(page, "Start");
  await expectVisibleHeroesToFit(page, `input income ${income}`);
  await page.getByLabel("Taxable income").fill(String(income));
  await clickStoryButton(page, "Next");
}

async function advanceAndFit(
  page: Page,
  heading: string | RegExp,
  context: string,
) {
  await clickStoryButton(page, "Next");
  await expect(page.getByRole("heading", { name: heading })).toBeVisible();
  await expectVisibleHeroesToFit(page, context);
}

async function walkFlowAndAssertHeroFit(page: Page, income: number) {
  await startStoryWithIncome(page, income);

  await expect(page.getByRole("heading", { name: "Your tax estimate" })).toBeVisible();
  await expectVisibleHeroesToFit(page, `tax income ${income}`);

  await advanceAndFit(page, "Bracket by bracket.", `bracket income ${income}`);
  await advanceAndFit(
    page,
    "Mapped across the Budget",
    `allocation income ${income}`,
  );

  const categoryHeadings = [
    "Social security & welfare",
    "Health",
    "Education",
    "Defence",
    "Energy & resources",
  ];

  for (const [index, heading] of categoryHeadings.entries()) {
    await advanceAndFit(page, heading, `${heading} income ${income}`);

    if (index === 0) {
      await clickStoryButton(page, "Open breakdown");
      await expect(
        page.getByText(/to Social security and welfare\./),
      ).toBeVisible();
      await expectVisibleHeroesToFit(
        page,
        `drilldown ${heading} income ${income}`,
      );
      await clickStoryButton(page, "Done");
      await expect(page.getByRole("heading", { name: heading })).toBeVisible();
      await expectVisibleHeroesToFit(
        page,
        `${heading} after drilldown income ${income}`,
      );
    }
  }

  await advanceAndFit(page, "States and territories", `states income ${income}`);
  await advanceAndFit(page, "Debt interest", `debt income ${income}`);
  await advanceAndFit(
    page,
    "Your illustrative receipt",
    `summary income ${income}`,
  );
  await advanceAndFit(
    page,
    "Australia's 2025-26 Commonwealth bill.",
    `coda income ${income}`,
  );
}

async function advanceAndAssertMobileViewportFit(
  page: Page,
  heading: string | RegExp,
  viewport: (typeof INTRO_VIEWPORTS)[number],
  context: string,
) {
  await clickStoryButton(page, "Next");
  await expect(page.getByRole("heading", { name: heading })).toBeVisible();
  await expectMobileStepToFitViewport(page, viewport, context);
}

async function walkFlowAndAssertMobileViewportFit(
  page: Page,
  income: number,
  viewport: (typeof INTRO_VIEWPORTS)[number],
) {
  await page.goto("/");
  await waitForStoryHydration(page);

  await expect(
    page.getByRole("heading", { name: "Your Australian Budget Wrapped" }),
  ).toBeVisible();
  await expectMobileStepToFitViewport(
    page,
    viewport,
    `intro income ${income}`,
  );

  await clickStoryButton(page, "Start");
  await expect(
    page.getByRole("heading", { name: "What should we wrap?" }),
  ).toBeVisible();
  await expectMobileStepToFitViewport(
    page,
    viewport,
    `income input ${income}`,
  );

  await page.getByLabel("Taxable income").fill(String(income));
  await clickStoryButton(page, "Next");
  await expect(
    page.getByRole("heading", { name: "Your tax estimate" }),
  ).toBeVisible();
  await expectMobileStepToFitViewport(page, viewport, `tax income ${income}`);

  await advanceAndAssertMobileViewportFit(
    page,
    "Bracket by bracket.",
    viewport,
    `bracket income ${income}`,
  );
  await advanceAndAssertMobileViewportFit(
    page,
    "Mapped across the Budget",
    viewport,
    `allocation income ${income}`,
  );

  const categoryHeadings = [
    "Social security & welfare",
    "Health",
    "Education",
    "Defence",
    "Energy & resources",
  ];

  for (const [index, heading] of categoryHeadings.entries()) {
    await advanceAndAssertMobileViewportFit(
      page,
      heading,
      viewport,
      `${heading} income ${income}`,
    );

    if (index === 0) {
      await clickStoryButton(page, "Open breakdown");
      await expect(
        page.getByText(/to Social security and welfare\./),
      ).toBeVisible();
      await expectMobileStepToFitViewport(
        page,
        viewport,
        `drilldown ${heading} income ${income}`,
      );
      await clickStoryButton(page, "Done");
      await expect(page.getByRole("heading", { name: heading })).toBeVisible();
      await expectMobileStepToFitViewport(
        page,
        viewport,
        `${heading} after drilldown income ${income}`,
      );
    }
  }

  await advanceAndAssertMobileViewportFit(
    page,
    "States and territories",
    viewport,
    `states income ${income}`,
  );
  await advanceAndAssertMobileViewportFit(
    page,
    "Debt interest",
    viewport,
    `debt income ${income}`,
  );
  await advanceAndAssertMobileViewportFit(
    page,
    "Your illustrative receipt",
    viewport,
    `summary income ${income}`,
  );
  await advanceAndAssertMobileViewportFit(
    page,
    "Australia's 2025-26 Commonwealth bill.",
    viewport,
    `coda income ${income}`,
  );
}

test.describe("mobile flow viewport fit", () => {
  test.setTimeout(180_000);

  for (const viewport of INTRO_VIEWPORTS) {
    test.describe(`${viewport.width}x${viewport.height}`, () => {
      test.use({ viewport });

      for (const income of FLOW_VIEWPORT_FIT_INCOMES) {
        test(`keeps every step within one viewport for taxable income ${income}`, async ({
          page,
        }) => {
          await walkFlowAndAssertMobileViewportFit(page, income, viewport);
        });
      }
    });
  }
});

async function openSocialSecurityDrilldown(page: Page) {
  await startStoryWithIncome(page, 90000);
  await expect(page.getByRole("heading", { name: "Your tax estimate" })).toBeVisible();
  await advanceAndFit(page, "Bracket by bracket.", "bracket for drilldown");
  await advanceAndFit(
    page,
    "Mapped across the Budget",
    "allocation for drilldown",
  );
  await advanceAndFit(
    page,
    "Social security & welfare",
    "category for drilldown",
  );
  await clickStoryButton(page, "Open breakdown");
  await expect(
    page.getByText(/to Social security and welfare\./),
  ).toBeVisible();
  await expectVisibleHeroesToFit(page, "social security drilldown");
}

function parseCurrencyAmount(value: string) {
  return Number(value.replace(/[^0-9.-]/g, ""));
}

async function expectDrilldownAmountsDescending(page: Page) {
  const amountTexts = await page
    .locator(".drilldown-row > strong")
    .evaluateAll((elements) =>
      elements.map((element) => element.textContent?.trim() ?? ""),
    );
  const amounts = amountTexts.map(parseCurrencyAmount);

  expect(amounts.length).toBeGreaterThan(2);

  for (let index = 1; index < amounts.length; index += 1) {
    expect(amounts[index - 1]).toBeGreaterThanOrEqual(amounts[index]);
  }
}

async function expectFirstDrilldownBarLargest(page: Page) {
  const widths = await page.locator(".drilldown-bar-fill").evaluateAll(
    (elements) =>
      elements.map((element) =>
        Number.parseFloat((element as HTMLElement).style.width),
      ),
  );

  expect(widths.length).toBeGreaterThan(2);
  expect(widths[0]).toBe(100);

  for (const width of widths) {
    expect(widths[0]).toBeGreaterThanOrEqual(width);
  }
}

async function expectDrilldownRowsNotClipped(page: Page) {
  const rows = page.locator(".drilldown-row");
  const count = await rows.count();

  for (let index = 0; index < count; index += 1) {
    const row = rows.nth(index);

    await row.scrollIntoViewIfNeeded();

    const clippingFailures = await row.evaluate((element) => {
      const rowElement = element as HTMLElement;
      const bars = rowElement.closest(".drilldown-bars") as HTMLElement | null;
      const amount = rowElement.querySelector("strong") as HTMLElement | null;
      const label = rowElement.querySelector(
        ".drilldown-row-text b",
      ) as HTMLElement | null;

      if (!bars || !amount || !label) {
        return ["missing drilldown row content"];
      }

      const barsRect = bars.getBoundingClientRect();
      const amountRect = amount.getBoundingClientRect();
      const labelRect = label.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const failures: string[] = [];

      if (amountRect.width <= 0 || amountRect.height <= 0) {
        failures.push("amount hidden");
      }

      if (labelRect.width <= 0 || labelRect.height <= 0) {
        failures.push("label hidden");
      }

      for (const [name, rect] of [
        ["amount", amountRect],
        ["label", labelRect],
      ] as const) {
        if (
          rect.left < barsRect.left - 1 ||
          rect.right > barsRect.right + 1 ||
          rect.top < barsRect.top - 1 ||
          rect.bottom > barsRect.bottom + 1
        ) {
          failures.push(`${name} clipped`);
        }

        if (rect.left < -1 || rect.right > viewportWidth + 1) {
          failures.push(`${name} viewport clipped`);
        }
      }

      return failures;
    });

    expect(clippingFailures, `drilldown row ${index}`).toEqual([]);
  }
}

async function waitForDesktopLayout(page: Page) {
  await page.waitForFunction(
    () =>
      new Promise<void>((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
      }),
  );
  await page.waitForTimeout(760);
}

async function expectDesktopContentContained(page: Page, context: string) {
  await waitForDesktopLayout(page);

  const failures = await page.locator(".story-card").evaluate((container) => {
    const containerRect = container.getBoundingClientRect();
    const ignoredSelector = [
      ".story-lines",
      ".story-pattern",
      ".story-slab",
      ".story-poster-year",
      ".story-watermark",
    ].join(",");
    const elements = Array.from(container.querySelectorAll("*"));
    const failures: {
      bottom: number;
      className: string;
      left: number;
      right: number;
      tagName: string;
      text: string;
      top: number;
    }[] = [];

    for (const element of elements) {
      if (!(element instanceof HTMLElement || element instanceof SVGElement)) {
        continue;
      }

      if (element.closest(ignoredSelector)) {
        continue;
      }

      const rect = element.getBoundingClientRect();
      const style = window.getComputedStyle(element);

      if (
        style.display === "none" ||
        style.visibility === "hidden" ||
        rect.width === 0 ||
        rect.height === 0
      ) {
        continue;
      }

      if (
        rect.left < containerRect.left - 2 ||
        rect.right > containerRect.right + 2 ||
        rect.top < containerRect.top - 2 ||
        rect.bottom > containerRect.bottom + 2
      ) {
        failures.push({
          bottom: rect.bottom,
          className:
            typeof element.className === "string" ? element.className : "",
          left: rect.left,
          right: rect.right,
          tagName: element.tagName.toLowerCase(),
          text: element.textContent?.trim().slice(0, 80) ?? "",
          top: rect.top,
        });
      }
    }

    return failures;
  });

  expect(failures, context).toEqual([]);

  const pageScrolls = await page.evaluate(
    () =>
      document.documentElement.scrollHeight > window.innerHeight + 1 ||
      document.body.scrollHeight > window.innerHeight + 1,
  );

  expect(pageScrolls, `${context} page scroll`).toBe(false);
}

async function expectSummaryBarsVisuallyWeighted(page: Page) {
  const bars = await page.locator(".summary-chart-row").evaluateAll((rows) =>
    rows.map((row) => {
      const fill = row.querySelector(".summary-chart-fill") as HTMLElement | null;
      const track = row.querySelector(".summary-chart-track") as HTMLElement | null;
      const label =
        row.querySelector(".summary-chart-row-top span")?.textContent?.trim() ??
        "";

      if (!fill || !track) {
        return { label, backgroundColor: "", fillWidth: 0, trackWidth: 0 };
      }

      return {
        label,
        backgroundColor: window.getComputedStyle(fill).backgroundColor,
        fillWidth: fill.getBoundingClientRect().width,
        trackWidth: track.getBoundingClientRect().width,
      };
    }),
  );

  expect(bars.length).toBeGreaterThan(2);

  for (const bar of bars) {
    expect(bar.fillWidth, `${bar.label} fill width`).toBeGreaterThan(0);
    expect(bar.fillWidth, `${bar.label} track width`).toBeLessThanOrEqual(
      bar.trackWidth + 1,
    );
    expect(bar.backgroundColor, `${bar.label} fill colour`).not.toBe(
      "rgba(0, 0, 0, 0)",
    );
  }

  expect(bars[0].fillWidth, "largest summary row fill").toBeGreaterThan(
    bars[1].fillWidth,
  );
}

async function advanceDesktopAndAssert(
  page: Page,
  heading: string | RegExp,
  context: string,
) {
  await clickStoryButton(page, "Next");
  await expect(page.getByRole("heading", { name: heading })).toBeVisible();
  await expectDesktopContentContained(page, context);
}

async function walkDesktopFlowAndAssertContainment(page: Page) {
  await page.goto("/");
  await waitForStoryHydration(page);

  await expect(
    page.getByRole("heading", { name: "Your Australian Budget Wrapped" }),
  ).toBeVisible();
  await expectDesktopContentContained(page, "desktop intro");

  await clickStoryButton(page, "Start");
  await expect(
    page.getByRole("heading", { name: "What should we wrap?" }),
  ).toBeVisible();
  await expectDesktopContentContained(page, "desktop income input");

  await page.getByLabel("Taxable income").fill("90000");
  await clickStoryButton(page, "Next");
  await expect(
    page.getByRole("heading", { name: "Your tax estimate" }),
  ).toBeVisible();
  await expectDesktopContentContained(page, "desktop tax estimate");

  await advanceDesktopAndAssert(
    page,
    "Bracket by bracket.",
    "desktop bracket walk",
  );
  await advanceDesktopAndAssert(
    page,
    "Mapped across the Budget",
    "desktop allocation",
  );

  const categoryHeadings = [
    "Social security & welfare",
    "Health",
    "Education",
    "Defence",
    "Energy & resources",
  ];

  for (const [index, heading] of categoryHeadings.entries()) {
    await advanceDesktopAndAssert(page, heading, `desktop category ${heading}`);

    if (index === 0) {
      await clickStoryButton(page, "Open breakdown");
      await expect(
        page.getByText(/to Social security and welfare\./),
      ).toBeVisible();
      await expectDesktopContentContained(page, "desktop drilldown");
      await clickStoryButton(page, "Done");
      await expect(
        page.getByRole("heading", { name: "Social security & welfare" }),
      ).toBeVisible();
      await expectDesktopContentContained(
        page,
        "desktop category after drilldown",
      );
    }
  }

  await advanceDesktopAndAssert(
    page,
    "States and territories",
    "desktop spotlight states",
  );
  await advanceDesktopAndAssert(
    page,
    "Debt interest",
    "desktop spotlight debt",
  );
  await advanceDesktopAndAssert(
    page,
    "Your illustrative receipt",
    "desktop final summary",
  );
  await expectSummaryBarsVisuallyWeighted(page);
  await advanceDesktopAndAssert(
    page,
    "Australia's 2025-26 Commonwealth bill.",
    "desktop coda",
  );
}

test.describe("drilldown row ordering", () => {
  for (const viewportWidth of [390, 430] as const) {
    test.describe(`${viewportWidth}px viewport`, () => {
      test.use({ viewport: { width: viewportWidth, height: 844 } });

      test("sorts visible drilldown amounts and bars by size", async ({
        page,
      }) => {
        await openSocialSecurityDrilldown(page);
        await expectDrilldownAmountsDescending(page);
        await expectFirstDrilldownBarLargest(page);
        await expectDrilldownRowsNotClipped(page);
      });
    });
  }
});

test.describe("laptop story stage", () => {
  test.setTimeout(60_000);

  for (const viewport of DESKTOP_CONTAINMENT_VIEWPORTS) {
    test.describe(`${viewport.width}x${viewport.height}`, () => {
      test.use({ viewport });

      test("keeps every desktop step inside the editorial layout container", async ({
        page,
      }) => {
        await walkDesktopFlowAndAssertContainment(page);
      });
    });
  }
});

test.describe("fit-to-width hero typography", () => {
  test.setTimeout(90_000);

  for (const viewportWidth of HERO_FIT_VIEWPORT_WIDTHS) {
    test.describe(`${viewportWidth}px viewport`, () => {
      test.use({ viewport: { width: viewportWidth, height: 844 } });

      for (const income of HERO_FIT_INCOMES) {
        test(`fits hero text through the flow for taxable income ${income}`, async ({
          page,
        }) => {
          await walkFlowAndAssertHeroFit(page, income);
        });
      }
    });
  }

  test.use({ viewport: { width: 390, height: 844 } });

  test("hides fit text for one frame before revealing the fitted tax total", async ({
    page,
  }) => {
    await page.goto("/");
    await waitForStoryHydration(page);
    await expect(page.locator('[data-hero-fit="intro-title"]')).toHaveCSS(
      "visibility",
      "visible",
    );

    await clickStoryButton(page, "Start");
    await page.getByLabel("Taxable income").fill("90000");

    const firstFrame = await captureFirstFitFrameAfterClick(
      page,
      "Next",
      '[data-hero-fit="tax-total"]',
    );

    expect(firstFrame).toMatchObject({
      present: true,
      ready: "false",
      visibility: "hidden",
    });

    const taxTotal = page.locator('[data-hero-fit="tax-total"]');

    await expect(taxTotal).toHaveCSS("visibility", "visible");

    const visibleState = await taxTotal.evaluate((element) => {
      const style = window.getComputedStyle(element);

      return {
        fontSize: Number.parseFloat(style.fontSize),
        maxPx: Number(element.getAttribute("data-fit-max-px")),
      };
    });

    expect(visibleState.fontSize).toBeLessThanOrEqual(visibleState.maxPx - 1);
  });

  test("hides new step hero text for one frame across transitions", async ({
    page,
  }) => {
    await page.goto("/");
    await waitForStoryHydration(page);
    await expect(page.locator('[data-hero-fit="intro-title"]')).toHaveCSS(
      "visibility",
      "visible",
    );

    await clickAndAssertTransitionHidesHero(page, "Start", "intro to input");
    await expect(
      page.getByRole("heading", { name: "What should we wrap?" }),
    ).toBeVisible();

    await page.getByLabel("Taxable income").fill("90000");
    await clickAndAssertTransitionHidesHero(page, "Next", "input to tax");
    await expect(
      page.getByRole("heading", { name: "Your tax estimate" }),
    ).toBeVisible();

    await clickAndAssertTransitionHidesHero(page, "Next", "tax to bracket");
    await expect(
      page.getByRole("heading", { name: "Bracket by bracket." }),
    ).toBeVisible();

    await clickAndAssertTransitionHidesHero(
      page,
      "Next",
      "bracket to allocation",
    );
    await expect(
      page.getByRole("heading", { name: "Mapped across the Budget" }),
    ).toBeVisible();

    await clickAndAssertTransitionHidesHero(
      page,
      "Next",
      "allocation to category",
    );
    await expect(
      page.getByRole("heading", { name: "Social security & welfare" }),
    ).toBeVisible();

    await clickAndAssertTransitionHidesHero(
      page,
      "Open breakdown",
      "category to drilldown",
    );
    await expect(
      page.getByText(/to Social security and welfare\./),
    ).toBeVisible();
  });

  test("fits category amount by content length, not just container width", async ({
    page,
  }) => {
    async function getFirstCategoryAmountFontSize(income: number) {
      await startStoryWithIncome(page, income);
      await advanceAndFit(page, "Bracket by bracket.", `bracket ${income}`);
      await advanceAndFit(
        page,
        "Mapped across the Budget",
        `allocation ${income}`,
      );
      await advanceAndFit(
        page,
        "Social security & welfare",
        `category ${income}`,
      );

      return page
        .locator('[data-hero-fit="category-amount"]')
        .first()
        .evaluate((element) =>
          Number.parseFloat(window.getComputedStyle(element).fontSize),
        );
    }

    const shortAmountFontSize = await getFirstCategoryAmountFontSize(5);
    const longAmountFontSize = await getFirstCategoryAmountFontSize(1000000);

    expect(shortAmountFontSize).toBeGreaterThan(longAmountFontSize + 1);
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
    await waitForStoryHydration(page);
    await clickStoryButton(page, "Start");
    await waitForHeroFitCycle(page);
    await page.getByLabel("Taxable income").fill("90000");
    await clickStoryButton(page, "Next");
    await waitForHeroFitCycle(page);

    for (let index = 0; index < 12; index += 1) {
      if (
        await page
          .getByRole("heading", { name: "Your illustrative receipt" })
          .isVisible()
          .catch(() => false)
      ) {
        return;
      }

      await clickStoryButton(page, "Next");
      await waitForHeroFitCycle(page);
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
