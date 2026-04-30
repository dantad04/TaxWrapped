"use client";

import { useEffect, useMemo, useState } from "react";
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
import { estimateAustralianTax2025_26 } from "@/lib/tax/australian-resident-2025-26";

const currencyFormatter = new Intl.NumberFormat("en-AU", {
  style: "currency",
  currency: "AUD",
  maximumFractionDigits: 0,
});

const percentFormatter = new Intl.NumberFormat("en-AU", {
  maximumFractionDigits: 1,
});

type AccentTone = "blue" | "green" | "magenta" | "red";
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
  | "allocation"
  | "category"
  | "spotlight"
  | "summary";

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

function getAccentTone(index: number): AccentTone {
  const tones: AccentTone[] = ["magenta", "green", "blue", "red"];

  return tones[index % tones.length];
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

function MiniPieMark({ tone }: { tone: AccentTone }) {
  return <div aria-hidden="true" className={`mini-pie mini-pie-${tone}`} />;
}

function PosterYear() {
  return <div aria-hidden="true" className="story-poster-year">25-26</div>;
}

interface StoryBar {
  amount: number;
  label: string;
  fillShare: number;
  tone: AccentTone;
}

function StoryBars({
  bars,
  label,
}: {
  bars: StoryBar[];
  label: string;
}) {
  return (
    <div className="poster-bars" aria-label={label}>
      {bars.map((bar) => (
        <div key={bar.label} className={`poster-bar poster-bar-${bar.tone}`}>
          <div className="poster-bar-fill-wrap">
            <span
              className="poster-bar-fill"
              style={{
                width: `${Math.max(7, Math.min(100, bar.fillShare * 100))}%`,
              }}
            />
          </div>
          <strong>{formatCurrency(bar.amount)}</strong>
          <span>{bar.label}</span>
        </div>
      ))}
    </div>
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
  const progress = ((currentStep + 1) / totalSteps) * 100;

  return (
    <main className="story-shell">
      <section
        className={`story-card story-card-${currentKind} story-tone-${tone} ${surfaceClasses.surface} ${surfaceClasses.ink}`}
        data-step={currentKind}
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
        </nav>
      </section>
    </main>
  );
}

interface FunctionStory {
  meta: (typeof FUNCTION_STORY_META)[number];
  allocation: BudgetFunctionAllocation;
}

interface SpotlightStory {
  meta: (typeof SPOTLIGHT_STORY_META)[number];
  allocation: SpotlightAllocation;
}

function getFunctionDisplayLabel(slug: BudgetFunctionSlug, label: string) {
  return (
    FUNCTION_STORY_META.find((item) => item.slug === slug)?.title ?? label
  );
}

function buildFunctionStories(
  allocations: readonly BudgetFunctionAllocation[],
): FunctionStory[] {
  return FUNCTION_STORY_META.flatMap((meta) => {
    const allocation = allocations.find((item) => item.slug === meta.slug);

    return allocation ? [{ meta, allocation }] : [];
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
  const spotlightSummary = useMemo(
    () => calculateSpotlightAllocation(taxEstimate.totalEstimatedTax),
    [taxEstimate.totalEstimatedTax],
  );
  const topAllocationPreview = allocationSummary.allocations
    .slice()
    .sort((left, right) => right.amountCents - left.amountCents)
    .slice(0, 4);
  const maxPreviewAmountCents = topAllocationPreview[0]?.amountCents ?? 1;
  const categoryStories = buildFunctionStories(allocationSummary.allocations);
  const spotlightStories = buildSpotlightStories(spotlightSummary.allocations);

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

  useEffect(() => {
    document.documentElement.dataset.storyHydrated = "true";

    return () => {
      delete document.documentElement.dataset.storyHydrated;
    };
  }, []);

  function goNext() {
    if (!canGoNext) {
      return;
    }

    if (isLastStep) {
      return;
    }

    setStepIndex((current) => Math.min(current + 1, steps.length - 1));
  }

  function goBack() {
    setStepIndex((current) => Math.max(current - 1, 0));
  }

  function restart() {
    setStepIndex(0);
    setIncomeInput("");
  }

  return (
    <StoryFrame
      currentKind={currentStep.kind}
      currentStep={stepIndex}
      surface={currentStep.surface}
      tone={currentStep.tone}
      totalSteps={steps.length}
      canGoBack={stepIndex > 0}
      canGoNext={canGoNext && !isLastStep}
      nextLabel={stepIndex === 0 ? "Start" : "Next"}
      onBack={goBack}
      onNext={goNext}
      onRestart={restart}
    >
      {currentStep.kind === "intro" && (
        <section className="story-moment story-moment-center">
          <p className="story-eyebrow">{currentStep.eyebrow}</p>
          <h1 className="story-title">{currentStep.title}</h1>
          <p className="story-copy">
            Estimate how your Commonwealth tax maps across Australian
            Government spending.
          </p>
          <p className="story-caveat">
            This is an estimate. Taxes are not hypothecated.
          </p>
        </section>
      )}

      {currentStep.kind === "input" && (
        <section className="story-moment">
          <p className="story-eyebrow">{currentStep.eyebrow}</p>
          <h2 className="story-title">{currentStep.title}</h2>
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

      {currentStep.kind === "tax" && (
        <section className="story-moment story-moment-center">
          <MiniPieMark tone="red" />
          <p className="story-eyebrow">{currentStep.eyebrow}</p>
          <h2 className="story-title">{currentStep.title}</h2>
          <p className="story-number story-number-red">
            {formatCurrency(taxEstimate.totalEstimatedTax)}
          </p>
          <p className="story-copy">
            Including a simplified Medicare levy. Still an estimate, not tax
            advice.
          </p>
        </section>
      )}

      {currentStep.kind === "allocation" && (
        <section className="story-moment story-moment-allocation">
          <p className="story-eyebrow">{currentStep.eyebrow}</p>
          <h2 className="story-title">{currentStep.title}</h2>
          <p className="allocation-hero">
            <span>{formatCurrency(taxEstimate.totalEstimatedTax)}</span>
            split proportionally
          </p>
          <StoryBars
            label="Top allocation preview"
            bars={topAllocationPreview.map((category, index) => ({
              amount: category.amount,
              label: getFunctionDisplayLabel(category.slug, category.label),
              fillShare: category.amountCents / maxPreviewAmountCents,
              tone: getAccentTone(index),
            }))}
          />
          <p className="story-caveat">
            Illustrative only. Taxes are not hypothecated.
          </p>
        </section>
      )}

      {currentStep.kind === "category" && currentCategoryStory && (
        <section className="story-moment story-moment-center">
          <div
            className={`category-hit tone-${currentCategoryStory.meta.tone}`}
          >
            <span aria-hidden="true" className="story-watermark">
              {currentCategoryStory.meta.motif}
            </span>
            <MiniPieMark tone={currentCategoryStory.meta.tone} />
            <p className="story-eyebrow">{currentStep.eyebrow}</p>
            <p className="story-kicker">{currentCategoryStory.meta.message}</p>
            <p
              className={`story-number story-number-${currentCategoryStory.meta.tone}`}
            >
              {formatCurrency(currentCategoryStory.allocation.amount)}
            </p>
            <h2 className="story-category-title">
              {currentCategoryStory.meta.title}
            </h2>
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

      {currentStep.kind === "spotlight" && currentSpotlightStory && (
        <section className="story-moment story-moment-center">
          <div
            className={`category-hit spotlight-hit tone-${currentSpotlightStory.meta.tone}`}
          >
            <span aria-hidden="true" className="story-watermark">
              {currentSpotlightStory.meta.motif}
            </span>
            <MiniPieMark tone={currentSpotlightStory.meta.tone} />
            <p className="story-eyebrow">{currentStep.eyebrow}</p>
            <p className="story-kicker">{currentSpotlightStory.meta.message}</p>
            <p
              className={`story-number story-number-${currentSpotlightStory.meta.tone}`}
            >
              {formatCurrency(currentSpotlightStory.allocation.amount)}
            </p>
            <h2 className="story-category-title">
              {currentSpotlightStory.meta.title}
            </h2>
            <p className="story-copy story-copy-tight">
              {currentSpotlightStory.meta.detail}
            </p>
            <p className="story-pill story-pill-soft">
              Non-additive • not included in the final summary total
            </p>
          </div>
        </section>
      )}

      {currentStep.kind === "summary" && (
        <section className="story-moment story-moment-summary">
          <p className="story-eyebrow">{currentStep.eyebrow}</p>
          <h2 className="story-title">{currentStep.title}</h2>
          <p className="summary-total">
            {formatCurrency(taxEstimate.totalEstimatedTax)}
          </p>
          <div className="summary-shell">
            <div>
              <span>Additive map</span>
              <strong>Sums to your estimate</strong>
            </div>
            <div>
              <span>Largest slice</span>
              <strong>{FUNCTION_STORY_META[0].title}</strong>
            </div>
            <div>
              <span>Spotlights</span>
              <strong>Shown separately</strong>
            </div>
          </div>
          <p className="story-caveat">
            Estimate only. This is a proportional Budget map, not a record of
            actual spending.
          </p>
        </section>
      )}
    </StoryFrame>
  );
}
