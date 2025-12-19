import React, { useEffect, useState } from "react";
import type { CarListingSummary } from "~/types/types";
import styles from "./TopListings.module.css";
import {
  Card,
  CardActionArea,
  CardMedia,
  CardContent,
  Typography,
} from "@mui/material";
const TopListings = ({ carListings }: { carListings: CarListingSummary[] }) => {
  const topListings = [...carListings]
    .sort((a, b) => b.viewCount - a.viewCount)
    .slice(0, 5);

  return (
    <div className={styles.topListingContainer}>
      <Typography gutterBottom variant="h6" className={styles.topListingHeader}>
        Top Listings Last 7 days
      </Typography>
      <div className={styles.cardsContainer}>
        {topListings.map((carListing, index) => {
          return (
            <Card
              key={carListing.id}
              sx={{
                width: "100%",
                display: "flex",
                flexDirection: "column",
                border: "1px solid rgba(122, 0, 129, 0.4)",
                boxShadow: "0 0 15px rgba(122, 0, 129, 0.35)",
                transition: "all 0.3s ease",
                "&:hover": {
                  boxShadow: "0 0 25px rgba(122, 0, 129, 0.8)",
                  transform: "translateY(-4px)",
                },
              }}
            >
              <CardActionArea>
                <CardMedia
                  component="img"
                  image={carListing.thumbnailUrl}
                  alt={`${carListing.make} ${carListing.model}`}
                  sx={{
                    height: 100,
                    objectFit: "cover",
                  }}
                />

                <CardContent>
                  <Typography variant="caption" color="text.secondary">
                    #{index + 1}
                  </Typography>

                  <Typography
                    gutterBottom
                    variant="h6"
                    className={styles.topListingHeader}
                  >
                    {carListing.make} {carListing.model}
                  </Typography>

                  <Typography variant="h6" color="primary">
                    ${carListing.price.toLocaleString("en-US")}
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    {carListing.mileage.toLocaleString("en-US")} km •{" "}
                    {carListing.location} • {carListing.year}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default TopListings;
