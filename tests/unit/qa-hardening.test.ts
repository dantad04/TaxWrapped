import { sourceRegistry } from "@/data/sources";
import {
  allocateTaxAcrossBudgetFunctions,
  calculateSpotlightAllocation,
} from "@/lib/allocation/budget-allocation";
import {
  buildSummaryChartRows,
  sumChartRowCents,
} from "@/lib/charts/budget-chart-data";
import {
  buildShareCardData,
  sumShareCardRowCents,
} from "@/lib/share/share-card-data";
import { estimateAustralianTax2025_26 } from "@/lib/tax/australian-resident-2025-26";
import fs from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";

async function collectSourceFiles(directory: string): Promise<string[]> {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(directory, entry.name);

      if (entry.isDirectory()) {
        return collectSourceFiles(fullPath);
      }

      if (/\.(css|ts|tsx)$/.test(entry.name)) {
        return [fullPath];
      }

      return [];
    }),
  );

  return files.flat();
}

async function readSourceFiles() {
  const sourceFiles = await collectSourceFiles(path.join(process.cwd(), "src"));

  return Promise.all(
    sourceFiles.map(async (filePath) => ({
      relativePath: path.relative(process.cwd(), filePath),
      source: await fs.readFile(filePath, "utf8"),
    })),
  );
}

function phrase(words: readonly string[]) {
  return words.join(" ");
}

describe("MVP QA hardening", () => {
  it("does not introduce browser storage, cookies, API calls, analytics, or server actions in source", async () => {
    const files = await readSourceFiles();
    const bannedPatterns = [
      { label: "browser local storage", pattern: /localStorage/ },
      { label: "browser session storage", pattern: /sessionStorage/ },
      { label: "document cookies", pattern: /document\.cookie/ },
      { label: "Next cookies helper", pattern: /cookies\(/ },
      { label: "fetch API", pattern: /\bfetch\(/ },
      { label: "XMLHttpRequest", pattern: /XMLHttpRequest/ },
      { label: "sendBeacon", pattern: /sendBeacon/ },
      { label: "server action directive", pattern: /["']use server["']/ },
      { label: "Google Analytics", pattern: /\bgtag\(/ },
      { label: "dataLayer", pattern: /dataLayer/ },
      { label: "PostHog", pattern: /posthog/i },
      { label: "Plausible", pattern: /plausible\(/i },
    ];
    const matches: string[] = [];

    for (const file of files) {
      for (const banned of bannedPatterns) {
        if (banned.pattern.test(file.source)) {
          matches.push(`${file.relativePath}: ${banned.label}`);
        }
      }
    }

    expect(matches).toEqual([]);
  });

  it("does not include hypothecation-implying risky copy in app source", async () => {
    const files = await readSourceFiles();
    const riskyPhrases = [
      phrase(["exactly", "where", "your", "tax", "dollars", "went"]),
      phrase(["where", "your", "dollars", "went"]),
      phrase(["your", "exact", "dollars"]),
      phrase(["exact", "dollars", "went"]),
      phrase(["dollars", "were", "literally", "assigned"]),
    ];
    const matches: string[] = [];

    for (const file of files) {
      for (const riskyPhrase of riskyPhrases) {
        if (file.source.toLowerCase().includes(riskyPhrase)) {
          matches.push(`${file.relativePath}: ${riskyPhrase}`);
        }
      }
    }

    expect(matches).toEqual([]);
  });

  it("keeps tax, allocation, chart, and share totals reconciled for representative, zero, and low-tax cases", () => {
    for (const taxableIncome of [0, 20_000, 90_000]) {
      const taxEstimate = estimateAustralianTax2025_26({
        taxableIncome,
        includeMedicareLevy: true,
      });
      const summary = allocateTaxAcrossBudgetFunctions(
        taxEstimate.totalEstimatedTax,
      );
      const rows = buildSummaryChartRows(summary);
      const shareCard = buildShareCardData(summary);

      expect(taxEstimate.incomeTaxAfterOffsets).toBeGreaterThanOrEqual(0);
      expect(
        summary.allocations.reduce((total, row) => total + row.amountCents, 0),
      ).toBe(summary.inputTaxAmountCents);
      expect(sumChartRowCents(rows)).toBe(summary.inputTaxAmountCents);
      expect(sumShareCardRowCents(shareCard.rows)).toBe(
        summary.inputTaxAmountCents,
      );
      expect(rows.every((row) => row.additive)).toBe(true);
      expect(shareCard.rows.every((row) => row.additive)).toBe(true);
    }
  });

  it("keeps spotlight programs non-additive and outside final summary/share rows", () => {
    const summary = allocateTaxAcrossBudgetFunctions(19_588);
    const spotlightSummary = calculateSpotlightAllocation(19_588);
    const summaryRows = buildSummaryChartRows(summary);
    const shareCard = buildShareCardData(summary);
    const finalSlugs = new Set<string>([
      ...summaryRows.flatMap((row) => [row.id, ...row.sourceSlugs]),
      ...shareCard.rows.flatMap((row) => [row.id, ...row.sourceSlugs]),
    ]);

    for (const spotlight of spotlightSummary.allocations) {
      expect(spotlight.additive).toBe(false);
      expect(finalSlugs.has(spotlight.slug)).toBe(false);
    }
  });

  it("connects displayed source-dependent tax and allocation outputs to the source registry", () => {
    const taxEstimate = estimateAustralianTax2025_26({
      taxableIncome: 90_000,
      includeMedicareLevy: true,
    });
    const summary = allocateTaxAcrossBudgetFunctions(
      taxEstimate.totalEstimatedTax,
    );
    const spotlightSummary = calculateSpotlightAllocation(
      taxEstimate.totalEstimatedTax,
    );
    const sourceIds = new Set(Object.keys(sourceRegistry));

    for (const sourceId of taxEstimate.sourceIds) {
      expect(sourceIds.has(sourceId)).toBe(true);
    }

    for (const allocation of [
      ...summary.allocations,
      ...spotlightSummary.allocations,
    ]) {
      expect(sourceIds.has(allocation.sourceId)).toBe(true);
      expect(allocation.source).not.toBeNull();
    }
  });

  it("keeps raw taxable income out of share-card text fields", () => {
    const taxEstimate = estimateAustralianTax2025_26({
      taxableIncome: 90_000,
      includeMedicareLevy: true,
    });
    const shareCard = buildShareCardData(
      allocateTaxAcrossBudgetFunctions(taxEstimate.totalEstimatedTax),
    );
    const searchableShareText = [
      shareCard.productName,
      shareCard.sourceYearLabel,
      shareCard.caveat,
      shareCard.methodologyLabel,
      ...shareCard.rows.flatMap((row) => [
        row.id,
        row.label,
        row.displayLabel,
        String(row.amount),
      ]),
    ].join(" ");

    expect(searchableShareText).not.toContain("90000");
    expect(searchableShareText).not.toContain("90,000");
    expect(searchableShareText).not.toContain("$90,000");
  });
});
