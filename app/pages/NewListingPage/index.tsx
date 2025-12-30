import { Typography } from "@mui/material";
import React from "react";
import NewListingForm from "~/components/newListingPageComponents/NewListingForm";
import styles from "./NewListingPage.module.css";

const NewListingPage = () => {
  return (
    <div className={styles.content}>
      <Typography variant="h5" sx={{ alignSelf: "flex-start" }}>
        New Listing
      </Typography>
      <NewListingForm />
    </div>
  );
};

export default NewListingPage;
