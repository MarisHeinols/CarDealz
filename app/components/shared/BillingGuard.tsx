import React from "react";
import { Box, Typography, Button, Container, CircularProgress } from "@mui/material";
import { useBilling } from "~/hooks/useBilling";
import { Link as RouterLink } from "react-router";
import { useTranslation } from "react-i18next";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";

interface BillingGuardProps {
  children: React.ReactNode;
}

export default function BillingGuard({ children }: BillingGuardProps) {
  const { t } = useTranslation();
  const { loading, isBillingActive, billingStatus } = useBilling();

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={12}>
        <CircularProgress size={40} />
      </Box>
    );
  }

  if (!isBillingActive) {
    return (
      <Container maxWidth="sm" sx={{ py: 12, textAlign: "center" }}>
        <Box sx={{ mb: 4 }}>
          <ErrorOutlineIcon color="error" sx={{ fontSize: 64 }} />
        </Box>
        <Typography variant="h5" fontWeight={900} gutterBottom>
          {t("billing.required_title", { defaultValue: "Subscription Required" })}
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 4 }}>
          {billingStatus === "canceled" || !billingStatus 
            ? t("billing.no_plan_desc", { defaultValue: "Your current plan does not allow this action. Please subscribe to a business tier to continue." })
            : t("billing.overdue_desc", { defaultValue: "Your subscription is currently inactive or overdue. Please update your payment method." })
          }
        </Typography>
        <Button 
          variant="contained" 
          component={RouterLink} 
          to="/admin?tab=account"
          size="large"
          sx={{ px: 4 }}
        >
          {t("billing.manage_subscription", { defaultValue: "Manage Subscription" })}
        </Button>
      </Container>
    );
  }

  return <>{children}</>;
}
