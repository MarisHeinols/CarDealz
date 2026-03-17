import { Box, Card, CardContent, Rating, Stack, Typography, Avatar } from "@mui/material";
import type { StoreTheme } from "~/redux/slices/storeSettingsSlice";

type Review = {
  id: string | number;
  name: string;
  avatar?: string;
  rating: number;
  date: string;
  text: string;
};

type Props = {
  theme: StoreTheme;
  reviews: Review[];
};

export function PreviewReviews({ theme, reviews }: Props) {
  return (
    <Box sx={{ mt: 3 }}>
      <Typography
        variant="h6"
        fontWeight={700}
        sx={{
          mb: 2,
          color: theme.isTextLight ? "white" : (theme.heading || "text.primary"),
        }}
      >
        Customer Reviews
      </Typography>
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
                  <Rating value={r.rating} readOnly size="small" />
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

