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
  "bp1-2025-26-statement5-appendix-a-table-a-5-1": {
    id: "bp1-2025-26-statement5-appendix-a-table-a-5-1",
    title:
      "Budget Paper No. 1 2025-26, Statement 5, Appendix A, Table A.5.1: Estimates of expenses by function and sub-function",
    publisher: "Australian Government",
    url: "https://budget.gov.au/content/bp1/download/bp1_2025-26.pdf",
    sourceLocator: "Statement 5, Appendix A, Table A.5.1",
    note: "Top-level expenses and sub-function expenses by function, reported in AUD millions.",
  },
  "defence-pbs-2025-26-table-4b": {
    id: "defence-pbs-2025-26-table-4b",
    title:
      "Defence Portfolio Budget Statements 2025-26, Table 4b: Defence Planned Expenditure by Key Cost Category",
    publisher: "Department of Defence",
    url: "https://www.defence.gov.au/sites/default/files/2025-03/2025-26_Defence_PBS_00_Complete.pdf",
    sourceLocator: "Table 4b",
    note: "Defence planned expenditure by key cost category, used proportionally for Defence drill-downs.",
  },
  "defence-pbs-2025-26-table-5": {
    id: "defence-pbs-2025-26-table-5",
    title:
      "Defence Portfolio Budget Statements 2025-26, Table 5: Capability Acquisition Program",
    publisher: "Department of Defence",
    url: "https://www.defence.gov.au/sites/default/files/2025-03/2025-26_Defence_PBS_00_Complete.pdf",
    sourceLocator: "Table 5",
    note: "Capability Acquisition Program components for nested Defence drill-downs.",
  },
  "defence-pbs-2025-26-table-6": {
    id: "defence-pbs-2025-26-table-6",
    title:
      "Defence Portfolio Budget Statements 2025-26, Table 6: Capability Sustainment Program",
    publisher: "Department of Defence",
    url: "https://www.defence.gov.au/sites/default/files/2025-03/2025-26_Defence_PBS_00_Complete.pdf",
    sourceLocator: "Table 6",
    note: "Capability Sustainment Program components for nested Defence drill-downs.",
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
