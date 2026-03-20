import React, { useState } from "react";
import {
  Button,
  Pagination,
  Typography,
  Box,
  Chip,
  Stack,
  LinearProgress,
} from "@mui/material";
import { useSearchParams } from "react-router";
import { useTranslation } from "react-i18next";

import ListingsTable from "../ListingsTable";
import {
  defaultFilters,
  useListingsTable,
} from "../ListingsTable/useListingTable";

import styles from "./Listings.module.css";
import type { ListingsFiltersState } from "~/types/types";
import ListingsFilters from "../ListingFilter";
import TopListings from "../TopListings";
import { useAllListingsCached } from "~/hooks/useCachedListings";
import { useUserPreferences } from "~/context/UserPreferencesContext";

const Listings = () => {
  const { listings, loading, refreshing } = useAllListingsCached();
  const [filters, setFilters] = useState<ListingsFiltersState>(defaultFilters);
  const [filtersTouched, setFiltersTouched] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const sellerFilter = searchParams.get("seller");
  const prefs = useUserPreferences();
  const { t } = useTranslation();

  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [sellerFilter]);

  React.useEffect(() => {
    if (filtersTouched) return;
    const loc = prefs.location;
    if (!loc) return;

    const nextCountry = loc.country ? loc.country : "all";
    const nextCity = loc.city || "";

    // Only apply defaults if user hasn't interacted and filters are still blank for location.
    setFilters((prev) => {
      if ((prev.country && prev.country !== "all") || prev.city) return prev;
      if (nextCountry === "all" && !nextCity) return prev;
      return { ...prev, country: nextCountry, city: nextCity };
    });
  }, [prefs.location, filtersTouched]);

  // If ?seller= is set, filter listings to that seller only
  const displayedListings = sellerFilter
    ? listings.filter((l) => l.sellerId === sellerFilter)
    : listings;

  const table = useListingsTable(displayedListings, filters);

  return (
    <div className={styles.listingsContainer}>
      {refreshing ? <LinearProgress sx={{ mb: 2 }} /> : null}
      {/* Seller filter banner */}
      {sellerFilter && (
        <Box mb={2}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="body2" color="text.secondary">
              {t("common.showing_from")}
            </Typography>
            <Chip
              label={
                displayedListings[0]?.sellerName
                  ? `${displayedListings[0].sellerName}`
                  : `Seller ${sellerFilter}`
              }
              onDelete={() => setSearchParams({})}
              size="small"
            />
          </Stack>
        </Box>
      )}

      <ListingsFilters
        filters={filters}
        onChange={(f) => {
          setFiltersTouched(true);
          setFilters(f);
        }}
        onReset={() => {
          setFiltersTouched(false);
          setFilters(defaultFilters);
        }}
      />
      <TopListings carListings={table.rows} />
      {loading && listings.length === 0 ? (
        <Box sx={{ mt: 2 }}>
          <LinearProgress />
        </Box>
      ) : null}
      <ListingsTable
        rows={table.rows}
        sortKey={table.sortKey}
        sortDir={table.sortDir}
        onSort={table.toggleSort}
      />

      <div className={styles.footer}>
        <Typography variant="body2">
          {table.total} {t("common.results")}
        </Typography>

        <Pagination
          page={table.page}
          count={table.pageCount}
          onChange={(_, p) => table.setPage(p)}
        />
      </div>
    </div>
  );
};

export default Listings;
