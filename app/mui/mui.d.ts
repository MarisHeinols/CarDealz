import "@mui/material/Chip";

declare module "@mui/material/Chip" {
  interface ChipPropsVariantOverrides {
    levelLow: true;
    levelNeutral: true;
    levelMedium: true;
    levelHigh: true;
  }
}