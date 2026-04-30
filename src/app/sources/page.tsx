import {
  TransparencyPageShell,
  TransparencySection,
} from "@/components/transparency-page";
import { sourceRegistry, type SourceId } from "@/data/sources";

const sourceSupport: Partial<
  Record<
    SourceId,
    {
      sourceYear: string;
      supports: string;
    }
  >
> = {
  "ato-resident-tax-rates-2025-26": {
    sourceYear: "2025-26 income year",
    supports: "Resident individual tax brackets used before offsets and Medicare levy.",
  },
  "ato-low-income-tax-offset": {
    sourceYear: "2025-26 estimate setting",
    supports: "Low Income Tax Offset thresholds and taper rates.",
  },
  "ato-medicare-levy": {
    sourceYear: "2025-26 estimate setting",
    supports: "The simplified 2% Medicare levy option and caveat framing.",
  },
  "bp1-2025-26-statement5-table5-3": {
    sourceYear: "2025-26 Budget",
    supports: "Top-level expenses by function for the additive final summary.",
  },
  "bp1-2025-26-statement5-table5-3-1": {
    sourceYear: "2025-26 Budget",
    supports: "Selected non-additive spotlight program amounts.",
  },
};

const sources = Object.values(sourceRegistry);

export default function SourcesPage() {
  return (
    <TransparencyPageShell
      eyebrow="Sources"
      title="Sources"
      deck="Where the numbers come from. This page is generated from the project source registry, with plain-English notes on what each source supports."
      tone="magenta"
      posterWord="SOURCE"
    >
      <TransparencySection title="Registry-backed references">
        <p>
          Each source below is stored in the app source registry and connected
          to either the tax estimate, the Budget data model, or the spotlight
          caveats.
        </p>
      </TransparencySection>

      <div className="source-list">
        {sources.map((source) => {
          const support = sourceSupport[source.id as SourceId];

          return (
            <article key={source.id} className="source-card">
              <div>
                <p className="source-card-kicker">{source.publisher}</p>
                <h2>{source.title}</h2>
              </div>
              <dl>
                <div>
                  <dt>Source year</dt>
                  <dd>{support?.sourceYear ?? "Not specified in registry"}</dd>
                </div>
                <div>
                  <dt>Locator</dt>
                  <dd>{source.sourceLocator}</dd>
                </div>
                <div>
                  <dt>Supports</dt>
                  <dd>{support?.supports ?? source.note}</dd>
                </div>
              </dl>
              <p>{source.note}</p>
              <a href={source.url}>{source.url}</a>
            </article>
          );
        })}
      </div>
    </TransparencyPageShell>
  );
}
