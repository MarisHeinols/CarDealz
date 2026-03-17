import React from "react";
import Listings from "~/components/homePageComponents/Listings";
import AppContainer from "~/components/shared/AppContainer";
const HomePage = () => {
  return (
    <AppContainer sx={{ py: 4 }}>
      <Listings />
    </AppContainer>
  );
};

export default HomePage;
