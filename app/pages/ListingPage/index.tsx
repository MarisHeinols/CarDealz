import React from "react";
import { Box, Chip, Divider, Grid, Stack, Typography } from "@mui/material";
import listingsJson from "../../data/mockData/carListingsDetails.json";
import ImageCarousel from "~/components/listingPageComponents/ImageCarousel";
import SpecSheet from "~/components/listingPageComponents/SpecSheet";
import MarketValueBar from "~/components/listingPageComponents/MarketValueBar";
import VisibilityIcon from "@mui/icons-material/Visibility";
import SellerCard from "~/components/listingPageComponents/SellerCard";
import { parseCarListingDetails } from "~/data/mockData/parsers/carListingDetailsParser";

type Props = {
  id: string;
};

const ListingPage = ({ id }: Props) => {
  const listings = parseCarListingDetails(listingsJson);
  const car = listings.find((c) => c.id === id);

  if (!car) {
    return <Typography>Car not found</Typography>;
  }

  return (
    <Box p={4}>
      <Grid container spacing={4}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Stack spacing={2}>
            <Typography variant="h4" fontWeight={600}>
              {car.year} {car.make} {car.model}
            </Typography>

            <Typography variant="h5" color="primary">
              ${car.price.toLocaleString("en-US")}
            </Typography>

            <Stack direction="row" spacing={1}>
              <Chip label={car.condition.toUpperCase()} />
              <Chip label={car.color} />
              <Chip label={car.location} />
            </Stack>

            <Divider />

            <Typography>
              Mileage:{" "}
              <strong>{car.mileage.toLocaleString("en-US")} miles</strong>
            </Typography>

            <MarketValueBar price={car.price} marketRange={car.marketRange} />

            <Divider />

            <Box>
              <Typography variant="h6" mb={1}>
                Description
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {car.description}
              </Typography>
            </Box>
          </Stack>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <ImageCarousel images={car.images.map((img) => img.url)} />{" "}
        </Grid>
      </Grid>

      <Box mt={6}>
        <Typography variant="h5" mb={2}>
          Specifications & Features
        </Typography>
        <SpecSheet features={car.features} />
      </Box>

      {/* Seller */}
      <Box mt={6}>
        <Typography variant="h5" mb={2}>
          Seller Information
        </Typography>
        <SellerCard seller={car.seller} />
      </Box>

      {/* Meta */}
      <Typography variant="body2" color="text.secondary" mt={3}>
        <VisibilityIcon sx={{ verticalAlign: "middle", mr: 0.5 }} />
        {car.viewCount} views
      </Typography>
    </Box>
  );
};

export default ListingPage;
