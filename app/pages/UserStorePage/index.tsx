import { useState, useMemo, useEffect } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Container,
  Grid,
  Pagination,
  Typography,
  Select,
  MenuItem,
  FormControl,
  LinearProgress,
} from "@mui/material";

import { useTranslation } from "react-i18next";
import StoreHeader from "~/components/userStorePageComponents/StoreHeader";
import StoreInfo from "~/components/userStorePageComponents/StoreInfo";
import StoreMap from "~/components/userStorePageComponents/StoreMap";
import StoreListingsGrid from "~/components/userStorePageComponents/StoreListingsGrid";

import { useFilteredListings } from "~/hooks/userStore/useFilteredListings ";
import { auth } from "~/firebase/auth";
import { onAuthStateChanged } from "firebase/auth";
import ListingsFilters, {
  defaultFilters,
} from "~/components/homePageComponents/ListingFilter";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useAppSelector } from "~/redux/hooks";
import { useOwnerListingsCached } from "~/hooks/useCachedListings";
import StoreReviewsSection from "~/components/shared/StoreReviewsSection";
import { useNavigate } from "react-router";

const ITEMS_PER_PAGE = 8;

const UserStorePage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [filters, setFilters] = useState(defaultFilters);
  const [page, setPage] = useState(1);
  const [sortParam, setSortParam] = useState<string>("newest");
  const [ownerId, setOwnerId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setOwnerId(user.uid);
      } else {
        setOwnerId(null);
        navigate("/login");
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const owner = useOwnerListingsCached(ownerId);
  const listings = owner.listings;
  const loading = owner.loading;
  const refreshing = owner.refreshing;

  const filtered = useFilteredListings(listings, filters);

  const filteredAndSorted = useMemo(() => {
    let result = [...filtered];
    switch (sortParam) {
      case "price_asc":
        result.sort(
          (a, b) => (a.salePrice || a.price) - (b.salePrice || b.price),
        );
        break;
      case "price_desc":
        result.sort(
          (a, b) => (b.salePrice || b.price) - (a.salePrice || a.price),
        );
        break;
      case "year_desc":
        result.sort((a, b) => b.year - a.year);
        break;
      case "newest":
      default:
        result.sort((a, b) => {
          if (a.createdAt && b.createdAt) {
            return (
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
          }
          return 0; // fallback original order
        });
        break;
    }
    return result;
  }, [filtered, sortParam]);

  const theme = useAppSelector((state) => state.storeSettings.theme);

  const pageCount = Math.ceil(filteredAndSorted.length / ITEMS_PER_PAGE);
  const visibleListings = filteredAndSorted.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE,
  );
  const hasActiveFilters =
    JSON.stringify(filters) !== JSON.stringify(defaultFilters);
  return (
    <Container
      maxWidth="xl"
      sx={{ py: 4, bgcolor: theme ? theme.background : "" }}
    >
      {refreshing ? <LinearProgress sx={{ mb: 2 }} /> : null}
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
        <Accordion
          defaultExpanded={hasActiveFilters}
          sx={{
            bgcolor: theme.secondary ? theme.secondary : "",
            color: theme.isTextLight ? "white" : "black",
          }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography fontWeight={600}>
              {t("filters.searchTitle")} & {t("listing.features")}
            </Typography>
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

      {/* Header and Sorting */}
      <Box
        sx={{
          mt: 4,
          mb: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Typography
          variant="h6"
          fontWeight={700}
          sx={{
            color: theme.isTextLight
              ? "white"
              : theme.heading || "text.primary",
          }}
        >
          {t("listing.inventory")}
        </Typography>
        <FormControl
          size="small"
          sx={{
            minWidth: 200,
            bgcolor: theme.secondary || "background.paper",
            borderRadius: 1,
          }}
        >
          <Select
            value={sortParam}
            onChange={(e) => {
              setSortParam(e.target.value);
              setPage(1);
            }}
            displayEmpty
            sx={{ color: theme.isTextLight ? "white" : "text.primary" }}
          >
            <MenuItem value="newest">{t("businesses.sortOptions.newest")}</MenuItem>
            <MenuItem value="price_asc">{t("businesses.sortOptions.price_asc")}</MenuItem>
            <MenuItem value="price_desc">{t("businesses.sortOptions.price_desc")}</MenuItem>
            <MenuItem value="year_desc">{t("businesses.sortOptions.year")}</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Listings */}
      <Box sx={{ mt: 1 }}>
        {loading && listings.length === 0 ? <LinearProgress /> : null}
        <StoreListingsGrid listings={visibleListings} isOwner={true} />
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

      <Box>
        {ownerId ? (
          <StoreReviewsSection
            storeUid={ownerId}
            ownerUid={ownerId}
            viewerUid={ownerId}
            useStoreTheme
          />
        ) : null}
      </Box>
    </Container>
  );
};

export default UserStorePage;
