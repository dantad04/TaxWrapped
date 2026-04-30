import { auBudget2025_26 } from "@/data/auBudget2025_26";
import type {
  BudgetDrilldownAllocationRow,
  BudgetDrilldownDataset,
  BudgetDrilldownNode,
  BudgetProgramCalloutAllocationRow,
  BudgetDrilldownView,
  ProgramCallout,
} from "./drilldown-model";

function amountToCents(amount: number): number {
  return Math.round((amount + Number.EPSILON) * 100);
}

function centsToAmount(cents: number): number {
  return Math.round(cents) / 100;
}

function getChildren(node: BudgetDrilldownNode): readonly BudgetDrilldownNode[] {
  return node.children?.length ? node.children : [node];
}

function getAllocationBasisM(node: BudgetDrilldownNode): number {
  return node.allocationBasisM ?? node.amountM;
}

function allocateChildrenByBasis(
  parentContributionCents: number,
  parent: BudgetDrilldownNode,
): readonly BudgetDrilldownAllocationRow[] {
  const children = getChildren(parent);
  const basisM = getAllocationBasisM(parent);
  const initial = children.map((child, index) => {
    const exactCents = (parentContributionCents * child.amountM) / basisM;
    const floorCents = Math.floor(exactCents);

    return {
      child,
      index,
      floorCents,
      remainder: exactCents - floorCents,
    };
  });
  const floorTotal = initial.reduce((sum, item) => sum + item.floorCents, 0);
  const delta = parentContributionCents - floorTotal;
  const adjustedIndexes = new Map<number, number>();

  if (delta > 0) {
    for (const item of [...initial]
      .sort(
        (left, right) =>
          right.remainder - left.remainder || left.index - right.index,
      )
      .slice(0, delta)) {
      adjustedIndexes.set(item.index, 1);
    }
  }

  if (delta < 0) {
    for (const item of [...initial]
      .filter((entry) => entry.floorCents > 0)
      .sort(
        (left, right) =>
          left.remainder - right.remainder || left.index - right.index,
      )
      .slice(0, Math.abs(delta))) {
      adjustedIndexes.set(item.index, -1);
    }
  }

  return initial.map(({ child, index, floorCents }) => {
    const amountCents = floorCents + (adjustedIndexes.get(index) ?? 0);

    return {
      id: child.id,
      label: child.label,
      amount: centsToAmount(amountCents),
      amountCents,
      budgetAmountM: child.amountM,
      description: child.description,
      source: child.source,
      sourceUrl: child.sourceUrl,
      sourceLocator: child.sourceLocator,
      allocationMode: child.allocationMode,
      hasChildren: Boolean(child.children?.length),
    };
  });
}

function allocateProgramCalloutsByBasis(
  parentContributionCents: number,
  parent: BudgetDrilldownNode,
  callouts: readonly ProgramCallout[],
): readonly BudgetProgramCalloutAllocationRow[] {
  if (callouts.length === 0) {
    return [];
  }

  const basisM = getAllocationBasisM(parent);
  const initial = callouts.map((callout, index) => {
    const exactCents = (parentContributionCents * callout.amountM) / basisM;
    const floorCents = Math.floor(exactCents);

    return {
      callout,
      index,
      exactCents,
      floorCents,
      remainder: exactCents - floorCents,
    };
  });
  const floorTotal = initial.reduce((sum, item) => sum + item.floorCents, 0);
  const roundedSubsetTotal = Math.round(
    initial.reduce((sum, item) => sum + item.exactCents, 0),
  );
  const targetTotal = Math.min(parentContributionCents, roundedSubsetTotal);
  const delta = targetTotal - floorTotal;
  const adjustedIndexes = new Map<number, number>();

  if (delta > 0) {
    for (const item of [...initial]
      .sort(
        (left, right) =>
          right.remainder - left.remainder || left.index - right.index,
      )
      .slice(0, delta)) {
      adjustedIndexes.set(item.index, 1);
    }
  }

  if (delta < 0) {
    for (const item of [...initial]
      .filter((entry) => entry.floorCents > 0)
      .sort(
        (left, right) =>
          left.remainder - right.remainder || left.index - right.index,
      )
      .slice(0, Math.abs(delta))) {
      adjustedIndexes.set(item.index, -1);
    }
  }

  return initial.map(({ callout, index, floorCents }) => {
    const amountCents = floorCents + (adjustedIndexes.get(index) ?? 0);

    return {
      id: callout.id,
      label: callout.label,
      descriptionShort: callout.descriptionShort,
      amount: centsToAmount(amountCents),
      amountCents,
      budgetAmountM: callout.amountM,
      sourceId: callout.sourceId,
      sourceLocator: callout.sourceLocator,
    };
  });
}

