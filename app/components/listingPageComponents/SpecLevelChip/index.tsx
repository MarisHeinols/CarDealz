import { Chip } from "@mui/material";
import React from "react";
import type { SpecLevel } from "~/types/types";

const specConfig: Record<
  SpecLevel,
  { label: string; color: "success" | "warning" | "default" }
> = {
  high: { label: "High Spec", color: "success" },
  normal: { label: "Normal Spec", color: "warning" },
  low: { label: "Low Spec", color: "default" },
};

const SpecLevelChip = ({ level }: { level: SpecLevel }) => {
  const cfg = specConfig[level];
  return <Chip label={cfg.label} color={cfg.color} size="small" />;
};

export default SpecLevelChip;
