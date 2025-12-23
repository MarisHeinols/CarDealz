import { LinearProgress } from "@mui/material";

type MarketRange = { min: number; max: number };

const DealIndicator = ({
  price,
  marketRange,
}: {
  price: number;
  marketRange: MarketRange;
}) => {
  const percentage =
    ((price - marketRange.min) / (marketRange.max - marketRange.min)) * 100;

  const value = Math.max(0, Math.min(100, percentage));

  const color: "success" | "warning" | "error" =
    value < 33 ? "success" : value < 66 ? "warning" : "error";

  return (
    <LinearProgress
      variant="determinate"
      value={value}
      color={color}
      sx={{ width: 30 }}
    />
  );
};

export default DealIndicator;
