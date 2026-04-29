import type { BudgetSource } from "@/lib/budget/model";

export const budgetSources = {
  "bp1-2025-26-statement5-table5-3": {
    id: "bp1-2025-26-statement5-table5-3",
    title:
      "Budget Paper No. 1 2025-26, Statement 5, Table 5.3: Estimates of expenses by function",
    publisher: "Australian Government",
    url: "https://budget.gov.au/content/bp1/download/bp1_bs-5.pdf",
    sourceLocator: "Statement 5, Table 5.3",
    note: "Top-level general government sector expenses by function, reported in AUD millions.",
  },
  "bp1-2025-26-statement5-table5-3-1": {
    id: "bp1-2025-26-statement5-table5-3-1",
    title:
      "Budget Paper No. 1 2025-26, Statement 5, Table 5.3.1: Top 20 programs by expense",
    publisher: "Australian Government",
    url: "https://budget.gov.au/content/bp1/download/bp1_bs-5.pdf",
    sourceLocator: "Statement 5, Table 5.3.1",
    note: "Selected top expense programs, reported in AUD millions and used only as non-additive spotlights.",
  },
} as const satisfies Record<string, BudgetSource>;

export type BudgetSourceId = keyof typeof budgetSources;
