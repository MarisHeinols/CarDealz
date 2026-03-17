import { useEffect, useMemo, useState } from "react";
import { Box, Container, LinearProgress, Pagination, Typography } from "@mui/material";
import { useAppDispatch } from "~/redux/hooks";
import { loadStoreSettingsFromDb } from "~/services/storeSettingsService";
import { getStoreHandleForUid, resolveStoreUidByHandle } from "~/services/storeHandleService";
import { useOwnerListingsCached } from "~/hooks/useCachedListings";
import StoreHeader from "~/components/userStorePageComponents/StoreHeader";
import StoreInfo from "~/components/userStorePageComponents/StoreInfo";
import StoreMap from "~/components/userStorePageComponents/StoreMap";
import StoreListingsGrid from "~/components/userStorePageComponents/StoreListingsGrid";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "~/firebase/auth";
import { StorefrontContext, type StorefrontSettings } from "~/context/StorefrontContext";
import { getUserProfile, type UserProfileDoc } from "~/services/usersService";
import { cacheKeyStoreUidByHandle, getAnyCachedValue } from "~/services/storeCache";
import ListingsTable from "~/components/homePageComponents/ListingsTable";
import ListingsFilters from "~/components/homePageComponents/ListingFilter";
import {
  defaultFilters,
  useListingsTable,
} from "~/components/homePageComponents/ListingsTable/useListingTable";
import type { ListingsFiltersState } from "~/types/types";
import { updateListingPrice, deleteListingFromDb } from "~/services/listingsService";
import { showNotification } from "~/redux/slices/uiSlice";
import type { CarListingSummary } from "~/types/types";
import StoreReviewsSection from "~/components/shared/StoreReviewsSection";
import AppContainer from "~/components/shared/AppContainer";

