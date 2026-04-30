import type {
  BudgetAllocationSummary,
  BudgetFunctionAllocation,
  SpotlightAllocation,
} from "@/lib/allocation/model";
import type { BudgetFunctionSlug, SpotlightProgramSlug } from "@/lib/budget/model";

export type ChartTone = "blue" | "green" | "magenta" | "red";

export interface AllocationChartSegment {
  id: BudgetFunctionSlug;
  label: string;
  amount: number;
  amountCents: number;
  shareOfTotal: number;
  tone: ChartTone;
  additive: true;
}

export interface SummaryChartRow {
  id: BudgetFunctionSlug | "remaining-additive-functions";
  label: string;
  amount: number;
  amountCents: number;
  shareOfTotal: number;
  tone: ChartTone;
  additive: true;
  sourceSlugs: readonly BudgetFunctionSlug[];
}

export interface SpotlightChartMarker {
  id: SpotlightProgramSlug;
  label: string;
  amount: number;
  amountCents: number;
  shareOfAdditiveBudget: number;
  tone: ChartTone;
  additive: false;
  parentFunctionSlug: BudgetFunctionSlug;
}

const budgetFunctionTones: Partial<Record<BudgetFunctionSlug, ChartTone>> = {
  defence: "red",
  education: "blue",
  "fuel-energy": "green",
  health: "green",
  "other-purposes": "blue",
  "social-security-welfare": "magenta",
};

const spotlightTones: Partial<Record<SpotlightProgramSlug, ChartTone>> = {
  "commonwealth-debt-management": "red",
  "revenue-assistance-states-territories": "blue",
};

const fallbackTones: readonly ChartTone[] = [
  "magenta",
  "green",
  "blue",
  "red",
];

function getFallbackTone(index: number): ChartTone {
  return fallbackTones[index % fallbackTones.length];
}

export function getBudgetFunctionChartTone(
  slug: BudgetFunctionSlug,
  index = 0,
): ChartTone {
  return budgetFunctionTones[slug] ?? getFallbackTone(index);
}

export function getSpotlightChartTone(
  slug: SpotlightProgramSlug,
  index = 0,
): ChartTone {
  return spotlightTones[slug] ?? getFallbackTone(index);
}

function getTotalCents(items: readonly { amountCents: number }[]): number {
  return items.reduce((total, item) => total + item.amountCents, 0);
}

function getShare(amountCents: number, totalCents: number): number {
  return totalCents > 0 ? amountCents / totalCents : 0;
}

function sortByAmountDescending<T extends { amountCents: number; label: string }>(
  items: readonly T[],
): T[] {
  return items
    .slice()
    .sort(
      (left, right) =>
        right.amountCents - left.amountCents ||
        left.label.localeCompare(right.label),
    );
}

export function buildAllocationChartSegments(
  allocations: readonly BudgetFunctionAllocation[],
): AllocationChartSegment[] {
  const totalCents = getTotalCents(allocations);

  return sortByAmountDescending(allocations).map((allocation, index) => ({
    id: allocation.slug,
    label: allocation.label,
    amount: allocation.amount,
    amountCents: allocation.amountCents,
    shareOfTotal: getShare(allocation.amountCents, totalCents),
    tone: getBudgetFunctionChartTone(allocation.slug, index),
    additive: true,
  }));
}

export function buildSummaryChartRows(
  summary: BudgetAllocationSummary,
  maxRows = 7,
): SummaryChartRow[] {
  const sortedAllocations = sortByAmountDescending(summary.allocations);
  const visibleCount = Math.max(1, maxRows - 1);
  const visibleAllocations = sortedAllocations.slice(0, visibleCount);
  const remainingAllocations = sortedAllocations.slice(visibleCount);
  const rows: SummaryChartRow[] = visibleAllocations.map(
    (allocation, index) => ({
      id: allocation.slug,
      label: allocation.label,
      amount: allocation.amount,
      amountCents: allocation.amountCents,
      shareOfTotal: getShare(
        allocation.amountCents,
        summary.inputTaxAmountCents,
      ),
      tone: getBudgetFunctionChartTone(allocation.slug, index),
      additive: true,
      sourceSlugs: [allocation.slug],
    }),
  );

  if (remainingAllocations.length > 0) {
    const amountCents = getTotalCents(remainingAllocations);

    rows.push({
      id: "remaining-additive-functions",
      label: "All other additive functions",
      amount: amountCents / 100,
      amountCents,
      shareOfTotal: getShare(amountCents, summary.inputTaxAmountCents),
      tone: "red",
      additive: true,
      sourceSlugs: remainingAllocations.map((allocation) => allocation.slug),
    });
  }

  return rows;
}

export function buildSpotlightChartMarker(
  allocation: SpotlightAllocation,
  index = 0,
): SpotlightChartMarker {
  return {
    id: allocation.slug,
    label: allocation.label,
    amount: allocation.amount,
    amountCents: allocation.amountCents,
    shareOfAdditiveBudget: allocation.shareOfAdditiveBudget,
    tone: getSpotlightChartTone(allocation.slug, index),
    additive: false,
    parentFunctionSlug: allocation.parentFunctionSlug,
  };
}

export function sumChartRowCents(
  rows: readonly { amountCents: number }[],
): number {
  return rows.reduce((total, row) => total + row.amountCents, 0);
}
