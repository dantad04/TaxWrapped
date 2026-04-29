import type {
  AustralianTaxEstimate,
  EstimateAustralianTaxInput,
  TaxBracket,
  TaxIncomeYear,
  TaxSourceId,
} from "./model";

export const AUSTRALIAN_RESIDENT_TAX_INCOME_YEAR =
  "2025-26" satisfies TaxIncomeYear;

export const TAX_ENGINE_SOURCE_IDS = [
  "ato-resident-tax-rates-2025-26",
  "ato-low-income-tax-offset",
  "ato-medicare-levy",
] as const satisfies readonly TaxSourceId[];

export const SIMPLIFIED_MEDICARE_LEVY_CAVEAT =
  "Simplified Medicare levy is calculated as 2% of taxable income and does not apply reductions, exemptions, family thresholds, or Medicare levy surcharge.";

export const TAX_ESTIMATE_CAVEATS = [
  "Input must be taxable income, not gross salary.",
  "Estimate is for Australian resident individuals for 2025-26.",
  "Estimate excludes HELP/HECS repayments, Medicare levy surcharge, Medicare levy reductions and exemptions, spouse/dependant/family Medicare thresholds, offsets other than LITO, non-resident rules, working holiday maker rules, deductions, business income complexity, and capital gains complexity.",
  SIMPLIFIED_MEDICARE_LEVY_CAVEAT,
] as const;

export const RESIDENT_TAX_BRACKETS_2025_26 = [
  {
    lowerBoundInclusive: 0,
    upperBoundInclusive: 18200,
    baseTax: 0,
    rate: 0,
    threshold: 0,
  },
  {
    lowerBoundInclusive: 18200.01,
    upperBoundInclusive: 45000,
    baseTax: 0,
    rate: 0.16,
    threshold: 18200,
  },
  {
    lowerBoundInclusive: 45000.01,
    upperBoundInclusive: 135000,
    baseTax: 4288,
    rate: 0.3,
    threshold: 45000,
  },
  {
    lowerBoundInclusive: 135000.01,
    upperBoundInclusive: 190000,
    baseTax: 31288,
    rate: 0.37,
    threshold: 135000,
  },
  {
    lowerBoundInclusive: 190000.01,
    upperBoundInclusive: null,
    baseTax: 51638,
    rate: 0.45,
    threshold: 190000,
  },
] as const satisfies readonly TaxBracket[];

function assertFiniteTaxableIncome(taxableIncome: number): void {
  if (!Number.isFinite(taxableIncome)) {
    throw new TypeError("Taxable income must be a finite number.");
  }
}

function normaliseTaxableIncome(taxableIncome: number): number {
  assertFiniteTaxableIncome(taxableIncome);

  return roundMoney(Math.max(0, taxableIncome));
}

function roundMoney(amount: number): number {
  return Math.round((amount + Number.EPSILON) * 100) / 100;
}

function getResidentTaxBracket(taxableIncome: number): TaxBracket {
  const bracket = RESIDENT_TAX_BRACKETS_2025_26.find((candidate) => {
    const belowUpperBound =
      candidate.upperBoundInclusive === null ||
      taxableIncome <= candidate.upperBoundInclusive;

    return taxableIncome >= candidate.lowerBoundInclusive && belowUpperBound;
  });

  if (!bracket) {
    return RESIDENT_TAX_BRACKETS_2025_26[0];
  }

  return bracket;
}

export function calculateResidentIncomeTax2025_26(
  taxableIncome: number,
): number {
  const safeTaxableIncome = normaliseTaxableIncome(taxableIncome);
  const bracket = getResidentTaxBracket(safeTaxableIncome);
  const tax =
    bracket.baseTax +
    Math.max(0, safeTaxableIncome - bracket.threshold) * bracket.rate;

  return roundMoney(Math.max(0, tax));
}

export function calculateMaximumLowIncomeTaxOffset2025_26(
  taxableIncome: number,
): number {
  const safeTaxableIncome = normaliseTaxableIncome(taxableIncome);

  if (safeTaxableIncome <= 37500) {
    return 700;
  }

  if (safeTaxableIncome <= 45000) {
    return roundMoney(700 - (safeTaxableIncome - 37500) * 0.05);
  }

  if (safeTaxableIncome <= 66667) {
    return roundMoney(Math.max(0, 325 - (safeTaxableIncome - 45000) * 0.015));
  }

  return 0;
}

export function calculateLowIncomeTaxOffset2025_26(
  taxableIncome: number,
): number {
  const baseIncomeTax = calculateResidentIncomeTax2025_26(taxableIncome);
  const maximumOffset =
    calculateMaximumLowIncomeTaxOffset2025_26(taxableIncome);

  return roundMoney(Math.min(baseIncomeTax, maximumOffset));
}

export function calculateSimplifiedMedicareLevy(
  taxableIncome: number,
  includeMedicareLevy: boolean,
): number {
  const safeTaxableIncome = normaliseTaxableIncome(taxableIncome);

  if (!includeMedicareLevy) {
    return 0;
  }

  return roundMoney(safeTaxableIncome * 0.02);
}

export function estimateAustralianTax2025_26({
  taxableIncome,
  includeMedicareLevy = true,
}: EstimateAustralianTaxInput): AustralianTaxEstimate {
  const safeTaxableIncome = normaliseTaxableIncome(taxableIncome);
  const baseIncomeTaxBeforeOffsets =
    calculateResidentIncomeTax2025_26(safeTaxableIncome);
  const lowIncomeTaxOffset =
    calculateLowIncomeTaxOffset2025_26(safeTaxableIncome);
  const incomeTaxAfterOffsets = roundMoney(
    Math.max(0, baseIncomeTaxBeforeOffsets - lowIncomeTaxOffset),
  );
  const medicareLevy = calculateSimplifiedMedicareLevy(
    safeTaxableIncome,
    includeMedicareLevy,
  );
  const totalEstimatedTax = roundMoney(incomeTaxAfterOffsets + medicareLevy);
  const caveats =
    taxableIncome < 0
      ? [
          ...TAX_ESTIMATE_CAVEATS,
          "Negative taxable income inputs are treated as zero.",
        ]
      : TAX_ESTIMATE_CAVEATS;

  return {
    taxableIncome: safeTaxableIncome,
    incomeYear: AUSTRALIAN_RESIDENT_TAX_INCOME_YEAR,
    baseIncomeTaxBeforeOffsets,
    lowIncomeTaxOffset,
    incomeTaxAfterOffsets,
    medicareLevy,
    totalEstimatedTax,
    caveats,
    sourceIds: TAX_ENGINE_SOURCE_IDS,
  };
}
