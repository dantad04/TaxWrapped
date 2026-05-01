"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  AllocationStackedChart,
  CategoryShareChart,
  SpotlightMarkerChart,
  SummaryRankedBarChart,
} from "@/components/budget-charts";
import {
  allocateTaxAcrossBudgetFunctions,
  calculateSpotlightAllocation,
} from "@/lib/allocation/budget-allocation";
import type {
  BudgetFunctionAllocation,
  SpotlightAllocation,
} from "@/lib/allocation/model";
import type {
  BudgetFunctionSlug,
  SpotlightProgramSlug,
} from "@/lib/budget/model";
import {
  calculateReceiptScaleDenominator,
  COMMONWEALTH_TOTAL_EXPENSES_M,
  formatCommonwealthBill,
  formatReceiptScaleDenominator,
} from "@/lib/budget/australia-receipt-coda";
import {
  calculateBudgetProgramCallouts,
  calculateBudgetDrilldownView,
  getBudgetDrilldownCategory,
} from "@/lib/budget/drilldown-data";
import type {
  BudgetDrilldownAllocationRow,
  BudgetProgramCalloutAllocationRow,
  BudgetDrilldownView,
} from "@/lib/budget/drilldown-model";
import type { ChartTone } from "@/lib/charts/budget-chart-data";
import { useCountUp } from "@/hooks/use-count-up";
import { useFitText } from "@/hooks/use-fit-text";
import { setSharePreviewEstimatedTax } from "@/lib/share/share-preview-state";
import { estimateAustralianTax2025_26 } from "@/lib/tax/australian-resident-2025-26";
import type { BracketWalkRow } from "@/lib/tax/bracket-walk";
import { buildBracketWalk } from "@/lib/tax/bracket-walk";

const currencyFormatter = new Intl.NumberFormat("en-AU", {
  style: "currency",
  currency: "AUD",
  maximumFractionDigits: 0,
});

const percentFormatter = new Intl.NumberFormat("en-AU", {
  maximumFractionDigits: 1,
});

type AccentTone = ChartTone;
type StorySurface = "charcoal" | "paper";

const storyPalette = {
  red: {
    surface: "bg-[#f4f1ea]",
    ink: "text-[#151515]",
    accent: "bg-[#df1f26]",
    glow: "story-glow-red",
  },
  blue: {
    surface: "bg-[#f4f1ea]",
    ink: "text-[#151515]",
    accent: "bg-[#2e55ff]",
    glow: "story-glow-blue",
  },
  green: {
    surface: "bg-[#f4f1ea]",
    ink: "text-[#151515]",
    accent: "bg-[#149c48]",
    glow: "story-glow-green",
  },
  magenta: {
    surface: "bg-[#f4f1ea]",
    ink: "text-[#151515]",
    accent: "bg-[#bb33b6]",
    glow: "story-glow-magenta",
  },
} as const satisfies Record<
  AccentTone,
  {
    surface: "bg-[#f4f1ea]",
    ink: "text-[#151515]",
    accent: string;
    glow: string;
  }
>;

const storySurfaces = {
  paper: {
    surface: "bg-[#f4f1ea]",
    ink: "text-[#151515]",
  },
  charcoal: {
    surface: "bg-[#29282e]",
    ink: "text-[#fbfaf5]",
  },
} as const satisfies Record<
  StorySurface,
  {
    surface: string;
    ink: string;
  }
>;

const FUNCTION_STORY_META = [
  {
    slug: "social-security-welfare",
    title: "Social security & welfare",
    message: "The biggest slice is care and support.",
    detail: "Income support, seniors, disability and welfare functions anchor the Budget story.",
    motif: "CARE",
    tone: "magenta",
  },
  {
    slug: "health",
    title: "Health",
    message: "Health is the next major moment.",
    detail: "Medical benefits, medicines and health services sit behind this function.",
    motif: "HEALTH",
    tone: "green",
  },
  {
    slug: "education",
    title: "Education",
    message: "Learning gets a clear share.",
    detail: "This top-level function covers Australian Government education expenses.",
    motif: "LEARN",
    tone: "blue",
  },
  {
    slug: "defence",
    title: "Defence",
    message: "National capability is part of the mix.",
    detail: "Shown as an additive top-level Budget function, not a separate program trace.",
    motif: "DEF",
    tone: "red",
  },
  {
    slug: "fuel-energy",
    title: "Energy & resources",
    message: "Energy is smaller, but visible.",
    detail: "Based on the sourced Fuel and energy top-level Budget function.",
    motif: "ENERGY",
    tone: "green",
  },
] as const satisfies ReadonlyArray<{
  slug: BudgetFunctionSlug;
  title: string;
  message: string;
  detail: string;
  motif: string;
  tone: AccentTone;
}>;

const SPOTLIGHT_STORY_META = [
  {
    slug: "revenue-assistance-states-territories",
    title: "States and territories",
    message: "Some Budget support flows through the federation.",
    detail: "Revenue assistance is a non-additive spotlight from Budget Paper No. 1.",
    motif: "STATES",
    tone: "blue",
    surface: "paper",
  },
  {
    slug: "commonwealth-debt-management",
    title: "Debt interest",
    message: "Debt costs are in the picture too.",
    detail: "Commonwealth Debt Management is a non-additive spotlight, not a villain or a final-summary category.",
    motif: "DEBT",
    tone: "red",
    surface: "charcoal",
  },
] as const satisfies ReadonlyArray<{
  slug: SpotlightProgramSlug;
  title: string;
  message: string;
  detail: string;
  motif: string;
  tone: AccentTone;
  surface: StorySurface;
}>;

