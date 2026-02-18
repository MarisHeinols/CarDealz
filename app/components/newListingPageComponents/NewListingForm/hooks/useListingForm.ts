import { useState } from "react";
import type { CarListingDetailsJson, CarFeature } from "~/types/types";

const emptyListing: CarListingDetailsJson = {
  id: "",
  vin: 0,
  ta: new Date(),
  make: "",
  model: "",
  year: new Date().getFullYear(),
  mileage: 0,
  fuelType: "petrol",
  displacement: 0,
  transmission: "automatic",
  drivetrain: "fwd",
  horsepower: 0,
  price: 0,
  interiorColor: "",
  condition: "used",
  color: "",
  location: "",
  marketRange: { min: 0, max: 0 },
  images: [],
  features: [],
  description: "",
  seller: {
    name: "",
    isDealer: false,
  },
  viewCount: 0,
  lastViewed: new Date().toISOString(),
  createdAt: new Date().toISOString(),
};

export function useListingForm() {
  const [listing, setListing] =
    useState<CarListingDetailsJson>(emptyListing);

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

  return {
    listing,
    setListing,
    updateField,
    toggleFeature,
  };
}