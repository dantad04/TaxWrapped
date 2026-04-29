import type {
  WeightedAllocationInput,
  WeightedAllocationResult,
} from "./model";

export function amountToCents(amount: number): number {
  if (!Number.isFinite(amount)) {
    throw new TypeError("Amount must be a finite number.");
  }

  return Math.round((amount + Number.EPSILON) * 100);
}

export function centsToAmount(cents: number): number {
  return Math.round(cents) / 100;
}

export function allocateAmountByWeights<TMetadata>(
  totalAmount: number,
  weights: readonly WeightedAllocationInput<TMetadata>[],
): readonly WeightedAllocationResult<TMetadata>[] {
  if (totalAmount < 0) {
    throw new RangeError("Total amount must not be negative.");
  }

  if (weights.length === 0) {
    return [];
  }

  const totalCents = amountToCents(totalAmount);
  const totalWeight = weights.reduce((sum, item) => {
    if (!Number.isFinite(item.weight) || item.weight < 0) {
      throw new RangeError(
        "Allocation weights must be finite non-negative numbers.",
      );
    }

    return sum + item.weight;
  }, 0);

  if (totalWeight <= 0) {
    throw new RangeError(
      "Allocation weights must include a positive total weight.",
    );
  }

  const initial = weights.map((item, index) => {
    const exactCents = (totalCents * item.weight) / totalWeight;
    const floorCents = Math.floor(exactCents);

    return {
      item,
      index,
      exactCents,
      floorCents,
      remainder: exactCents - floorCents,
    };
  });

  const floorTotal = initial.reduce((sum, item) => sum + item.floorCents, 0);
  const centsToDistribute = totalCents - floorTotal;
  const indexesReceivingExtraCent = new Set(
    [...initial]
      .sort((left, right) => {
        const remainderDifference = right.remainder - left.remainder;

        if (remainderDifference !== 0) {
          return remainderDifference;
        }

        return left.index - right.index;
      })
      .slice(0, centsToDistribute)
      .map((item) => item.index),
  );

  return initial.map(({ item, index, exactCents, floorCents, remainder }) => {
    const amountCents =
      floorCents + (indexesReceivingExtraCent.has(index) ? 1 : 0);

    return {
      id: item.id,
      label: item.label,
      weight: item.weight,
      weightShare: item.weight / totalWeight,
      unroundedAmount: exactCents / 100,
      amount: centsToAmount(amountCents),
      amountCents,
      remainder,
      metadata: item.metadata,
    };
  });
}
