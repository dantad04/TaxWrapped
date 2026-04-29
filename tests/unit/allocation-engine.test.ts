import { budget2025_26 } from "@/data/budget-2025-26";
import { budgetSources } from "@/data/sources";
import {
  allocateTaxAcrossBudgetFunctions,
  calculateSpotlightAllocation,
} from "@/lib/allocation/budget-allocation";
import { allocateAmountByWeights } from "@/lib/allocation/rounding";
import { describe, expect, it } from "vitest";

function sumCents(items: readonly { amountCents: number }[]) {
  return items.reduce((total, item) => total + item.amountCents, 0);
}

describe("allocation rounding", () => {
  it("uses stable largest-remainder rounding for exact cent allocation", () => {
    const allocations = allocateAmountByWeights(0.02, [
      { id: "first", label: "First", weight: 1, metadata: null },
      { id: "second", label: "Second", weight: 1, metadata: null },
      { id: "third", label: "Third", weight: 1, metadata: null },
    ]);

    expect(allocations.map((item) => item.amountCents)).toEqual([1, 1, 0]);
    expect(sumCents(allocations)).toBe(2);
  });

  it("rejects negative total amounts", () => {
    expect(() =>
      allocateAmountByWeights(-1, [
        { id: "only", label: "Only", weight: 1, metadata: null },
      ]),
    ).toThrow("Total amount must not be negative.");
  });
});

describe("budget allocation engine", () => {
  it("allocates $0 across all top-level functions", () => {
    const summary = allocateTaxAcrossBudgetFunctions(0);

    expect(summary.allocations).toHaveLength(
      budget2025_26.topLevelFunctions.length,
    );
    expect(summary.allocations.every((item) => item.amount === 0)).toBe(true);
    expect(sumCents(summary.allocations)).toBe(0);
  });

  it("allocates a representative tax amount exactly after rounding", () => {
    const summary = allocateTaxAcrossBudgetFunctions(19588);

    expect(summary.inputTaxAmount).toBe(19588);
    expect(summary.inputTaxAmountCents).toBe(1958800);
    expect(sumCents(summary.allocations)).toBe(1958800);
    expect(summary.allocations.map((item) => item.slug)).toEqual(
      budget2025_26.topLevelFunctions.map((item) => item.slug),
    );
  });

  it("is deterministic across repeated runs", () => {
    const first = allocateTaxAcrossBudgetFunctions(19588);
    const second = allocateTaxAcrossBudgetFunctions(19588);

    expect(second).toEqual(first);
  });

  it("marks top-level allocations as additive", () => {
    const summary = allocateTaxAcrossBudgetFunctions(100);

    expect(summary.allocations.every((item) => item.additive)).toBe(true);
    expect(
      summary.allocations.every(
        (item) => item.kind === "budget-function-allocation",
      ),
    ).toBe(true);
  });

  it("marks spotlight allocations as non-additive", () => {
    const summary = calculateSpotlightAllocation(19588);

    expect(summary.allocations).toHaveLength(
      budget2025_26.spotlightPrograms.length,
    );
    expect(summary.allocations.every((item) => item.additive === false)).toBe(
      true,
    );
    expect(
      summary.allocations.every((item) => item.kind === "spotlight-allocation"),
    ).toBe(true);
  });

  it("does not include spotlight programs in the final summary total", () => {
    const finalSummary = allocateTaxAcrossBudgetFunctions(19588);
    const spotlightSummary = calculateSpotlightAllocation(19588);
    const finalSlugs = new Set<string>(
      finalSummary.allocations.map((item) => item.slug),
    );

    for (const spotlight of spotlightSummary.allocations) {
      expect(finalSlugs.has(spotlight.slug)).toBe(false);
    }

    expect(sumCents(finalSummary.allocations)).toBe(1958800);
    expect(sumCents(spotlightSummary.allocations)).not.toBe(1958800);
  });

  it("rejects negative tax amounts", () => {
    expect(() => allocateTaxAcrossBudgetFunctions(-1)).toThrow(
      "Tax amount must not be negative.",
    );
    expect(() => calculateSpotlightAllocation(-1)).toThrow(
      "Tax amount must not be negative.",
    );
  });

  it("does not point allocation results at missing Budget items or sources", () => {
    const finalSummary = allocateTaxAcrossBudgetFunctions(19588);
    const spotlightSummary = calculateSpotlightAllocation(19588);
    const functionSlugs = new Set(
      budget2025_26.topLevelFunctions.map((item) => item.slug),
    );
    const spotlightSlugs = new Set(
      budget2025_26.spotlightPrograms.map((item) => item.slug),
    );
    const sourceIds = new Set(Object.keys(budgetSources));

    for (const allocation of finalSummary.allocations) {
      expect(functionSlugs.has(allocation.slug)).toBe(true);
      expect(sourceIds.has(allocation.sourceId)).toBe(true);
      expect(allocation.source).not.toBeNull();
    }

    for (const allocation of spotlightSummary.allocations) {
      expect(spotlightSlugs.has(allocation.slug)).toBe(true);
      expect(sourceIds.has(allocation.sourceId)).toBe(true);
      expect(allocation.source).not.toBeNull();
      expect(functionSlugs.has(allocation.parentFunctionSlug)).toBe(true);
    }
  });

  it("allocates small totals deterministically", () => {
    const oneDollar = allocateTaxAcrossBudgetFunctions(1);
    const twoDollars = allocateTaxAcrossBudgetFunctions(2);

    expect(sumCents(oneDollar.allocations)).toBe(100);
    expect(sumCents(twoDollars.allocations)).toBe(200);
    expect(allocateTaxAcrossBudgetFunctions(1)).toEqual(oneDollar);
    expect(allocateTaxAcrossBudgetFunctions(2)).toEqual(twoDollars);
  });

  it("normalises across additive top-level rows, not the published rounded total", () => {
    const summary = allocateTaxAcrossBudgetFunctions(19588);

    expect(summary.budgetTotalExpensesAudMillions).toBe(785670);
    expect(summary.additiveWeightTotalAudMillions).toBe(785671);
    expect(sumCents(summary.allocations)).toBe(1958800);
  });
});
