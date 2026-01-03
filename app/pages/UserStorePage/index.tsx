import { useState } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Container,
  Grid,
  Pagination,
  Typography,
} from "@mui/material";

import StoreHeader from "~/components/userStorePageComponents/StoreHeader";
import StoreInfo from "~/components/userStorePageComponents/StoreInfo";
import StoreMap from "~/components/userStorePageComponents/StoreMap";
import StoreListingsGrid from "~/components/userStorePageComponents/StoreListingsGrid";

import carListingsJson from "~/data/mockData/carListings.json";
import { parseCarListings } from "~/data/mockData/parsers/carListingSummaryParser";
import { useFilteredListings } from "~/hooks/userStore/useFilteredListings ";
import ListingsFilters, {
  defaultFilters,
} from "~/components/homePageComponents/ListingFilter";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

const ITEMS_PER_PAGE = 8;

const UserStorePage = () => {
  const listings = parseCarListings(carListingsJson);

  const [filters, setFilters] = useState(defaultFilters);
  const [page, setPage] = useState(1);

  const filtered = useFilteredListings(listings, filters);

  const pageCount = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const visibleListings = filtered.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );
  const hasActiveFilters =
    JSON.stringify(filters) !== JSON.stringify(defaultFilters);

  return (
    <Container maxWidth="xl" sx={{ my: 4 }}>
      <StoreHeader />

      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid size={{ xs: 12, md: 5 }}>
          <StoreInfo />
        </Grid>
        <Grid size={{ xs: 12, md: 7 }}>
          <StoreMap />
        </Grid>
      </Grid>

      {/* Filters */}
      <Box sx={{ mt: 4 }}>
        <Accordion defaultExpanded={hasActiveFilters}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography fontWeight={600}>Search & Filters</Typography>
          </AccordionSummary>

          <AccordionDetails>
            <ListingsFilters
              filters={filters}
              onChange={(f) => {
                setFilters(f);
                setPage(1);
              }}
              onReset={() => {
                setFilters(defaultFilters);
                setPage(1);
              }}
            />
          </AccordionDetails>
        </Accordion>
      </Box>

      {/* Listings */}
      <Box sx={{ mt: 3 }}>
        <StoreListingsGrid listings={visibleListings} />
      </Box>

      {/* Pagination */}
      {pageCount > 1 && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <Pagination
            count={pageCount}
            page={page}
            onChange={(_, p) => setPage(p)}
          />
        </Box>
      )}
    </Container>
  );
};

export default UserStorePage;
