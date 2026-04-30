import {
  calculateReceiptScaleDenominator,
  COMMONWEALTH_TOTAL_EXPENSES_M,
  formatCommonwealthBill,
} from "@/lib/budget/australia-receipt-coda";
import { estimateAustralianTax2025_26 } from "@/lib/tax/australian-resident-2025-26";
import fs from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";

describe("Australia receipt coda", () => {
  it("formats the published total expenses figure as a billions hero", () => {
    expect(COMMONWEALTH_TOTAL_EXPENSES_M).toBe(785_670);
    expect(formatCommonwealthBill(COMMONWEALTH_TOTAL_EXPENSES_M)).toBe(
      "$785.7B",
    );
  });

  it("calculates the 1-in scale for representative taxable incomes", () => {
    const ninetyThousandTax = estimateAustralianTax2025_26({
      taxableIncome: 90_000,
      includeMedicareLevy: true,
    }).totalEstimatedTax;
    const fortyFiveThousandTax = estimateAustralianTax2025_26({
      taxableIncome: 45_000,
      includeMedicareLevy: true,
    }).totalEstimatedTax;

    expect(calculateReceiptScaleDenominator(ninetyThousandTax)).toBe(
      40_110_000,
    );
    expect(calculateReceiptScaleDenominator(fortyFiveThousandTax)).toBe(
      161_561_000,
    );
  });

  it("omits the slice denominator for zero-tax cases", () => {
    expect(calculateReceiptScaleDenominator(0)).toBeNull();
  });

  it("does not include political or value-laden terms in the coda card source", async () => {
    const source = await fs.readFile(
      path.join(process.cwd(), "src/app/budget-wrapped-flow.tsx"),
      "utf8",
    );
    const cardSource = source.match(
      /function AustraliaReceiptCodaCard[\s\S]*?const drilldownColours/,
    )?.[0];
    const bannedTerms = [
      "party",
      "election",
      "minister",
      "government",
      "fair",
      "unfair",
      "small",
      "large",
    ];

    expect(cardSource).toBeDefined();

    for (const term of bannedTerms) {
      expect(cardSource?.toLowerCase()).not.toContain(term);
    }
  });
});
