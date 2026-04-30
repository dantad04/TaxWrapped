import {
  calculateLowIncomeTaxOffset2025_26,
  calculateMaximumLowIncomeTaxOffset2025_26,
  calculateResidentIncomeTax2025_26,
  calculateSimplifiedMedicareLevy,
  estimateAustralianTax2025_26,
  SIMPLIFIED_MEDICARE_LEVY_CAVEAT,
} from "@/lib/tax/australian-resident-2025-26";
import { buildBracketWalk } from "@/lib/tax/bracket-walk";
import { describe, expect, it } from "vitest";

function roundMoney(amount: number): number {
  return Math.round((amount + Number.EPSILON) * 100) / 100;
}

describe("Australian resident tax engine 2025-26", () => {
  it("calculates every resident tax bracket boundary", () => {
    expect(calculateResidentIncomeTax2025_26(0)).toBe(0);
    expect(calculateResidentIncomeTax2025_26(18200)).toBe(0);
    expect(calculateResidentIncomeTax2025_26(18201)).toBe(0.16);
    expect(calculateResidentIncomeTax2025_26(45000)).toBe(4288);
    expect(calculateResidentIncomeTax2025_26(45001)).toBe(4288.3);
    expect(calculateResidentIncomeTax2025_26(135000)).toBe(31288);
    expect(calculateResidentIncomeTax2025_26(135001)).toBe(31288.37);
    expect(calculateResidentIncomeTax2025_26(190000)).toBe(51638);
    expect(calculateResidentIncomeTax2025_26(190001)).toBe(51638.45);
    expect(calculateResidentIncomeTax2025_26(200000)).toBe(56138);
  });

  it("calculates LITO thresholds deterministically", () => {
    expect(calculateMaximumLowIncomeTaxOffset2025_26(37500)).toBe(700);
    expect(calculateMaximumLowIncomeTaxOffset2025_26(37501)).toBe(699.95);
    expect(calculateMaximumLowIncomeTaxOffset2025_26(45000)).toBe(325);
    expect(calculateMaximumLowIncomeTaxOffset2025_26(45001)).toBe(324.99);
    expect(calculateMaximumLowIncomeTaxOffset2025_26(66666)).toBe(0.01);
    expect(calculateMaximumLowIncomeTaxOffset2025_26(66667)).toBe(0);
    expect(calculateMaximumLowIncomeTaxOffset2025_26(66668)).toBe(0);
  });

  it("does not allow LITO to reduce income tax below zero", () => {
    const taxFreeThresholdEstimate = estimateAustralianTax2025_26({
      taxableIncome: 18200,
      includeMedicareLevy: false,
    });
    const lowIncomeEstimate = estimateAustralianTax2025_26({
      taxableIncome: 20000,
      includeMedicareLevy: false,
    });

    expect(calculateLowIncomeTaxOffset2025_26(18200)).toBe(0);
    expect(taxFreeThresholdEstimate.incomeTaxAfterOffsets).toBe(0);
    expect(lowIncomeEstimate.baseIncomeTaxBeforeOffsets).toBe(288);
    expect(lowIncomeEstimate.lowIncomeTaxOffset).toBe(288);
    expect(lowIncomeEstimate.incomeTaxAfterOffsets).toBe(0);
  });

  it("toggles the simplified Medicare levy", () => {
    expect(calculateSimplifiedMedicareLevy(90000, true)).toBe(1800);
    expect(calculateSimplifiedMedicareLevy(90000, false)).toBe(0);

    expect(
      estimateAustralianTax2025_26({
        taxableIncome: 90000,
        includeMedicareLevy: true,
      }).medicareLevy,
    ).toBe(1800);
    expect(
      estimateAustralianTax2025_26({
        taxableIncome: 90000,
        includeMedicareLevy: false,
      }).medicareLevy,
    ).toBe(0);
  });

  it("safely handles negative taxable income", () => {
    const estimate = estimateAustralianTax2025_26({
      taxableIncome: -1000,
      includeMedicareLevy: true,
    });

    expect(calculateResidentIncomeTax2025_26(-1000)).toBe(0);
    expect(calculateLowIncomeTaxOffset2025_26(-1000)).toBe(0);
    expect(calculateSimplifiedMedicareLevy(-1000, true)).toBe(0);
    expect(estimate.taxableIncome).toBe(0);
    expect(estimate.totalEstimatedTax).toBe(0);
    expect(estimate.caveats).toContain(
      "Negative taxable income inputs are treated as zero.",
    );
  });

  it("rejects non-finite taxable income", () => {
    expect(() => calculateResidentIncomeTax2025_26(Number.NaN)).toThrow(
      "Taxable income must be a finite number.",
    );
    expect(() =>
      estimateAustralianTax2025_26({
        taxableIncome: Number.POSITIVE_INFINITY,
        includeMedicareLevy: false,
      }),
    ).toThrow("Taxable income must be a finite number.");
  });

  it("returns representative sample estimates", () => {
    expect(
      estimateAustralianTax2025_26({
        taxableIncome: 45000,
        includeMedicareLevy: false,
      }),
    ).toMatchObject({
      taxableIncome: 45000,
      incomeYear: "2025-26",
      baseIncomeTaxBeforeOffsets: 4288,
      lowIncomeTaxOffset: 325,
      incomeTaxAfterOffsets: 3963,
      medicareLevy: 0,
      totalEstimatedTax: 3963,
    });

    expect(
      estimateAustralianTax2025_26({
        taxableIncome: 90000,
        includeMedicareLevy: false,
      }),
    ).toMatchObject({
      baseIncomeTaxBeforeOffsets: 17788,
      lowIncomeTaxOffset: 0,
      incomeTaxAfterOffsets: 17788,
      medicareLevy: 0,
      totalEstimatedTax: 17788,
    });

    expect(
      estimateAustralianTax2025_26({
        taxableIncome: 90000,
        includeMedicareLevy: true,
      }),
    ).toMatchObject({
      incomeTaxAfterOffsets: 17788,
      medicareLevy: 1800,
      totalEstimatedTax: 19588,
    });

    expect(
      estimateAustralianTax2025_26({
        taxableIncome: 135000,
        includeMedicareLevy: false,
      }).baseIncomeTaxBeforeOffsets,
    ).toBe(31288);
    expect(
      estimateAustralianTax2025_26({
        taxableIncome: 190000,
        includeMedicareLevy: false,
      }).baseIncomeTaxBeforeOffsets,
    ).toBe(51638);
    expect(
      estimateAustralianTax2025_26({
        taxableIncome: 200000,
        includeMedicareLevy: false,
      }).baseIncomeTaxBeforeOffsets,
    ).toBe(56138);
  });

  it("returns caveats and source IDs with the structured result", () => {
    const estimate = estimateAustralianTax2025_26({
      taxableIncome: 90000,
      includeMedicareLevy: true,
    });

    expect(estimate.caveats).toContain(SIMPLIFIED_MEDICARE_LEVY_CAVEAT);
    expect(estimate.sourceIds).toEqual([
      "ato-resident-tax-rates-2025-26",
      "ato-low-income-tax-offset",
      "ato-medicare-levy",
    ]);
  });
});

