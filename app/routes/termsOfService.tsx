import React from "react";
import { Container, Typography, Box } from "@mui/material";
import { useTranslation } from "react-i18next";

export function meta() {
  return [
    { title: "Terms of Service | BalticAuto" },
    { name: "description", content: "The legal terms and conditions for using the BalticAuto platform." },
  ];
}

export default function TermsOfService() {
  const { t } = useTranslation();

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Typography variant="h3" component="h1" gutterBottom align="center" sx={{ fontWeight: 800 }}>
        {t("legal.tos_title", "Terms of Service")}
      </Typography>
      <Typography variant="body1" paragraph align="center" color="text.secondary" sx={{ mb: 6 }}>
        {t("legal.tos_intro", "By using BalticAuto, you agree to these legal terms. Please read them carefully before using our marketplace.")}
      </Typography>
      
      {[1, 2, 3, 4, 5, 6].map((idx) => (
        <Box key={idx} sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 700 }}>
            {t(`legal.tos_section${idx}_title`)}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {t(`legal.tos_section${idx}_text`)}
          </Typography>
        </Box>
      ))}

      <Typography variant="caption" display="block" sx={{ mt: 8, textAlign: "center", fontStyle: "italic" }}>
        {t("legal.last_updated", "Last updated: March 2026")}
      </Typography>
    </Container>
  );
}
