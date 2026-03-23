import { Typography } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import NewListingForm from "~/components/newListingPageComponents/NewListingForm";
import AppContainer from "~/components/shared/AppContainer";
import BillingGuard from "~/components/shared/BillingGuard";

const NewListingPage = () => {
  const { t } = useTranslation();
  return (
    <AppContainer sx={{ py: 4 }}>
      <Typography variant="h5" fontWeight={900} sx={{ mb: 2 }}>
        {t("nav.newListing")}
      </Typography>
      <BillingGuard>
        <NewListingForm />
      </BillingGuard>
    </AppContainer>
  );
};

export default NewListingPage;
