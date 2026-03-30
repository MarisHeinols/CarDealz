import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Menu,
  MenuItem,
  TextField,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import EditIcon from "@mui/icons-material/Edit";
import PeopleIcon from "@mui/icons-material/People";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import { useState, type MouseEvent } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import {
  deleteListingFromDb,
  markAsSale,
  markListingAsSold,
  stopSale,
  updateListingPrice,
  updateListingStatus,
} from "~/services/listingsService";
import {
  cacheKeyAllListings,
  cacheKeyOwnerListings,
  invalidateCache,
} from "~/services/listingsCache";
import { useAppDispatch } from "~/redux/hooks";
import { showNotification } from "~/redux/slices/uiSlice";
import ConfirmDialog from "~/components/shared/ConfirmDialog";

type Props = {
  enabled?: boolean;
  listingId: string;
  sellerId?: string;
  status?: "draft" | "published" | "closed";
  price: number;
  isOnSale?: boolean;
  salePrice?: number | null;
  isSold?: boolean;

  iconButtonSx?: any;
  iconButtonSize?: "small" | "medium" | "large";

  onAfterAction?: () => void;
  onStatusChanged?: (status: "draft" | "published") => void;
  onPriceChanged?: (price: number) => void;
  onSold?: (soldPrice: number) => void;
  onSaleApplied?: (salePrice: number) => void;
  onSaleStopped?: () => void;
  onDeleted?: () => void;
};