type StepKind =
  | "intro"
  | "input"
  | "tax"
  | "bracket-walk"
  | "allocation"
  | "category"
  | "spotlight"
  | "drilldown"
  | "summary"
  | "coda";

interface StoryStep {
  kind: StepKind;
  eyebrow: string;
  title: string;
  slug?: BudgetFunctionSlug | SpotlightProgramSlug;
  tone: AccentTone;
  surface: StorySurface;
}

function formatCurrency(amount: number) {
  return currencyFormatter.format(Math.round(amount));
}

function formatPercent(share: number) {
  return `${percentFormatter.format(share * 100)}%`;
}

type FitTextElement = "div" | "h1" | "h2" | "p" | "span" | "strong";

interface FitTextProps {
  as?: FitTextElement;
  children: React.ReactNode;
  className?: string;
  deps?: readonly unknown[];
  fitId: string;
  minPx: number;
  maxPx: number;
  style?: CSSProperties;
  ariaHidden?: boolean;
  ariaLabel?: string;
  suppressHydrationWarning?: boolean;
}

function FitText({
  as = "span",
  ariaHidden,
  ariaLabel,
  children,
  className,
  deps = [],
  fitId,
  maxPx,
  minPx,
  style,
  suppressHydrationWarning,
}: FitTextProps) {
  const ref = useRef<HTMLElement>(null);
  const fontSize = useFitText({
    ref,
    minPx,
    maxPx,
    deps,
  });

  const props = {
    "aria-hidden": ariaHidden,
    "aria-label": ariaLabel,
    className: className ? `${className} fit-text` : "fit-text",
    "data-fit-max-px": maxPx,
    "data-fit-min-px": minPx,
    "data-hero-fit": fitId,
    style: {
      ...style,
      fontSize: `${fontSize}px`,
    },
    suppressHydrationWarning,
  };

  if (as === "div") {
    return (
      <div {...props} ref={ref as React.RefObject<HTMLDivElement>}>
        {children}
      </div>
    );
  }

  if (as === "h1") {
    return (
      <h1 {...props} ref={ref as React.RefObject<HTMLHeadingElement>}>
        {children}
      </h1>
    );
  }

  if (as === "h2") {
    return (
      <h2 {...props} ref={ref as React.RefObject<HTMLHeadingElement>}>
        {children}
      </h2>
    );
  }

  if (as === "p") {
    return (
      <p {...props} ref={ref as React.RefObject<HTMLParagraphElement>}>
        {children}
      </p>
    );
  }

  if (as === "strong") {
    return (
      <strong {...props} ref={ref as React.RefObject<HTMLElement>}>
        {children}
      </strong>
    );
  }

  return (
    <span {...props} ref={ref as React.RefObject<HTMLSpanElement>}>
      {children}
    </span>
  );
}

function AnimatedCurrency({
  amount,
  as: Component = "span",
  className,
  fit,
}: {
  amount: number;
  as?: "p" | "span" | "strong";
  className?: string;
  fit?: {
    id: string;
    minPx: number;
    maxPx: number;
  };
}) {
  const displayedAmount = useCountUp(amount, 700);
  const finalValue = formatCurrency(amount);
  const displayedValue = formatCurrency(displayedAmount);
  const content = (
    <span
      aria-hidden="true"
      className="countup-currency-value"
      suppressHydrationWarning
    >
      {displayedValue}
    </span>
  );
  const countUpClassName = className
    ? `${className} countup-currency`
    : "countup-currency";
  const countUpStyle = {
    "--countup-width": `${finalValue.length}ch`,
  } as CSSProperties;

  if (fit) {
    return (
      <FitText
        ariaLabel={finalValue}
        as={Component}
        className={countUpClassName}
        deps={[finalValue]}
        fitId={fit.id}
        maxPx={fit.maxPx}
        minPx={fit.minPx}
        style={countUpStyle}
      >
        {content}
      </FitText>
    );
  }

  return (
    <Component
      aria-label={finalValue}
      className={countUpClassName}
      style={countUpStyle}
    >
      {content}
    </Component>
  );
}

function parseIncome(value: string) {
  if (value.trim() === "") {
    return null;
  }

  const parsed = Number(value.replace(/,/g, ""));

  if (!Number.isFinite(parsed)) {
    return null;
  }

  return Math.max(0, parsed);
}

function WavyLines() {
  return (
    <svg
      aria-hidden="true"
      className="story-lines"
      viewBox="0 0 420 720"
      preserveAspectRatio="none"
    >
      <path d="M-80 74 C 28 102, 96 28, 214 56 S 384 120, 520 52" />
      <path d="M-90 122 C 46 86, 134 174, 254 118 S 404 36, 526 116" />
      <path d="M-108 548 C 22 482, 122 612, 244 554 S 420 490, 534 604" />
      <path d="M-90 614 C 54 664, 142 542, 274 604 S 436 706, 538 574" />
    </svg>
  );
}

function PatternBlock() {
  return (
    <div aria-hidden="true" className="story-pattern">
      {Array.from({ length: 16 }).map((_, index) => (
        <span key={index} />
      ))}
    </div>
  );
}

