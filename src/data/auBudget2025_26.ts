import type {
  BudgetDrilldownDataset,
  BudgetDrilldownNode,
  ProgramCallout,
} from "@/lib/budget/drilldown-model";

const budgetPaperSource = {
  sourceId: "bp1-2025-26-statement5-appendix-a-table-a-5-1",
  source: "Australian Government Budget Paper No. 1 2025-26",
  sourceUrl: "https://budget.gov.au/content/bp1/download/bp1_2025-26.pdf",
  sourceLocator: "Statement 5, Appendix A, Table A.5.1",
} as const;

const defencePbsTable4bSource = {
  sourceId: "defence-pbs-2025-26-table-4b",
  source: "Defence Portfolio Budget Statements 2025-26",
  sourceUrl:
    "https://www.defence.gov.au/sites/default/files/2025-03/2025-26_Defence_PBS_00_Complete.pdf",
  sourceLocator: "Table 4b: Defence Planned Expenditure by Key Cost Category",
} as const;

const defencePbsTable5Source = {
  sourceId: "defence-pbs-2025-26-table-5",
  source: "Defence Portfolio Budget Statements 2025-26",
  sourceUrl:
    "https://www.defence.gov.au/sites/default/files/2025-03/2025-26_Defence_PBS_00_Complete.pdf",
  sourceLocator: "Table 5: Capability Acquisition Program",
} as const;

const defencePbsTable6Source = {
  sourceId: "defence-pbs-2025-26-table-6",
  source: "Defence Portfolio Budget Statements 2025-26",
  sourceUrl:
    "https://www.defence.gov.au/sites/default/files/2025-03/2025-26_Defence_PBS_00_Complete.pdf",
  sourceLocator: "Table 6: Capability Sustainment Program",
} as const;

function bpNode(
  id: string,
  label: string,
  amountM: number,
  description: string,
  children?: readonly BudgetDrilldownNode[],
): BudgetDrilldownNode {
  return {
    id,
    label,
    amountM,
    description,
    allocationMode: "direct",
    ...budgetPaperSource,
    ...(children ? { children } : {}),
  };
}

function bpCallout(
  id: string,
  label: string,
  amountM: number,
  descriptionShort: string,
): ProgramCallout {
  return {
    id,
    label,
    amountM,
    descriptionShort,
    sourceId: budgetPaperSource.sourceId,
    sourceLocator: budgetPaperSource.sourceLocator,
  };
}

function defencePbsNode(
  id: string,
  label: string,
  amountM: number,
  description: string,
  source:
    | typeof defencePbsTable4bSource
    | typeof defencePbsTable5Source
    | typeof defencePbsTable6Source = defencePbsTable4bSource,
  children?: readonly BudgetDrilldownNode[],
): BudgetDrilldownNode {
  return {
    id,
    label,
    amountM,
    description,
    allocationMode: "proportional",
    ...source,
    ...(children ? { children } : {}),
  };
}

function defencePbsCallout(
  id: string,
  label: string,
  amountM: number,
  descriptionShort: string,
  source:
    | typeof defencePbsTable4bSource
    | typeof defencePbsTable5Source
    | typeof defencePbsTable6Source = defencePbsTable4bSource,
): ProgramCallout {
  return {
    id,
    label,
    amountM,
    descriptionShort,
    sourceId: source.sourceId,
    sourceLocator: source.sourceLocator,
  };
}

const capabilityAcquisitionChildren = [
  defencePbsNode(
    "military-equipment-acquisition-program",
    "Military Equipment Acquisition Program",
    14320.1,
    "Major military equipment acquisition projects.",
    defencePbsTable5Source,
  ),
  defencePbsNode(
    "enterprise-estate-infrastructure-program",
    "Enterprise Estate and Infrastructure Program",
    3531.8,
    "Estate and infrastructure acquisition investment.",
    defencePbsTable5Source,
  ),
  defencePbsNode(
    "ict-acquisition-program",
    "ICT Acquisition Program",
    407.2,
    "Information and communications technology acquisition.",
    defencePbsTable5Source,
  ),
  defencePbsNode(
    "minors-program",
    "Minors Program",
    541.4,
    "Smaller acquisition projects within the capability program.",
    defencePbsTable5Source,
  ),
] as const;

