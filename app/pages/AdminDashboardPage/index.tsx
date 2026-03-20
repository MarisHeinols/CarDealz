import { useEffect, useState } from "react";
import { Box, Grid, Typography, Tabs, Tab } from "@mui/material";
import { useTranslation } from "react-i18next";
import StorePreview from "~/components/adminDashboardPageComponents/StorePreview";
import AdminSettingsPanel from "~/components/adminDashboardPageComponents/AdminSettingsPanel";
import AppContainer from "~/components/shared/AppContainer";
import BusinessAnalytics from "~/components/adminDashboardPageComponents/BusinessAnalytics";
import LeadsPanel from "~/components/adminDashboardPageComponents/LeadsPanel";
import { useLocation } from "react-router";

const AdminDashboardPage = () => {
  const { t } = useTranslation();
  const [tabIndex, setTabIndex] = useState(0);
  const location = useLocation();

  useEffect(() => {
    const idx = (location.state as any)?.tabIndex;
    if (typeof idx === "number" && idx >= 0 && idx <= 2) {
      setTabIndex(idx);
    }
  }, [location.state]);

  return (
    <AppContainer sx={{ py: 4 }}>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 700 }}>
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
          <Tab label={t("dashboard.tabs.store_editor")} />
          <Tab label={t("dashboard.tabs.leads")} />
        </Tabs>
      </Box>

      {tabIndex === 0 && <BusinessAnalytics />}

      {tabIndex === 1 && (
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
      )}

      {tabIndex === 2 && <LeadsPanel />}
    </AppContainer>
  );
};

export default AdminDashboardPage;
