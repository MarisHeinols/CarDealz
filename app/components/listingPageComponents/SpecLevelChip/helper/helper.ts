import { featureDefinitions, type FeatureCategory } from "~/components/listingPageComponents/SpecSheet/featureLabels";
import type { SpecLevel } from "~/types/types";

const categoryWeights: Record<FeatureCategory, number> = {
  comfort: 1,
  infotainment: 1,
  lighting: 0.8,
  security: 1,
  wheels: 0.5,
  exterior: 0.8,
  performance: 1.2,
  safety: 1.5,
  ev: 1.2,
};

export const calculateSpecScore = (features: string[]) => {
  return features.reduce((score, f) => {
    const def = featureDefinitions[f as keyof typeof featureDefinitions];
    if (!def) return score;

    return score + categoryWeights[def.category];
  }, 0);
};

export const getSpecLevel = (score: number): SpecLevel => {
  if (score >= 18) return "high";
  if (score >= 9) return "normal";
  return "low";
};