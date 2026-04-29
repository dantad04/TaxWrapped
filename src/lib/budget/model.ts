export type BudgetYear = "2025-26";

export type CurrencyCode = "AUD";

export type AmountScale = "millions";

export type BudgetFunctionSlug =
  | "general-public-services"
  | "defence"
  | "public-order-safety"
  | "education"
  | "health"
  | "social-security-welfare"
  | "housing-community-amenities"
  | "recreation-culture"
  | "fuel-energy"
  | "agriculture-forestry-fishing"
  | "mining-manufacturing-construction"
  | "transport-communication"
  | "other-economic-affairs"
  | "other-purposes";

export type SpotlightProgramSlug =
  | "revenue-assistance-states-territories"
  | "support-for-seniors"
  | "national-disability-insurance-scheme"
  | "aged-care-services"
  | "medical-benefits"
  | "commonwealth-debt-management"
  | "pharmaceutical-benefits"
  | "fuel-tax-credits-scheme";

export interface BudgetSource {
  id: string;
  title: string;
  publisher: string;
  url: string;
  sourceLocator: string;
  note: string;
}

export interface BudgetDataItem<TSourceId extends string = string> {
  slug: string;
  label: string;
  amountAudMillions: number;
  sourceId: TSourceId;
  note: string;
  additive: boolean;
}

export interface TopLevelExpenseFunction<TSourceId extends string = string>
  extends BudgetDataItem<TSourceId> {
  slug: BudgetFunctionSlug;
  kind: "top-level-function";
  additive: true;
}

export interface SpotlightProgram<TSourceId extends string = string>
  extends BudgetDataItem<TSourceId> {
  slug: SpotlightProgramSlug;
  kind: "spotlight-program";
  additive: false;
  parentFunctionSlug: BudgetFunctionSlug;
}

export interface BudgetDataset<TSourceId extends string = string> {
  budgetYear: BudgetYear;
  currency: CurrencyCode;
  amountScale: AmountScale;
  totalExpensesAudMillions: number;
  roundingToleranceAudMillions: number;
  sourceIds: readonly TSourceId[];
  topLevelFunctions: readonly TopLevelExpenseFunction<TSourceId>[];
  spotlightPrograms: readonly SpotlightProgram<TSourceId>[];
  notes: readonly string[];
}
