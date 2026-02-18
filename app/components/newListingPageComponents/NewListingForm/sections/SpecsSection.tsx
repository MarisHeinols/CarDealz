import React from "react";
import { Grid, TextField, MenuItem } from "@mui/material";
import type { CarListingDetailsJson } from "~/types/types";

interface Props {
  listing: CarListingDetailsJson;
  setListing: React.Dispatch<React.SetStateAction<CarListingDetailsJson>>;
}

export default function SpecsSection({ listing, setListing }: Props) {
  const handleChange =
    (field: keyof CarListingDetailsJson) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setListing((prev) => ({ ...prev, [field]: e.target.value }));

  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 4 }}>
        <TextField
          select
          label="Fuel Type"
          fullWidth
          value={listing.fuelType}
          onChange={handleChange("fuelType")}
        >
          <MenuItem value="petrol">Petrol</MenuItem>
          <MenuItem value="diesel">Diesel</MenuItem>
          <MenuItem value="hybrid">Hybrid</MenuItem>
          <MenuItem value="electric">Electric</MenuItem>
        </TextField>
      </Grid>
      <Grid size={{ xs: 4 }}>
        <TextField
          label="Horsepower"
          type="number"
          fullWidth
          value={listing.horsepower}
          onChange={handleChange("horsepower")}
        />
      </Grid>
      <Grid size={{ xs: 4 }}>
        <TextField
          label="Displacement (L)"
          type="number"
          fullWidth
          value={listing.displacement}
          onChange={handleChange("displacement")}
        />
      </Grid>
      <Grid size={{ xs: 6 }}>
        <TextField
          select
          label="Transmission"
          fullWidth
          value={listing.transmission}
          onChange={handleChange("transmission")}
        >
          <MenuItem value="automatic">Automatic</MenuItem>
          <MenuItem value="manual">Manual</MenuItem>
        </TextField>
      </Grid>
      <Grid size={{ xs: 6 }}>
        <TextField
          select
          label="Drivetrain"
          fullWidth
          value={listing.drivetrain}
          onChange={handleChange("drivetrain")}
        >
          <MenuItem value="fwd">FWD</MenuItem>
          <MenuItem value="rwd">RWD</MenuItem>
          <MenuItem value="awd">AWD</MenuItem>
        </TextField>
      </Grid>
    </Grid>
  );
}
