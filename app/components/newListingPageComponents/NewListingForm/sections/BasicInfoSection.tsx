import React, { useState, useEffect } from "react";
import {
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  CircularProgress,
  Typography,
  Stack,
  Autocomplete,
} from "@mui/material";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import type { CarListingDetailsJson } from "~/types/types";
import { CAR_MAKES, EXTERIOR_COLORS, INTERIOR_COLORS } from "~/constants/listingOptions";
import { COUNTRIES } from "~/constants/countries";
import { parseLocation, buildLocation } from "~/utils/location";
import { useCarModels } from "~/hooks/useCarModels";
import { useCities } from "~/hooks/useCities";

interface Props {
  listing: CarListingDetailsJson;
  setListing: React.Dispatch<React.SetStateAction<CarListingDetailsJson>>;
}

export default function BasicInfoSection({ listing, setListing }: Props) {
  const { city, country } = parseLocation(listing.location || "");
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  // Makes (curated local list; no external API, no random/custom entries)
  const makes = CAR_MAKES as unknown as string[];

  const { models, loading: modelsLoading } = useCarModels(listing.make);
  const { cities, loading: citiesLoading } = useCities(country);

  const handleChange =
    (field: keyof CarListingDetailsJson) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setListing((prev) => ({ ...prev, [field]: e.target.value }));

  const handleCityChange = (newCity: string) => {
    setListing((prev) => ({
      ...prev,
      location: buildLocation(newCity, country),
    }));
  };

  const handleCountryChange = (newCountry: string) => {
    setListing((prev) => ({
      ...prev,
      location: buildLocation(city, newCountry),
    }));
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setGeoError("Geolocation is not supported by your browser.");
      return;
    }
    setGeoLoading(true);
    setGeoError(null);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
            { headers: { "Accept-Language": "en" } }
          );
          const data = await res.json();
          const detectedCountry = data.address?.country || "";
          const detectedCity =
            data.address?.city ||
            data.address?.town ||
            data.address?.village ||
            data.address?.county ||
            "";
          setListing((prev) => ({
            ...prev,
            location: buildLocation(detectedCity, detectedCountry),
          }));
        } catch {
          setGeoError("Could not determine your location. Enter it manually.");
        } finally {
          setGeoLoading(false);
        }
      },
      (err) => {
        if (err.code === err.TIMEOUT) {
          setGeoError("Location request timed out. Enter it manually.");
        } else {
          setGeoError("Location access denied or failed. Enter it manually.");
        }
        setGeoLoading(false);
      },
      { timeout: 10000 } // Add 10s timeout to prevent infinite spinning
    );
  };

  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 6 }}>
        <Autocomplete
          options={makes}
          value={listing.make}
          onInputChange={(_, newValue) =>
            setListing((prev) => ({ ...prev, make: newValue, model: "" }))
          }
          renderInput={(params) => (
            <TextField
              {...params}
              label="Make"
              fullWidth
            />
          )}
        />
      </Grid>
      <Grid size={{ xs: 6 }}>
        <Autocomplete
          freeSolo
          options={models}
          loading={modelsLoading}
          value={listing.model}
          onInputChange={(_, newValue) =>
            setListing((prev) => ({ ...prev, model: newValue }))
          }
          renderInput={(params) => (
            <TextField
              {...params}
              label={modelsLoading ? "Loading Models…" : "Model"}
              fullWidth
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <React.Fragment>
                    {modelsLoading ? (
                      <CircularProgress color="inherit" size={20} />
                    ) : null}
                    {params.InputProps.endAdornment}
                  </React.Fragment>
                ),
              }}
            />
          )}
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
      <Grid size={{ xs: 3 }}>
        <TextField
          label="VIN"
          fullWidth
          value={listing.vin || ""}
          onChange={handleChange("vin")}
        />
      </Grid>
      <Grid size={{ xs: 3 }}>
        <TextField
          label="TA Expiry"
          type="month"
          fullWidth
          value={listing.ta || ""}
          onChange={handleChange("ta")}
          InputLabelProps={{ shrink: true }}
          placeholder="YYYY-MM"
        />
      </Grid>
      <Grid size={{ xs: 6 }}>
        <TextField
          label="Plate Number"
          fullWidth
          value={listing.plateNumber || ""}
          onChange={handleChange("plateNumber")}
        />
      </Grid>

      {/* Location: Country + City + Detect */}
      <Grid size={{ xs: 12 }}>
        <Stack direction="row" spacing={1} alignItems="flex-start">
          <FormControl sx={{ minWidth: 200, flexShrink: 0 }}>
            <InputLabel id="country-label">Country</InputLabel>
            <Select
              labelId="country-label"
              label="Country"
              value={country}
              onChange={(e) => handleCountryChange(e.target.value)}
            >
              {COUNTRIES.map((c) => (
                <MenuItem key={c} value={c}>
                  {c}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Autocomplete
            freeSolo
            options={cities}
            loading={citiesLoading}
            value={city}
            onInputChange={(_, newValue) => handleCityChange(newValue)}
            sx={{ flex: 1 }}
            renderInput={(params) => (
              <TextField
                {...params}
                label={citiesLoading ? "Loading Cities…" : "City / Region"}
                placeholder="e.g. Los Angeles"
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <React.Fragment>
                      {citiesLoading ? (
                        <CircularProgress color="inherit" size={20} />
                      ) : null}
                      {params.InputProps.endAdornment}
                    </React.Fragment>
                  ),
                }}
              />
            )}
          />

          <Button
            variant="outlined"
            onClick={handleDetectLocation}
            disabled={geoLoading}
            startIcon={
              geoLoading ? <CircularProgress size={16} /> : <MyLocationIcon />
            }
            sx={{ height: 56, whiteSpace: "nowrap" }}
          >
            {geoLoading ? "Detecting…" : "My Location"}
          </Button>
        </Stack>
        {geoError && (
          <Typography
            variant="caption"
            color="error"
            sx={{ mt: 0.5, display: "block" }}
          >
            {geoError}
          </Typography>
        )}
      </Grid>

      <Grid size={{ xs: 6 }}>
        <FormControl fullWidth>
          <InputLabel id="color-label">Exterior Color</InputLabel>
          <Select
            labelId="color-label"
            id="color-select"
            label="Exterior Color"
            value={listing.color}
            onChange={(e) =>
              setListing((prev) => ({
                ...prev,
                color: e.target.value as string,
              }))
            }
          >
            {EXTERIOR_COLORS.map((color) => (
              <MenuItem key={color} value={color}>
                {color}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
      <Grid size={{ xs: 6 }}>
        <FormControl fullWidth>
          <InputLabel id="interior-color-label">Interior Color</InputLabel>
          <Select
            labelId="interior-color-label"
            id="interior-color-select"
            label="Interior Color"
            value={listing.interiorColor}
            onChange={(e) =>
              setListing((prev) => ({
                ...prev,
                interiorColor: e.target.value as string,
              }))
            }
          >
            {INTERIOR_COLORS.map((color) => (
              <MenuItem key={color} value={color}>
                {color}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
    </Grid>
  );
}