function TaxEstimateMark() {
  return (
    <div aria-hidden="true" className="tax-poster-mark">
      <span />
      <span />
      <span />
    </div>
  );
}

function PosterYear() {
  return (
    <FitText
      ariaHidden
      as="div"
      className="story-poster-year"
      deps={["25-26"]}
      fitId="intro-year"
      maxPx={180}
      minPx={82}
    >
      25-26
    </FitText>
  );
}

function TaxBracketWalkCard({
  rows,
  totalAmount,
  title,
}: {
  rows: readonly BracketWalkRow[];
  totalAmount: number;
  title: string;
}) {
  return (
    <section className="story-moment bracket-walk-card">
      <p className="story-eyebrow">How your tax was built</p>
      <FitText
        as="h2"
        className="story-title"
        deps={[title]}
        fitId="bracket-title"
        maxPx={80}
        minPx={34}
      >
        {title}
      </FitText>
      <div className="bracket-walk-list" aria-label="Tax bracket breakdown">
        {rows.map((row) => (
          <div
            key={row.id}
            className={`bracket-walk-row bracket-walk-row-${row.kind}`}
          >
            <div className="bracket-walk-main">
              <strong>{row.label}</strong>
              {row.rateLabel && (
                <span className="bracket-walk-rate">{row.rateLabel}</span>
              )}
            </div>
            <div className="bracket-walk-detail">
              {row.taxableAmount === null ? (
                <span>{row.kind === "offset" ? "Offset applied" : "Added to estimate"}</span>
              ) : (
                <span>{formatCurrency(row.taxableAmount)} taxed</span>
              )}
              <strong className="bracket-walk-amount">
                {formatCurrency(row.amount)}
              </strong>
            </div>
          </div>
        ))}
        <div className="bracket-walk-row bracket-walk-total">
          <div className="bracket-walk-main">
            <strong>Total estimate</strong>
          </div>
          <AnimatedCurrency
            amount={totalAmount}
            as="strong"
            className="bracket-walk-total-amount"
            fit={{ id: "bracket-total", minPx: 30, maxPx: 56 }}
          />
        </div>
      </div>
    </section>
  );
}

function ProgramCallouts({
  callouts,
}: {
  callouts: readonly BudgetProgramCalloutAllocationRow[];
}) {
  if (callouts.length === 0) {
    return null;
  }

  return (
    <div className="program-callouts" data-testid="program-callouts">
      {callouts.slice(0, 2).map((callout) => (
        <article key={callout.id} className="program-callout">
          <div className="program-callout-topline">
            <AnimatedCurrency
              amount={callout.amount}
              as="strong"
              className="program-callout-amount"
            />
            <Link
              className="program-callout-source"
              href={`/sources#${callout.sourceId}`}
            >
              Source
            </Link>
          </div>
          <p>
            <b>{callout.label}</b> - {callout.descriptionShort}
          </p>
          <span>{callout.sourceLocator}</span>
        </article>
      ))}
    </div>
  );
}

function AnimatedBillions({
  amountM,
  className,
  fit,
}: {
  amountM: number;
  className?: string;
  fit?: {
    id: string;
    minPx: number;
    maxPx: number;
  };
}) {
  const displayedAmountM = useCountUp(amountM, 700);
  const finalValue = formatCommonwealthBill(amountM);
  const displayedValue = formatCommonwealthBill(displayedAmountM);
  const content = (
    <span
      aria-hidden="true"
      className="countup-currency-value"
      suppressHydrationWarning
    >
      {displayedValue}
    </span>
  );
  const countUpClassName = className
    ? `${className} countup-currency`
    : "countup-currency";
  const countUpStyle = {
    "--countup-width": `${finalValue.length}ch`,
  } as CSSProperties;

  if (fit) {
    return (
      <FitText
        ariaLabel={finalValue}
        as="p"
        className={countUpClassName}
        deps={[finalValue]}
        fitId={fit.id}
        maxPx={fit.maxPx}
        minPx={fit.minPx}
        style={countUpStyle}
      >
        {content}
      </FitText>
    );
  }

  return (
    <p
      aria-label={finalValue}
      className={countUpClassName}
      style={countUpStyle}
    >
      {content}
    </p>
  );
}

function AustraliaReceiptCodaCard({
  onSharePreview,
  totalTaxAmount,
  title,
}: {
  onSharePreview: React.MouseEventHandler<HTMLAnchorElement>;
  totalTaxAmount: number;
  title: string;
}) {
  const scaleDenominator =
    calculateReceiptScaleDenominator(totalTaxAmount);

  return (
    <section className="story-moment story-moment-coda">
      <p className="story-eyebrow">Zooming out</p>
      <FitText
        as="h2"
        className="story-title"
        deps={[title]}
        fitId="coda-title"
        maxPx={54}
        minPx={32}
      >
        {title}
      </FitText>
      <AnimatedBillions
        amountM={COMMONWEALTH_TOTAL_EXPENSES_M}
        className="coda-total"
        fit={{ id: "coda-total", minPx: 56, maxPx: 86 }}
      />
      {scaleDenominator !== null && (
        <p className="coda-slice">
          Your illustrative slice: {formatCurrency(totalTaxAmount)} — about 1
          in {formatReceiptScaleDenominator(scaleDenominator)} of the total.
        </p>
      )}
      <TransparencyLinkGroup
        links={[
          {
            href: "/share-preview",
            label: "Share preview",
            onClick: onSharePreview,
          },
          { href: "/methodology", label: "Methodology" },
          { href: "/sources", label: "Sources" },
          { href: "/privacy", label: "Privacy" },
        ]}
      />
    </section>
  );
}

