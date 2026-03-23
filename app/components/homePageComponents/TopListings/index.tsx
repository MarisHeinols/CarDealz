import React from "react";
import type { CarListingSummary } from "~/types/types";
import { Typography, Grid } from "@mui/material";
import { useTranslation } from "react-i18next";

import ListingCard from "~/components/shared/ListingCard";
const TopListings = ({ carListings }: { carListings: CarListingSummary[] }) => {
  const { t } = useTranslation();
  const topListings = [...carListings]
    .sort((a, b) => b.viewCount - a.viewCount)
    .slice(0, 5);

  return (
    <>
      <Typography gutterBottom variant="h5" fontWeight={900}>
        {t("nav.top_listings")}
      </Typography>

      <Grid container spacing={2}>
        {topListings.map((listing) => (
          <Grid key={listing.id} size={{ xs: 12, sm: 2.4 }}>
            <ListingCard listing={listing} />
          </Grid>
        ))}
      </Grid>
    </>
  );
};

export default TopListings;
