import {
  allocateTaxAcrossBudgetFunctions,
  calculateSpotlightAllocation,
} from "@/lib/allocation/budget-allocation";
import {
  buildAllocationChartSegments,
  buildSpotlightChartMarker,
  buildSummaryChartRows,
  sumChartRowCents,
} from "@/lib/charts/budget-chart-data";
import { describe, expect, it } from "vitest";

describe("budget chart data helpers", () => {
  it("builds additive summary rows that reconcile to the estimated tax amount", () => {
    const summary = allocateTaxAcrossBudgetFunctions(19588);
    const rows = buildSummaryChartRows(summary, 7);

    expect(rows.every((row) => row.additive)).toBe(true);
    expect(sumChartRowCents(rows)).toBe(summary.inputTaxAmountCents);
  });

  it("keeps spotlight programs out of the final summary chart rows", () => {
    const summary = allocateTaxAcrossBudgetFunctions(19588);
    const spotlightSummary = calculateSpotlightAllocation(19588);
    const rows = buildSummaryChartRows(summary, 7);
    const rowIds = new Set<string>(
      rows.flatMap((row) => [row.id, ...row.sourceSlugs]),
    );

    for (const spotlight of spotlightSummary.allocations) {
      expect(rowIds.has(spotlight.slug)).toBe(false);
    }
  });

  it("marks spotlight chart markers as non-additive", () => {
    const spotlightSummary = calculateSpotlightAllocation(19588);
    const marker = buildSpotlightChartMarker(spotlightSummary.allocations[0]);

    expect(marker.additive).toBe(false);
    expect(marker.parentFunctionSlug).toBe(
      spotlightSummary.allocations[0].parentFunctionSlug,
    );
  });

  it("creates allocation segments only from additive top-level functions", () => {
    const summary = allocateTaxAcrossBudgetFunctions(19588);
    const segments = buildAllocationChartSegments(summary.allocations);

    expect(segments).toHaveLength(summary.allocations.length);
    expect(segments.every((segment) => segment.additive)).toBe(true);
    expect(
      segments.every((segment) =>
        summary.allocations.some((allocation) => allocation.slug === segment.id),
      ),
    ).toBe(true);
  });

  it("handles zero and low-tax inputs without non-finite chart shares", () => {
    for (const amount of [0, 1, 2]) {
      const summary = allocateTaxAcrossBudgetFunctions(amount);
      const rows = buildSummaryChartRows(summary, 7);
      const segments = buildAllocationChartSegments(summary.allocations);

      expect(sumChartRowCents(rows)).toBe(summary.inputTaxAmountCents);
      expect(
        rows.every((row) => Number.isFinite(row.shareOfTotal)),
      ).toBe(true);
      expect(
        segments.every((segment) => Number.isFinite(segment.shareOfTotal)),
      ).toBe(true);
    }
  });
});
