import React, { useState } from "react";
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
import {
  CAR_MAKES,
  CONDITION_TIERS,
  EXTERIOR_COLORS,
  INTERIOR_COLORS,
} from "~/constants/listingOptions";
import { COUNTRIES } from "~/constants/countries";
import { parseLocation, buildLocation } from "~/utils/location";
import { useCarModels } from "~/hooks/useCarModels";
import { useCities } from "~/hooks/useCities";
import { useTranslation } from "react-i18next";

interface Props {
  listing: CarListingDetailsJson;
  setListing: React.Dispatch<React.SetStateAction<CarListingDetailsJson>>;
}

export default function BasicInfoSection({ listing, setListing }: Props) {
  const { t } = useTranslation();
  const { city, country } = parseLocation(listing.location || "");
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  const makes = CAR_MAKES as unknown as string[];
  const { models, loading: modelsLoading } = useCarModels(listing.make);
  const { cities, loading: citiesLoading } = useCities(country);

  const handleChange =
    (field: keyof CarListingDetailsJson) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      setListing((prev) => {
        const payload = { ...prev, [field]: val };

        // Handle numeric fields
        if (field === "year" || field === "mileage") {
          const numVal = Math.max(0, Number(val));
          if (!isNaN(numVal)) {
            (payload as any)[field] = numVal;
          }
        }

        // Handle alphanumeric VIN in uppercase
        if (field === "vin") {
          payload.vin = val.toUpperCase();
        }

        return payload;
      });
    };

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
      setGeoError(t("form.geolocationUnsupported"));
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
            { headers: { "Accept-Language": "en" } },
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
          setGeoError(t("form.locationDetectFailed"));
        } finally {
          setGeoLoading(false);
        }
      },
      (err) => {
        if (err.code === err.TIMEOUT) {
          setGeoError(t("form.locationTimeout"));
        } else {
          setGeoError(t("form.locationDenied"));
        }
        setGeoLoading(false);
      },
      { timeout: 10000 },
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
            <TextField {...params} label={t("form.make")} fullWidth />
          )}
        />
      </Grid>
      <Grid size={{ xs: 6 }}>
        <Autocomplete
          freeSolo
          options={models}
          loading={modelsLoading}
          value={listing.model}
          disabled={!listing.make}
          onInputChange={(_, newValue) =>
            setListing((prev) => ({ ...prev, model: newValue }))
          }
          renderInput={(params) => (
            <TextField
              {...params}
              label={
                !listing.make
                  ? t("form.select_make_first", { defaultValue: "Select maker first" })
                  : modelsLoading
                  ? t("form.loadingModels")
                  : t("form.model")
              }
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
          label={t("form.year")}
          type="number"
          fullWidth
          value={listing.year}
          onChange={handleChange("year")}
          inputProps={{ min: 1900, max: new Date().getFullYear() + 1 }}
        />
      </Grid>
      <Grid size={{ xs: 4 }}>
        <TextField
          label={t("form.mileage")}
          type="number"
          fullWidth
          value={listing.mileage}
          onChange={handleChange("mileage")}
          inputProps={{ min: 0 }}
        />
      </Grid>
      <Grid size={{ xs: 4 }}>
        <TextField
          select
          label={t("form.condition")}
          fullWidth
          value={listing.conditionTier}
          onChange={(e) =>
            setListing((prev) => ({
              ...prev,
              conditionTier: e.target.value as any,
            }))
          }
        >
          {CONDITION_TIERS.map((c) => (
            <MenuItem key={c.value} value={c.value}>
              {t(`carValues.condition_${c.value}`, { defaultValue: c.label })}
            </MenuItem>
          ))}
        </TextField>
      </Grid>
      <Grid size={{ xs: 3 }}>
        <TextField
          label={t("form.vin")}
          fullWidth
          value={listing.vin || ""}
          onChange={handleChange("vin")}
        />
      </Grid>
      <Grid size={{ xs: 3 }}>
        <TextField
          label={t("form.taExpiry")}
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
          label={t("form.plateNumber")}
          fullWidth
          value={listing.plateNumber || ""}
          onChange={handleChange("plateNumber")}
        />
      </Grid>

      <Grid size={{ xs: 6 }}>
        <TextField
          select
          label={t("form.status")}
          fullWidth
          value={listing.status}
          onChange={(e) =>
            setListing((prev) => ({
              ...prev,
              status: e.target.value as any,
            }))
          }
        >
          <MenuItem value="draft">{t("form.status_draft")}</MenuItem>
          <MenuItem value="published">{t("form.status_published")}</MenuItem>
        </TextField>
      </Grid>

      {/* Location: Country + City + Detect */}
      <Grid size={{ xs: 12 }}>
        <Stack direction="row" spacing={1} alignItems="flex-start">
          <FormControl sx={{ minWidth: 200, flexShrink: 0 }}>
            <InputLabel id="country-label">{t("form.country")}</InputLabel>
            <Select
              labelId="country-label"
              label={t("form.country")}
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
            disabled={!country}
            onInputChange={(_, newValue) => handleCityChange(newValue)}
            sx={{ flex: 1 }}
            renderInput={(params) => (
              <TextField
                {...params}
                label={
                  !country 
                    ? t("form.select_country_first", { defaultValue: "Select country first" })
                    : citiesLoading 
                      ? t("form.loadingCities") 
                      : t("form.city")
                }
                placeholder={t("form.cityPlaceholder")}
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
            {geoLoading ? t("form.detecting") : t("common.useMyLocation", { defaultValue: "Use my location" })}
          </Button>
        </Stack>
        
        {/* Full Address */}
        <TextField
          fullWidth
          label={t("fields.address", { defaultValue: "Full Address" })}
          placeholder={t("form.addressPlaceholder", { defaultValue: "e.g. Brīvības iela 123" })}
          value={listing.address || ""}
          onChange={handleChange("address")}
          disabled={!country}
          sx={{ mt: 2 }}
        />
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
          <InputLabel id="color-label">{t("form.exteriorColor")}</InputLabel>
          <Select
            labelId="color-label"
            id="color-select"
            label={t("form.exteriorColor")}
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
                {t(`carValues.color_${color}`, { defaultValue: color })}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
      <Grid size={{ xs: 6 }}>
        <FormControl fullWidth>
          <InputLabel id="interior-color-label">
            {t("form.interiorColor")}
          </InputLabel>
          <Select
            labelId="interior-color-label"
            id="interior-color-select"
            label={t("form.interiorColor")}
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
                {t(`carValues.color_${color}`, { defaultValue: color })}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
    </Grid>
  );
}
