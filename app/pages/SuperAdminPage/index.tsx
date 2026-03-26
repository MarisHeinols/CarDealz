import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Divider,
  Grid,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Chip,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { getAllBusinessUsers } from "~/services/businessesService";
import type { PrivateUserProfileDoc } from "~/services/usersService";
import { httpsCallable } from "firebase/functions";
import { functions } from "~/firebase/functions";
import ConfirmDialog from "~/components/shared/ConfirmDialog";

import { useAppDispatch } from "~/redux/hooks";
import { BILLING_ENABLED } from "~/config/billing";
import { showNotification } from "~/redux/slices/uiSlice";

export default function SuperAdminPage() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(true);
  const [businesses, setBusinesses] = useState<PrivateUserProfileDoc[]>([]);
  const [busy, setBusy] = useState(false);
  const [selectedDealer, setSelectedDealer] =
    useState<PrivateUserProfileDoc | null>(null);
  const [declineReason, setDeclineReason] = useState("");
  const [openDecline, setOpenDecline] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteUid, setDeleteUid] = useState<string | null>(null);

  useEffect(() => {
    loadBusinesses();
  }, []);

  const loadBusinesses = async () => {
    setLoading(true);
    try {
      const all = await getAllBusinessUsers();
      setBusinesses(all);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (
    uid: string,
    status: "approved" | "rejected",
    reason?: string,
  ) => {
    setBusy(true);
    try {
      const { httpsCallable } = await import("firebase/functions");
      const { functions } = await import("~/firebase/functions");
      const setDealerStatus = httpsCallable(functions, "verifyDealerAccount");
      await setDealerStatus({ dealerUid: uid, status, reason });
      await loadBusinesses();
      setOpenDecline(false);
      setDeclineReason("");
    } catch (err) {
      console.error("Failed to update dealer status:", err);
      alert(err instanceof Error ? err.message : "Action failed");
    } finally {
      setBusy(false);
    }
  };

  const handleDeleteClick = (uid: string) => {
    setDeleteUid(uid);
    setDeleteOpen(true);
  };

  const submitDelete = async () => {
    if (!deleteUid) return;
    const uid = deleteUid;

    setBusy(true);
    try {
      const { httpsCallable } = await import("firebase/functions");
      const { functions } = await import("~/firebase/functions");
      const deleteUser = httpsCallable(functions, "deleteUserByAdmin");
      await deleteUser({ uid });
      await loadBusinesses();
      setDeleteOpen(false);
      setDeleteUid(null);
      const { showNotification } = await import("~/redux/slices/uiSlice");
      dispatch(
        showNotification({
          message: t("admin.messages.deletedSuccess", {
            defaultValue: "Profile deleted permanently.",
          }),
          severity: "success",
        }),
      );
    } catch (err: any) {
      console.error("Delete failed:", err);
      alert(err.message || "Delete failed");
    } finally {
      setBusy(false);
    }
  };

  const pending = businesses.filter(
    (b) => b.dealerVerificationStatus === "pending",
  );
  const approved = businesses.filter(
    (b) => b.dealerVerificationStatus === "approved",
  );
  const rejected = businesses.filter(
    (b) => b.dealerVerificationStatus === "rejected",
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={10}>
        <CircularProgress />
      </Box>
    );
  }

  const BusinessTable = ({
    rows,
    title,
  }: {
    rows: PrivateUserProfileDoc[];
    title: string;
  }) => (
    <Box sx={{ mb: 6 }}>
      <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
        {title} ({rows.length})
      </Typography>
      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead sx={{ bgcolor: "grey.50" }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>
                {t("admin.table.businessName")}
              </TableCell>
              <TableCell sx={{ fontWeight: 700 }}>
                {t("admin.table.owner")}
              </TableCell>
              <TableCell sx={{ fontWeight: 700 }}>
                {t("admin.table.contact")}
              </TableCell>
              <TableCell sx={{ fontWeight: 700 }}>
                {t("admin.table.location")}
              </TableCell>
              {BILLING_ENABLED && (
                <TableCell sx={{ fontWeight: 700 }}>
                  {t("admin.table.billing", { defaultValue: "Billing" })}
                </TableCell>
              )}
              <TableCell sx={{ fontWeight: 700 }}>
                {t("admin.table.actions")}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={BILLING_ENABLED ? 6 : 5}
                  align="center"
                  sx={{ py: 3, color: "text.secondary" }}
                >
                  {t("admin.table.noBusinesses")}
                </TableCell>
              </TableRow>
            )}
            {rows.map((b) => (
              <TableRow key={b.uid}>
                <TableCell>
                  <Typography fontWeight={700}>
                    {b.storeName || b.businessName || "N/A"}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="primary"
                    sx={{ display: "block" }}
                  >
                    <strong>{t("admin.table.regNo")}</strong>{" "}
                    {b.registrationNumber || "N/A"}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    @{b.storeHandle}
                  </Typography>
                </TableCell>
                <TableCell>-</TableCell>
                <TableCell>
                  <Typography variant="body2">{b.email}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {b.businessPhone || b.phone}
                  </Typography>
                  {b.website && (
                    <Typography
                      variant="caption"
                      sx={{ mt: 0.5, display: "block" }}
                    >
                      <a
                        href={
                          b.website.startsWith("http")
                            ? b.website
                            : `https://${b.website}`
                        }
                        target="_blank"
                        rel="noreferrer"
                        style={{ color: "primary.main" }}
                      >
                        {b.website.replace(/^https?:\/\//, "")}
                      </a>
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  {b.city}, {b.country}
                </TableCell>
                {BILLING_ENABLED && (
                  <TableCell>
                    <Typography
                      variant="caption"
                      fontWeight={700}
                      sx={{
                        px: 1,
                        py: 0.5,
                        borderRadius: 1,
                        bgcolor:
                          b.billing?.status === "active"
                            ? "success.light"
                            : "error.light",
                        color:
                          b.billing?.status === "active"
                            ? "success.dark"
                            : "error.dark",
                        textTransform: "uppercase",
                      }}
                    >
                      {b.billing?.status || "Free"}
                    </Typography>
                  </TableCell>
                )}
                <TableCell>
                  <Stack direction="row" spacing={1}>
                    {b.dealerVerificationStatus !== "approved" && (
                      <Button
                        size="small"
                        variant="contained"
                        color="success"
                        disabled={busy}
                        onClick={() => handleUpdateStatus(b.uid, "approved")}
                      >
                        {t("admin.table.approve")}
                      </Button>
                    )}
                    {b.dealerVerificationStatus !== "rejected" && (
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        disabled={busy}
                        onClick={() => {
                          setSelectedDealer(b);
                          setOpenDecline(true);
                        }}
                      >
                        {t("admin.table.decline")}
                      </Button>
                    )}
                    <Button
                      size="small"
                      variant="text"
                      color="error"
                      disabled={busy}
                      onClick={() => handleDeleteClick(b.uid)}
                    >
                      {t("admin.table.delete", {
                        defaultValue: "Delete Profile",
                      })}
                    </Button>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Typography variant="h4" fontWeight={900} sx={{ mb: 4 }}>
        {t("admin.title")}
      </Typography>

      <BusinessTable rows={pending} title={t("admin.tabs.pending")} />
      <Divider sx={{ my: 4 }} />
      <BusinessTable rows={approved} title={t("admin.tabs.approved")} />
      <Divider sx={{ my: 4 }} />
      <BusinessTable rows={rejected} title={t("admin.tabs.rejected")} />

      <Dialog open={openDecline} onClose={() => setOpenDecline(false)}>
        <DialogTitle>{t("admin.dialogs.declineTitle")}</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>
            {t("admin.dialogs.declineDesc")}
          </Typography>
          <TextField
            autoFocus
            fullWidth
            multiline
            rows={4}
            label={t("admin.dialogs.declineLabel")}
            value={declineReason}
            onChange={(e) => setDeclineReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpenDecline(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            onClick={() =>
              selectedDealer &&
              handleUpdateStatus(selectedDealer.uid, "rejected", declineReason)
            }
            disabled={!declineReason.trim() || busy}
          >
            {t("common.confirm")}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={submitDelete}
        title={t("admin.table.delete")}
        message={t("admin.dialogs.deleteConfirm")}
        confirmText={t("common.delete")}
        cancelText={t("common.cancel")}
        loading={busy}
        severity="error"
      />
    </Container>
  );
}
