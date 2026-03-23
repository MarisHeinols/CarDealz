import { Grid } from "@mui/material";
import ListingCard from "~/components/shared/ListingCard";
import type { CarListingSummary } from "~/types/types";
import { useStorefrontSettings } from "~/hooks/useStorefrontSettings";

interface Props {
  listings: CarListingSummary[];
  isOwner?: boolean;
  onRefresh?: () => void;
}

const StoreListingsGrid = ({ listings, isOwner, onRefresh }: Props) => {
  const theme = useStorefrontSettings().theme;

  const getGridSize = () => {
    switch (theme.layout) {
      case "minimal":
        return { xs: 12, md: 12 };
      case "modern":
        return { xs: 12, sm: 6, md: 6, lg: 4 };
      case "classic":
      default:
        return { xs: 12, sm: 6, lg: 3 };
    }
  };

  return (
    <Grid container spacing={theme.layout === 'minimal' ? 4 : 3}>
      {listings.map((listing) => (
        <Grid key={listing.id} size={getGridSize()}>
          <ListingCard
            listing={listing}
            isOwner={isOwner}
            useStoreTheme
            storeThemeOverride={theme}
            onRefresh={onRefresh}
          />
        </Grid>
      ))}
    </Grid>
  );
};

export default StoreListingsGrid;
