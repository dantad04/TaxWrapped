import { budget2025_26 } from "@/data/budget-2025-26";
import { budgetSources } from "@/data/sources";
import {
  getSpotlightPrograms,
  getTopLevelExpenseFunctions,
  getTopLevelFunctionTotalAudMillions,
  isWithinPublishedTotalTolerance,
} from "@/lib/budget/budget-data";
import { describe, expect, it } from "vitest";

const sourceIds = new Set(Object.keys(budgetSources));

describe("2025-26 Budget data model", () => {
  it("gives every top-level function a sourceId", () => {
    expect(getTopLevelExpenseFunctions()).toHaveLength(14);

    for (const item of getTopLevelExpenseFunctions()) {
      expect(item.sourceId).toBeTruthy();
    }
  });

  it("gives every spotlight program a sourceId", () => {
    expect(getSpotlightPrograms()).toHaveLength(8);

    for (const item of getSpotlightPrograms()) {
      expect(item.sourceId).toBeTruthy();
    }
  });

  it("keeps top-level function amounts within the documented rounding tolerance", () => {
    const functionTotal = getTopLevelFunctionTotalAudMillions();
    const difference = Math.abs(
      functionTotal - budget2025_26.totalExpensesAudMillions,
    );

    expect(functionTotal).toBe(785671);
    expect(budget2025_26.totalExpensesAudMillions).toBe(785670);
    expect(budget2025_26.roundingToleranceAudMillions).toBe(1);
    expect(difference).toBeLessThanOrEqual(
      budget2025_26.roundingToleranceAudMillions,
    );
    expect(isWithinPublishedTotalTolerance()).toBe(true);
  });

  it("gives every top-level function a stable slug", () => {
    const slugs = getTopLevelExpenseFunctions().map((item) => item.slug);

    expect(new Set(slugs).size).toBe(slugs.length);

    for (const slug of slugs) {
      expect(slug).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    }
  });

  it("gives every top-level function a human-readable label", () => {
    for (const item of getTopLevelExpenseFunctions()) {
      expect(item.label.trim()).toBe(item.label);
      expect(item.label.length).toBeGreaterThan(2);
      expect(item.label).not.toBe(item.slug);
      expect(item.label).not.toContain("-");
    }
  });

  it("marks spotlight programs as non-additive", () => {
    for (const item of getSpotlightPrograms()) {
      expect(item.kind).toBe("spotlight-program");
      expect(item.additive).toBe(false);
    }
  });

  it("does not include any Budget data item without an amount", () => {
    const items = [
      ...getTopLevelExpenseFunctions(),
      ...getSpotlightPrograms(),
    ];

    for (const item of items) {
      expect(Number.isFinite(item.amountAudMillions)).toBe(true);
      expect(item.amountAudMillions).toBeGreaterThan(0);
    }
  });

  it("does not point any sourceId at a missing source registry entry", () => {
    const dataSourceIds = [
      ...budget2025_26.sourceIds,
      ...getTopLevelExpenseFunctions().map((item) => item.sourceId),
      ...getSpotlightPrograms().map((item) => item.sourceId),
    ];

    for (const sourceId of dataSourceIds) {
      expect(sourceIds.has(sourceId)).toBe(true);
    }
  });
});
