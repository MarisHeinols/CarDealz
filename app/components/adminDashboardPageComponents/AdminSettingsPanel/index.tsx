import { useTranslation } from "react-i18next";
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
import AccountPrivacySettings from "../AccountPrivacySettings";
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
  const { t } = useTranslation();
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
        showNotification({ message: t("common.save_success") || "Settings saved successfully!", severity: "success" })
      );
    } catch (err) {
      appDispatch(
        showNotification({ message: t("common.save_error") || "Failed to save settings.", severity: "error" })
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
          {t("common.loading")}
        </Typography>
      </Stack>
    );
  }

  return (
    <>
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography fontWeight={600}>{t("dashboard.settings.appearance.title")}</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <AppearanceSettings />
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography fontWeight={600}>{t("dashboard.settings.branding.title")}</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <BrandingSettings />
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography fontWeight={600}>{t("dashboard.settings.storeInfo.title")}</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <StoreInfoSettings />
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
          {saving ? t("common.saving") || "Saving…" : t("common.save") || "Save All Settings"}
        </Button>
      </Stack>
    </>
  );
};

export default AdminSettingsPanel;
