import { Button, Paper, Typography, Stack, Divider, Box, Rating } from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PhoneIcon from "@mui/icons-material/Phone";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import EmailIcon from "@mui/icons-material/Email";
import { useStorefrontSettings } from "~/hooks/useStorefrontSettings";
import { readableTextOn } from "~/utils/color";

type Props = {
  reviewStats?: { avg: number; count: number } | null;
  listingsCount?: number;
  viewsCount?: number;
};

const StoreInfo = ({ reviewStats, listingsCount, viewsCount }: Props) => {
  const storeSettings = useStorefrontSettings();
  const theme = storeSettings.theme;
  const onCard = readableTextOn(theme.secondary || theme.background, "dark");
  const contact = storeSettings.contact;
  const location = storeSettings.location;
  const workTime = storeSettings.workTime;

  const formatCount = (n: number) => {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, "")}k`;
    return String(n);
  };

  return (
    <Paper sx={{ p: 3, bgcolor: theme.secondary, color: onCard.text }}>
      <Stack spacing={2}>
        <Stack spacing={1}>
          <Typography
            variant="body2"
            sx={{ color: onCard.text }}
          >
            <LocationOnIcon /> {location.adress || "No adress"}
          </Typography>

          <Box
            sx={{ color: onCard.text, display: "flex", alignItems: "flex-start", gap: 1 }}
          >
            <AccessTimeIcon fontSize="small" />
            <Box>
              <Typography variant="body2" fontWeight={600}>
                Hours
              </Typography>
              {workTime && typeof workTime === 'object' ? (
                Object.entries(workTime).map(([day, wt]) => (
                  <Typography key={day} variant="caption" sx={{ display: "block" }}>
                    {day.slice(0, 3)}: {wt.isClosed ? "Closed" : `${wt.open} - ${wt.close}`}
                  </Typography>
                ))
              ) : (
                <Typography variant="body2">{String(workTime)}</Typography>
              )}
            </Box>
          </Box>

          <Typography
            variant="body2"
            sx={{ color: onCard.text }}
          >
            <PhoneIcon /> {contact.phone || "No phone"}
          </Typography>

          <Typography
            variant="body2"
            sx={{ color: onCard.text }}
          >
            <EmailIcon /> {contact.email || "No email"}
          </Typography>
        </Stack>

        <Button
          variant="contained"
          fullWidth
          sx={{
            bgcolor: theme.accent || theme.primary,
            "&:hover": { bgcolor: theme.accent || theme.primary, filter: "brightness(0.92)" },
          }}
        >
          Contact Seller
        </Button>

        <Divider />

        <Stack direction="row" spacing={3}>
          <Typography
            variant="body2"
            sx={{ color: onCard.text }}
          >
            <strong>{typeof listingsCount === "number" ? listingsCount : 0}</strong> listings
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: onCard.text }}
          >
            <strong>{typeof viewsCount === "number" ? formatCount(viewsCount) : "0"}</strong> views
          </Typography>
          {reviewStats && reviewStats.count >= 5 ? (
            <Stack direction="row" spacing={0.75} alignItems="center">
              <Rating value={reviewStats.avg} readOnly precision={0.1} size="small" />
              <Typography
                variant="body2"
                sx={{ color: onCard.text }}
              >
                <strong>{reviewStats.avg.toFixed(1)}</strong>
                <span style={{ opacity: 0.8 }}> ({reviewStats.count})</span>
              </Typography>
            </Stack>
          ) : null}
        </Stack>
      </Stack>
    </Paper>
  );
};

export default StoreInfo;
