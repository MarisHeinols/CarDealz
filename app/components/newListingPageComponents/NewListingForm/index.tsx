import {
  Box,
  Typography,
  Divider,
  Grid,
  TextField,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Button,
  Accordion,
  AccordionDetails,
  AccordionSummary,
} from "@mui/material";
import React, { useState } from "react";
import {
  CAR_FEATURE_GROUPS,
  CAR_FEATURE_LABELS,
} from "~/constants/carConstants";
import type { CarFeature, CarListingDetailsJson } from "~/types/types";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useNavigate } from "react-router";

const emptyListing: CarListingDetailsJson = {
  id: "",
  vin: 0,
  ta: new Date(),
  make: "",
  model: "",
  year: new Date().getFullYear(),
  mileage: 0,
  fuelType: "petrol",
  displacement: 0,
  transmission: "automatic",
  drivetrain: "fwd",
  horsepower: 0,
  price: 0,
  interiorColor: "",
  condition: "used",
  color: "",
  location: "",
  marketRange: { min: 0, max: 0 },
  images: [],
  features: [],
  description: "",
  seller: {
    name: "",
    isDealer: false,
  },
  viewCount: 0,
  lastViewed: new Date().toISOString(),
  createdAt: new Date().toISOString(),
};

const NewListingForm = () => {
  const [listing, setListing] = useState<CarListingDetailsJson>(emptyListing);
  const navigate = useNavigate();

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  const handleChange =
    (field: keyof CarListingDetailsJson) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setListing({ ...listing, [field]: e.target.value });
    };

  const toggleFeature = (feature: CarFeature) => {
    setListing((prev) => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter((f) => f !== feature)
        : [...prev.features, feature],
    }));
  };

  const handleSubmit = () => {
    console.log("Submitting listing:", listing);
    // POST → API
  };
  return (
    <Box component="form" sx={{ py: 4 }}>
      <Grid container spacing={2}>
        <Grid size={{ xs: 6 }}>
          <TextField
            label="Make"
            fullWidth
            value={listing.make}
            onChange={handleChange("make")}
          />
        </Grid>
        <Grid size={{ xs: 6 }}>
          <TextField
            label="Model"
            fullWidth
            value={listing.model}
            onChange={handleChange("model")}
          />
        </Grid>

        <Grid size={{ xs: 4 }}>
          <TextField
            label="Year"
            type="number"
            fullWidth
            value={listing.year}
            onChange={handleChange("year")}
          />
        </Grid>
        <Grid size={{ xs: 4 }}>
          <TextField
            label="Mileage"
            type="number"
            fullWidth
            value={listing.mileage}
            onChange={handleChange("mileage")}
          />
        </Grid>
        <Grid size={{ xs: 4 }}>
          <TextField
            label="Price"
            type="number"
            fullWidth
            value={listing.price}
            onChange={handleChange("price")}
          />
        </Grid>

        <Grid size={{ xs: 6 }}>
          <TextField
            select
            label="Condition"
            fullWidth
            value={listing.condition}
            onChange={handleChange("condition")}
          >
            <MenuItem value="new">New</MenuItem>
            <MenuItem value="used">Used</MenuItem>
            <MenuItem value="certified">Certified</MenuItem>
          </TextField>
        </Grid>

        <Grid size={{ xs: 6 }}>
          <TextField
            label="Location"
            fullWidth
            value={listing.location}
            onChange={handleChange("location")}
          />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <TextField
            label="Description"
            fullWidth
            multiline
            rows={4}
            value={listing.description}
            onChange={handleChange("description")}
          />
        </Grid>
      </Grid>

      <Divider sx={{ my: 4 }} />

      <Typography variant="h6" gutterBottom>
        Features
      </Typography>

      {Object.values(CAR_FEATURE_GROUPS).map((group) => (
        <Accordion key={group.title} defaultExpanded={false}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography fontWeight={600}>{group.title}</Typography>
          </AccordionSummary>

          <AccordionDetails>
            <Grid container spacing={1}>
              {group.features.map((feature) => (
                <Grid key={feature} size={{ xs: 12, sm: 6, md: 4 }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={listing.features.includes(feature)}
                        onChange={() => toggleFeature(feature)}
                      />
                    }
                    label={CAR_FEATURE_LABELS[feature]}
                  />
                </Grid>
              ))}
            </Grid>
          </AccordionDetails>
        </Accordion>
      ))}

      <Divider sx={{ my: 4 }} />
      <Box sx={{ display: "flex", gap: "1rem" }}>
        <Button variant="outlined" size="large" onClick={handleBack}>
          Back
        </Button>
        <Button variant="contained" size="large" onClick={handleSubmit}>
          Create Listing
        </Button>
      </Box>
    </Box>
  );
};

export default NewListingForm;
