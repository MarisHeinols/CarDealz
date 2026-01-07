import { Box, Button, Typography } from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { useState } from "react";
import StorePreview from "~/components/adminDashboardPageComponents/StorePreview";
import AdminSettingsPanel from "~/components/adminDashboardPageComponents/AdminSettingsPanel";

const PANEL_WIDTH = 360;
const COLLAPSED_WIDTH = 48;

const AdminDashboardPage = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Box
      sx={{
        height: "100vh",
        width: "85%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box
        sx={{
          px: 3,
          py: 1,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexShrink: 0,
        }}
      >
        <Typography variant="h5">Store Customization</Typography>
      </Box>

      {/* MAIN AREA */}
      <Box sx={{ flex: 1, position: "relative", display: "flex" }}>
        {/* LEFT — CENTERED PREVIEW (INSIDE 85% CONTAINER) */}
        <Box
          sx={{
            flex: 1,
            display: "flex",
            justifyContent: "center",
            overflowY: "auto",
            transition: "margin-right 0.2s ease",
            mr: collapsed ? `${COLLAPSED_WIDTH}px` : `${PANEL_WIDTH}px`,
          }}
        >
          {" "}
          <Box
            sx={{
              width: collapsed ? "90%" : "80%",
              mx: "auto",
              maxWidth: "1100px",
              transition: "width 0.2s ease",
            }}
          >
            {" "}
            <StorePreview />{" "}
          </Box>{" "}
        </Box>

        {/* RIGHT — SETTINGS PANEL (OUTSIDE 85% WRAPPER!) */}
        <Box
          sx={{
            position: "fixed",
            top: 0,
            height: "100vh",
            right: 0,
            width: collapsed ? COLLAPSED_WIDTH : PANEL_WIDTH,
            borderLeft: "1px solid",
            borderColor: "divider",
            bgcolor: "background.paper",
            overflowY: collapsed ? "hidden" : "auto",
            transition: "width 0.2s ease",
            display: "flex",
            flexDirection: "column",
            zIndex: 1,
            boxShadow: "-4px 0 10px rgba(0,0,0,0.05)",
            pt: "5rem",
          }}
        >
          {/* COLLAPSE BUTTON */}
          <Box
            sx={{
              display: "flex",
              justifyContent: collapsed ? "center" : "flex-start",
              alignItems: "center",
              p: 1,
            }}
          >
            <Button
              size="small"
              variant="outlined"
              startIcon={collapsed ? <SettingsIcon /> : <ChevronRightIcon />}
              onClick={() => setCollapsed(!collapsed)}
              sx={{
                minWidth: collapsed ? "40px" : "auto",
                px: collapsed ? 1 : 2,
                "& .MuiButton-startIcon": {
                  marginRight: collapsed ? 0 : "8px",
                },
              }}
            >
              {" "}
              {!collapsed && "Settings"}{" "}
            </Button>
          </Box>

          {/* SETTINGS CONTENT */}
          {!collapsed && (
            <Box sx={{ p: 2 }}>
              <AdminSettingsPanel />
              <Button variant="contained" fullWidth sx={{ mt: 4 }}>
                Publish Changes
              </Button>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default AdminDashboardPage;
