import Link from "next/link";
import { ShareBudgetReceiptCard } from "@/components/share/share-budget-receipt-card";
import { allocateTaxAcrossBudgetFunctions } from "@/lib/allocation/budget-allocation";
import { buildShareCardData } from "@/lib/share/share-card-data";
import { estimateAustralianTax2025_26 } from "@/lib/tax/australian-resident-2025-26";

const SHARE_PREVIEW_SAMPLE_TAXABLE_INCOME = 90000;

export default function SharePreviewPage() {
  const taxEstimate = estimateAustralianTax2025_26({
    taxableIncome: SHARE_PREVIEW_SAMPLE_TAXABLE_INCOME,
    includeMedicareLevy: true,
  });
  const allocationSummary = allocateTaxAcrossBudgetFunctions(
    taxEstimate.totalEstimatedTax,
  );
  const shareCard = buildShareCardData(allocationSummary);

  return (
    <main className="share-preview-shell">
      <nav className="share-preview-nav" aria-label="Share preview navigation">
        <Link href="/">Back to wrap</Link>
        <Link href="/methodology">Methodology</Link>
        <Link href="/sources">Sources</Link>
      </nav>
      <header className="share-preview-hero">
        <p>Sample share preview</p>
        <h1>Sample share preview</h1>
        <span>
          Design QA uses a fixed sample estimate. This is not your actual
          result, and no taxable income is shown on the card.
        </span>
      </header>
      <section className="share-preview-stage" aria-label="Share card preview">
        <ShareBudgetReceiptCard data={shareCard} />
      </section>
      <p className="share-preview-note">
        PNG export is not implemented in this slice. The card is rendered
        client-side as a 1080 by 1920 portrait preview for screenshot or browser
        export workflows.
      </p>
    </main>
  );
}
