import React, { useState, useEffect } from "react";
import { Box, Paper, Typography, Button, Stack, Link } from "@mui/material";
import { useTranslation } from "react-i18next";
import { Link as RouterLink } from "react-router";
import CookieSettingsDialog from "~/components/shared/CookieSettingsDialog";

const COOKIE_CONSENT_KEY = "balticauto_cookie_consent";

const CookieBanner = () => {
  const { t } = useTranslation();
  const [showBanner, setShowBanner] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [consentValue, setConsentValue] = useState<string | null>(null);

  const loadCloudflareWebAnalyticsIfAllowed = () => {
    try {
      const token = String(
        (import.meta as any).env?.VITE_CF_WEB_ANALYTICS_TOKEN || "",
      );
      if (!token) return;
      const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
      if (consent !== "true") return;

      const existing = document.querySelector(
        'script[src="https://static.cloudflareinsights.com/beacon.min.js"]',
      );
      if (existing) return;

      const s = document.createElement("script");
      s.defer = true;
      s.src = "https://static.cloudflareinsights.com/beacon.min.js";
      s.setAttribute("data-cf-beacon", JSON.stringify({ token }));
      document.head.appendChild(s);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    setConsentValue(consent);
    if (!consent) {
      setShowBanner(true);
    }

    const onOpenSettings = () => {
      setSettingsOpen(true);
      setShowBanner(false);
    };
    window.addEventListener("balticauto:open-cookie-settings", onOpenSettings);
    return () => {
      window.removeEventListener(
        "balticauto:open-cookie-settings",
        onOpenSettings,
      );
    };
  }, []);

  const handleAccept = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, "true");
    setConsentValue("true");
    loadCloudflareWebAnalyticsIfAllowed();
    setShowBanner(false);
  };

  const handleDecline = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, "false");
    setConsentValue("false");
    setShowBanner(false);
  };

  const analyticsAllowed = consentValue === "true";

  const settingsDialog = (
    <CookieSettingsDialog
      open={settingsOpen}
      onClose={() => setSettingsOpen(false)}
      initialChoice={{ analytics: analyticsAllowed }}
      onSave={(choice) => {
        const next = choice.analytics ? "true" : "false";
        localStorage.setItem(COOKIE_CONSENT_KEY, next);
        setConsentValue(next);
        if (choice.analytics) {
          loadCloudflareWebAnalyticsIfAllowed();
        }
        setSettingsOpen(false);
      }}
    />
  );

  if (!showBanner) return settingsDialog;

  return (
    <>
      {settingsDialog}
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
                "We use essential technologies for core functionality and security. With your consent, we also use Cloudflare Web Analytics to understand aggregated usage and improve the service.",
              )}{" "}
              <Link
                component={RouterLink}
                to="/privacy-policy"
                sx={{ fontWeight: 600 }}
              >
                {t("cookies.learn_more", "Learn more in our Privacy Policy")}
              </Link>
            </Typography>
          </Box>
          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button
              variant="text"
              size="small"
              onClick={() => setSettingsOpen(true)}
              sx={{ color: "text.secondary" }}
            >
              {t("cookies.settings_cta", "Settings")}
            </Button>
            <Button
              variant="text"
              size="small"
              onClick={handleDecline}
              sx={{ color: "text.secondary" }}
            >
              {t("cookies.decline", "Essential Only")}
            </Button>
            <Button
              variant="contained"
              size="small"
              onClick={handleAccept}
              sx={{ px: 3 }}
            >
              {t("cookies.accept", "Accept All")}
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </>
  );
};

export default CookieBanner;
