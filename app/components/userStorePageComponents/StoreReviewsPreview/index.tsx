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

const StoreReviewsPreview = ({ reviews }: { reviews: any[] }) => {
  const [open, setOpen] = useState(false);

  const preview = reviews.slice(0, 3); // show only first 3 reviews

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 2 }}>
        Customer Reviews
      </Typography>

      <Stack spacing={2}>
        {preview.map((r) => (
          <Card key={r.id} variant="outlined">
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
        <Button variant="outlined" onClick={() => setOpen(true)}>
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
