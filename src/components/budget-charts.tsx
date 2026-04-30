import type {
  BudgetAllocationSummary,
  BudgetFunctionAllocation,
  SpotlightAllocation,
} from "@/lib/allocation/model";
import type { CSSProperties } from "react";
import {
  buildAllocationChartSegments,
  buildSpotlightChartMarker,
  buildSummaryChartRows,
  type ChartTone,
} from "@/lib/charts/budget-chart-data";

interface DrawableSegment {
  segment: ReturnType<typeof buildAllocationChartSegments>[number];
  x: number;
  width: number;
}

const chartCurrencyFormatter = new Intl.NumberFormat("en-AU", {
  style: "currency",
  currency: "AUD",
  maximumFractionDigits: 0,
});

const chartPercentFormatter = new Intl.NumberFormat("en-AU", {
  maximumFractionDigits: 1,
});

function formatCurrency(amount: number) {
  return chartCurrencyFormatter.format(Math.round(amount));
}

function formatPercent(share: number) {
  return `${chartPercentFormatter.format(share * 100)}%`;
}

function getBarWidth(share: number, maxShare: number) {
  if (maxShare <= 0 || share <= 0) {
    return 0;
  }

  return Math.max(3, (share / maxShare) * 100);
}

export function AllocationStackedChart({
  summary,
}: {
  summary: BudgetAllocationSummary;
}) {
  const segments = buildAllocationChartSegments(summary.allocations);
  const chartWidth = 320;
  const topSegments = segments.slice(0, 4);
  const { drawableSegments } = segments.reduce<{
    cursor: number;
    drawableSegments: DrawableSegment[];
  }>(
    (state, segment) => {
      const width = segment.shareOfTotal * chartWidth;

      return {
        cursor: state.cursor + width,
        drawableSegments: [
          ...state.drawableSegments,
          { segment, x: state.cursor, width },
        ],
      };
    },
    { cursor: 0, drawableSegments: [] },
  );

  return (
    <div
      className="allocation-chart"
      role="img"
      aria-label={`Big-picture allocation chart: ${formatCurrency(
        summary.inputTaxAmount,
      )} is split proportionally across ${
        segments.length
      } additive top-level Budget functions. Top function: ${
        topSegments[0]?.label ?? "none"
      }.`}
    >
      <svg
        className="allocation-chart-svg"
        viewBox={`0 0 ${chartWidth} 86`}
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <rect className="allocation-chart-frame" x="2" y="18" width="316" height="36" />
        {drawableSegments.map(({ segment, x, width }) => (
          <rect
            key={segment.id}
            className={`chart-fill chart-fill-${segment.tone}`}
            x={x}
            y="20"
            width={width}
            height="32"
          />
        ))}
        <line className="allocation-chart-axis" x1="2" y1="65" x2="318" y2="65" />
        <text className="allocation-chart-label" x="4" y="80">
          additive top-level functions
        </text>
      </svg>
      <div className="allocation-chart-key" aria-hidden="true">
        {topSegments.map((segment) => (
          <span key={segment.id}>
            <i className={`chart-dot chart-dot-${segment.tone}`} />
            <strong>{formatCurrency(segment.amount)}</strong>
            {segment.label}
          </span>
        ))}
      </div>
      <span className="sr-only">
        {segments
          .map(
            (segment) =>
              `${segment.label}: ${formatCurrency(segment.amount)} (${formatPercent(
                segment.shareOfTotal,
              )})`,
          )
          .join("; ")}
      </span>
    </div>
  );
}

export function CategoryShareChart({
  allocation,
  title,
  tone,
}: {
  allocation: BudgetFunctionAllocation;
  title: string;
  tone: ChartTone;
}) {
  const percentage = formatPercent(allocation.shareOfAdditiveBudget);

  return (
    <div
      className={`category-chart chart-tone-${tone}`}
      role="img"
      aria-label={`${title} share chart: ${percentage} of the additive Budget function mix, estimated at ${formatCurrency(
        allocation.amount,
      )}.`}
    >
      <svg
        className="category-chart-svg"
        viewBox="0 0 320 82"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <rect className="category-chart-track" x="2" y="30" width="316" height="26" />
        <rect
          className={`chart-fill chart-fill-${tone}`}
          x="2"
          y="30"
          width={allocation.shareOfAdditiveBudget * 316}
          height="26"
        />
        {Array.from({ length: 6 }).map((_, index) => (
          <line
            key={index}
            className="category-chart-tick"
            x1={2 + index * 63.2}
            x2={2 + index * 63.2}
            y1="24"
            y2="62"
          />
        ))}
        <text className="category-chart-percent" x="8" y="22">
          {percentage}
        </text>
        <text className="category-chart-caption" x="8" y="78">
          share of additive Budget functions
        </text>
      </svg>
    </div>
  );
}

export function SpotlightMarkerChart({
  allocation,
  title,
  tone,
}: {
  allocation: SpotlightAllocation;
  title: string;
  tone: ChartTone;
}) {
  const marker = buildSpotlightChartMarker(allocation);
  const markerPosition = Math.min(94, Math.max(6, marker.shareOfAdditiveBudget * 100));

  return (
    <div
      className={`spotlight-chart chart-tone-${tone}`}
      role="img"
      aria-label={`${title} non-additive spotlight chart: ${formatCurrency(
        allocation.amount,
      )}, equal to ${formatPercent(
        allocation.shareOfAdditiveBudget,
      )} of the additive Budget function mix. This spotlight is not counted in the final summary.`}
    >
      <svg
        className="spotlight-chart-svg"
        viewBox="0 0 320 86"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <rect className="spotlight-chart-frame" x="3" y="22" width="314" height="34" />
        <line className="spotlight-chart-rail" x1="14" x2="306" y1="39" y2="39" />
        <line
          className={`spotlight-chart-marker chart-stroke-${tone}`}
          x1={`${markerPosition}%`}
          x2={`${markerPosition}%`}
          y1="16"
          y2="64"
        />
        <text className="spotlight-chart-label" x="10" y="80">
          non-additive spotlight
        </text>
      </svg>
    </div>
  );
}

export function SummaryRankedBarChart({
  summary,
  maxRows = 7,
}: {
  summary: BudgetAllocationSummary;
  maxRows?: number;
}) {
  const rows = buildSummaryChartRows(summary, maxRows);
  const maxShare = Math.max(...rows.map((row) => row.shareOfTotal), 0);

  return (
    <div
      className="summary-chart"
      role="img"
      aria-label={`Final summary bar chart: additive Budget functions sum to ${formatCurrency(
        summary.inputTaxAmount,
      )}. Non-additive spotlights are excluded from this total.`}
    >
      <div className="summary-chart-rows" aria-hidden="true">
        {rows.map((row, index) => (
          <div
            key={row.id}
            className={`summary-chart-row chart-tone-${row.tone}`}
            style={{ "--row-index": index } as CSSProperties}
          >
            <div className="summary-chart-row-top">
              <span>{row.label}</span>
              <strong>{formatCurrency(row.amount)}</strong>
            </div>
            <div className="summary-chart-track">
              <span
                className={`summary-chart-fill chart-fill-${row.tone}`}
                style={{ width: `${getBarWidth(row.shareOfTotal, maxShare)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
      <span className="sr-only">
        {rows
          .map(
            (row) =>
              `${row.label}: ${formatCurrency(row.amount)} (${formatPercent(
                row.shareOfTotal,
              )})`,
          )
          .join("; ")}
      </span>
    </div>
  );
}
