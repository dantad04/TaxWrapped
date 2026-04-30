import {
  allocateTaxAcrossBudgetFunctions,
  calculateSpotlightAllocation,
} from "@/lib/allocation/budget-allocation";
import {
  buildShareCardData,
  sumShareCardRowCents,
} from "@/lib/share/share-card-data";
import { describe, expect, it } from "vitest";

describe("share card data", () => {
  it("uses additive allocation rows that reconcile to the estimated tax amount", () => {
    const summary = allocateTaxAcrossBudgetFunctions(19588);
    const shareCard = buildShareCardData(summary);

    expect(shareCard.rows.every((row) => row.additive)).toBe(true);
    expect(sumShareCardRowCents(shareCard.rows)).toBe(
      summary.inputTaxAmountCents,
    );
  });

  it("keeps non-additive spotlight programs out of the share card rows", () => {
    const summary = allocateTaxAcrossBudgetFunctions(19588);
    const spotlightSummary = calculateSpotlightAllocation(19588);
    const shareCard = buildShareCardData(summary);
    const shareCardSlugs = new Set<string>(
      shareCard.rows.flatMap((row) => [row.id, ...row.sourceSlugs]),
    );

    for (const spotlight of spotlightSummary.allocations) {
      expect(shareCardSlugs.has(spotlight.slug)).toBe(false);
    }
  });

  it("keeps the top five additive rows plus an additive remainder row", () => {
    const summary = allocateTaxAcrossBudgetFunctions(19588);
    const shareCard = buildShareCardData(summary);

    expect(shareCard.rows).toHaveLength(6);
    expect(shareCard.rows.slice(0, 5).map((row) => row.id)).toEqual([
      "social-security-welfare",
      "other-purposes",
      "health",
      "education",
      "defence",
    ]);
    expect(shareCard.rows[5].id).toBe("remaining-additive-functions");
  });
});
