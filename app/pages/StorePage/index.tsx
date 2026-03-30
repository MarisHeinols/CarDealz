import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Typography,
  Stack,
  Tabs,
  Tab,
  Pagination,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Container,
  LinearProgress,
  ThemeProvider,
  createTheme,
  Divider,
  Link,
} from "@mui/material";
import { Link as RouterLink } from "react-router";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useAppDispatch } from "~/redux/hooks";
import { loadStoreSettingsFromDb } from "~/services/storeSettingsService";
import {
  getStoreHandleForUid,
  resolveStoreUidByHandle,
} from "~/services/storeHandleService";
import { useOwnerListingsCached } from "~/hooks/useCachedListings";
import StoreHeader from "~/components/userStorePageComponents/StoreHeader";
import StoreInfo from "~/components/userStorePageComponents/StoreInfo";
import StoreMap from "~/components/userStorePageComponents/StoreMap";
import StoreListingsGrid from "~/components/userStorePageComponents/StoreListingsGrid";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "~/firebase/auth";
import {
  StorefrontContext,
  type StorefrontSettings,
} from "~/context/StorefrontContext";
import { getUserProfile, type UserProfileDoc } from "~/services/usersService";
import {
  cacheKeyStoreUidByHandle,
  getAnyCachedValue,
} from "~/services/storeCache";
import ListingsTable from "~/components/homePageComponents/ListingsTable";
import ListingsFilters from "~/components/homePageComponents/ListingFilter";
import {
  defaultFilters,
  useListingsTable,
} from "~/components/homePageComponents/ListingsTable/useListingTable";
import type { ListingsFiltersState, CarListingSummary } from "~/types/types";
import { useTranslation } from "react-i18next";
import {
  updateListingPrice,
  deleteListingFromDb,
} from "~/services/listingsService";
import { showNotification } from "~/redux/slices/uiSlice";
import AppContainer from "~/components/shared/AppContainer";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";

function IndividualProfileListings({
  title,
  listings,
  isLoading,
  refreshing,
  canManage,
  onRefresh,
}: {
  title: string;
  listings: CarListingSummary[];
  isLoading: boolean;
  refreshing: boolean;
  canManage: boolean;
  onRefresh?: () => void;
}) {
  const { t } = useTranslation();
  const [filters, setFilters] = useState<ListingsFiltersState>(defaultFilters);
  const dispatch = useAppDispatch();
  const [localListings, setLocalListings] =
    useState<CarListingSummary[]>(listings);

  useEffect(() => {
    setLocalListings(listings);
  }, [listings]);

  const table = useListingsTable(localListings, filters);

  const handleChangePrice = async (listingId: string, newPrice: number) => {
    try {
      await updateListingPrice(listingId, newPrice);
      setLocalListings((prev) =>
        prev.map((l) =>
          l.id === listingId
            ? { ...l, price: newPrice, isOnSale: false, salePrice: undefined }
            : l,
        ),
      );
      dispatch(
        showNotification({
          message: t("pricing.priceUpdated"),
          severity: "success",
        }),
      );
      onRefresh?.();
    } catch (e: any) {
      dispatch(
        showNotification({
          message: e?.message || t("pricing.priceUpdateFailed"),
          severity: "error",
        }),
      );
    }
  };

  const handleDelete = async (listingId: string) => {
    try {
      await deleteListingFromDb(listingId);
      setLocalListings((prev) => prev.filter((l) => l.id !== listingId));
      dispatch(
        showNotification({
          message: t("pricing.listingDeleted"),
          severity: "info",
        }),
      );
      onRefresh?.();
    } catch (e: any) {
      dispatch(
        showNotification({
          message: e?.message || t("pricing.listingDeleteFailed"),
          severity: "error",
        }),
      );
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {refreshing ? <LinearProgress sx={{ mb: 2 }} /> : null}
      {isLoading ? <LinearProgress sx={{ mb: 2 }} /> : null}

      <Typography variant="h5" fontWeight={900} sx={{ mb: 3 }}>
        {title}
      </Typography>

      <Accordion
        defaultExpanded={false}
        variant="outlined"
        sx={{
          mb: 3,
          borderRadius: 2,
          "&:before": { display: "none" },
          overflow: "hidden",
          borderColor: "divider",
          boxShadow: "none",
        }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography fontWeight={600}>
            {t("store.search_and_filter")}
          </Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ p: 3, pt: 1 }}>
          <ListingsFilters
            filters={filters}
            noBorder
            onChange={(f) => {
              setFilters(f);
              table.setPage(1);
            }}
            onReset={() => {
              setFilters(defaultFilters);
              table.setPage(1);
            }}
          />
        </AccordionDetails>
      </Accordion>

      <ListingsTable
        rows={table.rows}
        sortKey={table.sortKey}
        sortDir={table.sortDir}
        onSort={table.toggleSort}
        showOwnerActions={canManage}
        onChangePrice={canManage ? handleChangePrice : undefined}
        onDelete={canManage ? handleDelete : undefined}
        onRefresh={onRefresh}
      />

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mt: 2,
        }}
      >
        <Typography variant="body2" color="text.secondary">
          {t("businesses.resultsCount", { count: table.total })}
        </Typography>
        <Pagination
          page={table.page}
          count={table.pageCount}
          onChange={(_, p) => table.setPage(p)}
        />
      </Box>
    </Container>
  );
}

