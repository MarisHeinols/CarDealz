import {
  Box,
  Card,
  CardContent,
  Stack,
  Typography,
  Avatar,
} from "@mui/material";
import type { StoreTheme } from "~/redux/slices/storeSettingsSlice";
import { useTranslation } from "react-i18next";

type Review = {
  id: string | number;
  name: string;
  avatar?: string;
  date: string;
  text: string;
};

type Props = {
  theme: StoreTheme;
  reviews: Review[];
};

export function PreviewReviews({ theme, reviews }: Props) {
  const { t } = useTranslation();
  return (
    <Box sx={{ mt: 3 }}>
      <Typography
        variant="h6"
        fontWeight={700}
        sx={{
          mb: 2,
          color: theme.isTextLight ? "white" : theme.heading || "text.primary",
        }}
      >
        {t("reviews.customer_reviews")}
      </Typography>
      {reviews.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ color: theme.isTextLight ? "rgba(255,255,255,0.7)" : "text.secondary" }}>
          {t("reviews.none")}
        </Typography>
      ) : null}
      <Stack spacing={2}>
        {reviews.slice(0, 2).map((r) => (
          <Card
            key={String(r.id)}
            variant="outlined"
            sx={{
              bgcolor: theme.secondary || "",
              color: theme.isTextLight ? "white" : "black",
            }}
          >
            <CardContent>
              <Stack direction="row" spacing={2}>
                <Avatar src={r.avatar} sx={{ width: 36, height: 36 }} />
                <Box>
                  <Typography fontWeight={600} variant="body2">
                    {r.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {r.date}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 0.5 }}>
                    {r.text}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Stack>
    </Box>
  );
}
