import { Box, Grid, Typography } from "@mui/material";
import StorePreview from "~/components/adminDashboardPageComponents/StorePreview";
import AdminSettingsPanel from "~/components/adminDashboardPageComponents/AdminSettingsPanel";
import AppContainer from "~/components/shared/AppContainer";

const AdminDashboardPage = () => {
  return (
    <AppContainer sx={{ py: 4 }}>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 700 }}>
        Store Editor
      </Typography>

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
    </AppContainer>
  );
};

export default AdminDashboardPage;
