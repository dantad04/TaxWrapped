import { auBudget2025_26 } from "@/data/auBudget2025_26";
import { budget2025_26 } from "@/data/budget-2025-26";
import { sourceRegistry } from "@/data/sources";
import { allocateTaxAcrossBudgetFunctions } from "@/lib/allocation/budget-allocation";
import {
  calculateBudgetDrilldownView,
  calculateBudgetProgramCallouts,
  calculateTopLevelContributionCents,
  getBudgetDrilldownCategory,
  getBudgetNodeChildrenTotalM,
  sumBudgetNodeAmountM,
} from "@/lib/budget/drilldown-data";
import type { BudgetDrilldownNode } from "@/lib/budget/drilldown-model";
import { describe, expect, it } from "vitest";

function walkNodes(
  nodes: readonly BudgetDrilldownNode[],
  visit: (node: BudgetDrilldownNode) => void,
) {
  for (const node of nodes) {
    visit(node);
    walkNodes(node.children ?? [], visit);
  }
}

function sumRowsCents(
  rows: readonly { amountCents: number }[],
): number {
  return rows.reduce((total, row) => total + row.amountCents, 0);
}

function findNodeById(
  nodes: readonly BudgetDrilldownNode[],
  id: string,
): BudgetDrilldownNode | null {
  for (const node of nodes) {
    if (node.id === id) {
      return node;
    }

    const childMatch = findNodeById(node.children ?? [], id);

    if (childMatch) {
      return childMatch;
    }
  }

  return null;
}

