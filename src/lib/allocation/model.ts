import type {
  BudgetDataset,
  BudgetFunctionSlug,
  BudgetSource,
  SpotlightProgramSlug,
} from "@/lib/budget/model";

export interface WeightedAllocationInput<TMetadata = unknown> {
  id: string;
  label: string;
  weight: number;
  metadata: TMetadata;
}

export interface WeightedAllocationResult<TMetadata = unknown> {
  id: string;
  label: string;
  weight: number;
  weightShare: number;
  unroundedAmount: number;
  amount: number;
  amountCents: number;
  remainder: number;
  metadata: TMetadata;
}

export interface BudgetFunctionAllocation {
  kind: "budget-function-allocation";
  slug: BudgetFunctionSlug;
  label: string;
  amount: number;
  amountCents: number;
  shareOfAdditiveBudget: number;
  budgetExpenseAudMillions: number;
  sourceId: string;
  source: BudgetSource | null;
  note: string;
  additive: true;
}

export interface SpotlightAllocation {
  kind: "spotlight-allocation";
  slug: SpotlightProgramSlug;
  label: string;
  amount: number;
  amountCents: number;
  shareOfAdditiveBudget: number;
  budgetExpenseAudMillions: number;
  sourceId: string;
  source: BudgetSource | null;
  note: string;
  additive: false;
  parentFunctionSlug: BudgetFunctionSlug;
}

export interface BudgetAllocationSummary {
  inputTaxAmount: number;
  inputTaxAmountCents: number;
  incomeYear: BudgetDataset["budgetYear"];
  budgetTotalExpensesAudMillions: number;
  additiveWeightTotalAudMillions: number;
  roundingStrategy: "largest-remainder-cents-stable-order";
  caveats: readonly string[];
  allocations: readonly BudgetFunctionAllocation[];
}

export interface SpotlightAllocationSummary {
  inputTaxAmount: number;
  inputTaxAmountCents: number;
  incomeYear: BudgetDataset["budgetYear"];
  additiveWeightTotalAudMillions: number;
  roundingStrategy: "independent-cent-rounding-non-additive";
  caveats: readonly string[];
  allocations: readonly SpotlightAllocation[];
}
