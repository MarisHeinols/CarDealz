import React from "react";
import { TextField } from "@mui/material";
import type { CarListingDetailsJson } from "~/types/types";
import { useTranslation } from "react-i18next";

interface Props {
  listing: CarListingDetailsJson;
  setListing: React.Dispatch<React.SetStateAction<CarListingDetailsJson>>;
}

function DescriptionSection({ listing, setListing }: Props) {
  const { t } = useTranslation();
  return (
    <TextField
      multiline
      rows={4}
      label={t("form.description")}
      fullWidth
      value={listing.description}
      onChange={(e) =>
        setListing((prev) => ({ ...prev, description: e.target.value }))
      }
      sx={{ mt: 2 }}
    />
  );
}

export default React.memo(DescriptionSection, (prev, next) => {
  return prev.listing.description === next.listing.description;
});
