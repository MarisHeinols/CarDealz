import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Button,
  Stack,
  Box,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AccountPrivacySettings from "../AccountPrivacySettings";
import { useAppDispatch } from "~/redux/hooks";
import { showNotification } from "~/redux/slices/uiSlice";

import { useTranslation } from "react-i18next";

const AccountSettingsPanel = () => {
  const { t } = useTranslation();
  const appDispatch = useAppDispatch();

  return (
    <Box sx={{ maxWidth: 800, mx: "auto", mt: 2 }}>
      <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
        {t("dashboard.account.title", { defaultValue: "Account Settings" })}
      </Typography>

      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography fontWeight={600}>
            {t("dashboard.account.billing.title", { defaultValue: "Plan & Billing" })}
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Stack spacing={2}>
            <Typography variant="body2" color="text.secondary">
              {t("dashboard.account.billing.desc", { defaultValue: "Managing your subscription status, payment methods, and invoices via Stripe Secure Portal." })}
            </Typography>
            <Button
              variant="outlined"
              sx={{ alignSelf: "flex-start" }}
              onClick={async () => {
                try {
                  const { goToCustomerPortal } = await import("~/services/billingService");
                  await goToCustomerPortal();
                } catch (err: any) {
                  appDispatch(showNotification({ message: err.message, severity: "error" }));
                }
              }}
            >
              {t("dashboard.account.billing.manageCta", { defaultValue: "Manage & Cancel Subscription" })}
            </Button>
          </Stack>
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography fontWeight={600} color="error.main">
            {t("dashboard.account.privacy.title", { defaultValue: "Account & Privacy" })}
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <AccountPrivacySettings />
        </AccordionDetails>
      </Accordion>
    </Box>
  );
};

export default AccountSettingsPanel;
