"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { ShareBudgetReceiptCard } from "@/components/share/share-budget-receipt-card";
import { allocateTaxAcrossBudgetFunctions } from "@/lib/allocation/budget-allocation";
import {
  SHARE_CARD_EXPORT_FILENAME,
  SHARE_CARD_EXPORT_HEIGHT,
  SHARE_CARD_EXPORT_WIDTH,
} from "@/lib/share/share-card-export";
import { buildShareCardData } from "@/lib/share/share-card-data";
import { getSharePreviewEstimatedTax } from "@/lib/share/share-preview-state";
import { estimateAustralianTax2025_26 } from "@/lib/tax/australian-resident-2025-26";

const SHARE_PREVIEW_SAMPLE_TAXABLE_INCOME = 90000;

function buildShareCardDataFromEstimatedTax(estimatedTaxAmount: number) {
  return buildShareCardData(
    allocateTaxAcrossBudgetFunctions(estimatedTaxAmount),
  );
}

function downloadBlob(blob: Blob, filename: string) {
  const downloadUrl = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = downloadUrl;
  anchor.download = filename;
  anchor.rel = "noopener";
  anchor.style.display = "none";

  document.body.append(anchor);
  anchor.click();
  anchor.remove();

  window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 0);
}

export function SharePreviewClient() {
  const exportCardRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [estimatedTaxAmount] = useState(() => getSharePreviewEstimatedTax());
  const sampleEstimatedTaxAmount = useMemo(() => {
    const taxEstimate = estimateAustralianTax2025_26({
      taxableIncome: SHARE_PREVIEW_SAMPLE_TAXABLE_INCOME,
      includeMedicareLevy: true,
    });

    return taxEstimate.totalEstimatedTax;
  }, []);
  const isSamplePreview = estimatedTaxAmount === null;
  const shareCard = useMemo(
    () =>
      buildShareCardDataFromEstimatedTax(
        estimatedTaxAmount ?? sampleEstimatedTaxAmount,
      ),
    [estimatedTaxAmount, sampleEstimatedTaxAmount],
  );

  async function handleDownload() {
    if (!exportCardRef.current || isExporting) {
      return;
    }

    setIsExporting(true);

    try {
      if ("fonts" in document) {
        await document.fonts.ready;
      }

      const { toBlob } = await import("html-to-image");
      const exportedBlob = await toBlob(exportCardRef.current, {
        cacheBust: true,
        canvasHeight: SHARE_CARD_EXPORT_HEIGHT,
        canvasWidth: SHARE_CARD_EXPORT_WIDTH,
        height: SHARE_CARD_EXPORT_HEIGHT,
        pixelRatio: 1,
        width: SHARE_CARD_EXPORT_WIDTH,
      });

      if (!exportedBlob) {
        throw new Error("Share card PNG export failed.");
      }

      const pngBlob =
        exportedBlob.type === "image/png"
          ? exportedBlob
          : new Blob([exportedBlob], { type: "image/png" });

      downloadBlob(pngBlob, SHARE_CARD_EXPORT_FILENAME);
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <main className="share-preview-shell">
      <nav className="share-preview-nav" aria-label="Share preview navigation">
        <Link href="/">Back to wrap</Link>
        <Link href="/methodology">Methodology</Link>
        <Link href="/sources">Sources</Link>
      </nav>
      <header className="share-preview-hero">
        <p>{isSamplePreview ? "Sample share preview" : "Share preview"}</p>
        <h1>{isSamplePreview ? "Sample share preview" : "Share preview"}</h1>
        <span>
          {isSamplePreview
            ? "Design QA uses a fixed sample estimate. This is not your actual result, and no salary before tax is shown on the card."
            : "This preview uses your current estimated tax amount. No salary before tax is shown on the card."}
        </span>
      </header>
      <section className="share-preview-stage" aria-label="Share card preview">
        <ShareBudgetReceiptCard data={shareCard} />
      </section>
      <div className="share-preview-actions">
        <button
          className="share-download-button"
          disabled={isExporting}
          onClick={handleDownload}
          type="button"
        >
          {isExporting ? "Rendering PNG" : "Download PNG"}
        </button>
      </div>
      <p className="share-preview-note">
        The PNG is rendered in this browser as a 1080 by 1920 image. Salary
        before tax is not included on the card.
      </p>
      <div
        aria-hidden="true"
        className="share-card-export-stage"
        ref={exportCardRef}
      >
        <ShareBudgetReceiptCard
          animated={false}
          className="share-card-export"
          data={shareCard}
          testId="share-card-export-source"
        />
      </div>
    </main>
  );
}