const capabilitySustainmentChildren = [
  defencePbsNode("navy-sustainment", "Navy Sustainment", 4041.1, "Sustainment for Navy capabilities.", defencePbsTable6Source),
  defencePbsNode("army-sustainment", "Army Sustainment", 2947.5, "Sustainment for Army capabilities.", defencePbsTable6Source),
  defencePbsNode("air-force-sustainment", "Air Force Sustainment", 4182.3, "Sustainment for Air Force capabilities.", defencePbsTable6Source),
  defencePbsNode("defence-digital-sustainment", "Defence Digital Sustainment", 2053.5, "ICT sustainment for Defence.", defencePbsTable6Source),
  defencePbsNode("joint-capabilities-sustainment", "Joint Capabilities Sustainment", 1017.7, "Sustainment for joint capability areas.", defencePbsTable6Source),
  defencePbsNode("strategy-policy-industry-sustainment", "Strategy, Policy and Industry Sustainment", 148.7, "Sustainment for strategy, policy and industry functions.", defencePbsTable6Source),
  defencePbsNode("defence-intelligence-sustainment", "Defence Intelligence Sustainment", 280.7, "Sustainment for Defence intelligence capabilities.", defencePbsTable6Source),
  defencePbsNode("security-estate-sustainment", "Security and Estate Sustainment", 3751.5, "Estate maintenance, garrison support and associated costs.", defencePbsTable6Source),
  defencePbsNode("nuclear-powered-submarines-sustainment", "Nuclear-Powered Submarines Sustainment", 6.2, "Sustainment for nuclear-powered submarine capability.", defencePbsTable6Source),
  defencePbsNode("guided-weapons-explosive-ordnance-sustainment", "Guided Weapons & Explosive Ordnance Sustainment", 164.8, "Sustainment for guided weapons and explosive ordnance.", defencePbsTable6Source),
  defencePbsNode("other-minor-sustainment", "Other Minor Sustainment", 164.7, "Other smaller sustainment activities.", defencePbsTable6Source),
] as const;

