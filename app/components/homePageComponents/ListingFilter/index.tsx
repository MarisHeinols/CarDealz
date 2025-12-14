import {
  Box,
  Button,
  Grid,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";

import type { ListingsFiltersState } from "~/types/types";

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
};

interface Props {
  filters: ListingsFiltersState;
  onChange: (filters: ListingsFiltersState) => void;
  onReset: () => void;
}

const ListingsFilters = ({ filters, onChange, onReset }: Props) => {
  const set = (key: keyof ListingsFiltersState, value: string) =>
    onChange({ ...filters, [key]: value });

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
        Search
      </Typography>

      <TextField
        fullWidth
        placeholder="Search by make, model, color, location..."
        value={filters.search}
        onChange={(e) => set("search", e.target.value)}
        sx={{ mb: 3 }}
      />

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 3 }}>
          <TextField
            select
            fullWidth
            label="Brand"
            value={filters.brand}
            onChange={(e) => set("brand", e.target.value)}
          >
            <MenuItem value="all">All</MenuItem>
            {["Toyota", "Honda", "Tesla", "Ford", "BMW", "Mazda"].map((b) => (
              <MenuItem key={b} value={b}>
                {b}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <TextField
            select
            fullWidth
            label="Year"
            value={filters.year}
            onChange={(e) => set("year", e.target.value)}
          >
            <MenuItem value="all">All</MenuItem>
            {["2024", "2023", "2022"].map((y) => (
              <MenuItem key={y} value={y}>
                {y}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
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

        <Grid size={{ xs: 12, md: 3 }}>
          <TextField
            select
            fullWidth
            label="Color"
            value={filters.color}
            onChange={(e) => set("color", e.target.value)}
          >
            <MenuItem value="all">All</MenuItem>
            {["White", "Black", "Silver", "Blue", "Red"].map((c) => (
              <MenuItem key={c} value={c}>
                {c}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            label="Price From"
            type="number"
            value={filters.priceFrom}
            onChange={(e) => set("priceFrom", e.target.value)}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            label="Price To"
            type="number"
            value={filters.priceTo}
            onChange={(e) => set("priceTo", e.target.value)}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            label="Mileage From"
            type="number"
            value={filters.mileageFrom}
            onChange={(e) => set("mileageFrom", e.target.value)}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            label="Mileage To"
            type="number"
            value={filters.mileageTo}
            onChange={(e) => set("mileageTo", e.target.value)}
          />
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