export default function StorePage({ handle }: { handle: string }) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [ownerId, setOwnerId] = useState<string | null>(null);
  const [loadingStore, setLoadingStore] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [viewerUid, setViewerUid] = useState<string | null>(null);
  const [viewerVerified, setViewerVerified] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [storefront, setStorefront] = useState<StorefrontSettings | null>(null);
  const [profile, setProfile] = useState<UserProfileDoc | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setViewerUid(u?.uid || null);
      setViewerVerified(true);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoadingStore(true);
    setNotFound(false);
    setLookupError(null);
    setProfile(null);
    setStorefront(null);

    // Fast path: hydrate from cache synchronously to avoid "loading" UI.
    const cachedUid = getAnyCachedValue<string>(
      cacheKeyStoreUidByHandle(handle),
    );
    if (cachedUid) {
      setOwnerId(cachedUid);
      // Profile/settings caches are handled inside services, but we can stop the initial loader if we already have profile.
      getUserProfile(cachedUid)
        .then((p) => {
          if (!cancelled) setProfile(p);
        })
        .catch(() => undefined);
      loadStoreSettingsFromDb(cachedUid)
        .then((s) => {
          if (!cancelled) setStorefront(s);
        })
        .catch(() => undefined);
    }

    resolveStoreUidByHandle(handle)
      .then(async (uid) => {
        if (cancelled) return;
        if (!uid) {
          setNotFound(true);
          setLoadingStore(false);
          return;
        }
        setOwnerId(uid);

        const [settings, userProfile] = await Promise.all([
          loadStoreSettingsFromDb(uid),
          getUserProfile(uid),
        ]);
        if (cancelled) return;
        if (!userProfile) {
          // Some deployments/users may have storeSettings saved even if the public profile doc is missing.
          // In that case, treat this as a published business storefront with a minimal profile.
          if (settings) {
            setProfile({ uid, role: "business", status: "active" });
          } else {
            setNotFound(true);
            setLoadingStore(false);
            return;
          }
        } else {
          setProfile(userProfile);
        }

        // Handle disabled accounts
        const isOwner = Boolean(uid && viewerUid === uid);
        if (userProfile?.status === "disabled" && !isOwner) {
          setNotFound(true);
          setLoadingStore(false);
          return;
        }

        // Businesses get a full storefront; individuals get a simple profile page.
        if (settings) setStorefront(settings);
        setLoadingStore(false);
      })
      .catch((e) => {
        console.error(e);
        if (!cancelled) {
          setLookupError(e?.code || e?.message || "lookup_failed");
          setNotFound(true);
          setLoadingStore(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [dispatch, handle]);

  // Owner fallback: if public handle lookup is blocked by rules but the viewer is logged in,
  // try matching the handle against the viewer's own `users/{uid}.storeHandle`.
  useEffect(() => {
    let cancelled = false;
    if (!notFound || !viewerUid) return;

    getStoreHandleForUid(viewerUid)
      .then(async (h) => {
        if (cancelled) return;
        if (!h) return;
        if (h === handle) {
          setNotFound(false);
          setLoadingStore(true);
          setOwnerId(viewerUid);
          const [settings, userProfile] = await Promise.all([
            loadStoreSettingsFromDb(viewerUid),
            getUserProfile(viewerUid),
          ]);
          if (cancelled) return;
          setProfile(userProfile);
          if (settings) setStorefront(settings);
          setLoadingStore(false);
        }
      })
      .catch(console.error);

    return () => {
      cancelled = true;
    };
  }, [dispatch, handle, notFound, viewerUid]);

  const owner = useOwnerListingsCached(ownerId);
  const isIndividual = profile?.role === "individual";
  const displayName = isIndividual
    ? "Private Seller"
    : storefront?.name || "Store";

  const theme = storefront?.theme;

  const muiTheme = useMemo(() => {
    if (!theme) return null;
    return createTheme({
      palette: {
        primary: {
          main: theme.accent || "#1976d2", // Accent is the main ACTION color
        },
        background: {
          paper: theme.primary || "#ffffff", // Primary is the component background
        },
      },
    });
  }, [theme]);

  const isLoading =
    loadingStore || !profile || (owner.loading && owner.listings.length === 0);
  const isOwner = Boolean(viewerUid && ownerId && viewerUid === ownerId);

  const visibleListings = useMemo(() => {
    if (isOwner) return owner.listings;
    return owner.listings.filter((l) => (l as any).status !== "draft");
  }, [owner.listings, isOwner]);

  const listingStats = useMemo(() => {
    const listingsCount = visibleListings.length;
    const viewsCount = visibleListings.reduce(
      (sum, l) => sum + (Number(l.viewCount) || 0),
      0,
    );
    return { listingsCount, viewsCount };
  }, [visibleListings]);

  // Business storefront filtering
  const [filters, setFilters] = useState<ListingsFiltersState>(defaultFilters);
  const table = useListingsTable(visibleListings, filters);

  if (notFound) {
    return (
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Typography variant="h5" fontWeight={900} sx={{ mb: 1 }}>
          {t("about.store.notFound")}
        </Typography>
        <Typography color="text.secondary">
          {t("about.store.notFoundDesc")}
        </Typography>
        {lookupError ? (
          <Typography
            color="text.secondary"
            variant="caption"
            sx={{ display: "block", mt: 1 }}
          >
            {t("about.store.details", { error: lookupError })}
          </Typography>
        ) : null}
      </Container>
    );
  }

  // Individual seller profile: heading + listings table (like main listings page)
  if (isIndividual) {
    return (
      <>
        <IndividualProfileListings
          title={displayName}
          listings={visibleListings}
          isLoading={isLoading}
          refreshing={owner.refreshing}
          canManage={isOwner && viewerVerified}
          onRefresh={owner.refresh}
        />
        {ownerId ? <Container maxWidth="xl" sx={{ pb: 6 }} /> : null}
      </>
    );
  }

  // Business storefront: show loader while resolving/fetching to avoid "not published" flicker.
  if (loadingStore || !profile) {
    return (
      <Container maxWidth="md" sx={{ py: 6 }}>
        <LinearProgress sx={{ mb: 2 }} />
        <Typography variant="h6" fontWeight={800} sx={{ mb: 1 }}>
          {t("about.store.loadingStore")}
        </Typography>
        <Typography color="text.secondary">
          {t("about.store.fetchingProfile")}
        </Typography>
      </Container>
    );
  }

  // Business storefront: don't render until storeSettings are loaded (prevents Redux fallback flash)
  if (!storefront) {
    return (
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Typography variant="h5" fontWeight={900} sx={{ mb: 1 }}>
          {t("about.store.notPublished")}
        </Typography>
        <Typography color="text.secondary">
          {t("about.store.notPublishedDesc")}
        </Typography>
      </Container>
    );
  }

  const content = (
    <Box
      sx={{
        bgcolor: theme?.background || "transparent",
        minHeight: "calc(100vh - 64px)",
      }}
    >
      <AppContainer sx={{ py: 4 }}>
        {owner.refreshing ? <LinearProgress sx={{ mb: 2 }} /> : null}
        {isLoading ? <LinearProgress sx={{ mb: 2 }} /> : null}

        <StoreHeader />

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "5fr 7fr" },
            gap: 3,
            mt: 1,
          }}
        >
          <StoreInfo
            listingsCount={listingStats.listingsCount}
            viewsCount={listingStats.viewsCount}
          />
          <StoreMap />
        </Box>

        {/* Inventory Section — Search & Filter */}
        <Box sx={{ mt: 5 }}>
          <Box sx={{ mt: 1 }}>
            <Accordion
              defaultExpanded={false}
              sx={{
                bgcolor: theme?.primary || "transparent",
                color: theme?.isTextLight ? "white" : "inherit",
                border: "1px solid",
                borderColor: "divider",
                boxShadow: "none",
                borderRadius: 2,
                "&:before": { display: "none" },
                overflow: "hidden",
              }}
            >
              <AccordionSummary
                expandIcon={
                  <ExpandMoreIcon
                    sx={{ color: theme?.isTextLight ? "white" : "inherit" }}
                  />
                }
              >
                <Typography fontWeight={600} sx={{ color: "inherit" }}>
                  {t("store.search_and_filter")}
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ p: 3, pt: 1 }}>
                <ListingsFilters
                  filters={filters}
                  noBorder
                  onChange={(f) => {
                    setFilters(f);
                    table.setPage(1);
                  }}
                  onReset={() => {
                    setFilters(defaultFilters);
                    table.setPage(1);
                  }}
                />
              </AccordionDetails>
            </Accordion>

            <Box sx={{ mt: 4 }}>
              <Typography
                variant="h6"
                fontWeight={800}
                sx={{ mb: 2, color: theme?.heading || "inherit" }}
              >
                {t("store.inventory")}
              </Typography>

              <StoreListingsGrid
                listings={table.rows}
                isOwner={isOwner && viewerVerified}
                onRefresh={owner.refresh}
              />

              <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
                <Pagination
                  page={table.page}
                  count={table.pageCount}
                  onChange={(_, p) => table.setPage(p)}
                  sx={{
                    "& .MuiPaginationItem-root": {
                      color: theme?.isTextLight ? "white" : "inherit",
                    },
                    "& .Mui-selected": {
                      bgcolor:
                        (theme?.accent || "primary.main") + " !important",
                      color: "white !important",
                    },
                  }}
                />
              </Box>
            </Box>
          </Box>
        </Box>
      </AppContainer>
    </Box>
  );

  return (
    <StorefrontContext.Provider value={storefront}>
      {muiTheme ? (
        <ThemeProvider theme={muiTheme}>{content}</ThemeProvider>
      ) : (
        content
      )}
    </StorefrontContext.Provider>
  );
}
