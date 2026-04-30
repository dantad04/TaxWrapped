import type { SourceId } from "@/data/sources";

export type BudgetDrilldownYear = `${number}-${number}`;

export type BudgetDrilldownAllocationMode = "direct" | "proportional";

export interface ProgramCallout {
  id: string;
  label: string;
  descriptionShort: string;
  sourceId: SourceId;
  sourceLocator: string;
  amountM: number;
}

export interface BudgetDrilldownNode {
  id: string;
  label: string;
  amountM: number;
  sourceId: SourceId;
  source: string;
  sourceUrl: string;
  sourceLocator: string;
  description: string;
  allocationMode: BudgetDrilldownAllocationMode;
  allocationBasisM?: number;
  callouts?: readonly ProgramCallout[];
  children?: readonly BudgetDrilldownNode[];
}

export interface BudgetDrilldownDataset {
  budgetYear: BudgetDrilldownYear;
  totalExpensesM: number;
  sourceIds: readonly SourceId[];
  categories: readonly BudgetDrilldownNode[];
}

export interface BudgetDrilldownAllocationRow {
  id: string;
  label: string;
  amount: number;
  amountCents: number;
  budgetAmountM: number;
  description: string;
  source: string;
  sourceUrl: string;
  sourceLocator: string;
  allocationMode: BudgetDrilldownAllocationMode;
  hasChildren: boolean;
}

export interface BudgetProgramCalloutAllocationRow {
  id: string;
  label: string;
  descriptionShort: string;
  amount: number;
  amountCents: number;
  budgetAmountM: number;
  sourceId: SourceId;
  sourceLocator: string;
}

export interface BudgetDrilldownView {
  node: BudgetDrilldownNode;
  path: readonly BudgetDrilldownNode[];
  contributionAmount: number;
  contributionAmountCents: number;
  rows: readonly BudgetDrilldownAllocationRow[];
}
