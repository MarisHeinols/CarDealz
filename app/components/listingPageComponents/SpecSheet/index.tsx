import { Chip, Grid, Paper, Typography } from "@mui/material";
import React from "react";
import type { CarFeature } from "~/types/types";

const featureLabels: Record<CarFeature, string> = {
  power_windows: "Power Windows",
  power_steering: "Power Steering",
  air_conditioning: "Air Conditioning",
  climate_control: "Climate Control",
  heated_seats: "Heated Seats",
  ventilated_seats: "Ventilated Seats",
  leather_seats: "Leather Seats",
  cruise_control: "Cruise Control",
  adaptive_cruise_control: "Adaptive Cruise Control",
  lane_assist: "Lane Assist",
  blind_spot_monitor: "Blind Spot Monitor",
  parking_sensors: "Parking Sensors",
  rear_camera: "Rear Camera",
  "360_camera": "360° Camera",
  led_headlights: "LED Headlights",
  adaptive_lights: "Adaptive Headlights",
  keyless_entry: "Keyless Entry",
  remote_start: "Remote Start",
  navigation: "Navigation",
  bluetooth: "Bluetooth",
  apple_carplay: "Apple CarPlay",
  android_auto: "Android Auto",
};

const SpecSheet = ({ features }: { features: CarFeature[] }) => {
  return (
    <Paper variant="outlined" sx={{ p: 3 }}>
      <Grid container spacing={1}>
        {features.map((f) => (
          <Grid size={{ xs: 6, md: 3 }} key={f}>
            <Chip label={featureLabels[f]} size="small" />
          </Grid>
        ))}
      </Grid>
    </Paper>
  );
};

export default SpecSheet;
