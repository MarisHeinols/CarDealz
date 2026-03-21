import {
  Box,
  Typography,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Pagination,
  Chip,
  Stack,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import StoreHeader from "~/components/userStorePageComponents/StoreHeader";
import StoreInfo from "~/components/userStorePageComponents/StoreInfo";
import StoreMap from "~/components/userStorePageComponents/StoreMap";
import StoreListingsGrid from "~/components/userStorePageComponents/StoreListingsGrid";
import { useAppSelector } from "~/redux/hooks";
import { auth } from "~/firebase/auth";
import { onAuthStateChanged } from "firebase/auth";
import { PreviewChrome } from "./PreviewChrome";
import { PreviewReviews } from "./PreviewReviews";
import { useEffect, useState } from "react";
import { useAllListingsCached, useOwnerListingsCached } from "~/hooks/useCachedListings";
import { useTranslation } from "react-i18next";

const PREVIEW_LISTINGS_COUNT = 4;

const StorePreview = () => {
  const { t } = useTranslation();
  const theme = useAppSelector((state) => state.storeSettings.theme);
  
  const [ownerId, setOwnerId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setOwnerId(user.uid);
      } else {
        setOwnerId(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const all = useAllListingsCached();
  const owner = useOwnerListingsCached(ownerId);
  const listings = ownerId ? owner.listings : all.listings;
  const previewListings = listings.slice(0, PREVIEW_LISTINGS_COUNT);

  return (
    <Box sx={{ pb: 3 }}>
      <PreviewChrome />

      {/* ── The actual store preview ── */}
      <Box
        sx={{
          border: "1px solid",
          borderColor: "divider",
          borderRadius: "0 0 12px 12px",
          overflow: "hidden",
          // Scale down slightly so more of the page is visible at once
          "& *": { pointerEvents: "none" },
        }}
      >
        <Box
          sx={{
            bgcolor: theme.background || "#f9fafb",
            px: { xs: 2, md: 4 },
            py: 3,
          }}
        >
          {/* Store header (banner + logo + name) */}
          <StoreHeader />

          {/* Info + Map */}
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12, md: 5 }}>
              <StoreInfo />
            </Grid>
            <Grid size={{ xs: 12, md: 7 }}>
              <StoreMap />
            </Grid>
          </Grid>

          {/* Search & Filters stub */}
          <Box sx={{ mt: 4 }}>
            <Accordion
              sx={{
                bgcolor: theme.secondary || "",
                color: theme.isTextLight ? "white" : "black",
              }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography fontWeight={600}>{t("store.search_and_filter")}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box
                  sx={{
                    display: "flex",
                    gap: 1,
                    flexWrap: "wrap",
                    opacity: 0.6,
                  }}
                >
                  {[
                    t("store.filters.make"),
                    t("store.filters.year"),
                    t("store.filters.condition"),
                    t("store.filters.price"),
                    t("store.filters.color"),
                  ].map(
                    (f) => (
                      <Chip
                        key={f}
                        label={f}
                        size="small"
                        variant="outlined"
                        sx={{
                          color: theme.isTextLight ? "white" : "inherit",
                          borderColor: theme.isTextLight
                            ? "rgba(255,255,255,0.4)"
                            : "divider",
                        }}
                      />
                    )
                  )}
                </Box>
              </AccordionDetails>
            </Accordion>
          </Box>

          {/* Listings grid — 4 mock cars */}
          <Box sx={{ mt: 3, mb: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography
              variant="h6"
              fontWeight={700}
              sx={{
                color: theme.isTextLight ? "white" : "text.primary",
              }}
            >
              {t("store.inventory")}
            </Typography>
            <Box>
              <Chip label={t("store.sort_date")} size="small" variant="outlined" sx={{ color: theme.isTextLight ? "white" : "text.primary", borderColor: "divider" }} />
            </Box>
          </Box>
          <Box>
            <StoreListingsGrid listings={previewListings} isOwner={true} />
          </Box>

          {/* Pagination stub */}
          <Box sx={{ display: "flex", justifyContent: "center", mt: 3, mb: 1 }}>
            <Pagination count={3} page={1} size="small" />
          </Box>

          <PreviewReviews theme={theme} reviews={[]} />
        </Box>
      </Box>
    </Box>
  );
};

export default StorePreview;
