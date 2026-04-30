import { auBudget2025_26 } from "@/data/auBudget2025_26";

export const COMMONWEALTH_TOTAL_EXPENSES_M = auBudget2025_26.totalExpensesM;

const wholeNumberFormatter = new Intl.NumberFormat("en-AU", {
  maximumFractionDigits: 0,
});

export function formatCommonwealthBill(
  totalExpensesM: number = COMMONWEALTH_TOTAL_EXPENSES_M,
): string {
  return `$${(totalExpensesM / 1_000).toFixed(1)}B`;
}

export function calculateReceiptScaleDenominator(
  userTaxAud: number,
  totalExpensesM: number = COMMONWEALTH_TOTAL_EXPENSES_M,
): number | null {
  if (!Number.isFinite(userTaxAud) || userTaxAud <= 0) {
    return null;
  }

  const denominator = (totalExpensesM * 1_000_000) / userTaxAud;

  if (denominator > 100_000) {
    return Math.round(denominator / 1_000) * 1_000;
  }

  return Math.round(denominator);
}

export function formatReceiptScaleDenominator(denominator: number): string {
  return wholeNumberFormatter.format(denominator);
}
