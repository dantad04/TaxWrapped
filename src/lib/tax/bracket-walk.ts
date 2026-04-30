import {
  calculateResidentIncomeTax2025_26,
  estimateAustralianTax2025_26,
  RESIDENT_TAX_BRACKETS_2025_26,
} from "./australian-resident-2025-26";

export type BracketWalkRowKind = "bracket" | "offset" | "levy";

export interface BracketWalkRow {
  id: string;
  kind: BracketWalkRowKind;
  label: string;
  rateLabel?: string;
  taxableAmount: number | null;
  amount: number;
  lowerBoundInclusive?: number;
  upperBoundInclusive?: number | null;
}

export interface BuildBracketWalkOptions {
  includeMedicareLevy?: boolean;
}

function roundMoney(amount: number): number {
  return Math.round((amount + Number.EPSILON) * 100) / 100;
}

function formatWholeCurrency(amount: number): string {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    maximumFractionDigits: 0,
  }).format(Math.round(amount));
}

function formatBracketRange(
  upperBoundInclusive: number | null,
  threshold: number,
): string {
  if (upperBoundInclusive === null) {
    return `${formatWholeCurrency(threshold + 1)}+`;
  }

  if (threshold === 0) {
    return `${formatWholeCurrency(0)} - ${formatWholeCurrency(upperBoundInclusive)}`;
  }

  return `${formatWholeCurrency(threshold + 1)} - ${formatWholeCurrency(upperBoundInclusive)}`;
}

export function buildBracketWalk(
  taxableIncome: number,
  { includeMedicareLevy = true }: BuildBracketWalkOptions = {},
): BracketWalkRow[] {
  const estimate = estimateAustralianTax2025_26({
    taxableIncome,
    includeMedicareLevy,
  });
  const rows: BracketWalkRow[] = RESIDENT_TAX_BRACKETS_2025_26.flatMap(
    (bracket, index): BracketWalkRow[] => {
      const upperBound = bracket.upperBoundInclusive ?? estimate.taxableIncome;
      const bracketEnd = Math.min(estimate.taxableIncome, upperBound);
      const taxableAmount = roundMoney(
        Math.max(0, bracketEnd - bracket.threshold),
      );

      if (
        taxableAmount <= 0 &&
        !(estimate.taxableIncome === 0 && index === 0)
      ) {
        return [];
      }

      const bracketTax = roundMoney(
        calculateResidentIncomeTax2025_26(bracketEnd) -
          calculateResidentIncomeTax2025_26(bracket.threshold),
      );

      return [
        {
          id: `bracket-${index}`,
          kind: "bracket",
          label: formatBracketRange(
            bracket.upperBoundInclusive,
            bracket.threshold,
          ),
          rateLabel: `${Math.round(bracket.rate * 100)}%`,
          taxableAmount,
          amount: bracketTax,
          lowerBoundInclusive: bracket.lowerBoundInclusive,
          upperBoundInclusive: bracket.upperBoundInclusive,
        },
      ];
    },
  );

  rows.push({
    id: "lito",
    kind: "offset",
    label: "Low income tax offset",
    taxableAmount: null,
    amount:
      estimate.lowIncomeTaxOffset > 0 ? -estimate.lowIncomeTaxOffset : 0,
  });

  if (includeMedicareLevy) {
    rows.push({
      id: "medicare-levy",
      kind: "levy",
      label: "Medicare levy (2%)",
      taxableAmount: null,
      amount: estimate.medicareLevy,
    });
  }

  return rows;
}
