import type { SourceId } from "@/data/sources";

export type TaxIncomeYear = "2025-26";

export type TaxSourceId = Extract<
  SourceId,
  | "ato-resident-tax-rates-2025-26"
  | "ato-low-income-tax-offset"
  | "ato-medicare-levy"
>;

export interface TaxBracket {
  lowerBoundInclusive: number;
  upperBoundInclusive: number | null;
  baseTax: number;
  rate: number;
  threshold: number;
}

export interface EstimateAustralianTaxInput {
  taxableIncome: number;
  includeMedicareLevy?: boolean;
}

export interface AustralianTaxEstimate {
  taxableIncome: number;
  incomeYear: TaxIncomeYear;
  baseIncomeTaxBeforeOffsets: number;
  lowIncomeTaxOffset: number;
  incomeTaxAfterOffsets: number;
  medicareLevy: number;
  totalEstimatedTax: number;
  caveats: readonly string[];
  sourceIds: readonly TaxSourceId[];
}
