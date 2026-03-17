import React, { useState } from "react";
import { Button, Pagination, Typography, Box, Chip, Stack, LinearProgress } from "@mui/material";
import { useSearchParams } from "react-router";

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

const Listings = () => {
  const { listings, loading, refreshing } = useAllListingsCached();
  const [filters, setFilters] = useState<ListingsFiltersState>(defaultFilters);
  const [searchParams, setSearchParams] = useSearchParams();
  const sellerFilter = searchParams.get("seller");

  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [sellerFilter]);

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
              Showing listings from:
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
        onChange={setFilters}
        onReset={() => setFilters(defaultFilters)}
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
        <Typography variant="body2">{table.total} results</Typography>

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
