import React from "react";
import { Grid, TextField } from "@mui/material";
import type { CarListingDetailsJson } from "~/types/types";

interface Props {
  listing: CarListingDetailsJson;
  setListing: React.Dispatch<React.SetStateAction<CarListingDetailsJson>>;
}

export default function PricingSection({ listing, setListing }: Props) {
  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 6 }}>
        <TextField
          label="Price"
          type="number"
          fullWidth
          value={listing.price}
          onChange={(e) =>
            setListing((prev) => ({ ...prev, price: Number(e.target.value) }))
          }
        />
      </Grid>
      <Grid size={{ xs: 3 }}>
        <TextField
          label="Market Min"
          type="number"
          fullWidth
          value={listing.marketRange.min}
          onChange={(e) =>
            setListing((prev) => ({
              ...prev,
              marketRange: { ...prev.marketRange, min: Number(e.target.value) },
            }))
          }
        />
      </Grid>
      <Grid size={{ xs: 3 }}>
        <TextField
          label="Market Max"
          type="number"
          fullWidth
          value={listing.marketRange.max}
          onChange={(e) =>
            setListing((prev) => ({
              ...prev,
              marketRange: { ...prev.marketRange, max: Number(e.target.value) },
            }))
          }
        />
      </Grid>
    </Grid>
  );
}
