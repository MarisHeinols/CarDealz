import { Grid } from "@mui/material";
import ListingCard from "~/components/shared/ListingCard";
import type { CarListingSummary } from "~/types/types";

interface Props {
  listings: CarListingSummary[];
}

const StoreListingsGrid = ({ listings }: Props) => {
  return (
    <Grid container spacing={3}>
      {listings.map((listing) => (
        <Grid key={listing.id} size={{ xs: 12, sm: 6, lg: 3 }}>
          <ListingCard listing={listing} />
        </Grid>
      ))}
    </Grid>
  );
};

export default StoreListingsGrid;
