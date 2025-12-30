import { Box, Chip, Grid, Paper, Stack, Typography } from "@mui/material";
import React from "react";
import type { CarFeature } from "~/types/types";
import { groupFeatures } from "./helper/helper";
import { featureDefinitions } from "./featureLabels";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";

const SpecSheet = ({ features }: { features: CarFeature[] }) => {
  const grouped = groupFeatures();
  const featureSet = new Set(features);

  return (
    <Paper sx={{ p: 3 }}>
      {Object.entries(grouped).map(([category, featureKeys]) => (
        <Box key={category} sx={{ mb: 3 }}>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
            {category.toUpperCase()}
          </Typography>

          <Grid container spacing={2}>
            {featureKeys.map((f) => {
              const enabled = featureSet.has(f);

              return (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={f}>
                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    sx={{
                      opacity: enabled ? 1 : 0.6,
                    }}
                  >
                    {enabled ? (
                      <CheckCircleIcon fontSize="small" color="success" />
                    ) : (
                      <RadioButtonUncheckedIcon
                        fontSize="small"
                        sx={{ color: "rgba(0,0,0,0.3)" }}
                      />
                    )}

                    <Typography variant="body2">
                      {featureDefinitions[f].label}
                    </Typography>
                  </Stack>
                </Grid>
              );
            })}
          </Grid>
        </Box>
      ))}
    </Paper>
  );
};

export default SpecSheet;