describe("tax bracket walk", () => {
  it.each([45000, 90000, 200000, 0, 18000])(
    "sums to the engine total for taxable income %s",
    (taxableIncome) => {
      const rows = buildBracketWalk(taxableIncome, {
        includeMedicareLevy: true,
      });
      const estimate = estimateAustralianTax2025_26({
        taxableIncome,
        includeMedicareLevy: true,
      });
      const rowTotal = roundMoney(
        rows.reduce((total, row) => total + row.amount, 0),
      );

      expect(rowTotal).toBe(estimate.totalEstimatedTax);
    },
  );

  it("caps the LITO row so the income tax subtotal never goes negative", () => {
    const rows = buildBracketWalk(20000, { includeMedicareLevy: false });
    const incomeTaxSubtotal = roundMoney(
      rows.reduce((total, row) => total + row.amount, 0),
    );

    expect(rows.find((row) => row.id === "lito")?.amount).toBe(-288);
    expect(incomeTaxSubtotal).toBe(0);
  });

  it("only includes the Medicare levy row when it is enabled", () => {
    expect(
      buildBracketWalk(90000, { includeMedicareLevy: true }).some(
        (row) => row.id === "medicare-levy",
      ),
    ).toBe(true);
    expect(
      buildBracketWalk(90000, { includeMedicareLevy: false }).some(
        (row) => row.id === "medicare-levy",
      ),
    ).toBe(false);
  });

  it("emits bracket rows in ascending order", () => {
    const lowerBounds = buildBracketWalk(200000, {
      includeMedicareLevy: true,
    })
      .filter((row) => row.kind === "bracket")
      .map((row) => row.lowerBoundInclusive ?? 0);

    expect(lowerBounds).toEqual([...lowerBounds].sort((a, b) => a - b));
  });
});
