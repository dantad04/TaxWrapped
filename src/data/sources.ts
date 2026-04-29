import type { BudgetSource } from "@/lib/budget/model";

export const sourceRegistry = {
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
  "ato-resident-tax-rates-2025-26": {
    id: "ato-resident-tax-rates-2025-26",
    title: "Tax rates - Australian resident",
    publisher: "Australian Taxation Office",
    url: "https://www.ato.gov.au/tax-rates-and-codes/tax-rates-australian-residents",
    sourceLocator: "Resident tax rates 2025-26",
    note: "Australian resident individual income tax rates excluding Medicare levy.",
  },
  "ato-low-income-tax-offset": {
    id: "ato-low-income-tax-offset",
    title: "Low income tax offset",
    publisher: "Australian Taxation Office",
    url: "https://www.ato.gov.au/individuals-and-families/income-deductions-offsets-and-records/tax-offsets/low-income-tax-offset",
    sourceLocator: "Low income tax offset thresholds",
    note: "Low income tax offset eligibility and taper thresholds.",
  },
  "ato-medicare-levy": {
    id: "ato-medicare-levy",
    title: "Medicare levy",
    publisher: "Australian Taxation Office",
    url: "https://www.ato.gov.au/individuals-and-families/medicare-and-private-health-insurance/medicare-levy",
    sourceLocator: "Medicare levy overview",
    note: "Medicare levy overview used for the simplified 2 per cent levy setting.",
  },
} as const satisfies Record<string, BudgetSource>;

export const budgetSources = {
  "bp1-2025-26-statement5-table5-3":
    sourceRegistry["bp1-2025-26-statement5-table5-3"],
  "bp1-2025-26-statement5-table5-3-1":
    sourceRegistry["bp1-2025-26-statement5-table5-3-1"],
} as const satisfies Record<string, BudgetSource>;

export type SourceId = keyof typeof sourceRegistry;
export type BudgetSourceId = keyof typeof budgetSources;
