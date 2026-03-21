import { Typography } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import NewListingForm from "~/components/newListingPageComponents/NewListingForm";
import AppContainer from "~/components/shared/AppContainer";

const NewListingPage = () => {
  const { t } = useTranslation();
  return (
    <AppContainer sx={{ py: 4 }}>
      <Typography variant="h5" fontWeight={800} sx={{ mb: 2 }}>
        {t("nav.newListing")}
      </Typography>
      <NewListingForm />
    </AppContainer>
  );
};

export default NewListingPage;
