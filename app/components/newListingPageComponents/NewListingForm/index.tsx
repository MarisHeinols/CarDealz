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
import React, { useRef, useState } from "react";
import {
  CAR_FEATURE_GROUPS,
  CAR_FEATURE_LABELS,
} from "~/constants/carConstants";
import type { CarFeature, CarListingDetailsJson } from "~/types/types";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useNavigate } from "react-router";
import ImageUpload from "~/components/shared/ImageUpload";
import ImageCarousel from "~/components/listingPageComponents/ImageCarousel";

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
  const [carImages, setCarImages] = useState<File[]>([]);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const imageUrls = React.useMemo(
    () => carImages.map((file) => URL.createObjectURL(file)),
    [carImages],
  );

  const handleImageUpload = (files: File[]) => {
    setCarImages((prev) => [...prev, ...files]);
  };

  const handleDeleteImage = (idx: number) => {
    setCarImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = () => {
    console.log("Submitting listing:", listing);
    // POST → API
  };
  return (
    <Box component="form" sx={{ py: 4 }}>
      <Grid container spacing={3}>
        {/* LEFT SIDE — 70% */}
        <Grid size={{ xs: 12, md: 8 }}>
          {/* IMAGE AREA */}
          <Box
            sx={{
              width: "100%",
              aspectRatio: "16 / 9",
              bgcolor: "#e3e1e1",
              borderRadius: 2,
              p: 2,
              mb: 3,
              overflow: "hidden",
            }}
          >
            {carImages.length > 0 ? (
              <ImageCarousel
                images={imageUrls}
                onDelete={handleDeleteImage}
                onUploadMore={() => fileInputRef.current?.click()}
              />
            ) : (
              <Box
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: 2,
                }}
              >
                <Typography>Upload Images</Typography>
                <ImageUpload
                  uploadFunction={handleImageUpload}
                  fileInputRef={fileInputRef}
                />
              </Box>
            )}
          </Box>

          {/* MAIN INFO */}
          <Grid container spacing={2}>
            <Grid size={{ xs: 6 }}>
              <TextField label="Make" fullWidth />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <TextField label="Model" fullWidth />
            </Grid>

            <Grid size={{ xs: 4 }}>
              <TextField label="Year" type="number" fullWidth />
            </Grid>
            <Grid size={{ xs: 4 }}>
              <TextField label="Mileage" type="number" fullWidth />
            </Grid>
            <Grid size={{ xs: 4 }}>
              <TextField label="Price" type="number" fullWidth />
            </Grid>

            <Grid size={{ xs: 6 }}>
              <TextField select label="Condition" fullWidth>
                <MenuItem value="new">New</MenuItem>
                <MenuItem value="used">Used</MenuItem>
                <MenuItem value="certified">Certified</MenuItem>
              </TextField>
            </Grid>

            <Grid size={{ xs: 6 }}>
              <TextField label="Location" fullWidth />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField multiline rows={4} label="Description" fullWidth />
            </Grid>
          </Grid>
        </Grid>

        {/* RIGHT SIDE — 30% */}
        <Grid size={{ xs: 12, md: 4 }}>
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
                  <Grid container spacing={1}>
                    {group.features.map((feature) => (
                      <Grid key={feature} size={{ xs: 12 }}>
                        <FormControlLabel
                          control={<Checkbox />}
                          label={CAR_FEATURE_LABELS[feature]}
                        />
                      </Grid>
                    ))}
                  </Grid>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        </Grid>
      </Grid>

      <Divider sx={{ my: 4 }} />

      <Box sx={{ display: "flex", gap: 2 }}>
        <Button variant="outlined">Back</Button>
        <Button variant="contained">Create Listing</Button>
      </Box>
    </Box>
  );
};

export default NewListingForm;
