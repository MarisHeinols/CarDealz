import {
  Box,
  Typography,
  Rating,
  Avatar,
  Stack,
  Button,
  Card,
  CardContent,
} from "@mui/material";
import { useState } from "react";
import StoreReviewsModal from "../StoreReviewModal";
import { useStorefrontSettings } from "~/hooks/useStorefrontSettings";

const StoreReviewsPreview = ({ reviews }: { reviews: any[] }) => {
  const [open, setOpen] = useState(false);

  const preview = reviews.slice(0, 3); // show only first 3 reviews
  const theme = useStorefrontSettings().theme;

  return (
    <Box>
      <Typography
        variant="h5"
        fontWeight={700}
        sx={{ my: 2, color: theme.isTextLight ? "white" : "black" }}
      >
        Customer Reviews
      </Typography>

      <Stack spacing={2}>
        {preview.map((r) => (
          <Card
            key={r.id}
            variant="outlined"
            sx={{
              bgcolor: theme.secondary || "",
              color: theme.isTextLight ? "white" : "black",
            }}
          >
            <CardContent>
              <Stack direction="row" spacing={2}>
                <Avatar src={r.avatar} />

                <Box>
                  <Typography fontWeight={600}>{r.name}</Typography>
                  <Rating value={r.rating} readOnly size="small" />
                  <Typography variant="body2" color="text.secondary">
                    {r.date}
                  </Typography>
                  <Typography sx={{ mt: 1 }}>{r.text}</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Stack>

      <Box sx={{ mt: 2 }}>
        <Button
          variant="outlined"
          onClick={() => setOpen(true)}
          sx={{
            borderColor: theme.accent || theme.primary || "",
            color: theme.accent || theme.primary || "",
          }}
        >
          View All Reviews ({reviews.length})
        </Button>
      </Box>

      <StoreReviewsModal
        open={open}
        onClose={() => setOpen(false)}
        reviews={reviews}
      />
    </Box>
  );
};

export default StoreReviewsPreview;
