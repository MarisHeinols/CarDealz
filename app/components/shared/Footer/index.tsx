import React from "react";
import { Box, Container, Typography, Link, Grid, Stack } from "@mui/material";
import { useTranslation } from "react-i18next";
import { Link as RouterLink } from "react-router";

const Footer = () => {
  const { t } = useTranslation();

  return (
    <Box
      component="footer"
      sx={{
        bgcolor: "background.paper",
        py: 6,
        borderTop: "1px solid",
        borderColor: "divider",
        mt: "auto",
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4} justifyContent="space-between">
          <Grid size={{ xs: 12, sm: 4 }}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              BalticAuto
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t("footer.tagline", "The best place to buy or sell your car.")}
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 8 }}>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={{ xs: 2, sm: 4 }}
              justifyContent="flex-end"
            >
              <Link
                component={RouterLink}
                to="/"
                color="inherit"
                underline="hover"
              >
                {t("footer.home", "Home")}
              </Link>
              <Link
                component={RouterLink}
                to="/about"
                color="inherit"
                underline="hover"
              >
                {t("footer.about", "About Us")}
              </Link>
              <Link
                component={RouterLink}
                to="/terms-of-service"
                color="inherit"
                underline="hover"
              >
                {t("footer.terms", "Terms of Service")}
              </Link>
              <Link
                component={RouterLink}
                to="/privacy-policy"
                color="inherit"
                underline="hover"
              >
                {t("footer.privacy", "Privacy Policy")}
              </Link>
            </Stack>
          </Grid>
        </Grid>
        <Box mt={5}>
          <Typography variant="body2" color="text.secondary" align="center">
            {"Copyright \u00A9 "}
            <Link color="inherit" href="https://baltic-auto.net/">
              BalticAuto
            </Link>{" "}
            {new Date().getFullYear()}
            {"."}
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
