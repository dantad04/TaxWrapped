import { cleanup, render, screen } from "@testing-library/react";
import fs from "node:fs/promises";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import Home from "@/app/page";
import MethodologyPage from "@/app/methodology/page";
import PrivacyPage from "@/app/privacy/page";
import SharePreviewPage from "@/app/share-preview/page";
import SourcesPage from "@/app/sources/page";
import { sourceRegistry } from "@/data/sources";

afterEach(() => {
  cleanup();
});

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

describe("routes", () => {
  it("home page renders", () => {
    render(<Home />);

    expect(
      screen.getByRole("heading", { name: "Your Australian Budget Wrapped" }),
    ).toBeDefined();
    expect(screen.getByText("Start")).toBeDefined();
  });

  it("methodology page renders", () => {
    render(<MethodologyPage />);

    expect(screen.getByRole("heading", { name: "Methodology" })).toBeDefined();
    expect(screen.getByText(/taxable income, not gross salary/i)).toBeDefined();
    expect(screen.getByText(/Low Income Tax Offset \(LITO\)/)).toBeDefined();
    expect(screen.getByText(/Medicare levy is simplified as 2%/)).toBeDefined();
    expect(
      screen.getByText(/allocates your estimated tax proportionally/i),
    ).toBeDefined();
    expect(screen.getByText(/Taxes are not hypothecated/)).toBeDefined();
  });

  it("sources page renders", () => {
    render(<SourcesPage />);

    expect(screen.getByRole("heading", { name: "Sources" })).toBeDefined();

    for (const source of Object.values(sourceRegistry)) {
      expect(screen.getByText(source.title)).toBeDefined();
      expect(screen.getAllByText(source.publisher).length).toBeGreaterThan(0);
    }
  });

  it("privacy page renders", () => {
    render(<PrivacyPage />);

    expect(screen.getByRole("heading", { name: "Privacy" })).toBeDefined();
    expect(screen.getByText(/does not store taxable income/i)).toBeDefined();
    expect(screen.getByText(/localStorage/)).toBeDefined();
    expect(screen.getByText(/sessionStorage/)).toBeDefined();
    expect(screen.getByText(/cookies/)).toBeDefined();
    expect(screen.getByText(/not tax advice/)).toBeDefined();
  });

  it("share preview page renders without raw taxable income", () => {
    render(<SharePreviewPage />);

    const shareCard = screen.getByTestId("share-card");
    const shareCardText = shareCard.textContent ?? "";

    expect(
      screen.getByRole("heading", { name: "Sample share preview" }),
    ).toBeDefined();
    expect(shareCardText).toContain("Australian Budget Wrapped");
    expect(shareCardText).toContain("$19,588");
    expect(shareCardText).toContain("2025-26 Budget");
    expect(shareCardText).toContain("Social security & welfare");
    expect(shareCardText).toContain("Health");
    expect(shareCardText).toContain(
      "Illustrative estimate. Taxes are not hypothecated.",
    );
    expect(shareCardText).not.toContain("90,000");
    expect(shareCardText).not.toContain("$90,000");
  });

  it("landing page contains the hypothecation disclaimer", () => {
    render(<Home />);

    expect(screen.getByText(/Taxes are not hypothecated/)).toBeDefined();
  });

  it("does not use browser storage in source files", async () => {
    const sourceFiles = await collectSourceFiles(path.join(process.cwd(), "src"));
    const bannedTerms = [
      "localStorage",
      "sessionStorage",
      "document.cookie",
      "cookies()",
    ];
    const matches: string[] = [];

    await Promise.all(
      sourceFiles.map(async (filePath) => {
        const source = await fs.readFile(filePath, "utf8");

        for (const term of bannedTerms) {
          if (source.includes(term)) {
            matches.push(`${path.relative(process.cwd(), filePath)}: ${term}`);
          }
        }
      }),
    );

    expect(matches).toEqual([]);
  });

  it("does not use the banned exact-dollar phrase in source files", async () => {
    const sourceFiles = await collectSourceFiles(path.join(process.cwd(), "src"));
    const bannedPhrase = [
      "exactly",
      "where",
      "your",
      "tax",
      "dollars",
      "went",
    ].join(" ");
    const matches: string[] = [];

    await Promise.all(
      sourceFiles.map(async (filePath) => {
        const source = await fs.readFile(filePath, "utf8");

        if (source.includes(bannedPhrase)) {
          matches.push(path.relative(process.cwd(), filePath));
        }
      }),
    );

    expect(matches).toEqual([]);
  });
});
