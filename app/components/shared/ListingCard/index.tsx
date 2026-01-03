import {
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Typography,
  Stack,
  Chip,
  Box,
} from "@mui/material";
import type { CarListingSummary } from "~/types/types";

const conditionVariantMap = {
  new: "levelHigh",
  certified: "levelMedium",
  used: "levelLow",
} as const;

const ListingCard = ({ listing }: { listing: CarListingSummary }) => {
  return (
    <Card sx={{ height: "100%" }}>
      <CardActionArea sx={{ height: "100%" }}>
        {/* Image */}
        <Box sx={{ position: "relative" }}>
          <CardMedia
            component="img"
            image={listing.thumbnailUrl}
            alt={`${listing.make} ${listing.model}`}
            sx={{
              width: "100%",
              aspectRatio: "4 / 3",
              objectFit: "cover",
            }}
          />

          {/* Condition badge */}
          <Chip
            label={listing.condition}
            size="small"
            variant={conditionVariantMap[listing.condition]}
            sx={{
              position: "absolute",
              top: 8,
              left: 8,

              backgroundColor: "rgba(255,255,255,0.85)",
              backdropFilter: "blur(6px)",
              border: "1px solid rgba(0,0,0,0.08)",
              boxShadow: "0 1px 4px rgba(0,0,0,0.12)",
            }}
          />
        </Box>

        {/* Content */}
        <CardContent sx={{ pb: 2 }}>
          <Stack spacing={0.5}>
            <Typography
              variant="subtitle1"
              fontWeight={600}
              sx={{
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {listing.year} {listing.make} {listing.model}
            </Typography>

            <Typography variant="h6" color="primary" fontWeight={600}>
              ${listing.price.toLocaleString("en-US")}
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {listing.mileage.toLocaleString("en-US")} km • {listing.location}
            </Typography>
          </Stack>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default ListingCard;
