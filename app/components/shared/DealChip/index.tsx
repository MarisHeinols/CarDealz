import { Chip } from "@mui/material";
import { useTranslation } from "react-i18next";

type MarketRange = { min: number; max: number };

type Props = {
  price: number;
  marketRange: MarketRange;
  size?: "small" | "medium";
};

function getDealRating(price: number, marketRange: MarketRange): "good" | "fair" | "above_market" {
  if (price < marketRange.min) return "good";
  if (price > marketRange.max) return "above_market";
  return "fair";
}

const DealChip = ({ price, marketRange, size = "small" }: Props) => {
  const { t } = useTranslation();

  if (
    typeof price !== "number" ||
    !marketRange ||
    typeof marketRange.min !== "number" ||
    typeof marketRange.max !== "number" ||
    (marketRange.min === 0 && marketRange.max === 0)
  ) {
    return null;
  }

  const rating = getDealRating(price, marketRange);

  const label =
    rating === "good"
      ? t("carValues.deal_good", { defaultValue: "Good Deal" })
      : rating === "above_market"
        ? t("carValues.deal_above_market", { defaultValue: "Above Market" })
        : t("carValues.deal_fair", { defaultValue: "Fair Price" });

  const color: "success" | "warning" | "error" =
    rating === "good" ? "success" : rating === "above_market" ? "error" : "warning";

  return <Chip size={size} label={label} color={color} />;
};

export default DealChip;
