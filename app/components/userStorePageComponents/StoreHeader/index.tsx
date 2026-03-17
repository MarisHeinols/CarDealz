import { Box, Avatar, Typography, Stack } from "@mui/material";
import { useStorefrontSettings } from "~/hooks/useStorefrontSettings";

const StoreHeader = () => {
  const storeSettings = useStorefrontSettings();

  return (
    <Box
      sx={{
        mb: 3,
        borderRadius: 2,
        overflow: "hidden",
        position: "relative",
      }}
    >
      {storeSettings.theme.layout === "minimal" && (
        <Box sx={{ p: 3, bgcolor: storeSettings.theme.secondary }}>
          <Stack direction="row" spacing={3} alignItems="center">
            <Avatar
              sx={{ width: 80, height: 80 }}
              src={storeSettings.logo ? storeSettings.logo : "/store-avatar.jpg"}
            />
            <Stack spacing={0}>
              <Typography variant="h5" fontWeight={700} color={storeSettings.theme.isTextLight ? "white" : "text.primary"}>
                {storeSettings.name}
              </Typography>
              <Typography variant="body1" color={storeSettings.theme.isTextLight ? "rgba(255,255,255,0.7)" : "text.secondary"}>
                {storeSettings.description}
              </Typography>
            </Stack>
          </Stack>
        </Box>
      )}

      {storeSettings.theme.layout === "modern" && (
        <Box
          sx={{
            height: 240,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            backgroundImage: storeSettings.bannerImage
              ? `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url(${storeSettings.bannerImage})`
              : `linear-gradient(135deg, ${storeSettings.theme.primary}, ${storeSettings.theme.accent})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            color: "white",
            p: 3,
          }}
        >
          <Avatar
            sx={{ width: 90, height: 90, border: "3px solid white", mb: 2, boxShadow: "0 4px 12px rgba(0,0,0,0.2)" }}
            src={storeSettings.logo ? storeSettings.logo : "/store-avatar.jpg"}
          />
          <Typography variant="h4" fontWeight={800} sx={{ textShadow: "0 2px 4px rgba(0,0,0,0.4)" }}>
            {storeSettings.name}
          </Typography>
          <Typography variant="body1" sx={{ mt: 1, opacity: 0.9, maxWidth: 600 }}>
            {storeSettings.description}
          </Typography>
        </Box>
      )}

      {(!storeSettings.theme.layout || storeSettings.theme.layout === "classic") && (
        <Box
          sx={{
            height: 180,
            backgroundImage: storeSettings.bannerImage
              ? `linear-gradient(rgba(0,0,0,0.35), rgba(0,0,0,0.35)), url(${storeSettings.bannerImage})`
              : `linear-gradient(135deg, ${storeSettings.theme.primary}, ${storeSettings.theme.accent})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            position: "relative",
          }}
        >
          {/* Identity strip */}
          <Box
            sx={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              px: 3,
              py: 2,
              backdropFilter: "blur(6px)",
              background: "linear-gradient(to top, rgba(0,0,0,0.45), rgba(0,0,0,0))",
            }}
          >
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar
                sx={{
                  width: 56,
                  height: 56,
                  border: "2px solid rgba(255,255,255,0.8)",
                }}
                src={storeSettings.logo ? storeSettings.logo : "/store-avatar.jpg"}
              />
              <Stack spacing={0}>
                <Typography variant="subtitle1" fontWeight={600} sx={{ color: "white" }}>
                  {storeSettings.name}
                </Typography>
                <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.85)" }}>
                  {storeSettings.description}
                </Typography>
              </Stack>
            </Stack>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default StoreHeader;
