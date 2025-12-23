import React from "react";
import {
  Box,
  Chip,
  Divider,
  Grid,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import listingsJson from "../../data/mockData/carListingsDetails.json";
import ImageCarousel from "~/components/listingPageComponents/ImageCarousel";
import SpecSheet from "~/components/listingPageComponents/SpecSheet";
import MarketValueBar from "~/components/listingPageComponents/MarketValueBar";
import VisibilityIcon from "@mui/icons-material/Visibility";
import SellerCard from "~/components/listingPageComponents/SellerCard";
import { parseCarListingDetails } from "~/data/mockData/parsers/carListingDetailsParser";
import DetailsCard from "~/components/listingPageComponents/DetailsCard";
import SpecLevelChip from "~/components/listingPageComponents/SpecLevelChip";
import {
  calculateSpecScore,
  getSpecLevel,
} from "~/components/listingPageComponents/SpecLevelChip/helper/helper";

type Props = {
  id: string;
};

const ListingPage = ({ id }: Props) => {
  const listings = parseCarListingDetails(listingsJson);
  const car = listings.find((c) => c.id === id);

  if (!car) {
    return <Typography>Car not found</Typography>;
  }

  const specScore = calculateSpecScore(car.features);
  const specLevel = getSpecLevel(specScore);

  return (
    <Box p={4}>
      <Grid container spacing={4}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Stack spacing={2}>
            <Paper variant="outlined" sx={{ p: 3, height: 450 }}>
              <Stack
                direction={"row"}
                alignItems={"center"}
                justifyContent={"space-between"}
              >
                <Typography variant="h4" fontWeight={600}>
                  {car.year} {car.make} {car.model}
                </Typography>

                <Typography variant="body2" color="text.secondary">
                  <VisibilityIcon sx={{ mr: 0.5 }} />
                  {car.viewCount} views
                </Typography>
              </Stack>

              <Typography variant="h5" color="primary">
                ${car.price.toLocaleString("en-US")}
              </Typography>

              <Stack direction="row" spacing={1}>
                <Chip label={car.condition} />
                <Chip label={car.location} />
                <Chip label={car.seller.isDealer ? "Dealer" : "Private"} />
              </Stack>

              <MarketValueBar price={car.price} marketRange={car.marketRange} />
              <DetailsCard listing={car} />
            </Paper>
          </Stack>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <ImageCarousel images={car.images.map((img) => img.url)} />{" "}
        </Grid>
      </Grid>

      <Box mt={3}>
        <Typography variant="h6" mb={1}>
          Description
        </Typography>
        <Paper variant="outlined" sx={{ p: 3, width: "100%", height: 300 }}>
          <Typography variant="body2" color="text.secondary">
            {car.description}
          </Typography>
        </Paper>
      </Box>

      <Box mt={3}>
        <Stack direction="row" spacing={1} alignItems="center" mb={2}>
          <Typography variant="h5">Specifications & Features</Typography>

          <SpecLevelChip level={specLevel} />
        </Stack>
        <SpecSheet features={car.features} />
      </Box>

      {/* Seller */}
      <Box mt={6}>
        <Typography variant="h5" mb={2}>
          Seller Information
        </Typography>
        <SellerCard seller={car.seller} />
      </Box>
    </Box>
  );
};

export default ListingPage;
