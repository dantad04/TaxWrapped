import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import {
  EmbeddedFunctionBreakdown,
  getEmbeddedBreakdownRows,
} from "@/components/embedded-function-breakdown";
import type {
  BudgetDrilldownAllocationRow,
  BudgetDrilldownNode,
  BudgetDrilldownView,
} from "@/lib/budget/drilldown-model";

const sourceId = "bp1-2025-26-statement5-appendix-a-table-a-5-1";

const node: BudgetDrilldownNode = {
  id: "test-function",
  label: "Test function",
  amountM: 100,
  sourceId,
  source: "Australian Government Budget Paper No. 1 2025-26",
  sourceUrl: "https://budget.gov.au",
  sourceLocator: "Statement 5, Appendix A, Table A.5.1",
  description: "Test function.",
  allocationMode: "direct",
};

function row(
  id: string,
  label: string,
  amountCents: number,
): BudgetDrilldownAllocationRow {
  return {
    id,
    label,
    amount: amountCents / 100,
    amountCents,
    budgetAmountM: amountCents,
    description: `${label} description.`,
    source: "Australian Government Budget Paper No. 1 2025-26",
    sourceUrl: "https://budget.gov.au",
    sourceLocator: "Statement 5, Appendix A, Table A.5.1",
    allocationMode: "direct",
    hasChildren: false,
  };
}

function view(
  rows: readonly BudgetDrilldownAllocationRow[],
): BudgetDrilldownView {
  return {
    node,
    path: [node],
    contributionAmount: 100,
    contributionAmountCents: 10000,
    rows,
  };
}

afterEach(() => {
  cleanup();
});

describe("EmbeddedFunctionBreakdown", () => {
  it("sorts and limits story-page breakdown rows by contribution", () => {
    const rows = getEmbeddedBreakdownRows(
      view([
        row("small", "Small line", 1200),
        row("large", "Large line", 7400),
        row("medium", "Medium line", 3300),
      ]),
      2,
    );

    expect(rows.map((item) => item.label)).toEqual([
      "Large line",
      "Medium line",
    ]);
  });

  it("renders the sorted breakdown directly on the page", () => {
    render(
      <EmbeddedFunctionBreakdown
        view={view([
          row("small", "Small line", 1200),
          row("large", "Large line", 7400),
          row("medium", "Medium line", 3300),
        ])}
      />,
    );

    const renderedRows = screen.getAllByTestId("embedded-breakdown-row");

    expect(within(renderedRows[0]).getByText("Large line")).toBeDefined();
    expect(within(renderedRows[0]).getByText("$74")).toBeDefined();
    expect(within(renderedRows[1]).getByText("Medium line")).toBeDefined();
    expect(within(renderedRows[2]).getByText("Small line")).toBeDefined();
  });

  it("renders a stable empty state when no breakdown data is available", () => {
    render(<EmbeddedFunctionBreakdown view={null} />);

    expect(screen.getByTestId("embedded-breakdown-empty").textContent).toContain(
      "No sourced sub-function breakdown is available",
    );
  });
});
