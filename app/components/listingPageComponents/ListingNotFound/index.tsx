import React from "react";
import { Box, Typography, Button } from "@mui/material";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import HomeIcon from "@mui/icons-material/Home";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import AppContainer from "~/components/shared/AppContainer";

const ListingNotFound = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <AppContainer>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "70vh",
          textAlign: "center",
          p: 3,
        }}
      >
        <Box
          sx={{
            position: "relative",
            mb: 4,
            "&::after": {
              content: '""',
              position: "absolute",
              top: -20,
              left: -20,
              right: -20,
              bottom: -20,
              background: "radial-gradient(circle, rgba(25, 118, 210, 0.1) 0%, rgba(0,0,0,0) 70%)",
              zIndex: -1,
            }
          }}
        >
          <DirectionsCarIcon sx={{ fontSize: 80, color: "text.secondary", opacity: 0.5 }} />
        </Box>
        <Typography variant="h4" fontWeight={900} gutterBottom>
          {t("carValues.listingNotFound")}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 500 }}>
          {t("carValues.carNotFound")}
        </Typography>
        <Button
          variant="contained"
          size="large"
          onClick={() => navigate("/")}
          startIcon={<HomeIcon />}
          sx={{
            borderRadius: 8,
            textTransform: "none",
            px: 4,
            py: 1.5,
            fontWeight: 700,
            boxShadow: "0 8px 16px rgba(25, 118, 210, 0.24)",
            transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
            "&:hover": {
              transform: "translateY(-2px)",
              boxShadow: "0 12px 20px rgba(25, 118, 210, 0.32)",
            }
          }}
        >
          {t("carValues.backToHome")}
        </Button>
      </Box>
    </AppContainer>
  );
};

export default ListingNotFound;
