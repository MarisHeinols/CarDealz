import { Box, Avatar, Typography, Stack } from "@mui/material";

const StoreHeader = () => {
  const coverImage = "/store-cover.jpg"; // optional / user-uploaded

  return (
    <Box
      sx={{
        height: 180,
        mb: 3,
        borderRadius: 2,
        overflow: "hidden",
        position: "relative",
        backgroundImage: coverImage
          ? `linear-gradient(
              rgba(0,0,0,0.35),
              rgba(0,0,0,0.35)
            ), url(${coverImage})`
          : "linear-gradient(135deg, #7a0081, #a855f7)",
        backgroundSize: "cover",
        backgroundPosition: "center",
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
          background:
            "linear-gradient(to top, rgba(0,0,0,0.45), rgba(0,0,0,0))",
        }}
      >
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar
            sx={{
              width: 56,
              height: 56,
              border: "2px solid rgba(255,255,255,0.8)",
            }}
            src="/store-avatar.jpg"
          />

          <Stack spacing={0}>
            <Typography
              variant="subtitle1"
              fontWeight={600}
              sx={{ color: "white" }}
            >
              John’s Auto Store
            </Typography>

            <Typography
              variant="caption"
              sx={{ color: "rgba(255,255,255,0.85)" }}
            >
              Trusted dealer • Since 2018
            </Typography>
          </Stack>
        </Stack>
      </Box>
    </Box>
  );
};

export default StoreHeader;