function findChildById(
  node: BudgetDrilldownNode,
  id: string,
): BudgetDrilldownNode | null {
  return node.children?.find((child) => child.id === id) ?? null;
}

export function getCurrentBudgetDrilldownDataset(): BudgetDrilldownDataset {
  return auBudget2025_26;
}

export function getTopLevelDrilldownCategories(
  dataset: BudgetDrilldownDataset = auBudget2025_26,
): readonly BudgetDrilldownNode[] {
  return dataset.categories;
}

export function getBudgetDrilldownCategory(
  id: string,
  dataset: BudgetDrilldownDataset = auBudget2025_26,
): BudgetDrilldownNode | null {
  return dataset.categories.find((category) => category.id === id) ?? null;
}

export function getBudgetDrilldownPath(
  ids: readonly string[],
  dataset: BudgetDrilldownDataset = auBudget2025_26,
): readonly BudgetDrilldownNode[] {
  const [categoryId, ...childIds] = ids;
  const category = categoryId
    ? getBudgetDrilldownCategory(categoryId, dataset)
    : null;

  if (!category) {
    return [];
  }

  const path: BudgetDrilldownNode[] = [category];
  let current = category;

  for (const childId of childIds) {
    const child = findChildById(current, childId);

    if (!child) {
      break;
    }

    path.push(child);
    current = child;
  }

  return path;
}

export function calculateTopLevelContributionCents(
  totalTaxAmount: number,
  category: BudgetDrilldownNode,
  dataset: BudgetDrilldownDataset = auBudget2025_26,
): number {
  if (!Number.isFinite(totalTaxAmount)) {
    throw new TypeError("Total tax amount must be finite.");
  }

  if (totalTaxAmount < 0) {
    throw new RangeError("Total tax amount must not be negative.");
  }

  return amountToCents((totalTaxAmount * category.amountM) / dataset.totalExpensesM);
}

export function calculateBudgetDrilldownView(
  totalTaxAmount: number,
  ids: readonly string[],
  dataset: BudgetDrilldownDataset = auBudget2025_26,
): BudgetDrilldownView | null {
  const path = getBudgetDrilldownPath(ids, dataset);

  if (path.length === 0) {
    return null;
  }

  let contributionAmountCents = calculateTopLevelContributionCents(
    totalTaxAmount,
    path[0],
    dataset,
  );

  for (let index = 1; index < path.length; index += 1) {
    const parent = path[index - 1];
    const row = allocateChildrenByBasis(contributionAmountCents, parent).find(
      (item) => item.id === path[index].id,
    );

    if (!row) {
      return null;
    }

    contributionAmountCents = row.amountCents;
  }

  const node = path[path.length - 1];

  return {
    node,
    path,
    contributionAmount: centsToAmount(contributionAmountCents),
    contributionAmountCents,
    rows: allocateChildrenByBasis(contributionAmountCents, node),
  };
}

export function calculateBudgetProgramCallouts(
  parentContributionCents: number,
  category: BudgetDrilldownNode,
): readonly BudgetProgramCalloutAllocationRow[] {
  if (!Number.isFinite(parentContributionCents)) {
    throw new TypeError("Parent contribution cents must be finite.");
  }

  if (parentContributionCents < 0) {
    throw new RangeError("Parent contribution cents must not be negative.");
  }

  return allocateProgramCalloutsByBasis(
    Math.round(parentContributionCents),
    category,
    category.callouts?.slice(0, 2) ?? [],
  );
}

export function sumBudgetNodeAmountM(
  nodes: readonly BudgetDrilldownNode[],
): number {
  return nodes.reduce((total, node) => total + node.amountM, 0);
}

export function getBudgetNodeChildrenTotalM(node: BudgetDrilldownNode): number {
  return sumBudgetNodeAmountM(node.children ?? []);
}
