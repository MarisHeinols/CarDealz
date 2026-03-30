import { Avatar, Box, Grid, Paper, Stack, Typography } from "@mui/material";
import ListingCard from "~/components/shared/ListingCard";
import ListingOwnerActions from "~/components/shared/ListingOwnerActions";
import type { CarListingSummary } from "~/types/types";
import { useStorefrontSettings } from "~/hooks/useStorefrontSettings";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";

interface Props {
  listings: CarListingSummary[];
  isOwner?: boolean;
  onRefresh?: () => void;
}

const StoreListingsGrid = ({ listings, isOwner, onRefresh }: Props) => {
  const theme = useStorefrontSettings().theme;
  const navigate = useNavigate();
  const { t } = useTranslation();

  const getGridSize = () => {
    switch (theme.layout) {
      case "minimal":
        return { xs: 12, md: 12 };
      case "modern":
        return { xs: 12, sm: 6, md: 6, lg: 4 };
      case "classic":
      default:
        return { xs: 12, sm: 6, lg: 3 };
    }
  };

  if (theme.layout === "minimal") {
    return (
      <>
        <Stack spacing={2}>
          {listings.map((listing) => (
            <Paper
              key={listing.id}
              variant="outlined"
              onClick={() => navigate(`/listing/${listing.id}`)}
              sx={{
                cursor: "pointer",
                bgcolor: theme.primary || "background.paper",
                color: theme.isTextLight ? "white" : "text.primary",
                borderColor: "divider",
                overflow: "hidden",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  p: 1.5,
                }}
              >
                <Avatar
                  variant="rounded"
                  src={listing.thumbnailUrl}
                  sx={{ width: 88, height: 64, flexShrink: 0 }}
                />

                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    variant="subtitle2"
                    fontWeight={700}
                    noWrap
                    sx={{
                      color:
                        theme.heading ||
                        (theme.isTextLight ? "white" : "text.primary"),
                    }}
                  >
                    {listing.year} {listing.make} {listing.model}
                  </Typography>
                  <Typography
                    variant="body2"
                    noWrap
                    sx={{
                      opacity: 0.85,
                      color: theme.isTextLight
                        ? "rgba(255,255,255,0.85)"
                        : "text.secondary",
                    }}
                  >
                    {listing.mileage.toLocaleString(undefined)} km •{" "}
                    {listing.location}
                  </Typography>
                </Box>

                <Box sx={{ textAlign: "right" }}>
                  <Typography
                    variant="subtitle1"
                    fontWeight={800}
                    sx={{
                      color:
                        theme.accent ||
                        (theme.isTextLight ? "white" : "primary.main"),
                      whiteSpace: "nowrap",
                    }}
                  >
                    €
                    {(listing.isOnSale && listing.salePrice
                      ? listing.salePrice
                      : listing.price
                    ).toLocaleString(undefined)}
                  </Typography>
                  {isOwner && listing.status === "draft" ? (
                    <Typography
                      variant="caption"
                      sx={{
                        display: "block",
                        opacity: 0.85,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {t("form.status_draft", { defaultValue: "Draft" })}
                    </Typography>
                  ) : null}
                </Box>

                {isOwner ? (
                  <ListingOwnerActions
                    enabled
                    listingId={listing.id}
                    sellerId={listing.sellerId}
                    status={listing.status}
                    price={listing.price}
                    isOnSale={listing.isOnSale}
                    salePrice={listing.salePrice}
                    isSold={listing.isSold}
                    iconButtonSx={{
                      ml: 0.5,
                      color: theme.isTextLight ? "white" : "text.secondary",
                    }}
                    onAfterAction={onRefresh}
                  />
                ) : null}
              </Box>
            </Paper>
          ))}
        </Stack>
      </>
    );
  }

  return (
    <Grid container spacing={3}>
      {listings.map((listing) => (
        <Grid key={listing.id} size={getGridSize()}>
          <ListingCard
            listing={listing}
            isOwner={isOwner}
            useStoreTheme
            storeThemeOverride={theme}
            onRefresh={onRefresh}
          />
        </Grid>
      ))}
    </Grid>
  );
};

export default StoreListingsGrid;
