import { Chip } from "@mui/material";
import React from "react";
import type { SpecLevel } from "~/types/types";
import { useTranslation } from "react-i18next";

const specVariantMap: Record<
  SpecLevel,
  "levelLow" | "levelMedium" | "levelHigh"
> = {
  low: "levelLow",
  normal: "levelMedium",
  high: "levelHigh",
};

const SpecLevelChip = ({ level }: { level: SpecLevel }) => {
  const { t } = useTranslation();
  
  const labels: Record<SpecLevel, string> = {
    low: t("listing.spec_low", { defaultValue: "Low Spec" }),
    normal: t("listing.spec_normal", { defaultValue: "Normal Spec" }),
    high: t("listing.spec_high", { defaultValue: "High Spec" }),
  };

  return (
    <Chip
      label={labels[level]}
      size="small"
      variant={specVariantMap[level]}
    />
  );
};

export default SpecLevelChip;
