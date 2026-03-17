import { useState } from "react";
import type { CarListingDetailsJson, CarFeature } from "~/types/types";
import { createEmptyListing } from "~/models";

export function useListingForm() {
  const [listing, setListing] = useState<CarListingDetailsJson>(createEmptyListing());

  const updateField =
    (field: keyof CarListingDetailsJson) =>
    (value: any) => {
      setListing((p) => ({ ...p, [field]: value }));
    };

  const toggleFeature = (feature: CarFeature) => {
    setListing((p) => ({
      ...p,
      features: p.features.includes(feature)
        ? p.features.filter((f) => f !== feature)
        : [...p.features, feature],
    }));
  };

  const resetForm = () => {
    setListing(createEmptyListing());
  };

  return {
    listing,
    setListing,
    updateField,
    toggleFeature,
    resetForm,
  };
}
