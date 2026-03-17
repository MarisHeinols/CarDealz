import React, { useState } from "react";
import { Box, Grid, Divider, Button, Alert } from "@mui/material";
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
import { filesToListingImages } from "~/services/fileToBase64";
import { createEmptyListing, validateListing } from "~/models";
import { db } from "~/firebase/fireStore";
import { doc, getDoc } from "firebase/firestore";
import { useAppDispatch } from "~/redux/hooks";
import { showNotification } from "~/redux/slices/uiSlice";
import { getListingsByOwner } from "~/services/listingsService";
import { useTranslation } from "react-i18next";

export default function NewListingForm() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [listing, setListing] =
    useState<CarListingDetailsJson>(createEmptyListing());
  const [images, setImages] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dispatch = useAppDispatch();

  const handleSubmit = async () => {
    const user = auth.currentUser;
    if (!user) {
      setError(t("newListing.mustBeLoggedIn"));
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // 1. Fetch user info for seller object
      const userDoc = await getDoc(doc(db, "users", user.uid));
      const userData = userDoc.data() || {};
      const role = userData.role as "individual" | "business" | undefined;
      const seller = {
        name: userData.ownerName || userData.name || "Private Seller",
        phone: userData.ownerPhone || userData.phone || "",
        email: user.email || "",
        isDealer: role === "business"
      };

      // Individuals: limit 3 listings per calendar year
      if (role === "individual") {
        const existing = await getListingsByOwner(user.uid);
        const year = new Date().getFullYear();
        const countThisYear = existing.filter((l) => {
          const createdAt = typeof l.createdAt === "string" ? Date.parse(l.createdAt) : NaN;
          if (!Number.isFinite(createdAt)) return false;
          return new Date(createdAt).getFullYear() === year;
        }).length;
        if (countThisYear >= 3) {
          throw new Error("Individual accounts can create only 3 listings per year.");
        }
      }

      // 2. Validate listing
      const listingToValidate = {
        ...listing,
        images: images as any, // pass local array to bypass empty images block
        seller
      } as CarListingDetailsJson;

      const validation = validateListing(listingToValidate);
      if (!validation.isValid) {
        setIsSubmitting(false);
        const errorMessages = validation.errors
          .map((e) => `${e.field}: ${e.message}`)
          .join("\n");
        setError(`Please fix the following errors:\n${errorMessages}`);
        return;
      }

      // 3. Process images and submit
      const listingImages = await filesToListingImages(images);
      await createListing(user.uid, { ...listingToValidate, images: listingImages });
      dispatch(showNotification({ message: t("newListing.createdSuccess"), severity: "success" }));
      navigate("/user");
    } catch (err) {
      setError(err instanceof Error ? err.message : t("newListing.createFailed"));
      setIsSubmitting(false);
    }
  };

  return (
    <Box component="form" sx={{ py: 4 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <ImagesSection images={images} setImages={setImages} setListing={setListing} />
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
        <Button variant="outlined" onClick={() => navigate(-1)}>
          {t("newListing.back")}
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? t("newListing.creating") : t("newListing.create")}
        </Button>
      </Box>
    </Box>
  );
}
