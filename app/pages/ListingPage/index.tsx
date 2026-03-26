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
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditIcon from "@mui/icons-material/Edit";
import PeopleIcon from "@mui/icons-material/People";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import DeleteIcon from "@mui/icons-material/Delete";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import { Menu, MenuItem, IconButton, Dialog, DialogTitle, DialogContent, TextField, DialogActions, Button } from "@mui/material";
import { deleteListingFromDb, markListingAsSold, updateListingPrice, markAsSale, stopSale } from "~/services/listingsService";
import { useNavigate } from "react-router";
import { useAppDispatch } from "~/redux/hooks";
import { showNotification } from "~/redux/slices/uiSlice";
import { invalidateCache, cacheKeyAllListings, cacheKeyOwnerListings } from "~/services/listingsCache";
import ConfirmDialog from "~/components/shared/ConfirmDialog";
import ListingNotFound from "~/components/listingPageComponents/ListingNotFound";

type Props = {
  id: string;
};

const ListingPage = ({ id }: Props) => {
  const dispatch = useAppDispatch();
  const {
    listing: car,
    loading,
    refreshing,
  } = useCachedListingDetails<any>(id);
  const [marketRefreshDoneForId, setMarketRefreshDoneForId] = useState<
    string | null
  >(null);
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!loading && !car) {
    return <ListingNotFound />;
  }

  const isOwner = Boolean(user?.uid && car?.sellerId && user.uid === car.sellerId);

  const [manageAnchor, setManageAnchor] = useState<null | HTMLElement>(null);
  const [busy, setBusy] = useState(false);
  const [priceOpen, setPriceOpen] = useState(false);
  const [soldOpen, setSoldOpen] = useState(false);
  const [saleOpen, setSaleOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [price, setPrice] = useState<string>("");
  const [soldPrice, setSoldPrice] = useState<string>("");
  const [salePrice, setSalePrice] = useState<string>("");

  const closeManage = () => setManageAnchor(null);

  const openEditPrice = () => {
    closeManage();
    setPrice(car?.price?.toString() || "");
    setPriceOpen(true);
  };

  const openMarkSold = () => {
    closeManage();
    setSoldPrice(car?.price?.toString() || "");
    setSoldOpen(true);
  };

  const submitPrice = async () => {
    if (!car) return;
    const n = Number(price);
    if (!Number.isFinite(n) || n <= 0) return;
    setBusy(true);
    try {
      await updateListingPrice(id, n);
      invalidateCache(cacheKeyAllListings());
      if (car?.sellerId) invalidateCache(cacheKeyOwnerListings(car.sellerId));
      setPriceOpen(false);
      dispatch(showNotification({ message: t("pricing.priceUpdated"), severity: "success" }));
    } finally {
      setBusy(false);
    }
  };

  const submitSold = async () => {
    if (!car) return;
    const n = Number(soldPrice);
    if (!Number.isFinite(n) || n <= 0) return;
    setBusy(true);
    try {
      await markListingAsSold(id, n);
      invalidateCache(cacheKeyAllListings());
      if (car?.sellerId) invalidateCache(cacheKeyOwnerListings(car.sellerId));
      setSoldOpen(false);
      dispatch(showNotification({ message: t("listingControl.soldSuccess"), severity: "success" }));
    } finally {
      setBusy(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!car) return;
    closeManage();
    const newStatus = car.status === "draft" ? "published" : "draft";
    setBusy(true);
    try {
      const { updateListingStatus } = await import("~/services/listingsService");
      await updateListingStatus(id, newStatus);
      invalidateCache(cacheKeyAllListings());
      if (car.sellerId) invalidateCache(cacheKeyOwnerListings(car.sellerId));
      dispatch(showNotification({ 
        message: newStatus === "published" ? t("listingControl.publishedSuccess") : t("listingControl.draftSuccess"), 
        severity: "success" 
      }));
    } catch (e) {
      console.error(e);
    } finally {
      setBusy(false);
    }
  };

  const handleDeleteClick = () => {
    closeManage();
    setDeleteOpen(true);
  };

  const submitDelete = async () => {
    setBusy(true);
    try {
      await deleteListingFromDb(id);
      invalidateCache(cacheKeyAllListings());
      if (car?.sellerId) invalidateCache(cacheKeyOwnerListings(car.sellerId));
      setDeleteOpen(false);
      dispatch(showNotification({ message: t("pricing.listingDeleted"), severity: "success" }));
      navigate("/admin");
    } finally {
      setBusy(false);
    }
  };

  const handleStopSale = async () => {
    closeManage();
    setBusy(true);
    try {
      await stopSale(id);
      invalidateCache(cacheKeyAllListings());
      if (car?.sellerId) invalidateCache(cacheKeyOwnerListings(car.sellerId));
      dispatch(showNotification({ message: t("listingControl.saleStopped", { defaultValue: "Sale ended" }), severity: "info" }));
    } finally {
      setBusy(false);
    }
  };

  const submitSale = async () => {
    if (!car) return;
    const n = Number(salePrice);
    if (!Number.isFinite(n) || n <= 0) return;
    setBusy(true);
    try {
      await markAsSale(id, n);
      invalidateCache(cacheKeyAllListings());
      if (car?.sellerId) invalidateCache(cacheKeyOwnerListings(car.sellerId));
      setSaleOpen(false);
      dispatch(showNotification({ message: t("listingControl.saleApplied"), severity: "success" }));
    } finally {
      setBusy(false);
    }
  };

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
                images={car.images.map((img: { url: any }) => img.url)}
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
              <SpecSheet features={car.features} isOwner={isOwner} listingId={id} />
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

                {isOwner && (
                  <>
                    <IconButton size="small" onClick={(e) => setManageAnchor(e.currentTarget)}>
                      <MoreVertIcon />
                    </IconButton>
                    <Menu
                      anchorEl={manageAnchor}
                      open={Boolean(manageAnchor)}
                      onClose={closeManage}
                    >
                      <MenuItem onClick={() => { closeManage(); navigate("/admin", { state: { tabIndex: 1 } }); }} disabled={busy}>
                        <PeopleIcon fontSize="small" sx={{ mr: 1 }} />
                        {t("listingControl.goToLeads")}
                      </MenuItem>
                      <MenuItem onClick={openEditPrice} disabled={busy}>
                        <EditIcon fontSize="small" sx={{ mr: 1 }} />
                        {t("listingControl.changePrice")}
                      </MenuItem>
                      <MenuItem 
                        onClick={() => {
                          if (car?.isOnSale) {
                            handleStopSale();
                          } else {
                            closeManage();
                            setSalePrice((car.price * 0.9).toString());
                            setSaleOpen(true);
                          }
                        }} 
                        disabled={busy}
                      >
                        <AttachMoneyIcon fontSize="small" sx={{ mr: 1, color: "error.main" }} />
                        {car?.isOnSale ? t("listingControl.stopSale") : t("listingControl.putOnSale")}
                      </MenuItem>
                      <MenuItem onClick={handleToggleStatus} disabled={busy}>
                         <CheckCircleOutlineIcon fontSize="small" sx={{ mr: 1, color: car.status === "draft" ? "primary.main" : "text.secondary" }} />
                         {car.status === "draft" ? t("listingControl.publish") : t("listingControl.moveToDraft")}
                      </MenuItem>
                      {!car.isSold && (
                        <MenuItem onClick={openMarkSold} disabled={busy} sx={{ color: "success.main" }}>
                          <CheckCircleOutlineIcon fontSize="small" sx={{ mr: 1 }} />
                          {t("listingControl.markAsSold")}
                        </MenuItem>
                      )}
                      <MenuItem onClick={handleDeleteClick} disabled={busy} sx={{ color: "error.main" }}>
                        <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
                        {t("listingControl.deleteListing")}
                      </MenuItem>
                    </Menu>
                  </>
                )}
              </Stack>
            </Stack>

            <Typography variant="h4" color="primary" fontWeight={900}>
              €{car.price.toLocaleString("en-US")}
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

              <Chip label={car.location} size="small" variant="levelNeutral" sx={{ px: 0.5 }} />

              <Chip
                label={
                  car.seller.isDealer
                    ? t("listing.dealer")
                    : t("listing.privateSeller")
                }
                size="small"
                variant={car.seller.isDealer ? "levelHigh" : "levelLow"}
                sx={{ px: 0.5 }}
              />
            </Stack>


            <Divider />

            <MarketValueBar price={car.price} marketRange={car.marketRange} />

            <DetailsCard listing={car} isOwner={isOwner} />

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

      {/* Owner Action Dialogs */}
      <Dialog
        open={priceOpen}
        onClose={() => setPriceOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>{t("listing.owner.editPrice", { defaultValue: "Edit price" })}</DialogTitle>
        <DialogContent dividers>
          <TextField
            autoFocus
            label={t("listing.owner.newPrice", { defaultValue: "New price" })}
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            fullWidth
            type="number"
            inputProps={{ min: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPriceOpen(false)} disabled={busy}>
            {t("common.cancel", { defaultValue: "Cancel" })}
          </Button>
          <Button
            variant="contained"
            onClick={submitPrice}
            disabled={busy}
          >
            {busy ? (
              <CircularProgress size={18} color="inherit" />
            ) : (
              t("common.save", { defaultValue: "Save" })
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
        <DialogTitle>{t("listing.owner.markSold", { defaultValue: "Mark as Sold" })}</DialogTitle>
        <DialogContent dividers>
          <TextField
            autoFocus
            label={t("listing.owner.soldPrice", { defaultValue: "Sold price" })}
            value={soldPrice}
            onChange={(e) => setSoldPrice(e.target.value)}
            fullWidth
            type="number"
            inputProps={{ min: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSoldOpen(false)} disabled={busy}>
            {t("common.cancel", { defaultValue: "Cancel" })}
          </Button>
          <Button
            variant="contained"
            onClick={submitSold}
            disabled={busy}
          >
            {busy ? (
              <CircularProgress size={18} color="inherit" />
            ) : (
              t("common.confirm", { defaultValue: "Confirm" })
            )}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={saleOpen}
        onClose={() => setSaleOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>{t("listingControl.putOnSale")}</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" sx={{ mb: 2 }} color="text.secondary">
            {t("listingControl.setSalePriceDesc")}
          </Typography>
          <TextField
            autoFocus
            label={t("listing.owner.newPrice", { defaultValue: "Sale price" })}
            value={salePrice}
            onChange={(e) => setSalePrice(e.target.value)}
            fullWidth
            type="number"
            inputProps={{ min: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSaleOpen(false)} disabled={busy}>
            {t("common.cancel", { defaultValue: "Cancel" })}
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={submitSale}
            disabled={busy}
          >
            {busy ? (
              <CircularProgress size={18} color="inherit" />
            ) : (
              t("listingControl.applySale")
            )}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={submitDelete}
        title={t("listingControl.deleteListing")}
        message={t("listing.deleteConfirm")}
        confirmText={t("common.delete")}
        cancelText={t("common.cancel")}
        loading={busy}
        severity="error"
      />
    </AppContainer>
  );
};

export default ListingPage;