const drilldownColours = [
  "#bb33b6",
  "#149c48",
  "#2e55ff",
  "#df1f26",
  "#c5d8da",
  "#ddc5c8",
  "#f4c84e",
  "#929292",
] as const;

function getDrilldownColour(index: number) {
  return drilldownColours[index % drilldownColours.length];
}

function getFunctionTone(slug: string): AccentTone {
  return (
    FUNCTION_STORY_META.find((item) => item.slug === slug)?.tone ?? "magenta"
  );
}

function buildConicGradient(rows: readonly BudgetDrilldownAllocationRow[]) {
  const totalCents = rows.reduce((total, row) => total + row.amountCents, 0);

  if (totalCents === 0) {
    return "conic-gradient(#d8d5ce 0deg 360deg)";
  }

  let cursor = 0;
  const segments = rows.map((row, index) => {
    const start = cursor;
    const share = row.amountCents / totalCents;
    cursor += share * 360;

    return `${getDrilldownColour(index)} ${start}deg ${cursor}deg`;
  });

  return `conic-gradient(${segments.join(", ")})`;
}

function getSourcePrefix(view: BudgetDrilldownView) {
  return view.node.id === "defence" || view.path[0]?.id === "defence"
    ? "Defence breakdown"
    : "Source";
}

function BudgetDrilldownCard({
  view,
  onSelectChild,
}: {
  view: BudgetDrilldownView;
  onSelectChild: (id: string) => void;
}) {
  const barsRef = useRef<HTMLDivElement>(null);
  const [hasMoreBars, setHasMoreBars] = useState(false);
  const maxCents = Math.max(...view.rows.map((row) => row.amountCents), 0);
  const sourcePrefix = getSourcePrefix(view);
  const defenceBreakdownSource = view.node.id === "defence" ? view.rows[0]?.source : null;
  const updateScrollAffordance = useCallback(() => {
    const bars = barsRef.current;

    if (!bars) {
      setHasMoreBars(false);
      return;
    }

    const remainingScroll = bars.scrollHeight - bars.scrollTop - bars.clientHeight;
    setHasMoreBars(remainingScroll > 1);
  }, []);

  useEffect(() => {
    const bars = barsRef.current;

    if (!bars) {
      return;
    }

    updateScrollAffordance();
    bars.addEventListener("scroll", updateScrollAffordance, { passive: true });
    window.addEventListener("resize", updateScrollAffordance);

    const resizeObserver =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(updateScrollAffordance);

    resizeObserver?.observe(bars);
    Array.from(bars.children).forEach((child) => resizeObserver?.observe(child));

    return () => {
      bars.removeEventListener("scroll", updateScrollAffordance);
      window.removeEventListener("resize", updateScrollAffordance);
      resizeObserver?.disconnect();
    };
  }, [updateScrollAffordance, view]);

  return (
    <section className="drilldown-card">
      <div
        className="drilldown-donut"
        style={{ "--drilldown-chart": buildConicGradient(view.rows) } as CSSProperties}
        aria-hidden="true"
      />
      <div className="drilldown-headline">
        <p>You contributed</p>
        <AnimatedCurrency
          amount={view.contributionAmount}
          as="strong"
          fit={{ id: "drilldown-contribution", minPx: 46, maxPx: 104 }}
        />
        <span>to {view.node.label}.</span>
      </div>
      <div
        className={`drilldown-bars-shell ${hasMoreBars ? "has-scroll-more" : ""}`}
      >
        <div className="drilldown-bars" data-testid="drilldown-bars" ref={barsRef}>
          {view.rows.map((row, index) => {
            const width =
              maxCents > 0 ? Math.max(2, (row.amountCents / maxCents) * 100) : 0;
            const colour = getDrilldownColour(index);
            const content = (
              <>
                <span className="drilldown-bar-track">
                  <span
                    className="drilldown-bar-fill"
                    style={{ width: `${width}%`, backgroundColor: colour }}
                  />
                </span>
                <strong>{formatCurrency(row.amount)}</strong>
                <span className="drilldown-row-text">
                  <b>{row.label}</b>
                  <small>{row.description}</small>
                </span>
              </>
            );

            return row.hasChildren ? (
              <button
                key={row.id}
                type="button"
                className="drilldown-row drilldown-row-button"
                onClick={() => onSelectChild(row.id)}
                aria-label={`Open ${row.label} breakdown`}
              >
                {content}
              </button>
            ) : (
              <div key={row.id} className="drilldown-row">
                {content}
              </div>
            );
          })}
        </div>
        <span
          aria-hidden="true"
          className="drilldown-scroll-affordance"
          data-testid="drilldown-scroll-affordance"
          data-visible={hasMoreBars ? "true" : "false"}
        />
      </div>
      <p className="drilldown-source">
        {view.node.id === "defence" ? "Source" : sourcePrefix}:{" "}
        {view.node.source}
      </p>
      {defenceBreakdownSource && (
        <p className="drilldown-source">
          Defence breakdown: {defenceBreakdownSource}
        </p>
      )}
      <p className="drilldown-source drilldown-source-muted">
        {view.node.sourceLocator}
      </p>
      <p className="drilldown-hint">
        {view.rows.some((row) => row.hasChildren)
          ? "Tap on a budget line to read more."
          : "No deeper sourced breakdown is available for these lines."}
      </p>
    </section>
  );
}

