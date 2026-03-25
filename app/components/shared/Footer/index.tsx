import React from "react";
import { Box, Container, Typography, Link, Grid, Stack } from "@mui/material";
import { useTranslation } from "react-i18next";
import { Link as RouterLink } from "react-router";

const Footer = () => {
  const { t } = useTranslation();
  const controllerRegValue = t("legal.data_controller_reg_value", "").trim();

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
        <Grid container spacing={4}>

          {/* Col 1 — Brand */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Typography variant="h6" fontWeight={800} color="text.primary" gutterBottom>
              BalticAuto
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t("footer.tagline", "The best place to buy or sell your car.")}
            </Typography>
          </Grid>

          {/* Col 2 — Nav links (flex-wrap, no overflow) */}
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Typography variant="subtitle2" fontWeight={700} color="text.primary" gutterBottom>
              {t("footer.links_title", "Links")}
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: "10px 20px" }}>
              {[
                { label: t("footer.home", "Home"), to: "/" },
                { label: t("footer.about", "About Us"), to: "/about" },
                { label: t("footer.terms", "Terms of Service"), to: "/terms-of-service" },
                { label: t("footer.privacy", "Privacy Policy"), to: "/privacy-policy" },
                { label: t("footer.cookie_policy", "Cookie Policy"), to: "/privacy-policy#cookie-policy" },
                { label: t("footer.data_deletion", "Data Deletion"), to: "/privacy-policy#data-deletion" },
              ].map(({ label, to }) => (
                <Link
                  key={to}
                  component={RouterLink}
                  to={to}
                  variant="body2"
                  color="text.secondary"
                  underline="hover"
                  sx={{ whiteSpace: "nowrap" }}
                >
                  {label}
                </Link>
              ))}
              <Link
                component="button"
                type="button"
                variant="body2"
                color="text.secondary"
                underline="hover"
                onClick={() => window.dispatchEvent(new Event("balticauto:open-cookie-settings"))}
                sx={{ cursor: "pointer", background: "none", border: 0, p: 0, font: "inherit", whiteSpace: "nowrap" }}
              >
                {t("footer.cookie_settings", "Cookie Settings")}
              </Link>
            </Box>
          </Grid>

          {/* Col 3 — GDPR / Data Controller */}
          <Grid size={{ xs: 12, sm: 12, md: 5 }}>
            <Typography variant="subtitle2" fontWeight={700} color="text.primary" gutterBottom>
              {t("legal.data_controller_title", "Data Controller (GDPR)")}
            </Typography>
            <Stack spacing={0.5}>
              <Typography variant="body2" color="text.secondary">
                {t("legal.data_controller_name", "Maris Heinols (self-employed)")}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t("legal.data_controller_email_label", "Email")}:{" "}
                <Link color="inherit" underline="hover" href="mailto:support@baltic-auto.net">
                  support@baltic-auto.net
                </Link>
              </Typography>
              {controllerRegValue && (
                <Typography variant="body2" color="text.secondary">
                  {t("legal.data_controller_reg_label", "Registration number")}: {controllerRegValue}
                </Typography>
              )}
              <Typography variant="body2" color="text.secondary">
                {t("legal.data_controller_dpo_label", "Data Protection")}:{" "}
                <Link color="inherit" underline="hover" href="mailto:support@baltic-auto.net">
                  support@baltic-auto.net
                </Link>
              </Typography>
            </Stack>
          </Grid>
        </Grid>

        {/* Copyright bar */}
        <Box mt={5} pt={3} borderTop="1px solid" borderColor="divider">
          <Typography variant="body2" color="text.secondary" align="center">
            {t("footer.copyright", "Copyright")} {"\u00A9 "}
            <Link color="inherit" href="https://baltic-auto.net/">BalticAuto</Link>{" "}
            {new Date().getFullYear()}.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
