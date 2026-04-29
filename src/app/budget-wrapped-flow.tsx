"use client";

import { useEffect, useMemo, useState } from "react";
import {
  allocateTaxAcrossBudgetFunctions,
  calculateSpotlightAllocation,
} from "@/lib/allocation/budget-allocation";
import { estimateAustralianTax2025_26 } from "@/lib/tax/australian-resident-2025-26";

const currencyFormatter = new Intl.NumberFormat("en-AU", {
  style: "currency",
  currency: "AUD",
  maximumFractionDigits: 0,
});

const percentFormatter = new Intl.NumberFormat("en-AU", {
  maximumFractionDigits: 1,
});

const storyColours = [
  {
    surface: "bg-[#f7f0df]",
    ink: "text-[#151515]",
    accent: "bg-[#ff3b7f]",
    glow: "story-glow-magenta",
  },
  {
    surface: "bg-[#151515]",
    ink: "text-[#f7f0df]",
    accent: "bg-[#38ff8b]",
    glow: "story-glow-green",
  },
  {
    surface: "bg-[#eef2ff]",
    ink: "text-[#111827]",
    accent: "bg-[#245cff]",
    glow: "story-glow-blue",
  },
  {
    surface: "bg-[#ffede8]",
    ink: "text-[#171717]",
    accent: "bg-[#ff3b2f]",
    glow: "story-glow-red",
  },
] as const;

type StepKind =
  | "intro"
  | "input"
  | "tax"
  | "allocation"
  | "category"
  | "summary";

interface StoryStep {
  kind: StepKind;
  eyebrow: string;
  title: string;
}

function formatCurrency(amount: number) {
  return currencyFormatter.format(Math.round(amount));
}

function formatPercent(share: number) {
  return `${percentFormatter.format(share * 100)}%`;
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
      <path d="M-80 120 C 50 40, 120 220, 250 130 S 420 90, 520 210" />
      <path d="M-120 350 C 20 250, 140 450, 280 330 S 430 260, 540 390" />
      <path d="M-80 590 C 80 490, 150 650, 300 560 S 470 500, 540 640" />
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

interface StoryFrameProps {
  children: React.ReactNode;
  currentStep: number;
  totalSteps: number;
  canGoBack: boolean;
  canGoNext: boolean;
  nextLabel?: string;
  onBack: () => void;
  onNext: () => void;
  onRestart: () => void;
  colourIndex: number;
}

function StoryFrame({
  children,
  currentStep,
  totalSteps,
  canGoBack,
  canGoNext,
  nextLabel = "Next",
  onBack,
  onNext,
  onRestart,
  colourIndex,
}: StoryFrameProps) {
  const colour = storyColours[colourIndex % storyColours.length];

  return (
    <main className="story-shell">
      <section className={`story-card ${colour.surface} ${colour.ink}`}>
        <WavyLines />
        <PatternBlock />
        <div className={`story-slab ${colour.accent} ${colour.glow}`} />

        <header className="story-topbar">
          <span>Australian Budget Wrapped</span>
          <span>
            {currentStep + 1}/{totalSteps}
          </span>
        </header>

        <div key={currentStep} className="story-content">
          {children}
        </div>

        <nav className="story-controls" aria-label="Story controls">
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
  const categoryStories = allocationSummary.allocations
    .slice()
    .sort((left, right) => right.amountCents - left.amountCents)
    .slice(0, 3);
  const spotlightStories = spotlightSummary.allocations.slice(0, 3);

  const steps: StoryStep[] = [
    {
      kind: "intro",
      eyebrow: "Commonwealth tax estimate",
      title: "Your Australian Budget Wrapped",
    },
    {
      kind: "input",
      eyebrow: "Start with taxable income",
      title: "What should we wrap?",
    },
    {
      kind: "tax",
      eyebrow: "Estimated Commonwealth tax",
      title: "Your tax estimate",
    },
    {
      kind: "allocation",
      eyebrow: "Big picture",
      title: "Mapped across the Budget",
    },
    ...categoryStories.map((category) => ({
      kind: "category" as const,
      eyebrow: "Category story",
      title: category.label,
    })),
    {
      kind: "summary",
      eyebrow: "Wrap-up",
      title: "Your illustrative receipt",
    },
  ];

  const currentStep = steps[stepIndex];
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
      currentStep={stepIndex}
      totalSteps={steps.length}
      canGoBack={stepIndex > 0}
      canGoNext={canGoNext && !isLastStep}
      nextLabel={stepIndex === 0 ? "Start" : "Next"}
      onBack={goBack}
      onNext={goNext}
      onRestart={restart}
      colourIndex={stepIndex}
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
          <p className="story-eyebrow">{currentStep.eyebrow}</p>
          <h2 className="story-title">{currentStep.title}</h2>
          <p className="story-number">
            {formatCurrency(taxEstimate.totalEstimatedTax)}
          </p>
          <p className="story-copy">
            Including a simplified Medicare levy. Still an estimate, not tax
            advice.
          </p>
        </section>
      )}

      {currentStep.kind === "allocation" && (
        <section className="story-moment">
          <p className="story-eyebrow">{currentStep.eyebrow}</p>
          <h2 className="story-title">{currentStep.title}</h2>
          <div className="allocation-stack" aria-label="Top allocation preview">
            {categoryStories.map((category) => (
              <div key={category.slug} className="allocation-strip">
                <span>{category.label}</span>
                <strong>{formatCurrency(category.amount)}</strong>
              </div>
            ))}
          </div>
          <p className="story-caveat">
            Proportional and illustrative. Taxes are not hypothecated.
          </p>
        </section>
      )}

      {currentStep.kind === "category" && (
        <section className="story-moment story-moment-center">
          {categoryStories
            .filter((category) => category.label === currentStep.title)
            .map((category, index) => (
              <div key={category.slug} className="category-hit">
                <p className="story-eyebrow">{currentStep.eyebrow}</p>
                <h2 className="story-title">{category.label}</h2>
                <p className="story-number">{formatCurrency(category.amount)}</p>
                <p className="story-copy">
                  About {formatPercent(category.shareOfAdditiveBudget)} of the
                  additive Budget function mix.
                </p>
                {spotlightStories[index] && (
                  <p className="story-pill">
                    Spotlight: {spotlightStories[index].label}
                  </p>
                )}
              </div>
            ))}
        </section>
      )}

      {currentStep.kind === "summary" && (
        <section className="story-moment">
          <p className="story-eyebrow">{currentStep.eyebrow}</p>
          <h2 className="story-title">{currentStep.title}</h2>
          <div className="summary-shell">
            <div>
              <span>Tax estimate</span>
              <strong>{formatCurrency(taxEstimate.totalEstimatedTax)}</strong>
            </div>
            <div>
              <span>Top category</span>
              <strong>{categoryStories[0]?.label}</strong>
            </div>
            <div>
              <span>Model</span>
              <strong>Illustrative only</strong>
            </div>
          </div>
          <p className="story-caveat">
            Estimate only. This is not a record of actual spending; taxes are
            not hypothecated.
          </p>
        </section>
      )}
    </StoryFrame>
  );
}
