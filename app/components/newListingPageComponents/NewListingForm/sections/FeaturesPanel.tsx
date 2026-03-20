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
} from "~/constants/carConstants";
import type { CarListingDetailsJson, CarFeature } from "~/types/types";
import { useTranslation } from "react-i18next";
import { featureDefinitions } from "~/components/listingPageComponents/SpecSheet/featureLabels";

interface Props {
  listing: CarListingDetailsJson;
  setListing: React.Dispatch<React.SetStateAction<CarListingDetailsJson>>;
}

export default function FeaturesPanel({ listing, setListing }: Props) {
  const { t } = useTranslation();

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
        {t("form.features")}
      </Typography>
      {Object.entries(CAR_FEATURE_GROUPS).map(([groupKey, group]) => (
        <Accordion key={group.title}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography fontWeight={600}>
              {t(`featureCategories.${groupKey}`, { defaultValue: group.title })}
            </Typography>
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
                label={t(`features.${feature}`, { defaultValue: featureDefinitions[feature].label })}
              />
            ))}
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
}
