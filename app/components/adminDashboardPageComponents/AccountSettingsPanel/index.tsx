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
import { useUserProfile } from "~/hooks/userStore/useUserProfile";

const AccountSettingsPanel = () => {
  const { t } = useTranslation();
  const appDispatch = useAppDispatch();
  const navigate = useNavigate();
  const { profile, loading } = useUserProfile();

  const isVerified = Boolean(profile?.dealerVerified);
  const vStatus = profile?.dealerVerificationStatus || "pending";

  return (
    <Box sx={{ maxWidth: 800, mx: "auto", mt: 2 }}>
      <Typography variant="h6" fontWeight={800} sx={{ mb: 2 }}>
        {t("dashboard.account.title", { defaultValue: "Account Settings" })}
      </Typography>

      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography fontWeight={600}>
            {t("dashboard.account.verification.title", { defaultValue: "Verification Status" })}
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Stack spacing={2}>
            {/* Email Verification */}
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

            {/* Dealer Verification */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Box 
                sx={{ 
                  width: 20, 
                  height: 20, 
                  borderRadius: "50%", 
                  bgcolor: isVerified ? "success.main" : (vStatus === "rejected" ? "error.main" : "warning.main"),
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontSize: 14
                }}
              >
                {isVerified ? "✓" : (vStatus === "rejected" ? "✕" : "!")}
              </Box>
              <Box>
                <Typography variant="body2" fontWeight={600}>
                  {isVerified 
                    ? t("dashboard.account.verification.dealerVerified") 
                    : (vStatus === "rejected" 
                        ? t("dashboard.account.verification.rejected") 
                        : t("dashboard.account.verification.pending"))}
                </Typography>
              </Box>
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