function TransparencyLinkGroup({
  links,
}: {
  links: readonly {
    href: string;
    label: string;
    onClick?: React.MouseEventHandler<HTMLAnchorElement>;
  }[];
}) {
  return (
    <nav className="story-transparency-links" aria-label="Transparency links">
      {links.map((link) => (
        <Link key={link.href} href={link.href} onClick={link.onClick}>
          {link.label}
        </Link>
      ))}
    </nav>
  );
}

interface StoryFrameProps {
  children: React.ReactNode;
  currentKind: StepKind;
  currentStep: number;
  surface: StorySurface;
  tone: AccentTone;
  totalSteps: number;
  canGoBack: boolean;
  canGoNext: boolean;
  nextLabel?: string;
  onBack: () => void;
  onNext: () => void;
  onRestart: () => void;
}

function StoryFrame({
  children,
  currentKind,
  currentStep,
  surface,
  tone,
  totalSteps,
  canGoBack,
  canGoNext,
  nextLabel = "Next",
  onBack,
  onNext,
  onRestart,
}: StoryFrameProps) {
  const colour = storyPalette[tone];
  const surfaceClasses = storySurfaces[surface];
  const surfaceColour =
    surface === "charcoal" ? "var(--story-charcoal)" : "var(--story-paper)";
  const progress = ((currentStep + 1) / totalSteps) * 100;
  const cardRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (currentKind !== "drilldown") {
      return;
    }

    const card = cardRef.current;

    if (!card) {
      return;
    }

    if (typeof card.scrollTo === "function") {
      card.scrollTo({ top: 0, left: 0 });
      return;
    }

    card.scrollTop = 0;
    card.scrollLeft = 0;
  }, [currentKind]);

  return (
    <main className="story-shell">
      <div
        className={`story-desktop-stage story-tone-${tone}`}
        style={{ "--story-surface-colour": surfaceColour } as CSSProperties}
      >
        <section
          ref={cardRef}
          className={`story-card story-card-${currentKind} story-tone-${tone} ${surfaceClasses.surface} ${surfaceClasses.ink}`}
          data-step={currentKind}
          style={{ "--story-surface-colour": surfaceColour } as CSSProperties}
        >
          <WavyLines />
          <PatternBlock />
          <div className={`story-slab ${colour.accent} ${colour.glow}`} />
          {currentKind === "intro" && <PosterYear />}

          <header className="story-topbar">
            <span>Australian Budget Wrapped</span>
            <span>
              {currentStep + 1}/{totalSteps}
            </span>
          </header>
          <div className="story-progress" aria-hidden="true">
            <span style={{ width: `${progress}%` }} />
          </div>

          <div key={currentStep} className="story-content">
            {children}
          </div>

          <nav
            className={`story-controls ${
              currentKind === "intro" ? "story-controls-intro" : ""
            }`}
            aria-label="Story controls"
          >
            <nav
              className="story-controls-links"
              aria-label="Desktop transparency links"
            >
              <Link href="/methodology">Methodology</Link>
              <Link href="/sources">Sources</Link>
              <Link href="/privacy">Privacy</Link>
            </nav>
            <p className="story-controls-caveat">
              Illustrative estimate. Taxes are not hypothecated.
            </p>
            <div className="story-controls-actions">
              <button
                type="button"
                className="story-icon-button"
                onClick={onBack}
                disabled={!canGoBack}
                aria-label="Back"
              >
                ←
              </button>
              <button
                type="button"
                className="story-main-button"
                onClick={onNext}
                disabled={!canGoNext}
              >
                {nextLabel}
              </button>
              <button
                type="button"
                className="story-icon-button"
                onClick={onRestart}
                aria-label="Restart"
              >
                ↺
              </button>
            </div>
          </nav>
        </section>
      </div>
    </main>
  );
}

interface FunctionStory {
  meta: (typeof FUNCTION_STORY_META)[number];
  allocation: BudgetFunctionAllocation;
  callouts: readonly BudgetProgramCalloutAllocationRow[];
}

interface SpotlightStory {
  meta: (typeof SPOTLIGHT_STORY_META)[number];
  allocation: SpotlightAllocation;
}

function buildFunctionStories(
  allocations: readonly BudgetFunctionAllocation[],
): FunctionStory[] {
  return FUNCTION_STORY_META.flatMap((meta) => {
    const allocation = allocations.find((item) => item.slug === meta.slug);
    const category = getBudgetDrilldownCategory(meta.slug);

    return allocation
      ? [
          {
            meta,
            allocation,
            callouts: category
              ? calculateBudgetProgramCallouts(
                  allocation.amountCents,
                  category,
                )
              : [],
          },
        ]
      : [];
  });
}

function buildSpotlightStories(
  allocations: readonly SpotlightAllocation[],
): SpotlightStory[] {
  return SPOTLIGHT_STORY_META.flatMap((meta) => {
    const allocation = allocations.find((item) => item.slug === meta.slug);

    return allocation ? [{ meta, allocation }] : [];
  });
}

