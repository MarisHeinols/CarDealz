import { useEffect, useState, Suspense, lazy } from "react";
import { Box, Grid, Typography, Tabs, Tab, CircularProgress } from "@mui/material";
import { useTranslation } from "react-i18next";
import AppContainer from "~/components/shared/AppContainer";
import BillingGuard from "~/components/shared/BillingGuard";
import { useSearchParams } from "react-router";

const BusinessAnalytics = lazy(() => import("~/components/adminDashboardPageComponents/BusinessAnalytics"));
const LeadsPanel = lazy(() => import("~/components/adminDashboardPageComponents/LeadsPanel"));
const StorePreview = lazy(() => import("~/components/adminDashboardPageComponents/StorePreview"));
const AdminSettingsPanel = lazy(() => import("~/components/adminDashboardPageComponents/AdminSettingsPanel"));
const AccountSettingsPanel = lazy(() => import("~/components/adminDashboardPageComponents/AccountSettingsPanel"));

const LoadingFallback = () => (
  <Box display="flex" justifyContent="center" py={8}>
    <CircularProgress size={32} />
  </Box>
);

const AdminDashboardPage = ({ mustVerify }: { mustVerify?: boolean }) => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const tabNames = ["analytics", "leads", "store", "account"];
  const currentTab = searchParams.get("tab") || "analytics";
  const tabIndex = mustVerify ? 3 : Math.max(0, tabNames.indexOf(currentTab));

  const setTabIndex = (newValue: number) => {
    setSearchParams({ tab: tabNames[newValue] }, { replace: true });
  };

  useEffect(() => {
    if (mustVerify && currentTab !== "account") {
      setTabIndex(3);
    }
  }, [mustVerify, currentTab]);

  return (
    <AppContainer sx={{ py: 4 }}>
      <Typography variant="h5" fontWeight={900} sx={{ mb: 3 }}>
        {t("dashboard.title")}
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 4 }}>
        <Tabs
          value={tabIndex}
          onChange={(_, v) => setTabIndex(v)}
          textColor="primary"
          indicatorColor="primary"
        >
          <Tab label={t("dashboard.tabs.analytics")} />
          <Tab label={t("dashboard.tabs.leads")} />
          <Tab label={t("dashboard.tabs.store_editor")} />
          <Tab label={t("dashboard.tabs.account", { defaultValue: "Account" })} />
        </Tabs>
      </Box>

      <Suspense fallback={<LoadingFallback />}>
        {tabIndex === 0 && (
          <BillingGuard>
            <BusinessAnalytics />
          </BillingGuard>
        )}

        {tabIndex === 1 && (
          <BillingGuard>
            <LeadsPanel />
          </BillingGuard>
        )}

        {tabIndex === 2 && (
          <BillingGuard>
            <Grid container spacing={3} alignItems="flex-start">
              {/* LEFT — full store preview */}
              <Grid size={{ xs: 12, md: 8 }}>
                <StorePreview />
              </Grid>

              {/* RIGHT — settings panel (sticky) */}
              <Grid size={{ xs: 12, md: 4 }} sx={{ mt: "0.2rem" }}>
                <Box
                  sx={{
                    position: "sticky",
                    top: 24,
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 2,
                    overflow: "hidden",
                    bgcolor: "background.paper",
                    boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                  }}
                >
                  <Box sx={{ p: 2 }}>
                    <AdminSettingsPanel />
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </BillingGuard>
        )}

        {tabIndex === 3 && <AccountSettingsPanel mustVerify={mustVerify} />}
      </Suspense>
    </AppContainer>
  );
};

export default AdminDashboardPage;
