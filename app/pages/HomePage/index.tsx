import React from "react";
import Listings from "~/components/homePageComponents/Listings";
import styles from "./HomePage.module.css";
const HomePage = () => {
  return (
    <div className={styles.content}>
      <Listings />
    </div>
  );
};

export default HomePage;
