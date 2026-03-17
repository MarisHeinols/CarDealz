import { Grid, Paper, Stack, Typography } from "@mui/material";
import React from "react";
import type { CarListingDetails } from "~/types/types";
import { useTranslation } from "react-i18next";

const DetailsCard = ({ listing }: { listing: CarListingDetails }) => {
  const { t } = useTranslation();
  return (
    <>
      <Stack direction={"row"} spacing={9} mt={3} pb={4}>
        <Typography variant="body1">
          {t("details.vin")}:{" "}
          <strong style={{ textTransform: "capitalize" }}>{listing.vin}</strong>
        </Typography>
        <Typography variant="body1">
          {t("details.ta")}:{" "}
          <strong style={{ textTransform: "capitalize" }}>
            {listing.ta || t("details.na")}
          </strong>
        </Typography>
        <Typography variant="body1">
          {t("details.plate")}:{" "}
          <strong style={{ textTransform: "uppercase" }}>
            {listing.plateNumber || t("details.na")}
          </strong>
        </Typography>
      </Stack>
      <Grid container spacing={1}>
        <Grid size={{ xs: 6, md: 6 }}>
          <Typography variant="body2">
            {t("details.fuelType")}:{" "}
            <strong style={{ textTransform: "capitalize" }}>
              {listing.fuelType}
            </strong>
          </Typography>
          <Typography variant="body2">
            {t("details.displacement")}: <strong>{listing.displacement}</strong>
          </Typography>
          <Typography variant="body2">
            {t("details.drivetrain")}:{" "}
            <strong style={{ textTransform: "capitalize" }}>
              {listing.drivetrain}
            </strong>
          </Typography>
          <Typography variant="body2">
            {t("details.transmission")}:{" "}
            <strong style={{ textTransform: "capitalize" }}>
              {listing.transmission}
            </strong>
          </Typography>
        </Grid>
        <Grid size={{ xs: 6, md: 6 }}>
          <Typography variant="body2">
            {t("details.interiorColor")}:{" "}
            <strong style={{ textTransform: "capitalize" }}>
              {listing.interiorColor}
            </strong>
          </Typography>
          <Typography variant="body2">
            {t("details.color")}:{" "}
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
