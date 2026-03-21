// src/components/adminDashboardPageComponents/AdminSettingsPanel.tsx
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Button,
  Stack,
  CircularProgress,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import SaveIcon from "@mui/icons-material/Save";
import AppearanceSettings from "../AppearenceSettings";
import BrandingSettings from "../BrandingSettings";
import LocationSettings from "../LocationSettings";
import StoreInfoSettings from "../StoreInfoSettings";
import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "~/redux/store";
import { loadStoreSettings } from "~/redux/slices/storeSettingsSlice";
import {
  saveStoreSettings,
  loadStoreSettingsFromDb,
} from "~/services/storeSettingsService";
import { auth } from "~/firebase/auth";
import { useAppDispatch } from "~/redux/hooks";
import { showNotification } from "~/redux/slices/uiSlice";

const AdminSettingsPanel = () => {
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const storeSettings = useSelector((s: RootState) => s.storeSettings);
  const dispatch = useDispatch();
  const appDispatch = useAppDispatch();

  // Load settings from DB on mount
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      setLoading(false);
      return;
    }
    loadStoreSettingsFromDb(user.uid)
      .then((settings) => {
        if (settings) {
          dispatch(loadStoreSettings({ ...settings, isEditMode: false }));
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [dispatch]);

  const handleSave = async () => {
    const user = auth.currentUser;
    if (!user) return;
    setSaving(true);
    try {
      await saveStoreSettings(user.uid, storeSettings);
      appDispatch(
        showNotification({ message: "Settings saved successfully!", severity: "success" })
      );
    } catch (err) {
      appDispatch(
        showNotification({ message: "Failed to save settings.", severity: "error" })
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Stack alignItems="center" py={4}>
        <CircularProgress />
        <Typography mt={1} color="text.secondary">
          Loading settings…
        </Typography>
      </Stack>
    );
  }

  return (
    <>
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography fontWeight={600}>Appearance</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <AppearanceSettings />
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography fontWeight={600}>Branding</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <BrandingSettings />
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography fontWeight={600}>Store Info</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <StoreInfoSettings />
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography fontWeight={600}>Plan & Billing</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Stack spacing={2}>
            <Typography variant="body2" color="text.secondary">
              Managing your subscription status, payment methods, and invoices via Stripe Secure Portal.
            </Typography>
            <Button
              variant="outlined"
              fullWidth
              onClick={async () => {
                try {
                  const { goToCustomerPortal } = await import("~/services/billingService");
                  await goToCustomerPortal();
                } catch (err: any) {
                  appDispatch(showNotification({ message: err.message, severity: "error" }));
                }
              }}
            >
              Manage & Cancel Subscription
            </Button>
          </Stack>
        </AccordionDetails>
      </Accordion>

      <Stack direction="row" justifyContent="flex-end" mt={3}>
        <Button
          variant="contained"
          size="large"
          startIcon={saving ? <CircularProgress size={18} color="inherit" /> : <SaveIcon />}
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? "Saving…" : "Save All Settings"}
        </Button>
      </Stack>
    </>
  );
};

export default AdminSettingsPanel;