const ListingOwnerActions = ({
  enabled,
  listingId,
  sellerId,
  status,
  price,
  isOnSale,
  salePrice,
  isSold,
  iconButtonSx,
  iconButtonSize = "small",
  onAfterAction,
  onStatusChanged,
  onPriceChanged,
  onSold,
  onSaleApplied,
  onSaleStopped,
  onDeleted,
}: Props) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [busy, setBusy] = useState(false);
  const [priceOpen, setPriceOpen] = useState(false);
  const [soldOpen, setSoldOpen] = useState(false);
  const [saleOpen, setSaleOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [draftPrice, setDraftPrice] = useState<string>("");
  const [draftSoldPrice, setDraftSoldPrice] = useState<string>("");
  const [draftSalePrice, setDraftSalePrice] = useState<string>("");

  if (!enabled) return null;

  const openMenu = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    event.preventDefault();
    setAnchorEl(event.currentTarget);
  };

  const closeMenu = (e?: unknown) => {
    const evt = e as
      | { stopPropagation?: () => void; preventDefault?: () => void }
      | undefined;
    evt?.stopPropagation?.();
    evt?.preventDefault?.();
    setAnchorEl(null);
  };

  const invalidate = () => {
    if (sellerId) invalidateCache(cacheKeyOwnerListings(sellerId));
    invalidateCache(cacheKeyAllListings());
  };

  const goToLeads = (e: MouseEvent) => {
    closeMenu(e);
    navigate("/admin", { state: { tabIndex: 1 } });
  };

  const openEditPrice = (e: MouseEvent) => {
    closeMenu(e);
    setDraftPrice(String(price ?? ""));
    setPriceOpen(true);
  };

  const openMarkSold = (e: MouseEvent) => {
    closeMenu(e);
    setDraftSoldPrice(String(price ?? ""));
    setSoldOpen(true);
  };

  const openSaleDialog = (e: MouseEvent) => {
    closeMenu(e);
    const suggested =
      isOnSale && salePrice ? String(salePrice) : String((price || 0) * 0.9);
    setDraftSalePrice(suggested);
    setSaleOpen(true);
  };

  const confirmDelete = (e: MouseEvent) => {
    closeMenu(e);
    setDeleteOpen(true);
  };

  const toggleStatus = async (e: MouseEvent) => {
    closeMenu(e);
    const newStatus = status === "draft" ? "published" : "draft";
    setBusy(true);
    try {
      await updateListingStatus(listingId, newStatus);
      invalidate();
      dispatch(
        showNotification({
          message:
            newStatus === "published"
              ? t("listingControl.publishedSuccess", {
                  defaultValue: "Listing published!",
                })
              : t("listingControl.draftSuccess", {
                  defaultValue: "Listing moved to draft.",
                }),
          severity: "success",
        }),
      );
      onStatusChanged?.(newStatus);
      onAfterAction?.();
    } catch {
      dispatch(
        showNotification({
          message: t("pricing.priceUpdateFailed", {
            defaultValue: "Failed to update listing status.",
          }),
          severity: "error",
        }),
      );
    } finally {
      setBusy(false);
    }
  };

  const stopSaleClick = async (e: MouseEvent) => {
    closeMenu(e);
    setBusy(true);
    try {
      await stopSale(listingId);
      invalidate();
      onSaleStopped?.();
      onAfterAction?.();
    } finally {
      setBusy(false);
    }
  };

  const submitPrice = async () => {
    const n = Number(draftPrice);
    if (!Number.isFinite(n) || n <= 0) return;
    setBusy(true);
    try {
      await updateListingPrice(listingId, n);
      invalidate();
      dispatch(
        showNotification({
          message: t("pricing.priceUpdated", { defaultValue: "Price updated." }),
          severity: "success",
        }),
      );
      setPriceOpen(false);
      onPriceChanged?.(n);
      onAfterAction?.();
    } catch {
      dispatch(
        showNotification({
          message: t("pricing.priceUpdateFailed", {
            defaultValue: "Failed to update price.",
          }),
          severity: "error",
        }),
      );
    } finally {
      setBusy(false);
    }
  };

  const submitSold = async () => {
    const n = Number(draftSoldPrice);
    if (!Number.isFinite(n) || n <= 0) return;
    setBusy(true);
    try {
      await markListingAsSold(listingId, n);
      invalidate();
      dispatch(
        showNotification({
          message: t("listingControl.soldSuccess", {
            defaultValue: "Marked as sold.",
          }),
          severity: "success",
        }),
      );
      setSoldOpen(false);
      onSold?.(n);
      onAfterAction?.();
    } catch {
      dispatch(
        showNotification({
          message: t("auth.loginFailed", {
            defaultValue: "Failed to mark as sold.",
          }),
          severity: "error",
        }),
      );
    } finally {
      setBusy(false);
    }
  };

  const submitSale = async () => {
    const n = Number(draftSalePrice);
    if (!Number.isFinite(n) || n <= 0) return;
    setBusy(true);
    try {
      await markAsSale(listingId, n);
      invalidate();
      dispatch(
        showNotification({
          message: t("listingControl.saleApplied", {
            defaultValue: "Sale applied successfully.",
          }),
          severity: "success",
        }),
      );
      setSaleOpen(false);
      onSaleApplied?.(n);
      onAfterAction?.();
    } catch {
      dispatch(
        showNotification({
          message: t("pricing.priceUpdateFailed", {
            defaultValue: "Failed to apply sale.",
          }),
          severity: "error",
        }),
      );
    } finally {
      setBusy(false);
    }
  };

  const submitDelete = async () => {
    setBusy(true);
    try {
      await deleteListingFromDb(listingId);
      invalidate();
      dispatch(
        showNotification({
          message: t("pricing.listingDeleted", {
            defaultValue: "Listing deleted.",
          }),
          severity: "success",
        }),
      );
      setDeleteOpen(false);
      onDeleted?.();
      onAfterAction?.();
    } catch {
      dispatch(
        showNotification({
          message: t("pricing.listingDeleteFailed", {
            defaultValue: "Failed to delete listing.",
          }),
          severity: "error",
        }),
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <IconButton
        size={iconButtonSize}
        onClick={openMenu}
        sx={iconButtonSx}
        disabled={busy}
      >
        <MoreVertIcon fontSize={iconButtonSize === "small" ? "small" : "medium"} />
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={closeMenu}
        onClick={(e) => e.stopPropagation()}
      >
        <MenuItem onClick={goToLeads} disabled={busy}>
          <PeopleIcon fontSize="small" sx={{ mr: 1 }} />
          {t("listingControl.goToLeads", { defaultValue: "Leads" })}
        </MenuItem>
        <MenuItem onClick={openEditPrice} disabled={busy}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          {t("listingControl.changePrice", { defaultValue: "Change price" })}
        </MenuItem>

        {isOnSale ? (
          <MenuItem onClick={stopSaleClick} disabled={busy}>
            <AttachMoneyIcon fontSize="small" sx={{ mr: 1, color: "error.main" }} />
            {t("listingControl.stopSale", { defaultValue: "End Sale" })}
          </MenuItem>
        ) : (
          <MenuItem onClick={openSaleDialog} disabled={busy}>
            <AttachMoneyIcon fontSize="small" sx={{ mr: 1, color: "error.main" }} />
            {t("listingControl.putOnSale", { defaultValue: "Put on Sale" })}
          </MenuItem>
        )}

        <MenuItem onClick={toggleStatus} disabled={busy}>
          <CheckCircleOutlineIcon fontSize="small" sx={{ mr: 1 }} />
          {status === "draft"
            ? t("listingControl.publish", { defaultValue: "Publish" })
            : t("listingControl.moveToDraft", { defaultValue: "Move to Draft" })}
        </MenuItem>

        {!isSold ? (
          <MenuItem
            onClick={openMarkSold}
            disabled={busy}
            sx={{ color: "success.main" }}
          >
            <CheckCircleOutlineIcon fontSize="small" sx={{ mr: 1 }} />
            {t("listingControl.markAsSold", { defaultValue: "Mark as sold" })}
          </MenuItem>
        ) : null}

        <MenuItem onClick={confirmDelete} disabled={busy} sx={{ color: "error.main" }}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          {t("listingControl.deleteListing", { defaultValue: "Delete" })}
        </MenuItem>
      </Menu>

      <Dialog open={priceOpen} onClose={() => setPriceOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>
          {t("listingControl.changePrice", { defaultValue: "Change price" })}
        </DialogTitle>
        <DialogContent dividers>
          <TextField
            autoFocus
            label={t("form.newPrice", { defaultValue: "New price" })}
            value={draftPrice}
            onChange={(e) => setDraftPrice(e.target.value)}
            fullWidth
            type="number"
            inputProps={{ min: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPriceOpen(false)} disabled={busy}>
            {t("common.cancel", { defaultValue: "Cancel" })}
          </Button>
          <Button variant="contained" onClick={submitPrice} disabled={busy}>
            {busy ? (
              <CircularProgress size={18} color="inherit" />
            ) : (
              t("common.save", { defaultValue: "Save" })
            )}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={soldOpen} onClose={() => setSoldOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>
          {t("listingControl.markAsSold", { defaultValue: "Mark as Sold" })}
        </DialogTitle>
        <DialogContent dividers>
          <TextField
            autoFocus
            label={t("form.soldPrice", { defaultValue: "Sold price" })}
            value={draftSoldPrice}
            onChange={(e) => setDraftSoldPrice(e.target.value)}
            fullWidth
            type="number"
            inputProps={{ min: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSoldOpen(false)} disabled={busy}>
            {t("common.cancel", { defaultValue: "Cancel" })}
          </Button>
          <Button variant="contained" onClick={submitSold} disabled={busy} color="success">
            {busy ? (
              <CircularProgress size={18} color="inherit" />
            ) : (
              t("common.confirm", { defaultValue: "Confirm" })
            )}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={saleOpen} onClose={() => setSaleOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>
          {t("listingControl.putOnSale", { defaultValue: "Put on Sale" })}
        </DialogTitle>
        <DialogContent dividers>
          <TextField
            autoFocus
            label={t("form.salePrice", { defaultValue: "Sale price" })}
            value={draftSalePrice}
            onChange={(e) => setDraftSalePrice(e.target.value)}
            fullWidth
            type="number"
            inputProps={{ min: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSaleOpen(false)} disabled={busy}>
            {t("common.cancel", { defaultValue: "Cancel" })}
          </Button>
          <Button variant="contained" color="error" onClick={submitSale} disabled={busy}>
            {busy ? (
              <CircularProgress size={18} color="inherit" />
            ) : (
              t("listingControl.applySale", { defaultValue: "Apply" })
            )}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={submitDelete}
        title={t("listingControl.deleteListing", { defaultValue: "Delete listing" })}
        message={t("listing.deleteConfirm", {
          defaultValue: "Are you sure you want to delete this listing?",
        })}
        confirmText={t("common.delete", { defaultValue: "Delete" })}
        cancelText={t("common.cancel", { defaultValue: "Cancel" })}
        loading={busy}
        severity="error"
      />
    </>
  );
};

export default ListingOwnerActions;
