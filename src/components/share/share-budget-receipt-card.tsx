"use client";

import { useCountUp } from "@/hooks/use-count-up";
import type { ShareCardData } from "@/lib/share/share-card-data";

const currencyFormatter = new Intl.NumberFormat("en-AU", {
  style: "currency",
  currency: "AUD",
  maximumFractionDigits: 0,
});

const toneColours = {
  blue: "#2e55ff",
  green: "#149c48",
  magenta: "#bb33b6",
  red: "#df1f26",
} as const;

interface ShareBudgetReceiptCardProps {
  data: ShareCardData;
  animated?: boolean;
  className?: string;
  testId?: string;
}

function formatCurrency(amount: number) {
  return currencyFormatter.format(Math.round(amount));
}

function getBarWidth(share: number, maxShare: number) {
  if (share <= 0 || maxShare <= 0) {
    return 0;
  }

  return Math.max(18, (share / maxShare) * 800);
}

export function ShareBudgetReceiptCard({
  data,
  animated = true,
  className,
  testId = "share-card",
}: ShareBudgetReceiptCardProps) {
  const maxShare = Math.max(...data.rows.map((row) => row.shareOfTotal), 0);
  const countedTaxAmount = useCountUp(
    data.estimatedTaxAmount,
    animated ? 700 : 0,
  );
  const displayedTaxAmount = animated
    ? countedTaxAmount
    : data.estimatedTaxAmount;

  return (
    <article
      className={className ? `share-card ${className}` : "share-card"}
      data-testid={testId}
      aria-label={`${data.productName} share card. Estimated Commonwealth tax ${formatCurrency(
        data.estimatedTaxAmount,
      )}. ${data.sourceYearLabel}. ${data.caveat}`}
    >
      <svg
        viewBox="0 0 1080 1920"
        role="img"
        aria-labelledby="share-card-title share-card-desc"
      >
        <title id="share-card-title">{data.productName}</title>
        <desc id="share-card-desc">
          Estimated Commonwealth tax and additive Budget allocation summary for
          sharing. Taxable income is not shown.
        </desc>
        <rect width="1080" height="1920" rx="86" fill="#29282e" />
        <path
          d="M-90 132 C 132 70, 254 184, 458 126 S 798 40, 1180 144"
          fill="none"
          stroke="#fbfaf5"
          strokeWidth="5"
          opacity="0.72"
        />
        <path
          d="M-100 178 C 98 236, 274 78, 486 176 S 866 268, 1184 126"
          fill="none"
          stroke="#fbfaf5"
          strokeWidth="5"
          opacity="0.58"
        />
        <path
          d="M-120 1602 C 94 1518, 274 1702, 492 1594 S 858 1480, 1202 1654"
          fill="none"
          stroke="#fbfaf5"
          strokeWidth="5"
          opacity="0.52"
        />
        <g opacity="0.92" transform="translate(672 150) rotate(14)">
          <rect width="410" height="122" fill="#df1f26" />
          <rect x="58" y="-48" width="410" height="122" fill="#2e55ff" />
        </g>
        <g opacity="0.86" transform="translate(-18 1428) rotate(-4)">
          {Array.from({ length: 16 }).map((_, index) => (
            <rect
              key={index}
              x={(index % 4) * 94}
              y={Math.floor(index / 4) * 94}
              width="94"
              height="94"
              fill={index % 2 === 0 ? "#bb33b6" : "transparent"}
            />
          ))}
        </g>
        <text
          x="74"
          y="120"
          fill="#fbfaf5"
          fontFamily="Inter, Arial, sans-serif"
          fontSize="30"
          fontWeight="900"
          letterSpacing="5"
        >
          {data.productName.toUpperCase()}
        </text>
        <text
          x="1006"
          y="120"
          fill="#fbfaf5"
          fontFamily="Inter, Arial, sans-serif"
          fontSize="30"
          fontWeight="900"
          letterSpacing="3"
          textAnchor="end"
        >
          {data.sourceYearLabel}
        </text>
        <text
          x="74"
          y="312"
          fill="#fbfaf5"
          fontFamily="Inter, Arial, sans-serif"
          fontSize="92"
          fontWeight="1000"
        >
          YOUR
        </text>
        <text
          x="74"
          y="408"
          fill="#fbfaf5"
          fontFamily="Inter, Arial, sans-serif"
          fontSize="92"
          fontWeight="1000"
        >
          BUDGET RECEIPT
        </text>
        <text
          x="74"
          y="505"
          fill="#fbfaf5"
          fontFamily="Inter, Arial, sans-serif"
          fontSize="36"
          fontWeight="900"
          letterSpacing="3"
        >
          ESTIMATED COMMONWEALTH TAX
        </text>
        <text
          x="74"
          y="712"
          aria-hidden="true"
          opacity="0"
          fill="#149c48"
          stroke="#fbfaf5"
          strokeWidth="8"
          paintOrder="stroke fill"
          fontFamily="Inter, Arial, sans-serif"
          fontSize="186"
          fontWeight="1000"
        >
          {formatCurrency(data.estimatedTaxAmount)}
        </text>
        <text
          x="74"
          y="712"
          fill="#149c48"
          stroke="#fbfaf5"
          strokeWidth="8"
          paintOrder="stroke fill"
          fontFamily="Inter, Arial, sans-serif"
          fontSize="186"
          fontWeight="1000"
          suppressHydrationWarning
        >
          {formatCurrency(displayedTaxAmount)}
        </text>
        <rect x="74" y="792" width="930" height="58" rx="29" fill="#fbfaf5" />
        <text
          x="100"
          y="832"
          fill="#151515"
          fontFamily="Inter, Arial, sans-serif"
          fontSize="30"
          fontWeight="1000"
          letterSpacing="3"
        >
          ADDITIVE TOP-LEVEL BUDGET FUNCTIONS
        </text>
        <g transform="translate(74 916)">
          {data.rows.map((row, index) => {
            const y = index * 130;
            const fill = toneColours[row.tone];
            const barWidth = getBarWidth(row.shareOfTotal, maxShare);

            return (
              <g key={row.id} transform={`translate(0 ${y})`}>
                <text
                  x="0"
                  y="0"
                  fill="#fbfaf5"
                  fontFamily="Inter, Arial, sans-serif"
                  fontSize="36"
                  fontWeight="1000"
                >
                  {row.displayLabel}
                </text>
                <text
                  x="930"
                  y="0"
                  fill={fill}
                  stroke="#151515"
                  strokeWidth="3"
                  paintOrder="stroke fill"
                  fontFamily="Inter, Arial, sans-serif"
                  fontSize="38"
                  fontWeight="1000"
                  textAnchor="end"
                >
                  {formatCurrency(row.amount)}
                </text>
                <rect
                  x="0"
                  y="22"
                  width="930"
                  height="34"
                  fill="none"
                  stroke="#fbfaf5"
                  strokeWidth="4"
                />
                <rect x="0" y="22" width={barWidth} height="34" fill={fill} />
              </g>
            );
          })}
        </g>
        <text
          x="74"
          y="1718"
          fill="#fbfaf5"
          fontFamily="Inter, Arial, sans-serif"
          fontSize="42"
          fontWeight="1000"
        >
          {data.caveat}
        </text>
        <text
          x="74"
          y="1788"
          fill="#fbfaf5"
          opacity="0.74"
          fontFamily="Inter, Arial, sans-serif"
          fontSize="30"
          fontWeight="900"
          letterSpacing="2"
        >
          {data.methodologyLabel.toUpperCase()}
        </text>
        <text
          x="1006"
          y="1870"
          fill="#df1f26"
          stroke="#151515"
          strokeWidth="3"
          paintOrder="stroke fill"
          fontFamily="Inter, Arial, sans-serif"
          fontSize="132"
          fontStyle="italic"
          fontWeight="1000"
          textAnchor="end"
          opacity="0.96"
        >
          25-26
        </text>
      </svg>
    </article>
  );
}
