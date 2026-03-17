import React, { useState, useEffect } from "react";
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
  condition: "all",
  color: "all",
  priceFrom: "",
  priceTo: "",
  mileageFrom: "",
  mileageTo: "",
  country: "all",
  city: "",
};

interface Props {
  filters: ListingsFiltersState;
  onChange: (filters: ListingsFiltersState) => void;
  onReset: () => void;
}

const YEARS = Array.from({ length: 30 }, (_, i) =>
  String(new Date().getFullYear() - i)
);

const ListingsFilters = ({ filters, onChange, onReset }: Props) => {
  const { t } = useTranslation();
  const set = (key: keyof ListingsFiltersState, value: string) =>
    onChange({ ...filters, [key]: value });

  // Makes (curated local list; no external API, no random/custom entries)
  const makes = CAR_MAKES as unknown as string[];

  const { models, loading: modelsLoading } = useCarModels(
    !filters.brand || filters.brand === "all" ? "" : filters.brand
  );
  const { cities, loading: citiesLoading } = useCities(
    !filters.country || filters.country === "all" ? "" : filters.country
  );

  // Note: the URL uses `searchParams.get("model")` but the state object may not have "model" depending on your types. 
  // Standard ListingsFiltersState only has `brand` built-in. Assuming standard filters state. If model is needed in future, 
  // you'd add it to ListingsFiltersState. For now we just implement the city Autocomplete and the brand driven models.

  // models + cities are now handled by shared hooks

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
              <TextField
                {...params}
                label={t("filters.brand")}
                placeholder={t("filters.allBrands")}
                fullWidth
              />
            )}
          />
        </Grid>

        {/* Dynamic Model Dropdown (updates the general search text since model isn't an explicit filter field in default setup, or could be used locally) */}
        {/* To integrate tightly, we just allow selecting a model which appends/sets the search string, or we can just leave it as an informational autocomplete */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
           <Autocomplete
            freeSolo
            options={models}
            loading={modelsLoading}
            disabled={filters.brand === "all"}
            value={filters.search.split(" ").find(s => models.includes(s)) || ""}
            onInputChange={(_, newValue) => {
              // A simple approach: if user selects a model, we ensure it's in the search box since that handles general queries
              if (newValue && !filters.search.includes(newValue)) {
                set("search", `${filters.search} ${newValue}`.trim());
              }
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label={modelsLoading ? "Loading Models…" : "Model"}
                placeholder={filters.brand === "all" ? "Select a brand first" : "Search model"}
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

        {/* Country */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <TextField
            select
            fullWidth
            label="Country"
            value={filters.country}
            onChange={(e) => {
              set("country", e.target.value);
              set("city", ""); // Reset city when country changes
            }}
          >
            <MenuItem value="all">All Countries</MenuItem>
            {COUNTRIES.map((c) => (
              <MenuItem key={c} value={c}>
                {c}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        {/* Dynamic City */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Autocomplete
            freeSolo
            options={cities}
            loading={citiesLoading}
            disabled={filters.country === "all"}
            value={filters.city}
            onInputChange={(_, newValue) => set("city", newValue)}
            renderInput={(params) => (
              <TextField
                {...params}
                label={citiesLoading ? "Loading Cities…" : "City / Region"}
                placeholder={filters.country === "all" ? "Select a country first" : "Search city"}
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
        </Grid>

        {/* Year */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <TextField
            select
            fullWidth
            label="Year"
            value={filters.year}
            onChange={(e) => set("year", e.target.value)}
          >
            <MenuItem value="all">All Years</MenuItem>
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
            label="Condition"
            value={filters.condition}
            onChange={(e) => set("condition", e.target.value)}
          >
            <MenuItem value="all">All</MenuItem>
            {["new", "certified", "used"].map((c) => (
              <MenuItem key={c} value={c}>
                {c}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        {/* Color */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <TextField
            select
            fullWidth
            label="Color"
            value={filters.color}
            onChange={(e) => set("color", e.target.value)}
          >
            <MenuItem value="all">All Colors</MenuItem>
            {["White", "Black", "Silver", "Blue", "Red", "Gray", "Green", "Orange", "Yellow"].map((c) => (
              <MenuItem key={c} value={c}>
                {c}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        {/* Price Range */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <TextField
              fullWidth
              label="Min Price"
              type="number"
              placeholder="$"
              value={filters.priceFrom}
              onChange={(e) => set("priceFrom", e.target.value)}
            />
            <Typography color="text.secondary" fontWeight={500}>
              —
            </Typography>
            <TextField
              fullWidth
              label="Max Price"
              type="number"
              placeholder="$"
              value={filters.priceTo}
              onChange={(e) => set("priceTo", e.target.value)}
            />
          </Stack>
        </Grid>

        {/* Mileage Range */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <TextField
              fullWidth
              label="Min Mileage"
              type="number"
              value={filters.mileageFrom}
              onChange={(e) => set("mileageFrom", e.target.value)}
            />
            <Typography color="text.secondary" fontWeight={500}>
              —
            </Typography>
            <TextField
              fullWidth
              label="Max Mileage"
              type="number"
              value={filters.mileageTo}
              onChange={(e) => set("mileageTo", e.target.value)}
            />
          </Stack>
        </Grid>
      </Grid>

      <Box display="flex" justifyContent="flex-end" mt={2}>
        <Button variant="outlined" onClick={onReset}>
          Reset Filters
        </Button>
      </Box>
    </Box>
  );
};

export default ListingsFilters;
