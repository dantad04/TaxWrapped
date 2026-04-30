import type { BudgetAllocationSummary } from "@/lib/allocation/model";
import {
  buildSummaryChartRows,
  sumChartRowCents,
  type SummaryChartRow,
} from "@/lib/charts/budget-chart-data";

export interface ShareCardAllocationRow extends SummaryChartRow {
  displayLabel: string;
}

export interface ShareCardData {
  productName: string;
  estimatedTaxAmount: number;
  estimatedTaxAmountCents: number;
  budgetYear: string;
  sourceYearLabel: string;
  rows: ShareCardAllocationRow[];
  caveat: string;
  methodologyLabel: string;
}

const displayLabels: Partial<Record<SummaryChartRow["id"], string>> = {
  "remaining-additive-functions": "All other additive functions",
  "social-security-welfare": "Social security & welfare",
};

function getDisplayLabel(row: SummaryChartRow): string {
  return displayLabels[row.id] ?? row.label;
}

export function buildShareCardData(
  summary: BudgetAllocationSummary,
): ShareCardData {
  return {
    productName: "Australian Budget Wrapped",
    estimatedTaxAmount: summary.inputTaxAmount,
    estimatedTaxAmountCents: summary.inputTaxAmountCents,
    budgetYear: summary.incomeYear,
    sourceYearLabel: `${summary.incomeYear} Budget`,
    rows: buildSummaryChartRows(summary, 6).map((row) => ({
      ...row,
      displayLabel: getDisplayLabel(row),
    })),
    caveat: "Illustrative estimate. Taxes are not hypothecated.",
    methodologyLabel: "Methodology + sources in app",
  };
}

export function sumShareCardRowCents(
  rows: readonly { amountCents: number }[],
): number {
  return sumChartRowCents(rows);
}
