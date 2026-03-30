import { Stack, Typography, LinearProgress, Box } from "@mui/material";
import { useTranslation } from "react-i18next";

type MarketRange = {
  min: number;
  max: number;
};

type Props = {
  price: number;
  marketRange: MarketRange;
};

const getVerdict = (
  price: number,
  marketRange: MarketRange,
): {
  rating: "good" | "fair" | "above_market";
  color: "success" | "warning" | "error";
} => {
  if (price < marketRange.min) return { rating: "good", color: "success" };
  if (price > marketRange.max)
    return { rating: "above_market", color: "error" };
  return { rating: "fair", color: "warning" };
};

const MarketValueBar = ({ price, marketRange }: Props) => {
  const { t } = useTranslation();
  if (
    typeof price !== "number" ||
    !marketRange ||
    (marketRange.min === 0 && marketRange.max === 0)
  ) {
    return null;
  }

  const range = marketRange.max - marketRange.min;
  const percentage = range > 0 ? ((price - marketRange.min) / range) * 100 : 50;

  const value = Math.max(0, Math.min(100, percentage));
  const { rating, color } = getVerdict(price, marketRange);
  const label =
    rating === "good"
      ? t("carValues.deal_good", { defaultValue: "Good Deal" })
      : rating === "above_market"
        ? t("carValues.deal_above_market", { defaultValue: "Above Market" })
        : t("carValues.deal_fair", { defaultValue: "Fair Price" });

  return (
    <Stack spacing={1} mt={3}>
      <Stack direction="row" justifyContent="space-between">
        <Typography variant="subtitle2">
          {t("carValues.marketValueEstimate", { defaultValue: "Market Value" })}
        </Typography>
        <Typography
          variant="subtitle2"
          color={`${color}.main`}
          fontWeight={600}
        >
          {label}
        </Typography>
      </Stack>

      <LinearProgress
        variant="determinate"
        value={value}
        color={color}
        sx={{ height: 8, borderRadius: 4 }}
      />

      <Box display="flex" justifyContent="space-between">
        <Typography variant="caption" color="text.secondary">
          €{marketRange.min.toLocaleString("en-US")}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          €{marketRange.max.toLocaleString("en-US")}
        </Typography>
      </Box>
    </Stack>
  );
};

export default MarketValueBar;
