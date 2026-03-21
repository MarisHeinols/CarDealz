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

  const [resolvingStore, setResolvingStore] = useState(false);
  const [busy, setBusy] = useState(false);

  const [manageAnchor, setManageAnchor] = useState<null | HTMLElement>(null);
  const manageOpen = Boolean(manageAnchor);

  const [priceOpen, setPriceOpen] = useState(false);
  const [soldOpen, setSoldOpen] = useState(false);
  const [price, setPrice] = useState<string>("");
  const [soldPrice, setSoldPrice] = useState<string>("");

  const closeManage = () => setManageAnchor(null);

  const visitStore = async () => {
    if (!sellerId) return;
    setResolvingStore(true);
    try {
      const handle = await getStoreHandleForUid(sellerId);
      navigate(`/store/${handle || sellerId}`);
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

  const deleteListing = async () => {
    closeManage();
    if (!listingId) return;
    const ok = window.confirm(
      t("listing.deleteConfirm", {
        defaultValue: "Delete this listing? This cannot be undone.",
      }),
    );
    if (!ok) return;
    setBusy(true);
    try {
      await deleteListingFromDb(listingId);
      navigate("/admin");
    } finally {
      setBusy(false);
    }
  };

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

        {seller.email && (
          <Stack direction="row" spacing={1} alignItems="center">
            <EmailIcon sx={{ fontSize: 16 }} color="action" />
            <Typography variant={compact ? "body2" : "body1"}>
              {seller.email}
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
    </Paper>
  );
};

export default SellerCard;
