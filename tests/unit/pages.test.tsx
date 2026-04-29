import { cleanup, render, screen } from "@testing-library/react";
import fs from "node:fs/promises";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import Home from "@/app/page";
import MethodologyPage from "@/app/methodology/page";
import PrivacyPage from "@/app/privacy/page";
import SourcesPage from "@/app/sources/page";

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

describe("placeholder routes", () => {
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
  });

  it("sources page renders", () => {
    render(<SourcesPage />);

    expect(screen.getByRole("heading", { name: "Sources" })).toBeDefined();
  });

  it("privacy page renders", () => {
    render(<PrivacyPage />);

    expect(screen.getByRole("heading", { name: "Privacy" })).toBeDefined();
  });

  it("landing page contains the hypothecation disclaimer", () => {
    render(<Home />);

    expect(screen.getByText(/Taxes are not hypothecated/)).toBeDefined();
  });

  it("does not use browser storage in source files", async () => {
    const sourceFiles = await collectSourceFiles(path.join(process.cwd(), "src"));
    const bannedTerms = ["localStorage", "sessionStorage"];
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
});
