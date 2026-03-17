import { Typography } from "@mui/material";
import React from "react";
import NewListingForm from "~/components/newListingPageComponents/NewListingForm";
import AppContainer from "~/components/shared/AppContainer";

const NewListingPage = () => {
  return (
    <AppContainer sx={{ py: 4 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        New Listing
      </Typography>
      <NewListingForm />
    </AppContainer>
  );
};

export default NewListingPage;
