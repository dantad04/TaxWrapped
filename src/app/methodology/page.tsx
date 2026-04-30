import {
  TransparencyCallout,
  TransparencyPageShell,
  TransparencySection,
} from "@/components/transparency-page";
import { budget2025_26 } from "@/data/budget-2025-26";
import { AUSTRALIAN_RESIDENT_TAX_INCOME_YEAR } from "@/lib/tax/australian-resident-2025-26";

export default function MethodologyPage() {
  return (
    <TransparencyPageShell
      eyebrow="Methodology"
      title="Methodology"
      deck="How the receipt is built: taxable income in, resident tax rules applied, then an illustrative proportional Budget map."
      tone="blue"
      posterWord="METHOD"
    >
      <TransparencySection eyebrow="Step 01" title="Start with taxable income">
        <p>
          You enter taxable income, not gross salary. That means the number
          after any deductions or income adjustments that would affect taxable
          income. The app keeps that input in the current page only.
        </p>
      </TransparencySection>

      <TransparencySection eyebrow="Step 02" title="Estimate Commonwealth tax">
        <p>
          The tax estimate uses Australian resident individual tax rates for the{" "}
          {AUSTRALIAN_RESIDENT_TAX_INCOME_YEAR} income year.
        </p>
        <ul>
          <li>Low Income Tax Offset (LITO) is included.</li>
          <li>
            Medicare levy is simplified as 2% of taxable income when included.
          </li>
          <li>
            The model is explanatory, not an ATO-grade tax return calculator.
          </li>
        </ul>
      </TransparencySection>

      <TransparencyCallout>
        Excluded: HELP/HECS repayments, Medicare levy surcharge, Medicare levy
        reductions or exemptions, family thresholds, deductions, non-resident
        rules, working holiday maker rules, offsets other than LITO, and unusual
        tax situations.
      </TransparencyCallout>

      <TransparencySection
        eyebrow="Step 03"
        title="Allocate the estimate proportionally"
      >
        <p>
          The Budget story allocates your estimated tax proportionally across
          Australian Government expenses. It is illustrative. Taxes are not
          hypothecated, and this does not claim that your dollars were literally
          assigned to particular functions or programs.
        </p>
        <ul>
          <li>
            Top-level Budget functions are additive and used for the final
            summary.
          </li>
          <li>
            Spotlight cards are non-additive examples and must not be
            double-counted.
          </li>
          <li>
            Rounding is deterministic, so displayed allocations reconcile to the
            estimated tax total.
          </li>
        </ul>
      </TransparencySection>

      <TransparencySection eyebrow="Budget year" title="2025-26 source frame">
        <p>
          The Budget data model uses the {budget2025_26.budgetYear} Australian
          Government Budget. Top-level rows are normalised across the additive
          function total because the published function rows are rounded to the
          nearest million.
        </p>
      </TransparencySection>
    </TransparencyPageShell>
  );
}
