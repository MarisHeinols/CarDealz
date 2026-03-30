import {
  Paper,
  Stack,
  Typography,
  Chip,
  Divider,
  Button,
  Box,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
} from "@mui/material";
import ConfirmDialog from "../../shared/ConfirmDialog";
import React from "react";
import type { SellerInfo } from "~/types/types";
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";
import StoreIcon from "@mui/icons-material/Store";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import ContactDealerDialog from "./ContactDealerDialog";
import { useAuth } from "~/hooks/userStore/useAuth";
import { getStoreHandleForUid } from "~/services/storeHandleService";
import { loadStoreSettingsFromDb } from "~/services/storeSettingsService";
import {
  deleteListingFromDb,
  markListingAsSold,
  updateListingPrice,
} from "~/services/listingsService";

interface Props {
  seller: SellerInfo;
  sellerId?: string;
  listingId?: string;
  compact?: boolean;
}

const SellerCard = ({ seller, sellerId, listingId, compact }: Props) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [contactOpen, setContactOpen] = useState(false);
  const { user } = useAuth();
  const isOwner = Boolean(user?.uid && sellerId && user.uid === sellerId);

  const [businessEmail, setBusinessEmail] = useState<string | null>(null);

  const [resolvingStore, setResolvingStore] = useState(false);
  const [busy, setBusy] = useState(false);

  const [manageAnchor, setManageAnchor] = useState<null | HTMLElement>(null);
  const manageOpen = Boolean(manageAnchor);

  const [priceOpen, setPriceOpen] = useState(false);
  const [soldOpen, setSoldOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [price, setPrice] = useState<string>("");
  const [soldPrice, setSoldPrice] = useState<string>("");

  React.useEffect(() => {
    let cancelled = false;
    setBusinessEmail(null);

    if (!sellerId || !seller?.isDealer) return;

    loadStoreSettingsFromDb(sellerId)
      .then((settings) => {
        const email = (settings as any)?.contact?.email;
        if (!cancelled) {
          setBusinessEmail(
            typeof email === "string" && email.trim() ? email.trim() : null,
          );
        }
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, [sellerId, seller?.isDealer]);

  const closeManage = () => setManageAnchor(null);

  const visitStore = async () => {
    if (!sellerId) return;
    setResolvingStore(true);
    try {
      const handle = await getStoreHandleForUid(sellerId);
      const target = (handle || sellerId).trim();
      navigate(`/store/${encodeURIComponent(target)}`);
    } catch (e) {
      console.error("Failed to resolve store handle", { sellerId, error: e });
      navigate(`/store/${encodeURIComponent(sellerId)}`);
    } finally {
      setResolvingStore(false);
    }
  };

  const goToLeads = () => {
    closeManage();
    navigate("/admin", { state: { tabIndex: 1 } });
  };

  const openEditPrice = () => {
    closeManage();
    setPriceOpen(true);
  };

  const openMarkSold = () => {
    closeManage();
    setSoldOpen(true);
  };

  const submitPrice = async () => {
    if (!listingId) return;
    const n = Number(price);
    if (!Number.isFinite(n) || n <= 0) return;
    setBusy(true);
    try {
      await updateListingPrice(listingId, n);
      setPriceOpen(false);
    } finally {
      setBusy(false);
    }
  };

  const submitSold = async () => {
    if (!listingId) return;
    const n = Number(soldPrice);
    if (!Number.isFinite(n) || n <= 0) return;
    setBusy(true);
    try {
      await markListingAsSold(listingId, n);
      setSoldOpen(false);
    } finally {
      setBusy(false);
    }
  };

  const handleDeleteClick = () => {
    closeManage();
    setDeleteOpen(true);
  };

  const submitDelete = async () => {
    if (!listingId) return;
    setBusy(true);
    try {
      await deleteListingFromDb(listingId);
      setDeleteOpen(false);
      navigate("/admin");
    } finally {
      setBusy(false);
    }
  };

  if (!seller) return null;

  const displayEmail = businessEmail || seller.email;

  return (
    <Paper
      elevation={compact ? 0 : 1}
      sx={{
        p: compact ? 2 : 3,
        border: compact ? "1px solid" : "none",
        borderColor: "divider",
        borderRadius: 2,
        bgcolor: compact ? "rgba(0,0,0,0.02)" : "background.paper",
      }}
    >
      <Stack spacing={1.5}>
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          justifyContent="space-between"
        >
          <Typography variant={compact ? "subtitle1" : "h6"} fontWeight={600}>
            {seller.name}
          </Typography>
          {seller.isDealer && (
            <Chip
              label={t("listing.dealer")}
              size="small"
              variant="levelHigh"
            />
          )}
        </Stack>

        <Divider />

        {seller.phone && (
          <Stack direction="row" spacing={1} alignItems="center">
            <PhoneIcon sx={{ fontSize: 16 }} color="action" />
            <Typography variant={compact ? "body2" : "body1"}>
              {seller.phone}
            </Typography>
          </Stack>
        )}

        {displayEmail && (
          <Stack direction="row" spacing={1} alignItems="center">
            <EmailIcon sx={{ fontSize: 16 }} color="action" />
            <Typography variant={compact ? "body2" : "body1"}>
              {displayEmail}
            </Typography>
          </Stack>
        )}

        {!seller.phone && !seller.email && (
          <Typography color="text.secondary" variant="body2">
            {t("sellerCard.contactHidden")}
          </Typography>
        )}

        {/* Seller navigation links */}
        {sellerId && (
          <>
            <Divider />
            <Stack
              direction="column"
              spacing={1}
              sx={{ width: "100%" }}
              alignItems="stretch"
            >
              {isOwner ? null : (
                <>
                  {seller.isDealer && listingId ? (
                    <Button
                      size={compact ? "small" : "medium"}
                      variant="contained"
                      onClick={() => setContactOpen(true)}
                      fullWidth
                      sx={{ textTransform: "none", fontWeight: 600 }}
                    >
                      {t("lead.contactDealer", {
                        defaultValue: "Contact dealer",
                      })}
                    </Button>
                  ) : null}

                  {seller.isDealer ? (
                    <Button
                      size={compact ? "small" : "medium"}
                      variant={compact ? "contained" : "outlined"}
                      startIcon={<StoreIcon />}
                      onClick={visitStore}
                      disabled={resolvingStore}
                      fullWidth
                      sx={{ textTransform: "none", fontWeight: 600 }}
                    >
                      {resolvingStore ? (
                        <CircularProgress size={18} color="inherit" />
                      ) : (
                        t("sellerCard.visitStore")
                      )}
                    </Button>
                  ) : (
                    <Button
                      size={compact ? "small" : "medium"}
                      variant={compact ? "contained" : "outlined"}
                      startIcon={<DirectionsCarIcon />}
                      onClick={visitStore}
                      disabled={resolvingStore}
                      fullWidth
                      sx={{ textTransform: "none", fontWeight: 600 }}
                    >
                      {resolvingStore ? (
                        <CircularProgress size={18} color="inherit" />
                      ) : (
                        t("sellerCard.moreFromSeller")
                      )}
                    </Button>
                  )}
                </>
              )}
            </Stack>

            {seller.isDealer && listingId && !isOwner ? (
              <ContactDealerDialog
                open={contactOpen}
                onClose={() => setContactOpen(false)}
                listingId={listingId}
                dealerId={sellerId}
                dealerName={seller.name}
              />
            ) : null}
          </>
        )}
      </Stack>
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
    </Paper>
  );
};

export default SellerCard;
