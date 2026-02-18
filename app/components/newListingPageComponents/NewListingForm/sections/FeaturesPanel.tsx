import React from "react";
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  CAR_FEATURE_GROUPS,
  CAR_FEATURE_LABELS,
} from "~/constants/carConstants";
import type { CarListingDetailsJson, CarFeature } from "~/types/types";

interface Props {
  listing: CarListingDetailsJson;
  setListing: React.Dispatch<React.SetStateAction<CarListingDetailsJson>>;
}

export default function FeaturesPanel({ listing, setListing }: Props) {
  const toggleFeature = (feature: CarFeature) => {
    setListing((prev) => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter((f) => f !== feature)
        : [...prev.features, feature],
    }));
  };

  return (
    <Box
      sx={{
        position: "sticky",
        top: 20,
        bgcolor: "#fafafa",
        borderRadius: 2,
        p: 2,
        boxShadow: 1,
        maxHeight: "calc(100vh - 40px)",
        overflowY: "auto",
      }}
    >
      <Typography variant="h6" gutterBottom>
        Features
      </Typography>
      {Object.values(CAR_FEATURE_GROUPS).map((group) => (
        <Accordion key={group.title}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography fontWeight={600}>{group.title}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            {group.features.map((feature) => (
              <FormControlLabel
                key={feature}
                control={
                  <Checkbox
                    checked={listing.features.includes(feature)}
                    onChange={() => toggleFeature(feature)}
                  />
                }
                label={CAR_FEATURE_LABELS[feature]}
              />
            ))}
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
}
