import { Grid, Paper, Stack, Typography } from "@mui/material";
import React from "react";
import type { CarListingDetails } from "~/types/types";

const DetailsCard = ({ listing }: { listing: CarListingDetails }) => {
  return (
    <>
      <Stack direction={"row"} spacing={9} mt={3} pb={4}>
        <Typography variant="body1">
          VIN:{" "}
          <strong style={{ textTransform: "capitalize" }}>{listing.vin}</strong>
        </Typography>
        <Typography variant="body1">
          TA:{" "}
          <strong style={{ textTransform: "capitalize" }}>
            {listing.ta.toString()}
          </strong>
        </Typography>
      </Stack>
      <Grid container spacing={1}>
        <Grid size={{ xs: 6, md: 6 }}>
          <Typography variant="body2">
            Fuel type:{" "}
            <strong style={{ textTransform: "capitalize" }}>
              {listing.fuelType}
            </strong>
          </Typography>
          <Typography variant="body2">
            Displacment: <strong>{listing.displacement}</strong>
          </Typography>
          <Typography variant="body2">
            Drivetrain:{" "}
            <strong style={{ textTransform: "capitalize" }}>
              {listing.drivetrain}
            </strong>
          </Typography>
          <Typography variant="body2">
            Transmition:{" "}
            <strong style={{ textTransform: "capitalize" }}>
              {listing.transmission}
            </strong>
          </Typography>
        </Grid>
        <Grid size={{ xs: 6, md: 6 }}>
          <Typography variant="body2">
            Interior color:{" "}
            <strong style={{ textTransform: "capitalize" }}>
              {listing.interiorColor}
            </strong>
          </Typography>
          <Typography variant="body2">
            Color:{" "}
            <strong style={{ textTransform: "capitalize" }}>
              {listing.color}
            </strong>
          </Typography>
        </Grid>
      </Grid>
    </>
  );
};

export default DetailsCard;
