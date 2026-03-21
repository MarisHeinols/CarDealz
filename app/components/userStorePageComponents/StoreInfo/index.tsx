import { Button, Paper, Typography, Stack, Divider, Box } from "@mui/material";
import { useTranslation } from "react-i18next";
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

const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const StoreInfo = ({ reviewStats, listingsCount, viewsCount }: Props) => {
  const { t } = useTranslation();
  const storeSettings = useStorefrontSettings();
  const theme = storeSettings.theme;
  const onCard = readableTextOn(theme.secondary || theme.background, "dark");
  const contact = storeSettings.contact;
  const location = storeSettings.location;
  const workTime = storeSettings.workTime;

  const formatCount = (n: number) => {
    if (n >= 1_000_000)
      return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, "")}k`;
    return String(n);
  };

  // Group identical consecutive days (e.g., Mon-Fri: 09:00 - 18:00)
  const groupedWorkTimes = () => {
    if (!workTime || typeof workTime !== "object") return null;

    const groups: { startDay: string; endDay: string; wt: any }[] = [];
    let currentGroup = null;

    for (const day of DAYS_OF_WEEK) {
      const wt = workTime[day];
      if (!wt) continue;

      if (!currentGroup) {
        currentGroup = { startDay: day, endDay: day, wt };
        groups.push(currentGroup);
      } else {
        const prevWt = currentGroup.wt;
        const isSame =
          prevWt.isClosed === wt.isClosed &&
          (wt.isClosed || (prevWt.open === wt.open && prevWt.close === wt.close));

        if (isSame) {
          currentGroup.endDay = day;
        } else {
          currentGroup = { startDay: day, endDay: day, wt };
          groups.push(currentGroup);
        }
      }
    }
    return groups;
  };

  const workGroups = groupedWorkTimes();

  return (
    <Paper sx={{ p: 3, bgcolor: theme.secondary, color: onCard.text }}>
      <Stack spacing={2}>
        <Stack spacing={1}>
          <Typography variant="body2" sx={{ color: onCard.text }}>
            <LocationOnIcon /> {location.adress || t("listing.noAddress")}
          </Typography>

          <Box
            sx={{
              color: onCard.text,
              display: "flex",
              alignItems: "flex-start",
              gap: 1,
            }}
          >
            <AccessTimeIcon fontSize="small" />
            <Box>
              <Typography variant="body2" fontWeight={600}>
                {t("listing.hours")}
              </Typography>
              {workGroups ? (
                workGroups.map((g, idx) => {
                  const startTrans = t(`days.${g.startDay.toLowerCase().slice(0, 3)}`, { defaultValue: g.startDay.slice(0, 3) });
                  const endTrans = t(`days.${g.endDay.toLowerCase().slice(0, 3)}`, { defaultValue: g.endDay.slice(0, 3) });
                  const dayLabel = g.startDay === g.endDay ? startTrans : `${startTrans}-${endTrans}`;
                  
                  return (
                    <Typography
                      key={idx}
                      variant="caption"
                      sx={{ display: "block" }}
                    >
                      {dayLabel}: {g.wt.isClosed ? t("common.closed") : `${g.wt.open} - ${g.wt.close}`}
                    </Typography>
                  );
                })
              ) : (
                <Typography variant="body2">{String(workTime)}</Typography>
              )}
            </Box>
          </Box>

          <Typography variant="body2" sx={{ color: onCard.text }}>
            <PhoneIcon /> {contact.phone || t("listing.noPhone")}
          </Typography>

          <Typography variant="body2" sx={{ color: onCard.text }}>
            <EmailIcon /> {contact.email || t("listing.noEmail")}
          </Typography>
        </Stack>

        <Button
          variant="contained"
          fullWidth
          sx={{
            bgcolor: theme.accent || theme.primary,
            "&:hover": {
              bgcolor: theme.accent || theme.primary,
              filter: "brightness(0.92)",
            },
          }}
        >
          {t("listing.contactSeller")}
        </Button>

        <Divider />

        <Stack direction="row" spacing={3}>
          <Typography variant="body2" sx={{ color: onCard.text }}>
            <strong>
              {typeof listingsCount === "number" ? listingsCount : 0}
            </strong>{" "}
            {t("nav.listings").toLowerCase()}
          </Typography>
          <Typography variant="body2" sx={{ color: onCard.text }}>
            <strong>
              {typeof viewsCount === "number" ? formatCount(viewsCount) : "0"}
            </strong>{" "}
            {t("businesses.table.views").toLowerCase()}
          </Typography>
          {reviewStats ? (
            <Typography variant="body2" sx={{ color: onCard.text }}>
              <strong>{reviewStats.count}</strong> {t("businesses.table.reviews").toLowerCase()}
            </Typography>
          ) : null}
        </Stack>
      </Stack>
    </Paper>
  );
};

export default StoreInfo;
