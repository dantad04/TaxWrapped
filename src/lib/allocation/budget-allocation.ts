import { budget2025_26 } from "@/data/budget-2025-26";
import { budgetSources } from "@/data/sources";
import {
  getSpotlightPrograms,
  getTopLevelExpenseFunctions,
  getTopLevelFunctionTotalAudMillions,
} from "@/lib/budget/budget-data";
import type {
  BudgetDataset,
  BudgetSource,
  SpotlightProgram,
  TopLevelExpenseFunction,
} from "@/lib/budget/model";
import type {
  BudgetAllocationSummary,
  SpotlightAllocationSummary,
} from "./model";
import {
  allocateAmountByWeights,
  amountToCents,
  centsToAmount,
} from "./rounding";

export const BUDGET_ALLOCATION_CAVEATS = [
  "Allocation is proportional and illustrative only.",
  "Taxes are not hypothecated; allocations are proportional category estimates, not literal earmarking.",
  "Final summary allocations use additive top-level Budget functions only.",
  "Spotlight program allocations are non-additive highlights and must not be added to the final summary total.",
  "Rounding uses a deterministic largest-remainder method at cent precision and preserves the user's estimated tax total.",
] as const;

export const SPOTLIGHT_ALLOCATION_CAVEATS = [
  "Spotlight allocations are proportional and illustrative only.",
  "Taxes are not hypothecated; spotlight allocations are proportional estimates, not literal earmarking.",
  "Spotlight programs are non-additive highlights and must not be added to the final summary total.",
  "Spotlight amounts are independently rounded to cents because they are not a reconciled summary.",
] as const;

function getBudgetSource(sourceId: string): BudgetSource | null {
  return budgetSources[sourceId as keyof typeof budgetSources] ?? null;
}

function assertValidTaxAmount(totalTaxAmount: number): void {
  if (!Number.isFinite(totalTaxAmount)) {
    throw new TypeError("Tax amount must be a finite number.");
  }

  if (totalTaxAmount < 0) {
    throw new RangeError("Tax amount must not be negative.");
  }
}

function buildFunctionWeights(
  dataset: BudgetDataset,
): readonly {
  id: string;
  label: string;
  weight: number;
  metadata: TopLevelExpenseFunction;
}[] {
  return getTopLevelExpenseFunctions(dataset).map((item) => ({
    id: item.slug,
    label: item.label,
    weight: item.amountAudMillions,
    metadata: item,
  }));
}

function buildSpotlightWeights(
  dataset: BudgetDataset,
): readonly {
  id: string;
  label: string;
  weight: number;
  metadata: SpotlightProgram;
}[] {
  return getSpotlightPrograms(dataset).map((item) => ({
    id: item.slug,
    label: item.label,
    weight: item.amountAudMillions,
    metadata: item,
  }));
}

export function allocateTaxAcrossBudgetFunctions(
  totalTaxAmount: number,
  dataset: BudgetDataset = budget2025_26,
): BudgetAllocationSummary {
  assertValidTaxAmount(totalTaxAmount);

  const inputTaxAmountCents = amountToCents(totalTaxAmount);
  const inputTaxAmount = centsToAmount(inputTaxAmountCents);
  const additiveWeightTotalAudMillions =
    getTopLevelFunctionTotalAudMillions(dataset);
  const weightedAllocations = allocateAmountByWeights(
    inputTaxAmount,
    buildFunctionWeights(dataset),
  );

  return {
    inputTaxAmount,
    inputTaxAmountCents,
    incomeYear: dataset.budgetYear,
    budgetTotalExpensesAudMillions: dataset.totalExpensesAudMillions,
    additiveWeightTotalAudMillions,
    roundingStrategy: "largest-remainder-cents-stable-order",
    caveats: BUDGET_ALLOCATION_CAVEATS,
    allocations: weightedAllocations.map((allocation) => ({
      kind: "budget-function-allocation",
      slug: allocation.metadata.slug,
      label: allocation.metadata.label,
      amount: allocation.amount,
      amountCents: allocation.amountCents,
      shareOfAdditiveBudget: allocation.weightShare,
      budgetExpenseAudMillions: allocation.metadata.amountAudMillions,
      sourceId: allocation.metadata.sourceId,
      source: getBudgetSource(allocation.metadata.sourceId),
      note: allocation.metadata.note,
      additive: true,
    })),
  };
}

export function calculateSpotlightAllocation(
  totalTaxAmount: number,
  dataset: BudgetDataset = budget2025_26,
): SpotlightAllocationSummary {
  assertValidTaxAmount(totalTaxAmount);

  const inputTaxAmountCents = amountToCents(totalTaxAmount);
  const inputTaxAmount = centsToAmount(inputTaxAmountCents);
  const additiveWeightTotalAudMillions =
    getTopLevelFunctionTotalAudMillions(dataset);
  const spotlightWeights = buildSpotlightWeights(dataset);
  const weightedAllocations = spotlightWeights.map((item) => {
    const exactCents =
      (inputTaxAmountCents * item.weight) / additiveWeightTotalAudMillions;
    const amountCents = Math.round(exactCents);

    return {
      item,
      amountCents,
      amount: centsToAmount(amountCents),
      shareOfAdditiveBudget: item.weight / additiveWeightTotalAudMillions,
    };
  });

  return {
    inputTaxAmount,
    inputTaxAmountCents,
    incomeYear: dataset.budgetYear,
    additiveWeightTotalAudMillions,
    roundingStrategy: "independent-cent-rounding-non-additive",
    caveats: SPOTLIGHT_ALLOCATION_CAVEATS,
    allocations: weightedAllocations.map(
      ({ item, amountCents, amount, shareOfAdditiveBudget }) => ({
        kind: "spotlight-allocation",
        slug: item.metadata.slug,
        label: item.metadata.label,
        amount,
        amountCents,
        shareOfAdditiveBudget,
        budgetExpenseAudMillions: item.metadata.amountAudMillions,
        sourceId: item.metadata.sourceId,
        source: getBudgetSource(item.metadata.sourceId),
        note: item.metadata.note,
        additive: false,
        parentFunctionSlug: item.metadata.parentFunctionSlug,
      }),
    ),
  };
}
