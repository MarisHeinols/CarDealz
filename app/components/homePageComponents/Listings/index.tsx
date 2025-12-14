import React, { useState } from "react";
import { Pagination, Typography } from "@mui/material";

import ListingsTable from "../ListingsTable";
import {
  defaultFilters,
  useListingsTable,
} from "../ListingsTable/useListingTable";

import styles from "./Listings.module.css";
import carListingsJson from "../../../data/mockData/carListings.json";
import { parseCarListings } from "~/data/mockData/parsers/carListingParser";
import type { ListingsFiltersState } from "~/types/types";
import ListingsFilters from "../ListingFilter";

const Listings = () => {
  const listings = parseCarListings(carListingsJson);

  const [filters, setFilters] = useState<ListingsFiltersState>(defaultFilters);

  const table = useListingsTable(listings, filters);

  return (
    <div className={styles.listingsContainer}>
      <ListingsFilters
        filters={filters}
        onChange={setFilters}
        onReset={() => setFilters(defaultFilters)}
      />

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
