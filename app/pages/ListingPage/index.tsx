import React from "react";
import {
  Box,
  Button,
  Chip,
  Divider,
  Grid,
  LinearProgress,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import ImageCarousel from "~/components/listingPageComponents/ImageCarousel";
import SpecSheet from "~/components/listingPageComponents/SpecSheet";
import MarketValueBar from "~/components/listingPageComponents/MarketValueBar";
import VisibilityIcon from "@mui/icons-material/Visibility";
import SellerCard from "~/components/listingPageComponents/SellerCard";
import DetailsCard from "~/components/listingPageComponents/DetailsCard";
import SpecLevelChip from "~/components/listingPageComponents/SpecLevelChip";
import {
  recordUniqueListingView,
  updateListingFields,
} from "~/services/listingsService";
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
import { useAuth } from "~/hooks/userStore/useAuth";
import ListingOwnerActions from "~/components/shared/ListingOwnerActions";
import { useNavigate } from "react-router";
import ListingNotFound from "~/components/listingPageComponents/ListingNotFound";

type Props = {
  id: string;
};

const ListingPage = ({ id }: Props) => {
  const {
    listing: car,
    loading,
    refreshing,
    mutate,
  } = useCachedListingDetails<any>(id);
  const [marketRefreshDoneForId, setMarketRefreshDoneForId] = useState<
    string | null
  >(null);
  const [marketValueLoading, setMarketValueLoading] = useState(false);
  const [marketValueError, setMarketValueError] = useState<string | null>(null);
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();

  const hasMarketRange =
    car &&
    car.marketRange &&
    typeof car.marketRange.min === "number" &&
    typeof car.marketRange.max === "number" &&
    !(car.marketRange.min === 0 && car.marketRange.max === 0);

  if (!loading && !car) {
    return <ListingNotFound />;
  }

  const isOwner = Boolean(
    user?.uid && car?.sellerId && user.uid === car.sellerId,
  );

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
      setMarketValueLoading(false);
      setMarketValueError(null);
      return;
    }

    let cancelled = false;
    setMarketValueLoading(!hasMarketRange);
    setMarketValueError(null);
    estimateMarketValue(car)
      .then(async (mv) => {
        const updates = {
          marketRange: { min: mv.min, max: mv.max },
          marketRangeUpdatedAt: new Date().toISOString(),
        };
        if (cancelled) return;

        // Always update UI locally so guests can see the deal/market range.
        mutate((prev) => (prev ? { ...prev, ...updates } : prev));

        // Persist only when we have an authenticated user (Firestore rules typically block anonymous writes).
        if (auth.currentUser?.uid) {
          await updateListingFields(id, updates);
        }
      })
      .catch((err) => {
        console.error(err);
        if (cancelled) return;
        const msg = err instanceof Error ? err.message : String(err);
        setMarketValueError(msg || "Market value estimate failed");
      })
      .finally(() => {
        if (!cancelled) {
          setMarketRefreshDoneForId(id);
          setMarketValueLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [car, id, marketRefreshDoneForId, hasMarketRange]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={10}>
        <CircularProgress />
      </Box>
    );
  }

  if (!car) {
    return null;
  }

  const specScore = calculateSpecScore(car.features);
  const specLevel = getSpecLevel(specScore);

  return (
    <AppContainer sx={{ py: 4, position: "relative" }}>
      {refreshing ? (
        <Box sx={{ position: "absolute", top: 0, left: 0, right: 0 }}>
          <CircularProgress
            size={18}
            sx={{ position: "absolute", top: 8, right: 8 }}
          />
        </Box>
      ) : null}
      <Grid container spacing={3}>
        {/* Main column - Gallery + content */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Stack spacing={3}>
            <Box
              sx={{
                height: { xs: 300, md: 520 },
                borderRadius: 2,
                overflow: "hidden",
              }}
            >
              <ImageCarousel
                images={
                  Array.isArray(car.images)
                    ? car.images.map(
                      (img: { url: any; thumbnailUrl?: any }) => img.url,
                    )
                    : []
                }
              />
            </Box>

            <Box>
              <Typography variant="h6" mb={1.5} fontWeight={800}>
                {t("listing.description")}
              </Typography>
              <Paper sx={{ p: 3, width: "100%" }}>
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{ whiteSpace: "pre-wrap", lineHeight: 1.6 }}
                >
                  {car.description}
                </Typography>
              </Paper>
            </Box>

            <Box>
              <Stack direction="row" spacing={1} alignItems="center" mb={1.5}>
                <Typography variant="h6" fontWeight={800}>
                  {t("listing.specsAndFeatures")}
                </Typography>
                <SpecLevelChip level={specLevel} />
              </Stack>
              <SpecSheet
                features={car.features}
                isOwner={isOwner}
                listingId={id}
                mutate={mutate}
              />
            </Box>
          </Stack>
        </Grid>

        {/* Sidebar - Info + actions */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Paper
            sx={{
              p: 3,
              display: "flex",
              flexDirection: "column",
              gap: 2,
              position: { md: "sticky" },
              top: { md: 88 },
              alignSelf: { md: "flex-start" },
            }}
          >
            <Stack
              direction={"row"}
              alignItems={"flex-start"}
              justifyContent={"space-between"}
              flexWrap="wrap"
              gap={1}
            >
              <Typography
                variant="h4"
                component="h1"
                fontWeight={900}
                sx={{ lineHeight: 1.2, flex: 1 }}
              >
                {car.year} {car.make} {car.model}
              </Typography>

              <Stack direction="row" spacing={1} alignItems="center">
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ display: "flex", alignItems: "center" }}
                >
                  <VisibilityIcon sx={{ mr: 0.5, fontSize: 18 }} />
                  {t("carValues.views", { count: car.viewCount })}
                </Typography>

                {isOwner ? (
                  <ListingOwnerActions
                    enabled
                    listingId={id}
                    sellerId={car.sellerId}
                    status={car.status}
                    price={car.price}
                    isOnSale={car.isOnSale}
                    salePrice={car.salePrice}
                    isSold={car.isSold}
                    onPriceChanged={(p) =>
                      mutate((prev) =>
                        prev
                          ? {
                            ...prev,
                            price: p,
                            isOnSale: false,
                            salePrice: null,
                          }
                          : prev,
                      )
                    }
                    onSold={(sp) =>
                      mutate((prev) =>
                        prev
                          ? {
                            ...prev,
                            isSold: true,
                            soldPrice: sp,
                            isOnSale: false,
                            salePrice: null,
                          }
                          : prev,
                      )
                    }
                    onSaleApplied={(p) =>
                      mutate((prev) =>
                        prev ? { ...prev, isOnSale: true, salePrice: p } : prev,
                      )
                    }
                    onSaleStopped={() =>
                      mutate((prev) =>
                        prev
                          ? { ...prev, isOnSale: false, salePrice: null }
                          : prev,
                      )
                    }
                    onStatusChanged={(s) =>
                      mutate((prev) => (prev ? { ...prev, status: s } : prev))
                    }
                    onDeleted={() => navigate("/admin")}
                  />
                ) : null}
              </Stack>
            </Stack>

            <Typography variant="h4" color="primary" fontWeight={900}>
              €
              {typeof car.price === "number"
                ? car.price.toLocaleString("en-US")
                : "N/A"}
            </Typography>

            <Stack
              direction="row"
              spacing={1}
              flexWrap="wrap"
              useFlexGap
              sx={{ rowGap: 1, alignItems: "center" }}
            >
              <Chip
                label={
                  car.conditionTier
                    ? t(`carValues.condition_${car.conditionTier}`, {
                      defaultValue: car.conditionTier,
                    })
                    : t("details.na")
                }
                size="small"
                variant={
                  car.conditionTier === "new"
                    ? "levelHigh"
                    : car.conditionTier === "slightly_used" ||
                      car.conditionTier === "first_payment"
                      ? "levelMedium"
                      : "levelLow"
                }
                sx={{ textTransform: "capitalize", px: 0.5 }}
              />

              <Chip
                label={car.location}
                size="small"
                variant="levelNeutral"
                sx={{ px: 0.5 }}
              />

              <Chip
                label={
                  car.seller?.isDealer
                    ? t("listing.dealer")
                    : t("listing.privateSeller")
                }
                size="small"
                variant={car.seller?.isDealer ? "levelHigh" : "levelLow"}
                sx={{ px: 0.5 }}
              />
            </Stack>

            <Divider />

            {marketValueLoading && !hasMarketRange ? (
              <Box sx={{ mt: 3 }}>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  sx={{ mb: 1 }}
                >
                  <Typography variant="subtitle2">
                    {t("carValues.marketValueEstimate", {
                      defaultValue: "Market Value",
                    })}
                  </Typography>
                  <Typography variant="subtitle2" color="text.secondary">
                    {t("carValues.estimating", {
                      defaultValue: "AI Analyzing…",
                    })}
                  </Typography>
                </Stack>
                <LinearProgress sx={{ height: 8, borderRadius: 4 }} />
              </Box>
            ) : marketValueError ? (
              <Box sx={{ mt: 3 }}>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  sx={{ mb: 1 }}
                >
                  <Typography variant="subtitle2">
                    {t("carValues.marketValueEstimate", {
                      defaultValue: "Market Value",
                    })}
                  </Typography>
                  <Button
                    size="small"
                    onClick={() => {
                      setMarketRefreshDoneForId(null);
                    }}
                  >
                    {t("common.retry", { defaultValue: "Retry" })}
                  </Button>
                </Stack>
                <Typography variant="body2" color="text.secondary">
                  {t("carValues.marketValueFailed", {
                    defaultValue: "Could not load market value right now.",
                  })}
                </Typography>
              </Box>
            ) : (
              <MarketValueBar price={car.price} marketRange={car.marketRange} />
            )}

            <DetailsCard listing={car} isOwner={isOwner} mutate={mutate} />

            <Box>
              <Typography
                variant="overline"
                color="text.secondary"
                sx={{ display: "block", mt: 1.5, mb: 1 }}
              >
                {t("listing.contactSeller")}
              </Typography>
              <SellerCard
                seller={car.seller}
                sellerId={car.sellerId}
                listingId={id}
                compact
              />
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </AppContainer>
  );
};

export default ListingPage;
