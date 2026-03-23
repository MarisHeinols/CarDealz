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
import type { ListingsFiltersState, CarListingSummary, SortKey, SortDir } from "~/types/types";
import ListingsFilters from "../ListingFilter";
import TopListings from "../TopListings";
import { usePaginatedListings } from "~/hooks/usePaginatedListings";
import { useUserPreferences } from "~/context/UserPreferencesContext";

const Listings = () => {
  const [filters, setFilters] = useState<ListingsFiltersState>(defaultFilters);
  const [filtersTouched, setFiltersTouched] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>("createdAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  
  const { 
    listings, 
    loading, 
    refreshing,
    error, 
    totalCount, 
    currentPage, 
    pageCount, 
    setCurrentPage 
  } = usePaginatedListings(10, { make: filters.brand }, sortKey, sortDir);
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

  // We still use useListingsTable for its sorting logic, 
  // though it now only sorts the CURRENT page's results.
  // In a full implementation, sorting would also be server-side.
  // We still use useListingsTable for its filtering logic (for search tokens)
  // and to know how to display the rows.
  const table = useListingsTable(displayedListings, filters, {
    sortKey,
    sortDir,
    onSort: (key, dir) => {
      setSortKey(key);
      setSortDir(dir);
      setCurrentPage(1);
    }
  });

  return (
    <div className={styles.listingsContainer}>
      <Typography variant="h4" component="h1" fontWeight={900} mb={3}>
        {t("seo.homeTitle")}
      </Typography>
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

      {error && (
        <Box sx={{ mb: 4, p: 3, bgcolor: "error.light", borderRadius: 2, border: "1px solid", borderColor: "error.main" }}>
          <Stack spacing={1}>
            <Typography color="error.dark" fontWeight="bold">
              {t("common.error_fetching")}
            </Typography>
            <Typography variant="body2" color="error.dark">
              {error}
            </Typography>
            <Button 
              variant="contained" 
              color="error" 
              size="small" 
              onClick={() => window.location.reload()} 
              sx={{ alignSelf: "flex-start", mt: 1 }}
            >
              {t("common.retry")}
            </Button>
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
      {loading && listings.length === 0 && !error ? (
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
          {totalCount} {t("common.results")}
        </Typography>

        <Pagination
          page={currentPage}
          count={pageCount}
          onChange={(_, p) => setCurrentPage(p)}
        />
      </div>
    </div>
  );
};

export default Listings;
