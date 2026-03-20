import React, { useState } from "react";
import {
  Box,
  Button,
  Grid,
  MenuItem,
  TextField,
  Typography,
  Autocomplete,
  CircularProgress,
  Stack,
} from "@mui/material";
import type { ListingsFiltersState } from "~/types/types";
import { COUNTRIES } from "~/constants/countries";
import { CAR_MAKES } from "~/constants/listingOptions";
import { useCarModels } from "~/hooks/useCarModels";
import { useCities } from "~/hooks/useCities";
import { useTranslation } from "react-i18next";

export const defaultFilters: ListingsFiltersState = {
  search: "",
  brand: "all",
  year: "all",
  conditionTier: "all",
  color: "all",
  priceFrom: "",
  priceTo: "",
  mileageFrom: "",
  mileageTo: "",
  country: "all",
  city: "",
  model: "",
};

interface Props {
  filters: ListingsFiltersState;
  onChange: (filters: ListingsFiltersState) => void;
  onReset: () => void;
}

const YEARS = Array.from({ length: 30 }, (_, i) =>
  String(new Date().getFullYear() - i),
);

const DISPLAY_COLORS = [
  "Black",
  "White",
  "Silver",
  "Gray",
  "Red",
  "Blue",
  "Green",
  "Brown",
  "Beige",
  "Gold",
  "Orange",
  "Yellow",
  "Purple",
];

const ListingsFilters = ({ filters, onChange, onReset }: Props) => {
  const { t } = useTranslation();
  const set = (key: keyof ListingsFiltersState, value: string) =>
    onChange({ ...filters, [key]: value });

  const makes = CAR_MAKES as unknown as string[];

  const { models, loading: modelsLoading } = useCarModels(
    !filters.brand || filters.brand === "all" ? "" : filters.brand,
  );
  const { cities, loading: citiesLoading } = useCities(
    !filters.country || filters.country === "all" ? "" : filters.country,
  );

  return (
    <Box
      sx={{
        p: 3,
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 2,
        mb: 3,
      }}
    >
      <Typography fontWeight={600} mb={1}>
        {t("filters.searchTitle")}
      </Typography>

      <TextField
        fullWidth
        placeholder={t("filters.searchPlaceholder")}
        value={filters.search}
        onChange={(e) => set("search", e.target.value)}
        sx={{ mb: 3 }}
      />

      <Grid container spacing={2}>
        {/* Brand */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Autocomplete
            options={makes}
            value={filters.brand === "all" ? "" : filters.brand}
            onInputChange={(_, newValue) => {
              set("brand", newValue || "all");
            }}
            renderInput={(params) => (
              <TextField {...params} label={t("filters.brand")} fullWidth />
            )}
          />
        </Grid>

        {/* Model */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Autocomplete
            options={models}
            disabled={!filters.brand || filters.brand === "all"}
            loading={modelsLoading}
            value={filters.model || ""}
            onInputChange={(_, newValue) => set("model", newValue)}
            renderInput={(params) => (
              <TextField
                {...params}
                label={t("filters.model")}
                placeholder={
                  !filters.brand || filters.brand === "all"
                    ? t("filters.selectBrandFirst")
                    : t("filters.searchModel")
                }
                fullWidth
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {modelsLoading ? (
                        <CircularProgress color="inherit" size={20} />
                      ) : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
          />
        </Grid>

        {/* Country */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <TextField
            select
            fullWidth
            label={t("filters.country")}
            value={filters.country}
            onChange={(e) => set("country", e.target.value)}
          >
            <MenuItem value="all">{t("filters.allCountries")}</MenuItem>
            {COUNTRIES.map((c) => (
              <MenuItem key={c} value={c}>
                {c}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        {/* City */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Autocomplete
            options={cities}
            disabled={!filters.country || filters.country === "all"}
            loading={citiesLoading}
            value={filters.city || ""}
            onInputChange={(_, newValue) => set("city", newValue)}
            renderInput={(params) => (
              <TextField
                {...params}
                label={t("filters.city")}
                placeholder={
                  !filters.country || filters.country === "all"
                    ? t("filters.selectCountryFirst")
                    : t("filters.searchCity")
                }
                fullWidth
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {citiesLoading ? (
                        <CircularProgress color="inherit" size={20} />
                      ) : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
          />
        </Grid>

        {/* Year */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <TextField
            select
            fullWidth
            label={t("filters.year")}
            value={filters.year}
            onChange={(e) => set("year", e.target.value)}
          >
            <MenuItem value="all">{t("filters.allYears")}</MenuItem>
            {YEARS.map((y) => (
              <MenuItem key={y} value={y}>
                {y}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        {/* Condition */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <TextField
            select
            fullWidth
            label={t("filters.condition")}
            value={filters.conditionTier}
            onChange={(e) => set("conditionTier", e.target.value)}
          >
            <MenuItem value="all">{t("filters.allConditions")}</MenuItem>
            {["new", "slightly_used", "used", "first_payment"].map((c) => (
              <MenuItem key={c} value={c}>
                {t(`carValues.condition_${c}`)}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        {/* Color */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Autocomplete
            options={DISPLAY_COLORS}
            value={filters.color === "all" ? "" : filters.color}
            getOptionLabel={(option) => option ? t(`carValues.color_${option}`) : ""}
            onChange={(_, newValue) => set("color", newValue || "all")}
            renderInput={(params) => (
              <TextField {...params} label={t("filters.color")} fullWidth />
            )}
          />
        </Grid>

        {/* Price Range */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Stack direction="row" spacing={1}>
            <TextField
              fullWidth
              label={t("filters.minPrice")}
              type="number"
              value={filters.priceFrom}
              onChange={(e) => set("priceFrom", e.target.value)}
            />
            <TextField
              fullWidth
              label={t("filters.maxPrice")}
              type="number"
              value={filters.priceTo}
              onChange={(e) => set("priceTo", e.target.value)}
            />
          </Stack>
        </Grid>

        {/* Mileage Range */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Stack direction="row" spacing={1}>
            <TextField
              fullWidth
              label={t("filters.minMileage")}
              type="number"
              value={filters.mileageFrom}
              onChange={(e) => set("mileageFrom", e.target.value)}
            />
            <TextField
              fullWidth
              label={t("filters.maxMileage")}
              type="number"
              value={filters.mileageTo}
              onChange={(e) => set("mileageTo", e.target.value)}
            />
          </Stack>
        </Grid>

        {/* Reset */}
        <Grid
          size={{ xs: 12, sm: 6, md: 3 }}
          display="flex"
          alignItems="center"
        >
          <Button
            variant="outlined"
            onClick={onReset}
            fullWidth
            sx={{ height: "56px" }}
          >
            {t("filters.resetFilters")}
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ListingsFilters;
