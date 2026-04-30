let sharePreviewEstimatedTax: number | null = null;

export function setSharePreviewEstimatedTax(amount: number) {
  sharePreviewEstimatedTax = Number.isFinite(amount)
    ? Math.max(0, Math.round(amount))
    : null;
}

export function getSharePreviewEstimatedTax() {
  return sharePreviewEstimatedTax;
}
