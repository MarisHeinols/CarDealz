import type { CarFeature } from "~/types/types";
import { featureDefinitions } from "../featureLabels";

export const groupFeatures = () => {
  return Object.entries(featureDefinitions).reduce(
    (acc, [key, def]) => {
      acc[def.category] ??= [];
      acc[def.category].push(key as CarFeature);
      return acc;
    },
    {} as Record<string, CarFeature[]>
  );
};