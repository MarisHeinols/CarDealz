import React, { useState } from "react";
import { Box, Grid, Divider, Button } from "@mui/material";
import { useNavigate } from "react-router";

import BasicInfoSection from "./sections/BasicInfoSection";
import SpecsSection from "./sections/SpecsSection";
import PricingSection from "./sections/PricingSection";
import DescriptionSection from "./sections/DescriptionSection";
import FeaturesPanel from "./sections/FeaturesPanel";

import { auth } from "~/firebase/auth";
import { createListing } from "~/services/createListing";
import type { CarListingDetailsJson } from "~/types/types";
import ImagesSection from "./sections/ImageSelection";
import { filesToBase64 } from "~/services/fileToBase64";

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

export default function NewListingForm() {
  const navigate = useNavigate();
  const [listing, setListing] = useState<CarListingDetailsJson>(emptyListing);
  const [images, setImages] = useState<File[]>([]);

  const handleSubmit = async () => {
    const user = auth.currentUser;
    if (!user) return;
    const imageUris = await filesToBase64(images);
    await createListing(user.uid, { ...listing, images: imageUris });
    navigate("/my-listings");
  };

  return (
    <Box component="form" sx={{ py: 4 }}>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <ImagesSection images={images} setImages={setImages} />
          <Divider sx={{ my: 2 }} />
          <BasicInfoSection listing={listing} setListing={setListing} />
          <Divider sx={{ my: 2 }} />
          <SpecsSection listing={listing} setListing={setListing} />
          <Divider sx={{ my: 2 }} />
          <PricingSection listing={listing} setListing={setListing} />
          <Divider sx={{ my: 2 }} />
          <DescriptionSection listing={listing} setListing={setListing} />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <FeaturesPanel listing={listing} setListing={setListing} />
        </Grid>
      </Grid>
      <Divider sx={{ my: 4 }} />
      <Box sx={{ display: "flex", gap: 2 }}>
        <Button variant="outlined">Back</Button>
        <Button variant="contained" onClick={handleSubmit}>
          Create Listing
        </Button>
      </Box>
    </Box>
  );
}
