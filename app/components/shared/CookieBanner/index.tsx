import React, { useState, useEffect } from "react";
import { Box, Paper, Typography, Button, Stack, Link } from "@mui/material";
import { useTranslation } from "react-i18next";
import { Link as RouterLink } from "react-router";

const COOKIE_CONSENT_KEY = "balticauto_cookie_consent";

const CookieBanner = () => {
  const { t } = useTranslation();
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, "true");
    setShowBanner(false);
  };

  const handleDecline = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, "false");
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <Paper
      elevation={10}
      sx={{
        position: "fixed",
        bottom: 24,
        left: "50%",
        transform: "translateX(-50%)",
        width: "90%",
        maxWidth: 600,
        p: 3,
        zIndex: 9999,
        borderRadius: 4,
        border: "1px solid rgba(0,0,0,0.1)",
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        backdropFilter: "blur(10px)",
      }}
    >
      <Stack spacing={2}>
        <Box>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>
            🍪 {t("cookies.title", "Cookies & Privacy")}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t(
              "cookies.message",
              "We use cookies to improve your experience, analyze traffic, and ensure security. By clicking \"Accept\", you consent to our use of cookies.",
            )}{" "}
            <Link component={RouterLink} to="/privacy-policy" sx={{ fontWeight: 600 }}>
              {t("cookies.learn_more", "Learn more in our Privacy Policy")}
            </Link>
          </Typography>
        </Box>
        <Stack direction="row" spacing={2} justifyContent="flex-end">
          <Button variant="text" size="small" onClick={handleDecline} sx={{ color: "text.secondary" }}>
            {t("cookies.decline", "Essential Only")}
          </Button>
          <Button variant="contained" size="small" onClick={handleAccept} sx={{ px: 3 }}>
            {t("cookies.accept", "Accept All")}
          </Button>
        </Stack>
      </Stack>
    </Paper>
  );
};

export default CookieBanner;
