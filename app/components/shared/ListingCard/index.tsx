import {
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Typography,
  Stack,
  Chip,
  Box,
} from "@mui/material";
import { useNavigate } from "react-router";
import type { CarListingSummary } from "~/types/types";
import ListingOwnerActions from "~/components/shared/ListingOwnerActions";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "~/redux/hooks";
import { useTheme } from "@mui/material/styles";
import type { StoreTheme } from "~/redux/slices/storeSettingsSlice";

const conditionTierStyleMap = {
  new: { bgcolor: "#7a0081", color: "#fff" }, // Purple
  slightly_used: { bgcolor: "#0288d1", color: "#fff" }, // Blue
  first_payment: { bgcolor: "#0288d1", color: "#fff" }, // Blue
  used: { bgcolor: "#0288d1", color: "#fff" }, // Blue
} as const;

interface Props {
  listing: CarListingSummary;
  isOwner?: boolean;
  /**
   * When true, the card uses store profile/admin theme colors.
   * When false (default), it uses the normal website theme.
   */
  useStoreTheme?: boolean;
  storeThemeOverride?: StoreTheme;
  onRefresh?: () => void;
}

const ListingCard = ({
  listing,
  isOwner,
  useStoreTheme = false,
  storeThemeOverride,
  onRefresh,
}: Props) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const muiTheme = useTheme();
  const storeTheme = useAppSelector((state) => state.storeSettings.theme);
  const activeTheme = useStoreTheme ? storeThemeOverride || storeTheme : null;

  const color = activeTheme?.isTextLight ? "white" : "inherit";
  const isMinimal = activeTheme?.layout === "minimal";

  return (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        borderRadius: 2,
        overflow: "hidden",
        position: "relative",
        boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
        transition: "transform 0.2s, box-shadow 0.2s",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
        },
        bgcolor: useStoreTheme
          ? activeTheme?.primary || "background.paper"
          : "background.paper",
      }}
    >
      <CardActionArea
        onClick={() => navigate(`/listing/${listing.id}`)}
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "stretch",
        }}
      >
        <Box
          sx={{
            position: "relative",
            width: "100%",
            aspectRatio: isMinimal ? "16 / 9" : "4 / 3",
            overflow: "hidden",
          }}
        >
          <CardMedia
            component="img"
            image={listing.thumbnailUrl}
            alt={`${listing.make} ${listing.model}`}
            sx={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
          <Chip
            label={t(`carValues.condition_${listing.conditionTier}`)}
            size="small"
            sx={{
              position: "absolute",
              top: 12,
              left: 12,
              boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
              bgcolor: conditionTierStyleMap[listing.conditionTier].bgcolor,
              color: conditionTierStyleMap[listing.conditionTier].color,
              fontWeight: 600,
            }}
          />

          {isOwner && listing.status === "draft" && (
            <Chip
              label={t("form.status_draft")}
              size="small"
              color="warning"
              variant="filled"
              sx={{
                position: "absolute",
                bottom: 12,
                left: 12,
                fontWeight: 700,
                boxShadow: "0 1px 4px rgba(0,0,0,0.12)",
              }}
            />
          )}
        </Box>

        {/* Content */}
        <CardContent
          sx={{
            pb: 2,
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <Stack spacing={0.5}>
            <Typography
              variant="subtitle1"
              fontWeight={600}
              sx={{
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                color: activeTheme?.heading || color,
              }}
            >
              {listing.year} {listing.make} {listing.model}
              {listing.isSold && (
                <Chip
                  label={t("sellerCard.status_sold")}
                  size="small"
                  color="success"
                  sx={{
                    ml: 1,
                    height: 18,
                    fontSize: "0.65rem",
                    fontWeight: "bold",
                  }}
                />
              )}
            </Typography>

            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              flexWrap="wrap"
              sx={{ gap: 0.5 }}
            >
              <Typography
                variant="h6"
                fontWeight={600}
                sx={{
                  color: useStoreTheme
                    ? activeTheme?.accent || muiTheme.palette.primary.main
                    : muiTheme.palette.primary.main,
                }}
              >
                €
                {(listing.isOnSale && listing.salePrice
                  ? listing.salePrice
                  : listing.price
                ).toLocaleString(undefined)}
              </Typography>
              {listing.isOnSale && listing.salePrice && (
                <>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ textDecoration: "line-through", opacity: 0.7 }}
                  >
                    €{listing.price.toLocaleString(undefined)}
                  </Typography>
                  <Chip
                    size="small"
                    label={t("listing.saleBadge")}
                    color="error"
                    sx={{ height: 20, fontSize: "0.65rem", fontWeight: "bold" }}
                  />
                </>
              )}
            </Stack>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                color: color,
                opacity: 0.8,
              }}
            >
              {listing.mileage.toLocaleString(undefined)} {t("common.unit_km")}{" "}
              • {listing.location}
            </Typography>
          </Stack>
        </CardContent>
      </CardActionArea>

      {isOwner ? (
        <Box
          sx={{
            position: "absolute",
            top: 8,
            right: 8,
            zIndex: 10,
          }}
        >
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
              backgroundColor: "rgba(255,255,255,0.85)",
              backdropFilter: "blur(6px)",
              border: "1px solid rgba(0,0,0,0.08)",
              boxShadow: "0 1px 4px rgba(0,0,0,0.12)",
              "&:hover": { backgroundColor: "rgba(255,255,255,1)" },
            }}
            onAfterAction={onRefresh}
          />
        </Box>
      ) : null}
    </Card>
  );
};

export default ListingCard;
