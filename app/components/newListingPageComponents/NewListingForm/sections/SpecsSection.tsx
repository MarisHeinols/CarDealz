import React from "react";
import { Grid, TextField, MenuItem } from "@mui/material";
import type { CarListingDetailsJson } from "~/types/types";
import { useTranslation } from "react-i18next";

interface Props {
  listing: CarListingDetailsJson;
  setListing: React.Dispatch<React.SetStateAction<CarListingDetailsJson>>;
}

export default function SpecsSection({ listing, setListing }: Props) {
  const { t } = useTranslation();

  const handleChange =
    (field: keyof CarListingDetailsJson) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setListing((prev) => ({ ...prev, [field]: e.target.value }));

  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 4 }}>
        <TextField
          select
          label={t("form.fuelType")}
          fullWidth
          value={listing.fuelType}
          onChange={handleChange("fuelType")}
        >
          <MenuItem value="petrol">{t("carValues.fuel_petrol")}</MenuItem>
          <MenuItem value="diesel">{t("carValues.fuel_diesel")}</MenuItem>
          <MenuItem value="hybrid">{t("carValues.fuel_hybrid")}</MenuItem>
          <MenuItem value="electric">{t("carValues.fuel_electric")}</MenuItem>
        </TextField>
      </Grid>
      <Grid size={{ xs: 4 }}>
        <TextField
          label={t("form.horsepower")}
          type="number"
          fullWidth
          value={listing.horsepower}
          onChange={handleChange("horsepower")}
        />
      </Grid>
      <Grid size={{ xs: 4 }}>
        <TextField
          label={t("form.displacement")}
          type="number"
          fullWidth
          value={listing.displacement}
          onChange={handleChange("displacement")}
        />
      </Grid>
      <Grid size={{ xs: 6 }}>
        <TextField
          select
          label={t("form.transmission")}
          fullWidth
          value={listing.transmission}
          onChange={handleChange("transmission")}
        >
          <MenuItem value="automatic">{t("carValues.transmission_automatic")}</MenuItem>
          <MenuItem value="manual">{t("carValues.transmission_manual")}</MenuItem>
        </TextField>
      </Grid>
      <Grid size={{ xs: 6 }}>
        <TextField
          select
          label={t("form.drivetrain")}
          fullWidth
          value={listing.drivetrain}
          onChange={handleChange("drivetrain")}
        >
          <MenuItem value="fwd">{t("carValues.drivetrain_fwd")}</MenuItem>
          <MenuItem value="rwd">{t("carValues.drivetrain_rwd")}</MenuItem>
          <MenuItem value="awd">{t("carValues.drivetrain_awd")}</MenuItem>
          <MenuItem value="4wd">{t("carValues.drivetrain_4wd")}</MenuItem>
        </TextField>
      </Grid>
    </Grid>
  );
}
