import React from "react";
import { Grid, TextField } from "@mui/material";
import type { CarListingDetailsJson } from "~/types/types";

interface Props {
  listing: CarListingDetailsJson;
  setListing: React.Dispatch<React.SetStateAction<CarListingDetailsJson>>;
}

export default function BasicInfoSection({ listing, setListing }: Props) {
  const handleChange =
    (field: keyof CarListingDetailsJson) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setListing((prev) => ({ ...prev, [field]: e.target.value }));

  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 6 }}>
        <TextField
          label="Make"
          fullWidth
          value={listing.make}
          onChange={handleChange("make")}
        />
      </Grid>
      <Grid size={{ xs: 6 }}>
        <TextField
          label="Model"
          fullWidth
          value={listing.model}
          onChange={handleChange("model")}
        />
      </Grid>
      <Grid size={{ xs: 4 }}>
        <TextField
          label="Year"
          type="number"
          fullWidth
          value={listing.year}
          onChange={handleChange("year")}
        />
      </Grid>
      <Grid size={{ xs: 4 }}>
        <TextField
          label="Mileage"
          type="number"
          fullWidth
          value={listing.mileage}
          onChange={handleChange("mileage")}
        />
      </Grid>
      <Grid size={{ xs: 4 }}>
        <TextField
          label="VIN"
          fullWidth
          value={listing.vin}
          onChange={handleChange("vin")}
        />
      </Grid>
    </Grid>
  );
}