describe("2025-26 Budget drilldown data", () => {
  it("keeps top-level categories within the published total rounding tolerance", () => {
    const topLevelTotal = sumBudgetNodeAmountM(auBudget2025_26.categories);

    expect(topLevelTotal).toBe(785671);
    expect(auBudget2025_26.totalExpensesM).toBe(785670);
    expect(Math.abs(topLevelTotal - auBudget2025_26.totalExpensesM)).toBeLessThanOrEqual(1);
  });

  it("connects every drilldown node source to the source registry", () => {
    const sourceIds = new Set(Object.keys(sourceRegistry));

    for (const sourceId of auBudget2025_26.sourceIds) {
      expect(sourceIds.has(sourceId)).toBe(true);
    }

    walkNodes(auBudget2025_26.categories, (node) => {
      expect(sourceIds.has(node.sourceId)).toBe(true);
      expect(node.source).toBeTruthy();
      expect(node.sourceUrl).toMatch(/^https:\/\//);
      expect(node.sourceLocator).toBeTruthy();
    });
  });

  it("keeps child categories reconciled to their parent or proportional basis", () => {
    walkNodes(auBudget2025_26.categories, (node) => {
      if (!node.children?.length) {
        return;
      }

      const expectedBasis = node.allocationBasisM ?? node.amountM;
      const childTotal = getBudgetNodeChildrenTotalM(node);

      expect(Math.abs(childTotal - expectedBasis)).toBeLessThanOrEqual(1);
    });
  });

  it("keeps the Defence top-level amount separate from the PBS proportional basis", () => {
    const defence = getBudgetDrilldownCategory("defence");

    expect(defence?.amountM).toBe(51483);
    expect(defence?.allocationMode).toBe("proportional");
    expect(defence?.allocationBasisM).toBe(57421.2);
    expect(defence?.source).toBe(
      "Australian Government Budget Paper No. 1 2025-26",
    );
  });

  it("splits a user's Defence contribution by Defence PBS proportions", () => {
    const defence = getBudgetDrilldownCategory("defence");
    const view = calculateBudgetDrilldownView(19_588, ["defence"]);

    expect(defence).not.toBeNull();
    expect(view).not.toBeNull();

    const expectedDefenceCents = calculateTopLevelContributionCents(
      19_588,
      defence!,
    );

    expect(view?.contributionAmountCents).toBe(expectedDefenceCents);
    expect(sumRowsCents(view?.rows ?? [])).toBe(expectedDefenceCents);
    expect(view?.rows.map((row) => row.label)).toEqual([
      "Workforce",
      "Operations",
      "Capability Acquisition Program",
      "Capability Sustainment Program",
      "Operating",
    ]);
  });

  it("supports nested Defence acquisition and sustainment drilldowns", () => {
    const acquisitionView = calculateBudgetDrilldownView(19_588, [
      "defence",
      "capability-acquisition-program",
    ]);
    const sustainmentView = calculateBudgetDrilldownView(19_588, [
      "defence",
      "capability-sustainment-program",
    ]);

    expect(acquisitionView?.rows.map((row) => row.label)).toContain(
      "Military Equipment Acquisition Program",
    );
    expect(sustainmentView?.rows.map((row) => row.label)).toContain(
      "Air Force Sustainment",
    );
    expect(sumRowsCents(acquisitionView?.rows ?? [])).toBe(
      acquisitionView?.contributionAmountCents,
    );
    expect(sumRowsCents(sustainmentView?.rows ?? [])).toBe(
      sustainmentView?.contributionAmountCents,
    );
  });

  it("keeps zero-tax drilldowns stable", () => {
    const view = calculateBudgetDrilldownView(0, ["health"]);

    expect(view?.contributionAmountCents).toBe(0);
    expect(sumRowsCents(view?.rows ?? [])).toBe(0);
    expect(view?.rows.every((row) => row.amountCents === 0)).toBe(true);
  });

  it("rejects negative tax amounts for drilldown calculations", () => {
    expect(() =>
      calculateBudgetDrilldownView(-1, ["social-security-welfare"]),
    ).toThrow(RangeError);
  });

  it("connects every program callout source to the source registry", () => {
    const sourceIds = new Set(Object.keys(sourceRegistry));

    for (const category of auBudget2025_26.categories) {
      for (const callout of category.callouts ?? []) {
        expect(sourceIds.has(callout.sourceId)).toBe(true);
        expect(callout.sourceLocator).toBeTruthy();
      }
    }
  });

  it("keeps program callout amounts tied to existing drilldown rows", () => {
    for (const category of auBudget2025_26.categories) {
      for (const callout of category.callouts ?? []) {
        const sourceRow = findNodeById(category.children ?? [], callout.id);

        expect(sourceRow).not.toBeNull();
        expect(callout.amountM).toBe(sourceRow?.amountM);
        expect(callout.sourceId).toBe(sourceRow?.sourceId);
        expect(callout.sourceLocator).toBe(sourceRow?.sourceLocator);
      }
    }
  });

  it("keeps per-card callout contributions within the parent category contribution", () => {
    const summary = allocateTaxAcrossBudgetFunctions(19_588);

    for (const category of auBudget2025_26.categories) {
      if (!category.callouts?.length) {
        continue;
      }

      const parentAllocation = summary.allocations.find(
        (allocation) => allocation.slug === category.id,
      );

      expect(parentAllocation).toBeDefined();

      const callouts = calculateBudgetProgramCallouts(
        parentAllocation?.amountCents ?? 0,
        category,
      );

      expect(callouts.length).toBeLessThanOrEqual(2);
      expect(sumRowsCents(callouts)).toBeLessThanOrEqual(
        parentAllocation?.amountCents ?? 0,
      );
    }
  });

  it("does not duplicate spotlight items on the same card", () => {
    for (const category of auBudget2025_26.categories) {
      const spotlightLabels = new Set(
        budget2025_26.spotlightPrograms
          .filter((spotlight) => spotlight.parentFunctionSlug === category.id)
          .map((spotlight) => spotlight.label.toLowerCase()),
      );
      const spotlightSlugs = new Set<string>(
        budget2025_26.spotlightPrograms
          .filter((spotlight) => spotlight.parentFunctionSlug === category.id)
          .map((spotlight) => spotlight.slug),
      );

      for (const callout of category.callouts ?? []) {
        expect(spotlightLabels.has(callout.label.toLowerCase())).toBe(false);
        expect(spotlightSlugs.has(callout.id)).toBe(false);
      }
    }
  });

  it("keeps judgemental and political phrasing out of callout copy", () => {
    const bannedPhrases = [
      "much-needed",
      "controversial",
      "underfunded",
      "bloated",
      "fair",
      "unfair",
      "party",
      "election",
      "minister",
      "labor",
      "liberal",
      "coalition",
      "greens",
    ];

    for (const category of auBudget2025_26.categories) {
      for (const callout of category.callouts ?? []) {
        const copy = `${callout.label} ${callout.descriptionShort}`.toLowerCase();

        for (const phrase of bannedPhrases) {
          expect(copy).not.toContain(phrase);
        }
      }
    }
  });
});
