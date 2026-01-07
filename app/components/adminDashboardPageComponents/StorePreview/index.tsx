import { Container, Grid, Box } from "@mui/material";
import StoreHeader from "~/components/userStorePageComponents/StoreHeader";
import StoreInfo from "~/components/userStorePageComponents/StoreInfo";
import StoreMap from "~/components/userStorePageComponents/StoreMap";
import { useAppSelector } from "~/redux/hooks";

const StorePreview = () => {
  const theme = useAppSelector((state) => state.storeSettings.theme);
  return (
    <Box sx={{ py: 3 }}>
      <Container maxWidth="xl">
        <StoreHeader />
        <Grid container spacing={3} sx={{ mt: 1 }}>
          <Grid size={{ xs: 12 }} sx={{ md: 5 }}>
            <StoreInfo theme={theme} isPreview={true} />
          </Grid>
          <Grid size={{ xs: 12 }} sx={{ md: 7 }}>
            <StoreMap />
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default StorePreview;
