import { Chip } from "@mui/material";
import React from "react";
import type { SpecLevel } from "~/types/types";

const specVariantMap: Record<
  SpecLevel,
  "levelLow" | "levelMedium" | "levelHigh"
> = {
  low: "levelLow",
  normal: "levelMedium",
  high: "levelHigh",
};

const specLabelMap: Record<SpecLevel, string> = {
  low: "Low Spec",
  normal: "Normal Spec",
  high: "High Spec",
};

const SpecLevelChip = ({ level }: { level: SpecLevel }) => {
  return (
    <Chip
      label={specLabelMap[level]}
      size="small"
      variant={specVariantMap[level]}
    />
  );
};

export default SpecLevelChip;
