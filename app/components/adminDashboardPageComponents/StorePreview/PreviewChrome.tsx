import { Box, Chip, Typography } from "@mui/material";
import DesktopWindowsOutlinedIcon from "@mui/icons-material/DesktopWindowsOutlined";
import StorefrontIcon from "@mui/icons-material/Storefront";

export function PreviewChrome() {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        bgcolor: "grey.100",
        border: "1px solid",
        borderColor: "divider",
        borderBottom: "none",
        px: 2,
        py: 1,
        borderRadius: "12px 12px 0 0",
      }}
    >
      <Box sx={{ display: "flex", gap: 0.75 }}>
        {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
          <Box key={c} sx={{ width: 12, height: 12, borderRadius: "50%", bgcolor: c }} />
        ))}
      </Box>

      <Box
        sx={{
          flex: 1,
          bgcolor: "white",
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 1,
          px: 2,
          py: 0.4,
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        <StorefrontIcon sx={{ fontSize: 14, color: "text.secondary" }} />
        <Typography variant="caption" color="text.secondary" noWrap>
          cardealz.com / store / your-store
        </Typography>
      </Box>

      <DesktopWindowsOutlinedIcon sx={{ fontSize: 18, color: "text.secondary" }} />

      <Chip
        label="PREVIEW"
        size="small"
        sx={{
          fontSize: 10,
          height: 20,
          fontWeight: 700,
          bgcolor: "primary.main",
          color: "white",
          letterSpacing: 0.5,
        }}
      />
    </Box>
  );
}