export const auBudget2025_26 = {
  budgetYear: "2025-26",
  totalExpensesM: 785670,
  sourceIds: [
    budgetPaperSource.sourceId,
    defencePbsTable4bSource.sourceId,
    defencePbsTable5Source.sourceId,
    defencePbsTable6Source.sourceId,
  ],
  categories: [
    bpNode("general-public-services", "General public services", 31418, "Core public administration, foreign affairs, general services and superannuation benefits.", [
      bpNode("legislative-executive-affairs", "Legislative and executive affairs", 1895, "Parliamentary, executive and related public functions."),
      bpNode("financial-fiscal-affairs", "Financial and fiscal affairs", 10428, "Financial, fiscal and treasury-related public services."),
      bpNode("foreign-affairs-economic-aid", "Foreign affairs and economic aid", 7878, "Foreign affairs and international aid activity."),
      bpNode("general-research", "General research", 4527, "General-purpose research activity."),
      bpNode("general-services", "General services", 1287, "General government services."),
      bpNode("government-superannuation-benefits", "Government superannuation benefits", 5403, "Government superannuation benefit expenses."),
    ]),
    {
      ...bpNode("defence", "Defence", 51483, "Top-level Defence function from Budget Paper No. 1, split using Defence PBS cost-category proportions.", [
        defencePbsNode("workforce", "Workforce", 17170.9, "Defence workforce costs."),
        defencePbsNode("operations", "Operations", 317.9, "Operational expenditure category in the Defence PBS."),
        defencePbsNode("capability-acquisition-program", "Capability Acquisition Program", 18800.5, "Capability acquisition investment.", defencePbsTable4bSource, capabilityAcquisitionChildren),
        defencePbsNode("capability-sustainment-program", "Capability Sustainment Program", 18758.8, "Capability sustainment investment.", defencePbsTable4bSource, capabilitySustainmentChildren),
        defencePbsNode("operating", "Operating", 2373.1, "Operating cost category in the Defence PBS."),
      ]),
      allocationMode: "proportional",
      allocationBasisM: 57421.2,
      callouts: [
        defencePbsCallout(
          "workforce",
          "Workforce",
          17170.9,
          "Funds Defence workforce costs.",
        ),
        defencePbsCallout(
          "capability-acquisition-program",
          "Capability Acquisition Program",
          18800.5,
          "Funds capability acquisition investment listed in the Defence PBS.",
        ),
      ],
    },
    bpNode("public-order-safety", "Public order and safety", 9145, "Courts, legal services and other public order and safety functions.", [
      bpNode("courts-legal-services", "Courts and legal services", 2003, "Courts and legal service expenses."),
      bpNode("other-public-order-safety", "Other public order and safety", 7142, "Other safety, law enforcement, border and related functions."),
    ]),
    {
      ...bpNode("education", "Education", 54030, "Higher education, schools, vocational education, student assistance and administration.", [
        bpNode("higher-education", "Higher education", 12139, "Higher education expenses."),
        bpNode("vocational-other-education", "Vocational and other education", 2671, "Vocational and other education expenses."),
        bpNode("schools", "Schools", 32208, "Government and non-government school funding.", [
          bpNode("non-government-schools", "Non-government schools", 19975, "Non-government school funding."),
          bpNode("government-schools", "Government schools", 12233, "Government school funding."),
        ]),
        bpNode("school-education-specific-funding", "School education - specific funding", 874, "Specific school education funding."),
        bpNode("student-assistance", "Student assistance", 5794, "Student assistance expenses."),
        bpNode("education-general-administration", "General administration", 344, "Education administration expenses."),
      ]),
      callouts: [
        bpCallout(
          "schools",
          "Schools",
          32208,
          "Funds school education expenses across school sectors.",
        ),
        bpCallout(
          "student-assistance",
          "Student assistance",
          5794,
          "Funds student assistance expenses.",
        ),
      ],
    },
    {
      ...bpNode("health", "Health", 124803, "Medical benefits, medicines, hospitals, health services and administration.", [
        bpNode("medical-services-benefits", "Medical services and benefits", 44832, "Medical services and benefits expenses."),
        bpNode("pharmaceutical-benefits-services", "Pharmaceutical benefits and services", 22586, "Pharmaceutical benefits and services."),
        bpNode("assistance-states-public-hospitals", "Assistance to the states for public hospitals", 33928, "Public hospital assistance to states and territories."),
        bpNode("hospital-services", "Hospital services", 1226, "Hospital services expenses."),
        bpNode("health-services", "Health services", 15422, "Other health services expenses."),
        bpNode("health-general-administration", "General administration", 5425, "Health administration expenses."),
        bpNode("aboriginal-torres-strait-islander-health", "Aboriginal and Torres Strait Islander health", 1383, "Aboriginal and Torres Strait Islander health expenses."),
      ]),
      callouts: [
        bpCallout(
          "assistance-states-public-hospitals",
          "Assistance to the states for public hospitals",
          33928,
          "Funds public hospital assistance to states and territories.",
        ),
        bpCallout(
          "health-services",
          "Health services",
          15422,
          "Funds other health services recorded in the Health function.",
        ),
      ],
    },
    {
      ...bpNode("social-security-welfare", "Social security and welfare", 290966, "Income support, aged care, disability, families, unemployment, welfare and administration.", [
        bpNode("assistance-aged", "Assistance to the aged", 109463, "Assistance to older Australians."),
        bpNode("assistance-veterans-dependants", "Assistance to veterans and dependants", 10301, "Assistance to veterans and dependants."),
        bpNode("assistance-people-disabilities", "Assistance to people with disabilities", 90884, "Assistance to people with disability."),
        bpNode("assistance-families-children", "Assistance to families with children", 52486, "Assistance to families with children."),
        bpNode("assistance-unemployed-sick", "Assistance to the unemployed and the sick", 16955, "Assistance to unemployed people and people who are sick."),
        bpNode("other-welfare-programs", "Other welfare programs", 1927, "Other welfare programs."),
        bpNode("assistance-indigenous-australians-nec", "Assistance for Indigenous Australians nec", 3460, "Assistance for Indigenous Australians not elsewhere classified."),
        bpNode("social-security-general-administration", "General administration", 5489, "Social security and welfare administration."),
      ]),
      callouts: [
        bpCallout(
          "assistance-families-children",
          "Assistance to families with children",
          52486,
          "Funds assistance for families with children.",
        ),
        bpCallout(
          "assistance-unemployed-sick",
          "Assistance to the unemployed and the sick",
          16955,
          "Funds assistance for unemployed people and people who are sick.",
        ),
      ],
    },
    bpNode("housing-community-amenities", "Housing and community amenities", 8952, "Housing, urban and regional development, and environment protection.", [
      bpNode("housing", "Housing", 4402, "Housing expenses."),
      bpNode("urban-regional-development", "Urban and regional development", 2062, "Urban and regional development expenses."),
      bpNode("environment-protection", "Environment protection", 2488, "Environment protection expenses."),
    ]),
    bpNode("recreation-culture", "Recreation and culture", 5867, "Broadcasting, arts, sport, recreation, national estate and parks.", [
      bpNode("broadcasting", "Broadcasting", 1834, "Broadcasting expenses."),
      bpNode("arts-cultural-heritage", "Arts and cultural heritage", 2085, "Arts and cultural heritage expenses."),
      bpNode("sport-recreation", "Sport and recreation", 1140, "Sport and recreation expenses."),
      bpNode("national-estate-parks", "National estate and parks", 809, "National estate and parks expenses."),
    ]),
    {
      ...bpNode("fuel-energy", "Fuel and energy", 19237, "Fuel and energy function expenses.", [
        bpNode("fuel-energy-total", "Fuel and energy", 19237, "Budget Paper No. 1 reports this as a single sub-function line."),
      ]),
      callouts: [
        bpCallout(
          "fuel-energy-total",
          "Fuel and energy",
          19237,
          "Funds the Fuel and energy sub-function reported in BP1 Appendix A.",
        ),
      ],
    },
    bpNode("agriculture-forestry-fishing", "Agriculture, forestry and fishing", 4427, "Agriculture, forestry, fishing, natural resources and administration.", [
      bpNode("wool-industry", "Wool industry", 62, "Wool industry expenses."),
      bpNode("grains-industry", "Grains industry", 305, "Grains industry expenses."),
      bpNode("dairy-industry", "Dairy industry", 58, "Dairy industry expenses."),
      bpNode("cattle-sheep-pig-industry", "Cattle, sheep and pig industry", 279, "Cattle, sheep and pig industry expenses."),
      bpNode("fishing-horticulture-other-agriculture", "Fishing, horticulture and other agriculture", 590, "Fishing, horticulture and other agriculture expenses."),
      bpNode("general-assistance-not-allocated", "General assistance not allocated to specific industries", 54, "General assistance not allocated to specific industries."),
      bpNode("rural-assistance", "Rural assistance", 413, "Rural assistance expenses."),
      bpNode("natural-resources-development", "Natural resources development", 1265, "Natural resources development expenses."),
      bpNode("agriculture-general-administration", "General administration", 1400, "Agriculture, forestry and fishing administration."),
    ]),
    bpNode("mining-manufacturing-construction", "Mining, manufacturing and construction", 5522, "Mining, manufacturing and construction function expenses.", [
      bpNode("mining-manufacturing-construction-total", "Mining, manufacturing and construction", 5522, "Budget Paper No. 1 reports this as a single sub-function line."),
    ]),
    bpNode("transport-communication", "Transport and communication", 16557, "Communication, rail, air, road, sea and other transport.", [
      bpNode("communication", "Communication", 1945, "Communication expenses."),
      bpNode("rail-transport", "Rail transport", 3086, "Rail transport expenses."),
      bpNode("air-transport", "Air transport", 479, "Air transport expenses."),
      bpNode("road-transport", "Road transport", 10135, "Road transport expenses."),
      bpNode("sea-transport", "Sea transport", 563, "Sea transport expenses."),
      bpNode("other-transport-communication", "Other transport and communication", 349, "Other transport and communication expenses."),
    ]),
    bpNode("other-economic-affairs", "Other economic affairs", 13558, "Tourism, labour and employment affairs, immigration and other economic affairs.", [
      bpNode("tourism-area-promotion", "Tourism and area promotion", 206, "Tourism and area promotion expenses."),
      bpNode("labour-employment-affairs", "Total labour and employment affairs", 5854, "Labour and employment affairs expenses.", [
        bpNode("vocational-industry-training", "Vocational and industry training", 2261, "Vocational and industry training expenses."),
        bpNode("labour-market-assistance-job-seekers-industry", "Labour market assistance to job seekers and industry", 2502, "Labour market assistance to job seekers and industry."),
        bpNode("industrial-relations", "Industrial relations", 1091, "Industrial relations expenses."),
      ]),
      bpNode("immigration", "Immigration", 3895, "Immigration expenses."),
      bpNode("other-economic-affairs-nec", "Other economic affairs nec", 3603, "Other economic affairs not elsewhere classified."),
    ]),
    bpNode("other-purposes", "Other purposes", 149706, "Debt interest, superannuation interest, inter-government transactions, disaster relief and contingency reserve.", [
      bpNode("public-debt-interest", "Public debt interest", 28429, "Public debt interest expenses.", [
        bpNode("interest-commonwealth-government-behalf", "Interest on Commonwealth Government's behalf", 28429, "Interest on the Commonwealth Government's behalf."),
      ]),
      bpNode("nominal-superannuation-interest", "Nominal superannuation interest", 15198, "Nominal superannuation interest expenses."),
      bpNode("general-purpose-intergovernment-transactions", "General purpose inter-government transactions", 104363, "General purpose inter-government transactions.", [
        bpNode("general-revenue-assistance-states-territories", "General revenue assistance - states and territories", 100625, "General revenue assistance to states and territories."),
        bpNode("local-government-assistance", "Local government assistance", 3738, "Local government assistance."),
      ]),
      bpNode("natural-disaster-relief", "Natural disaster relief", 874, "Natural disaster relief expenses."),
      bpNode("contingency-reserve", "Contingency reserve", 842, "Contingency reserve."),
    ]),
  ],
} as const satisfies BudgetDrilldownDataset;
