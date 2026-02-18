import React from "react";
import { TextField } from "@mui/material";
import type { CarListingDetailsJson } from "~/types/types";

interface Props {
  listing: CarListingDetailsJson;
  setListing: React.Dispatch<React.SetStateAction<CarListingDetailsJson>>;
}

export default function DescriptionSection({ listing, setListing }: Props) {
  return (
    <TextField
      multiline
      rows={4}
      label="Description"
      fullWidth
      value={listing.description}
      onChange={(e) =>
        setListing((prev) => ({ ...prev, description: e.target.value }))
      }
      sx={{ mt: 2 }}
    />
  );
}
