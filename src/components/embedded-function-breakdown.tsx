import type { CSSProperties } from "react";
import type {
  BudgetDrilldownAllocationRow,
  BudgetDrilldownView,
} from "@/lib/budget/drilldown-model";

const embeddedCurrencyFormatter = new Intl.NumberFormat("en-AU", {
  style: "currency",
  currency: "AUD",
  maximumFractionDigits: 0,
});

function formatEmbeddedCurrency(amount: number) {
  return embeddedCurrencyFormatter.format(Math.round(amount));
}

export function getEmbeddedBreakdownRows(
  view: BudgetDrilldownView | null,
  maxRows = 5,
): BudgetDrilldownAllocationRow[] {
  if (!view || view.rows.length === 0 || maxRows <= 0) {
    return [];
  }

  return view.rows
    .map((row, index) => ({ index, row }))
    .sort(
      (first, second) =>
        second.row.amountCents - first.row.amountCents ||
        first.index - second.index,
    )
    .slice(0, maxRows)
    .map(({ row }) => row);
}

interface EmbeddedFunctionBreakdownProps {
  maxRows?: number;
  view: BudgetDrilldownView | null;
}

export function EmbeddedFunctionBreakdown({
  maxRows = 5,
  view,
}: EmbeddedFunctionBreakdownProps) {
  const rows = getEmbeddedBreakdownRows(view, maxRows);
  const maxCents = Math.max(...rows.map((row) => row.amountCents), 0);

  if (!view || rows.length === 0) {
    return (
      <section
        aria-label="Embedded budget breakdown unavailable"
        className="embedded-breakdown embedded-breakdown-empty"
        data-testid="embedded-breakdown-empty"
      >
        <div className="embedded-breakdown-topline">
          <span>Breakdown</span>
          <small>No sourced lines</small>
        </div>
        <p>No sourced sub-function breakdown is available for this Budget function.</p>
      </section>
    );
  }

  const hasMoreRows = view.rows.length > rows.length;

  return (
    <section
      aria-label={`${view.node.label} embedded budget breakdown`}
      className="embedded-breakdown"
      data-testid="embedded-breakdown"
    >
      <div className="embedded-breakdown-topline">
        <span>Breakdown</span>
        <small>
          {hasMoreRows ? `Top ${rows.length} lines shown` : "Sourced lines"}
        </small>
      </div>
      <div className="embedded-breakdown-list">
        {rows.map((row) => {
          const width =
            maxCents > 0
              ? Math.max(3, (row.amountCents / maxCents) * 100)
              : 0;

          return (
            <div
              className="embedded-breakdown-row"
              data-testid="embedded-breakdown-row"
              key={row.id}
            >
              <span className="embedded-breakdown-track" aria-hidden="true">
                <span
                  className="embedded-breakdown-fill"
                  style={{ "--embedded-width": `${width}%` } as CSSProperties}
                />
              </span>
              <strong>{formatEmbeddedCurrency(row.amount)}</strong>
              <span className="embedded-breakdown-label">{row.label}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