export function BudgetWrappedFlow() {
  const [stepIndex, setStepIndex] = useState(0);
  const [incomeInput, setIncomeInput] = useState("");
  const [activeDrilldownPath, setActiveDrilldownPath] = useState<string[]>([]);
  const taxableIncome = parseIncome(incomeInput);
  const hasIncome = taxableIncome !== null;

  const taxEstimate = useMemo(
    () =>
      estimateAustralianTax2025_26({
        taxableIncome: taxableIncome ?? 0,
        includeMedicareLevy: true,
      }),
    [taxableIncome],
  );

  const allocationSummary = useMemo(
    () => allocateTaxAcrossBudgetFunctions(taxEstimate.totalEstimatedTax),
    [taxEstimate.totalEstimatedTax],
  );
  const bracketWalkRows = useMemo(
    () =>
      buildBracketWalk(taxableIncome ?? 0, {
        includeMedicareLevy: true,
      }),
    [taxableIncome],
  );
  const spotlightSummary = useMemo(
    () => calculateSpotlightAllocation(taxEstimate.totalEstimatedTax),
    [taxEstimate.totalEstimatedTax],
  );
  const activeDrilldownView = useMemo(
    () =>
      activeDrilldownPath.length > 0
        ? calculateBudgetDrilldownView(
            taxEstimate.totalEstimatedTax,
            activeDrilldownPath,
          )
        : null,
    [activeDrilldownPath, taxEstimate.totalEstimatedTax],
  );
  const categoryStories = buildFunctionStories(allocationSummary.allocations);
  const spotlightStories = buildSpotlightStories(spotlightSummary.allocations);
  const prepareSharePreview = useCallback(() => {
    setSharePreviewEstimatedTax(taxEstimate.totalEstimatedTax);
  }, [taxEstimate.totalEstimatedTax]);

  const steps: StoryStep[] = [
    {
      kind: "intro",
      eyebrow: "Commonwealth tax estimate",
      title: "Your Australian Budget Wrapped",
      tone: "red",
      surface: "paper",
    },
    {
      kind: "input",
      eyebrow: "Start with taxable income",
      title: "What should we wrap?",
      tone: "blue",
      surface: "charcoal",
    },
    {
      kind: "tax",
      eyebrow: "Estimated Commonwealth tax",
      title: "Your tax estimate",
      tone: "red",
      surface: "charcoal",
    },
    {
      kind: "bracket-walk",
      eyebrow: "How your tax was built",
      title: "Bracket by bracket.",
      tone: "green",
      surface: "charcoal",
    },
    {
      kind: "allocation",
      eyebrow: "Budget map",
      title: "Mapped across the Budget",
      tone: "blue",
      surface: "paper",
    },
    ...categoryStories.map(({ meta }) => ({
      kind: "category" as const,
      eyebrow: "Additive Budget function",
      title: meta.title,
      slug: meta.slug,
      tone: meta.tone,
      surface: "paper" as const,
    })),
    ...spotlightStories.map(({ meta }) => ({
      kind: "spotlight" as const,
      eyebrow: "Non-additive spotlight",
      title: meta.title,
      slug: meta.slug,
      tone: meta.tone,
      surface: meta.surface,
    })),
    {
      kind: "summary",
      eyebrow: "Final summary",
      title: "Your illustrative receipt",
      tone: "green",
      surface: "charcoal",
    },
    {
      kind: "coda",
      eyebrow: "Zooming out",
      title: "Australia's 2025-26 Commonwealth bill.",
      tone: "blue",
      surface: "paper",
    },
  ];

  const currentStep = steps[stepIndex];
  const currentCategoryStory =
    currentStep.kind === "category"
      ? categoryStories.find((story) => story.meta.slug === currentStep.slug)
      : undefined;
  const currentSpotlightStory =
    currentStep.kind === "spotlight"
      ? spotlightStories.find((story) => story.meta.slug === currentStep.slug)
      : undefined;
  const canGoNext = currentStep.kind !== "input" || hasIncome;
  const isLastStep = stepIndex === steps.length - 1;
  const activeDrilldownRoot = activeDrilldownPath[0];
  const activeDrilldownTone = activeDrilldownRoot
    ? getFunctionTone(activeDrilldownRoot)
    : currentStep.tone;

  useEffect(() => {
    document.documentElement.dataset.storyHydrated = "true";

    return () => {
      delete document.documentElement.dataset.storyHydrated;
    };
  }, []);

  function goNext() {
    if (activeDrilldownView) {
      setActiveDrilldownPath([]);
      return;
    }

    if (!canGoNext) {
      return;
    }

    if (isLastStep) {
      return;
    }

    setStepIndex((current) => Math.min(current + 1, steps.length - 1));
  }

  function goBack() {
    if (activeDrilldownPath.length > 1) {
      setActiveDrilldownPath((current) => current.slice(0, -1));
      return;
    }

    if (activeDrilldownPath.length === 1) {
      setActiveDrilldownPath([]);
      return;
    }

    setStepIndex((current) => Math.max(current - 1, 0));
  }

  function restart() {
    setStepIndex(0);
    setIncomeInput("");
    setActiveDrilldownPath([]);
  }

  function openDrilldown(slug: BudgetFunctionSlug) {
    if (getBudgetDrilldownCategory(slug)) {
      setActiveDrilldownPath([slug]);
    }
  }

  function openNestedDrilldown(id: string) {
    setActiveDrilldownPath((current) => [...current, id]);
  }

  return (
    <StoryFrame
      currentKind={activeDrilldownView ? "drilldown" : currentStep.kind}
      currentStep={stepIndex}
      surface={activeDrilldownView ? "paper" : currentStep.surface}
      tone={activeDrilldownView ? activeDrilldownTone : currentStep.tone}
      totalSteps={steps.length}
      canGoBack={activeDrilldownPath.length > 0 || stepIndex > 0}
      canGoNext={activeDrilldownView ? true : canGoNext && !isLastStep}
      nextLabel={
        activeDrilldownView ? "Done" : stepIndex === 0 ? "Start" : "Next"
      }
      onBack={goBack}
      onNext={goNext}
      onRestart={restart}
    >
      {activeDrilldownView && (
        <BudgetDrilldownCard
          view={activeDrilldownView}
          onSelectChild={openNestedDrilldown}
        />
      )}

      {!activeDrilldownView && currentStep.kind === "intro" && (
        <section className="story-moment story-moment-center">
          <p className="story-eyebrow">{currentStep.eyebrow}</p>
          <FitText
            as="h1"
            className="story-title"
            deps={[currentStep.title]}
            fitId="intro-title"
            maxPx={78}
            minPx={34}
          >
            {currentStep.title}
          </FitText>
          <p className="story-copy">
            Estimate how your Commonwealth tax maps across Australian
            Government spending.
          </p>
          <p className="story-caveat">
            This is an estimate. Taxes are not hypothecated.
          </p>
        </section>
      )}

      {!activeDrilldownView && currentStep.kind === "input" && (
        <section className="story-moment">
          <p className="story-eyebrow">{currentStep.eyebrow}</p>
          <FitText
            as="h2"
            className="story-title"
            deps={[currentStep.title]}
            fitId="input-title"
            maxPx={90}
            minPx={36}
          >
            {currentStep.title}
          </FitText>
          <form
            className="income-form"
            onSubmit={(event) => {
              event.preventDefault();
              goNext();
            }}
          >
            <label htmlFor="taxable-income">Taxable income</label>
            <div className="income-input-wrap">
              <span>$</span>
              <input
                id="taxable-income"
                name="taxable-income"
                inputMode="decimal"
                autoComplete="off"
                placeholder="90,000"
                value={incomeInput}
                onChange={(event) => setIncomeInput(event.target.value)}
              />
            </div>
            <p>
              Use taxable income, not salary. Your input stays in this page
              only.
            </p>
          </form>
        </section>
      )}

      {!activeDrilldownView && currentStep.kind === "tax" && (
        <section className="story-moment story-moment-center">
          <TaxEstimateMark />
          <p className="story-eyebrow">{currentStep.eyebrow}</p>
          <FitText
            as="h2"
            className="story-title"
            deps={[currentStep.title]}
            fitId="tax-title"
            maxPx={84}
            minPx={38}
          >
            {currentStep.title}
          </FitText>
          <AnimatedCurrency
            amount={taxEstimate.totalEstimatedTax}
            as="p"
            className="story-number story-number-red"
            fit={{ id: "tax-total", minPx: 54, maxPx: 108 }}
          />
          <p className="story-copy">
            Including a simplified Medicare levy. Still an estimate, not tax
            advice.
          </p>
          <TransparencyLinkGroup
            links={[
              { href: "/methodology", label: "How calculated" },
              { href: "/sources", label: "Sources" },
            ]}
          />
        </section>
      )}

      {!activeDrilldownView && currentStep.kind === "bracket-walk" && (
        <TaxBracketWalkCard
          rows={bracketWalkRows}
          totalAmount={taxEstimate.totalEstimatedTax}
          title={currentStep.title}
        />
      )}

      {!activeDrilldownView && currentStep.kind === "allocation" && (
        <section className="story-moment story-moment-allocation">
          <p className="story-eyebrow">{currentStep.eyebrow}</p>
          <FitText
            as="h2"
            className="story-title"
            deps={[currentStep.title]}
            fitId="allocation-title"
            maxPx={84}
            minPx={34}
          >
            {currentStep.title}
          </FitText>
          <p className="allocation-hero">
            <FitText
              as="span"
              deps={[formatCurrency(taxEstimate.totalEstimatedTax)]}
              fitId="allocation-total"
              maxPx={62}
              minPx={30}
            >
              {formatCurrency(taxEstimate.totalEstimatedTax)}
            </FitText>
            split proportionally
          </p>
          <AllocationStackedChart summary={allocationSummary} />
          <p className="story-caveat">
            Illustrative only. Taxes are not hypothecated.
          </p>
          <TransparencyLinkGroup
            links={[
              { href: "/methodology", label: "Methodology" },
              { href: "/sources", label: "Sources" },
            ]}
          />
        </section>
      )}

      {!activeDrilldownView && currentStep.kind === "category" && currentCategoryStory && (
        <section className="story-moment story-moment-center">
          <div
            className={`category-hit tone-${currentCategoryStory.meta.tone}`}
          >
            <span aria-hidden="true" className="story-watermark">
              {currentCategoryStory.meta.motif}
            </span>
            <CategoryShareChart
              allocation={currentCategoryStory.allocation}
              title={currentCategoryStory.meta.title}
              tone={currentCategoryStory.meta.tone}
            />
            <p className="story-eyebrow">{currentStep.eyebrow}</p>
            <FitText
              as="p"
              className="story-kicker"
              deps={[currentCategoryStory.meta.message]}
              fitId="category-kicker"
              maxPx={36}
              minPx={22}
            >
              {currentCategoryStory.meta.message}
            </FitText>
            <AnimatedCurrency
              amount={currentCategoryStory.allocation.amount}
              as="p"
              className={`story-number story-number-${currentCategoryStory.meta.tone}`}
              fit={{ id: "category-amount", minPx: 52, maxPx: 112 }}
            />
            <ProgramCallouts callouts={currentCategoryStory.callouts} />
            <FitText
              as="h2"
              className="story-category-title"
              deps={[currentCategoryStory.meta.title]}
              fitId="category-title"
              maxPx={48}
              minPx={26}
            >
              {currentCategoryStory.meta.title}
            </FitText>
            <p className="story-copy story-copy-tight">
              {currentCategoryStory.meta.detail}
            </p>
            <p className="story-pill story-pill-soft">
              Additive function •{" "}
              {formatPercent(
                currentCategoryStory.allocation.shareOfAdditiveBudget,
              )}{" "}
              of the Budget function mix
            </p>
            <button
              type="button"
              className="story-detail-button"
              onClick={() => openDrilldown(currentCategoryStory.allocation.slug)}
            >
              Open breakdown
            </button>
            {spotlightSummary.allocations.some(
              (spotlight) =>
                spotlight.parentFunctionSlug ===
                currentCategoryStory.allocation.slug,
            ) && (
              <div className="story-mini-list">
                <span>Spotlights, not added</span>
                {spotlightSummary.allocations
                  .filter(
                    (spotlight) =>
                      spotlight.parentFunctionSlug ===
                      currentCategoryStory.allocation.slug,
                  )
                  .slice(0, 2)
                  .map((spotlight) => (
                    <p key={spotlight.slug}>
                      <strong>{formatCurrency(spotlight.amount)}</strong>{" "}
                      {spotlight.label}
                    </p>
                  ))}
              </div>
            )}
          </div>
        </section>
      )}

      {!activeDrilldownView && currentStep.kind === "spotlight" && currentSpotlightStory && (
        <section className="story-moment story-moment-center">
          <div
            className={`category-hit spotlight-hit tone-${currentSpotlightStory.meta.tone}`}
          >
            <span aria-hidden="true" className="story-watermark">
              {currentSpotlightStory.meta.motif}
            </span>
            <SpotlightMarkerChart
              allocation={currentSpotlightStory.allocation}
              title={currentSpotlightStory.meta.title}
              tone={currentSpotlightStory.meta.tone}
            />
            <p className="story-eyebrow">{currentStep.eyebrow}</p>
            <FitText
              as="p"
              className="story-kicker"
              deps={[currentSpotlightStory.meta.message]}
              fitId="spotlight-kicker"
              maxPx={36}
              minPx={22}
            >
              {currentSpotlightStory.meta.message}
            </FitText>
            <FitText
              as="p"
              className={`story-number story-number-${currentSpotlightStory.meta.tone}`}
              deps={[formatCurrency(currentSpotlightStory.allocation.amount)]}
              fitId="spotlight-amount"
              maxPx={112}
              minPx={52}
            >
              {formatCurrency(currentSpotlightStory.allocation.amount)}
            </FitText>
            <FitText
              as="h2"
              className="story-category-title"
              deps={[currentSpotlightStory.meta.title]}
              fitId="spotlight-title"
              maxPx={48}
              minPx={26}
            >
              {currentSpotlightStory.meta.title}
            </FitText>
            <p className="story-copy story-copy-tight">
              {currentSpotlightStory.meta.detail}
            </p>
            <p className="story-pill story-pill-soft">
              Non-additive • not included in the final summary total
            </p>
          </div>
        </section>
      )}

      {!activeDrilldownView && currentStep.kind === "summary" && (
        <section className="story-moment story-moment-summary">
          <p className="story-eyebrow">{currentStep.eyebrow}</p>
          <FitText
            as="h2"
            className="story-title"
            deps={[currentStep.title]}
            fitId="summary-title"
            maxPx={72}
            minPx={32}
          >
            {currentStep.title}
          </FitText>
          <AnimatedCurrency
            amount={taxEstimate.totalEstimatedTax}
            as="p"
            className="summary-total"
            fit={{ id: "summary-total", minPx: 52, maxPx: 120 }}
          />
          <SummaryRankedBarChart
            summary={allocationSummary}
            onFunctionSelect={openDrilldown}
          />
          <p className="story-caveat">
            Estimate only. This is a proportional Budget map, not a record of
            actual spending.
          </p>
          <TransparencyLinkGroup
            links={[
              {
                href: "/share-preview",
                label: "Share preview",
                onClick: prepareSharePreview,
              },
              { href: "/methodology", label: "Methodology" },
              { href: "/sources", label: "Sources" },
              { href: "/privacy", label: "Privacy" },
            ]}
          />
        </section>
      )}

      {!activeDrilldownView && currentStep.kind === "coda" && (
        <AustraliaReceiptCodaCard
          onSharePreview={prepareSharePreview}
          totalTaxAmount={taxEstimate.totalEstimatedTax}
          title={currentStep.title}
        />
      )}
    </StoryFrame>
  );
}
