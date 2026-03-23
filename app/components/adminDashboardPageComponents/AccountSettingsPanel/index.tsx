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
import { useNavigate } from "react-router";
import { auth } from "~/firebase/auth";

import { useTranslation } from "react-i18next";

const AccountSettingsPanel = ({ mustVerify }: { mustVerify?: boolean }) => {
  const { t } = useTranslation();
  const appDispatch = useAppDispatch();
  const navigate = useNavigate();

  return (
    <Box sx={{ maxWidth: 800, mx: "auto", mt: 2 }}>
      <Typography variant="h6" fontWeight={800} sx={{ mb: 2 }}>
        {t("dashboard.account.title", { defaultValue: "Account Settings" })}
      </Typography>

      {mustVerify && (
        <Box 
          p={3} 
          mb={4} 
          sx={{ 
            bgcolor: "error.light", 
            borderRadius: 2, 
            border: "1px solid",
            borderColor: "error.main",
            display: "flex", 
            flexDirection: "column",
            gap: 2 
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Typography variant="subtitle1" fontWeight={800} color="error.dark">
              {t("nav.verifyPhone", { defaultValue: "Verify Phone" })}
            </Typography>
          </Box>
          <Typography variant="body2" color="error.dark">
            {t("listingControl.phone_verification_required", { defaultValue: "Phone verification is required to access all features." })}
          </Typography>
          <Button 
            variant="contained" 
            color="error" 
            fullWidth 
            onClick={() => navigate("/verify-phone")}
          >
            {t("nav.verifyPhone", { defaultValue: "Verify Phone" })}
          </Button>
        </Box>
      )}
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography fontWeight={600}>
            {t("dashboard.account.verification.title", { defaultValue: "Verification Status" })}
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Stack spacing={2}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Box 
                sx={{ 
                  width: 20, 
                  height: 20, 
                  borderRadius: "50%", 
                  bgcolor: auth.currentUser?.emailVerified ? "success.main" : "warning.main",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontSize: 14
                }}
              >
                {auth.currentUser?.emailVerified ? "✓" : "!"}
              </Box>
              <Typography variant="body2" fontWeight={600}>
                {t("dashboard.account.verification.email", { defaultValue: "Email Verified" })}
              </Typography>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Box 
                sx={{ 
                  width: 20, 
                  height: 20, 
                  borderRadius: "50%", 
                  bgcolor: auth.currentUser?.phoneNumber ? "success.main" : "error.main",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontSize: 14
                }}
              >
                {auth.currentUser?.phoneNumber ? "✓" : "!"}
              </Box>
              <Typography variant="body2" fontWeight={600}>
                {t("dashboard.account.verification.phone", { defaultValue: "Phone Verified" })}
              </Typography>
            </Box>
          </Stack>
        </AccordionDetails>
      </Accordion>

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
