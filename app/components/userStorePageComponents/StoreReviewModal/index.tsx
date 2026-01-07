import {
  Dialog,
  DialogTitle,
  DialogContent,
  Stack,
  Avatar,
  Typography,
  Rating,
  Divider,
  Pagination,
  Box,
} from "@mui/material";
import { useState } from "react";

const REVIEWS_PER_PAGE = 5;

const StoreReviewsModal = ({
  open,
  onClose,
  reviews,
}: {
  open: boolean;
  onClose: () => void;
  reviews: any[];
}) => {
  const [page, setPage] = useState(1);

  const pageCount = Math.ceil(reviews.length / REVIEWS_PER_PAGE);
  const paginated = reviews.slice(
    (page - 1) * REVIEWS_PER_PAGE,
    page * REVIEWS_PER_PAGE
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>All Reviews</DialogTitle>

      <DialogContent dividers>
        <Stack spacing={3}>
          {paginated.map((r) => (
            <Box key={r.id}>
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

              <Divider sx={{ mt: 2 }} />
            </Box>
          ))}
        </Stack>

        {pageCount > 1 && (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
            <Pagination
              page={page}
              count={pageCount}
              onChange={(_, v) => setPage(v)}
            />
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default StoreReviewsModal;
