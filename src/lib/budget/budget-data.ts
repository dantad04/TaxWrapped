import { budget2025_26 } from "@/data/budget-2025-26";
import { budgetSources } from "@/data/sources";
import type {
  BudgetDataset,
  BudgetSource,
  SpotlightProgram,
  TopLevelExpenseFunction,
} from "./model";

export function getCurrentBudgetDataset() {
  return budget2025_26;
}

export function getBudgetSources(): Readonly<Record<string, BudgetSource>> {
  return budgetSources;
}

export function getTopLevelExpenseFunctions(
  dataset: BudgetDataset = budget2025_26,
): readonly TopLevelExpenseFunction[] {
  return dataset.topLevelFunctions;
}

export function getSpotlightPrograms(
  dataset: BudgetDataset = budget2025_26,
): readonly SpotlightProgram[] {
  return dataset.spotlightPrograms;
}

export function sumAudMillions(
  items: readonly { amountAudMillions: number }[],
): number {
  return items.reduce((total, item) => total + item.amountAudMillions, 0);
}

export function getTopLevelFunctionTotalAudMillions(
  dataset: BudgetDataset = budget2025_26,
): number {
  return sumAudMillions(dataset.topLevelFunctions);
}

export function isWithinPublishedTotalTolerance(
  dataset: BudgetDataset = budget2025_26,
): boolean {
  const difference = Math.abs(
    getTopLevelFunctionTotalAudMillions(dataset) -
      dataset.totalExpensesAudMillions,
  );

  return difference <= dataset.roundingToleranceAudMillions;
}
