import React, { useMemo, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  Typography,
  Divider,
  Switch,
  FormControlLabel,
} from "@mui/material";
import { useTranslation } from "react-i18next";

export type CookieConsentChoice = {
  analytics: boolean;
};

type CookieSettingsDialogProps = {
  open: boolean;
  onClose: () => void;
  initialChoice: CookieConsentChoice;
  onSave: (choice: CookieConsentChoice) => void;
};

export default function CookieSettingsDialog({
  open,
  onClose,
  initialChoice,
  onSave,
}: CookieSettingsDialogProps) {
  const { t } = useTranslation();
  const [analytics, setAnalytics] = useState<boolean>(initialChoice.analytics);

  React.useEffect(() => {
    if (!open) return;
    setAnalytics(initialChoice.analytics);
  }, [initialChoice.analytics, open]);

  const effectiveChoice = useMemo(() => ({ analytics }), [analytics]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {t("cookies.settings_title", "Cookie settings")}
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          <Typography variant="body2" color="text.secondary">
            {t(
              "cookies.settings_intro",
              "You can choose whether to allow analytics. Essential technologies are always enabled for core functionality and security.",
            )}
          </Typography>

          <Divider />

          <Stack spacing={0.5}>
            <Typography variant="subtitle1" fontWeight={800}>
              {t("cookies.essential_title", "Essential")}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t(
                "cookies.essential_desc",
                "Required for core functionality and security. Always enabled.",
              )}
            </Typography>
          </Stack>

          <Divider />

          <Stack spacing={1}>
            <Stack spacing={0.5}>
              <Typography variant="subtitle1" fontWeight={800}>
                {t("cookies.analytics_title", "Analytics")}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t(
                  "cookies.analytics_desc",
                  "Helps us understand aggregated usage (Cloudflare Web Analytics).",
                )}
              </Typography>
            </Stack>

            <FormControlLabel
              control={
                <Switch
                  checked={analytics}
                  onChange={(e) => setAnalytics(e.target.checked)}
                />
              }
              label={t("cookies.analytics_toggle", "Allow analytics")}
            />
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>
          {t("common.cancel", "Cancel")}
        </Button>
        <Button variant="contained" onClick={() => onSave(effectiveChoice)}>
          {t("cookies.save", "Save")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
