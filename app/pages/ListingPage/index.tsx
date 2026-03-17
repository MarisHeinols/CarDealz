import React from "react";
import {
  Box,
  Chip,
  Divider,
  Grid,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import listingsJson from "../../data/mockData/carListingsDetails.json";
import ImageCarousel from "~/components/listingPageComponents/ImageCarousel";
import SpecSheet from "~/components/listingPageComponents/SpecSheet";
import MarketValueBar from "~/components/listingPageComponents/MarketValueBar";
import VisibilityIcon from "@mui/icons-material/Visibility";
import SellerCard from "~/components/listingPageComponents/SellerCard";
import DetailsCard from "~/components/listingPageComponents/DetailsCard";
import SpecLevelChip from "~/components/listingPageComponents/SpecLevelChip";
import { recordUniqueListingView, updateListingFields } from "~/services/listingsService";
import { useEffect, useState } from "react";
import { CircularProgress } from "@mui/material";
import {
  calculateSpecScore,
  getSpecLevel,
} from "~/components/listingPageComponents/SpecLevelChip/helper/helper";
import { estimateMarketValue } from "~/services/estimateMarketValue";
import { useCachedListingDetails } from "~/hooks/useCachedListingDetails";
import { auth } from "~/firebase/auth";
import AppContainer from "~/components/shared/AppContainer";
import { useTranslation } from "react-i18next";

type Props = {
  id: string;
};

const ListingPage = ({ id }: Props) => {
  const { listing: car, loading, refreshing } = useCachedListingDetails<any>(id);
  const [marketRefreshDoneForId, setMarketRefreshDoneForId] = useState<string | null>(null);
  const { t } = useTranslation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [id]);

  useEffect(() => {
    if (!car) return;
    recordUniqueListingView(id, auth.currentUser?.uid).catch(console.error);
  }, [car, id]);

  useEffect(() => {
    // Refresh market value if older than ~30 days (or missing).
    if (!car) return;
    if (marketRefreshDoneForId === id) return;

    const last =
      typeof car.marketRangeUpdatedAt === "string"
        ? Date.parse(car.marketRangeUpdatedAt)
        : NaN;
    const isStale =
      !Number.isFinite(last) || Date.now() - last > 30 * 24 * 60 * 60 * 1000;
    if (!isStale) {
      setMarketRefreshDoneForId(id);
      return;
    }

    let cancelled = false;
    estimateMarketValue(car)
      .then(async (mv) => {
        const updates = {
          marketRange: { min: mv.min, max: mv.max },
          marketRangeUpdatedAt: new Date().toISOString(),
        };
        if (cancelled) return;
        // Update Firestore; UI will refresh naturally next fetch, but we also optimistically update the local object.
        await updateListingFields(id, updates);
      })
      .catch(console.error)
      .finally(() => {
        if (!cancelled) setMarketRefreshDoneForId(id);
      });

    return () => {
      cancelled = true;
    };
  }, [car, id, marketRefreshDoneForId]);

  if (loading) {
    return <Box display="flex" justifyContent="center" p={10}><CircularProgress /></Box>;
  }

  if (!car) {
    return <Typography>Car not found</Typography>;
  }

  const specScore = calculateSpecScore(car.features);
  const specLevel = getSpecLevel(specScore);

  return (
    <AppContainer sx={{ py: 4, position: "relative" }}>
      {refreshing ? (
        <Box sx={{ position: "absolute", top: 0, left: 0, right: 0 }}>
          <CircularProgress size={18} sx={{ position: "absolute", top: 8, right: 8 }} />
        </Box>
      ) : null}
      <Grid container spacing={4}>
        {/* Left column - Image Gallery */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Box sx={{ height: { xs: 300, md: 500 }, borderRadius: 2, overflow: "hidden", mb: { xs: 2, md: 0 } }}>
            <ImageCarousel images={car.images.map((img: { url: any; }) => img.url)} />
          </Box>
        </Grid>

        {/* Right column - Car Info Header */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Paper sx={{ p: 3, display: "flex", flexDirection: "column", gap: 2.5, height: "100%" }}>
            <Stack
              direction={"row"}
              alignItems={"flex-start"}
              justifyContent={"space-between"}
              flexWrap="wrap"
              gap={1}
            >
              <Typography variant="h4" fontWeight={700} sx={{ lineHeight: 1.2 }}>
                {car.year} {car.make} {car.model}
              </Typography>

              <Typography variant="body2" color="text.secondary" sx={{ display: "flex", alignItems: "center" }}>
                <VisibilityIcon sx={{ mr: 0.5, fontSize: 18 }} />
                {car.viewCount} views
              </Typography>
            </Stack>

            <Typography variant="h4" color="primary" fontWeight={700}>
              ${car.price.toLocaleString("en-US")}
            </Typography>

            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ rowGap: 1 }}>
              <Chip
                label={car.condition}
                size="small"
                variant={
                  car.condition === "new"
                    ? "levelHigh"
                    : car.condition === "certified"
                      ? "levelMedium"
                      : "levelLow"
                }
                sx={{ textTransform: "capitalize" }}
              />

              <Chip
                label={car.location}
                size="small"
                variant="levelNeutral"
              />

              <Chip
                label={car.seller.isDealer ? t("listing.dealer") : t("listing.privateSeller")}
                size="small"
                variant={car.seller.isDealer ? "levelHigh" : "levelLow"}
              />
            </Stack>

            <Divider />

            <MarketValueBar price={car.price} marketRange={car.marketRange} />

            <Box sx={{ mt: 'auto', pt: 2 }}>
              <DetailsCard listing={car} />

              <Typography variant="overline" color="text.secondary" sx={{ display: 'block', mt: 3, mb: 1 }}>
                {t("listing.contactSeller")}
              </Typography>
              <SellerCard seller={car.seller} sellerId={car.sellerId} compact />
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Box mt={4}>
        <Typography variant="h5" mb={2} fontWeight={600}>
          {t("listing.description")}
        </Typography>
        <Paper sx={{ p: 3, width: "100%", minHeight: 150 }}>
          <Typography variant="body1" color="text.secondary" sx={{ whiteSpace: "pre-wrap", lineHeight: 1.6 }}>
            {car.description}
          </Typography>
        </Paper>
      </Box>

      <Box mt={3}>
        <Stack direction="row" spacing={1} alignItems="center" mb={2}>
          <Typography variant="h5">{t("listing.specsAndFeatures")}</Typography>

          <SpecLevelChip level={specLevel} />
        </Stack>
        <SpecSheet features={car.features} />
      </Box>

    </AppContainer>
  );
};

export default ListingPage;
