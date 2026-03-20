import {
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Typography,
  Stack,
  Chip,
  Box,
  IconButton,
  Button,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
} from "@mui/material";
import { useNavigate } from "react-router";
import type { CarListingSummary } from "~/types/types";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import EditIcon from "@mui/icons-material/Edit";
import PeopleIcon from "@mui/icons-material/People";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  updateListingPrice,
  deleteListingFromDb,
  markListingAsSold,
} from "~/services/listingsService";
import { useAppDispatch } from "~/redux/hooks";
import { showNotification } from "~/redux/slices/uiSlice";
import { useAppSelector } from "~/redux/hooks";
import { useTheme } from "@mui/material/styles";
import type { StoreTheme } from "~/redux/slices/storeSettingsSlice";

const conditionTierVariantMap = {
  new: "levelHigh",
  slightly_used: "levelMedium",
  first_payment: "levelMedium",
  used: "levelLow",
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
}

const ListingCard = ({
  listing,
  isOwner,
  useStoreTheme = false,
  storeThemeOverride,
}: Props) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const muiTheme = useTheme();
  const storeTheme = useAppSelector((state) => state.storeSettings.theme);
  const activeTheme = useStoreTheme ? storeThemeOverride || storeTheme : null;

  const color = activeTheme?.isTextLight ? "white" : "inherit";
  const isMinimal = activeTheme?.layout === "minimal";
  const dispatch = useAppDispatch();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [busy, setBusy] = useState(false);
  const [priceOpen, setPriceOpen] = useState(false);
  const [soldOpen, setSoldOpen] = useState(false);
  const [price, setPrice] = useState<string>("");
  const [soldPrice, setSoldPrice] = useState<string>("");

  const handleActionMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    event.preventDefault();
    setAnchorEl(event.currentTarget);
  };

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setAnchorEl(null);
  };

  const openLeads = (e: React.MouseEvent) => {
    handleClose(e);
    navigate("/admin", { state: { tabIndex: 2 } });
  };

  const openEditPrice = (e: React.MouseEvent) => {
    handleClose(e);
    setPrice(listing.price.toString());
    setPriceOpen(true);
  };

  const openMarkSold = (e: React.MouseEvent) => {
    handleClose(e);
    setSoldPrice(listing.price.toString());
    setSoldOpen(true);
  };

  const confirmDelete = (e: React.MouseEvent) => {
    handleClose(e);
    if (window.confirm(t("listingControl.confirmDelete"))) {
      submitDelete();
    }
  };

  const submitPrice = async () => {
    const n = Number(price);
    if (!Number.isFinite(n) || n <= 0) return;
    setBusy(true);
    try {
      await updateListingPrice(listing.id, n);
      dispatch(showNotification({ message: t("pricing.priceUpdated"), severity: "success" }));
      setPriceOpen(false);
    } catch (e) {
      dispatch(showNotification({ message: t("pricing.priceUpdateFailed"), severity: "error" }));
    } finally {
      setBusy(false);
    }
  };

  const submitDelete = async () => {
    setBusy(true);
    try {
      await deleteListingFromDb(listing.id);
      dispatch(showNotification({ message: t("pricing.listingDeleted"), severity: "success" }));
    } catch (e) {
      dispatch(showNotification({ message: t("pricing.listingDeleteFailed"), severity: "error" }));
    } finally {
      setBusy(false);
    }
  };

  const submitSold = async () => {
    const n = Number(soldPrice);
    if (!Number.isFinite(n) || n <= 0) return;
    setBusy(true);
    try {
      await markListingAsSold(listing.id, n);
      dispatch(showNotification({ message: t("listingControl.soldSuccess"), severity: "success" }));
      setSoldOpen(false);
    } catch (e) {
      dispatch(showNotification({ message: t("auth.loginFailed"), severity: "error" }));
    } finally {
      setBusy(false);
    }
  };

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
          ? activeTheme?.background || "background.paper"
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
        <Box sx={{ position: "relative" }}>
          <CardMedia
            component="img"
            height={isMinimal ? 160 : 180}
            image={listing.thumbnailUrl}
            alt={`${listing.make} ${listing.model}`}
            sx={{ objectFit: "cover" }}
          />
          <Chip
            label={t(`carValues.condition_${listing.conditionTier}`)}
            size="small"
            variant={conditionTierVariantMap[listing.conditionTier]}
            sx={{
              position: "absolute",
              top: 12,
              left: 12,
              backdropFilter: "blur(4px)",
              boxShadow: "0 1px 4px rgba(0,0,0,0.12)",
            }}
          />
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
                color: color,
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
                    ? ((activeTheme?.accent || activeTheme?.primary) ??
                      muiTheme.palette.primary.main)
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
              {listing.mileage.toLocaleString(undefined)} {t("common.unit_km")} • {listing.location}
            </Typography>
          </Stack>
        </CardContent>
      </CardActionArea>

      {/* Owner Menu Button */}
      {isOwner && (
        <IconButton
          size="small"
          onClick={handleActionMenu}
          sx={{
            position: "absolute",
            top: 8,
            right: 8,
            backgroundColor: "rgba(255,255,255,0.85)",
            backdropFilter: "blur(6px)",
            border: "1px solid rgba(0,0,0,0.08)",
            boxShadow: "0 1px 4px rgba(0,0,0,0.12)",
            zIndex: 10,
            "&:hover": {
              backgroundColor: "rgba(255,255,255,1)",
            },
          }}
        >
          <MoreVertIcon fontSize="small" />
        </IconButton>
      )}

      {/* Action Menu & Dialogs */}
      {isOwner && (
        <>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleClose}
            onClick={(e) => e.stopPropagation()}
          >
            <MenuItem onClick={openLeads} disabled={busy}>
              <PeopleIcon fontSize="small" sx={{ mr: 1 }} />
              {t("listingControl.goToLeads")}
            </MenuItem>
            <MenuItem onClick={openEditPrice} disabled={busy}>
              <EditIcon fontSize="small" sx={{ mr: 1 }} />
              {t("listingControl.changePrice")}
            </MenuItem>
            {!listing.isSold && (
              <MenuItem
                onClick={openMarkSold}
                disabled={busy}
                sx={{ color: "success.main" }}
              >
                <CheckCircleOutlineIcon fontSize="small" sx={{ mr: 1 }} />
                {t("listingControl.markAsSold")}
              </MenuItem>
            )}
            <MenuItem
              onClick={confirmDelete}
              disabled={busy}
              sx={{ color: "error.main" }}
            >
              <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
              {t("listingControl.deleteListing")}
            </MenuItem>
          </Menu>

          <Dialog
            open={priceOpen}
            onClose={() => setPriceOpen(false)}
            maxWidth="xs"
            fullWidth
          >
            <DialogTitle>{t("listingControl.changePrice")}</DialogTitle>
            <DialogContent dividers>
              <TextField
                autoFocus
                label={t("form.newPrice")}
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                fullWidth
                type="number"
                inputProps={{ min: 1 }}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setPriceOpen(false)} disabled={busy}>
                {t("common.cancel")}
              </Button>
              <Button variant="contained" onClick={submitPrice} disabled={busy}>
                {busy ? (
                  <CircularProgress size={18} color="inherit" />
                ) : (
                  t("common.save")
                )}
              </Button>
            </DialogActions>
          </Dialog>

          <Dialog
            open={soldOpen}
            onClose={() => setSoldOpen(false)}
            maxWidth="xs"
            fullWidth
          >
            <DialogTitle>{t("listingControl.markAsSold")}</DialogTitle>
            <DialogContent dividers>
              <Typography variant="body2" sx={{ mb: 2 }}>
                {t("listingControl.askSoldPrice")}
              </Typography>
              <TextField
                autoFocus
                label={t("form.soldPrice")}
                value={soldPrice}
                onChange={(e) => setSoldPrice(e.target.value)}
                fullWidth
                type="number"
                inputProps={{ min: 1 }}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setSoldOpen(false)} disabled={busy}>
                {t("common.cancel")}
              </Button>
              <Button
                variant="contained"
                onClick={submitSold}
                disabled={busy}
                color="success"
              >
                {busy ? (
                  <CircularProgress size={18} color="inherit" />
                ) : (
                  t("listingControl.markAsSold")
                )}
              </Button>
            </DialogActions>
          </Dialog>
        </>
      )}
    </Card>
  );
};

export default ListingCard;