function IndividualProfileListings({
  title,
  listings,
  isLoading,
  refreshing,
  canManage,
}: {
  title: string;
  listings: CarListingSummary[];
  isLoading: boolean;
  refreshing: boolean;
  canManage: boolean;
}) {
  const [filters, setFilters] = useState<ListingsFiltersState>(defaultFilters);
  const dispatch = useAppDispatch();
  const [localListings, setLocalListings] = useState<CarListingSummary[]>(listings);

  useEffect(() => {
    setLocalListings(listings);
  }, [listings]);

  const table = useListingsTable(localListings, filters);

  const handleChangePrice = async (listingId: string, newPrice: number) => {
    try {
      await updateListingPrice(listingId, newPrice);
      setLocalListings((prev) =>
        prev.map((l) => (l.id === listingId ? { ...l, price: newPrice, isOnSale: false, salePrice: undefined } : l))
      );
      dispatch(showNotification({ message: "Price updated!", severity: "success" }));
    } catch (e: any) {
      dispatch(showNotification({ message: e?.message || "Failed to update price", severity: "error" }));
    }
  };

  const handleDelete = async (listingId: string) => {
    try {
      await deleteListingFromDb(listingId);
      setLocalListings((prev) => prev.filter((l) => l.id !== listingId));
      dispatch(showNotification({ message: "Listing deleted.", severity: "info" }));
    } catch (e: any) {
      dispatch(showNotification({ message: e?.message || "Failed to delete listing", severity: "error" }));
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {refreshing ? <LinearProgress sx={{ mb: 2 }} /> : null}
      {isLoading ? <LinearProgress sx={{ mb: 2 }} /> : null}

      <Typography variant="h5" fontWeight={800} sx={{ mb: 2 }}>
        {title}
      </Typography>

      {canManage ? (
        <ListingsFilters
          filters={filters}
          onChange={(f) => {
            setFilters(f);
            table.setPage(1);
          }}
          onReset={() => {
            setFilters(defaultFilters);
            table.setPage(1);
          }}
        />
      ) : null}

      <ListingsTable
        rows={table.rows}
        sortKey={table.sortKey}
        sortDir={table.sortDir}
        onSort={table.toggleSort}
        showOwnerActions={canManage}
        onChangePrice={canManage ? handleChangePrice : undefined}
        onDelete={canManage ? handleDelete : undefined}
      />

      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 2 }}>
        <Typography variant="body2" color="text.secondary">
          {table.total} results
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
  const dispatch = useAppDispatch();
  const [ownerId, setOwnerId] = useState<string | null>(null);
  const [loadingStore, setLoadingStore] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [viewerUid, setViewerUid] = useState<string | null>(null);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [storefront, setStorefront] = useState<StorefrontSettings | null>(null);
  const [profile, setProfile] = useState<UserProfileDoc | null>(null);
  const [reviewStats, setReviewStats] = useState<{ avg: number; count: number } | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => setViewerUid(u?.uid || null));
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoadingStore(true);
    setNotFound(false);
    setLookupError(null);
    setProfile(null);
    setStorefront(null);
    setReviewStats(null);

    // Fast path: hydrate from cache synchronously to avoid "loading" UI.
    const cachedUid = getAnyCachedValue<string>(cacheKeyStoreUidByHandle(handle));
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
        setProfile(userProfile);
        if (!userProfile) {
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
    ? `${profile?.name || ""} ${profile?.surname || ""}`.trim() || "Private Seller"
    : profile?.storeName || profile?.businessName || storefront?.name || "Store";

  const theme = storefront?.theme;

  const isLoading = loadingStore || !profile || (owner.loading && owner.listings.length === 0);
  const isOwner = Boolean(viewerUid && ownerId && viewerUid === ownerId);

  const listingStats = useMemo(() => {
    const listingsCount = owner.listings.length;
    const viewsCount = owner.listings.reduce((sum, l) => sum + (Number(l.viewCount) || 0), 0);
    return { listingsCount, viewsCount };
  }, [owner.listings]);

  if (notFound) {
    return (
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Typography variant="h5" fontWeight={700} sx={{ mb: 1 }}>
          Store not found
        </Typography>
        <Typography color="text.secondary">
          This store link may be incorrect, the store hasn’t been published yet, or the app doesn’t have permission to look it up.
        </Typography>
        {lookupError ? (
          <Typography color="text.secondary" variant="caption" sx={{ display: "block", mt: 1 }}>
            Details: {lookupError}
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
          listings={owner.listings}
          isLoading={isLoading}
          refreshing={owner.refreshing}
          canManage={isOwner}
        />
        {ownerId ? (
          <Container maxWidth="xl" sx={{ pb: 6 }}>
            <StoreReviewsSection
              storeUid={ownerId}
              ownerUid={ownerId}
              viewerUid={viewerUid}
              onStatsChange={setReviewStats}
              useStoreTheme={false}
            />
          </Container>
        ) : null}
      </>
    );
  }

  // Business storefront: show loader while resolving/fetching to avoid "not published" flicker.
  if (loadingStore || !profile) {
    return (
      <Container maxWidth="md" sx={{ py: 6 }}>
        <LinearProgress sx={{ mb: 2 }} />
        <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
          Loading store…
        </Typography>
        <Typography color="text.secondary">
          Fetching store profile and settings.
        </Typography>
      </Container>
    );
  }

  // Business storefront: don't render until storeSettings are loaded (prevents Redux fallback flash)
  if (!storefront) {
    return (
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Typography variant="h5" fontWeight={700} sx={{ mb: 1 }}>
          Store not published yet
        </Typography>
        <Typography color="text.secondary">
          This business store doesn’t have storefront settings saved yet.
        </Typography>
      </Container>
    );
  }

  return (
    <StorefrontContext.Provider value={storefront}>
      <Box sx={{ bgcolor: theme?.background || "transparent", minHeight: "calc(100vh - 64px)" }}>
        <AppContainer sx={{ py: 4 }}>
          {owner.refreshing ? <LinearProgress sx={{ mb: 2 }} /> : null}
          {isLoading ? <LinearProgress sx={{ mb: 2 }} /> : null}

          <StoreHeader />

          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "5fr 7fr" }, gap: 3, mt: 1 }}>
            <StoreInfo
              reviewStats={reviewStats}
              listingsCount={listingStats.listingsCount}
              viewsCount={listingStats.viewsCount}
            />
            <StoreMap />
          </Box>

          <Box sx={{ mt: 3 }}>
            <StoreListingsGrid listings={owner.listings} isOwner={isOwner} />
          </Box>

          {ownerId ? (
            <StoreReviewsSection
              storeUid={ownerId}
              ownerUid={ownerId}
              viewerUid={viewerUid}
              onStatsChange={setReviewStats}
              useStoreTheme
            />
          ) : null}
        </AppContainer>
      </Box>
    </StorefrontContext.Provider>
  );
}

