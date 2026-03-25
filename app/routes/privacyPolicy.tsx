import React from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
  Divider,
  Link,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";

export function meta() {
  return [
    { title: "Privacy Policy | BalticAuto" },
    {
      name: "description",
      content:
        "Understand how we collect, use, and protect your personal information at BalticAuto. Includes cookie policy and data deletion rights.",
    },
  ];
}

export default function PrivacyPolicy() {
  const { t } = useTranslation();

  const controllerRegValue = t("legal.data_controller_reg_value", "").trim();

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      {/* Page Title */}
      <Typography
        variant="h3"
        component="h1"
        gutterBottom
        align="center"
        sx={{ fontWeight: 800 }}
      >
        {t("legal.privacy_title", "Privacy Policy")}
      </Typography>
      <Typography
        variant="body1"
        paragraph
        align="center"
        color="text.secondary"
        sx={{ mb: 1 }}
      >
        {t(
          "legal.privacy_intro",
          "Your privacy is important to us. This Privacy Policy explains how BalticAuto collects, uses, and protects your personal information.",
        )}
      </Typography>
      <Typography
        variant="caption"
        display="block"
        align="center"
        color="text.secondary"
        sx={{ mb: 6 }}
      >
        {t("legal.last_updated", "Last updated: March 2026")}
      </Typography>

      {/* Data Controller */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 700 }}>
          {t("legal.data_controller_title", "Data Controller (GDPR)")}
        </Typography>
        <Stack spacing={0.5}>
          <Typography variant="body1" color="text.secondary">
            <strong>{t("legal.data_controller_name", "Maris Heinols (self-employed)")}</strong>
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {t("legal.data_controller_email_label", "Email")}:{" "}
            <Link href="mailto:maris.heinolsh@gmail.com" underline="hover">
              maris.heinolsh@gmail.com
            </Link>
          </Typography>
          {controllerRegValue && (
            <Typography variant="body1" color="text.secondary">
              {t("legal.data_controller_reg_label", "Registration number")}:{" "}
              {controllerRegValue}
            </Typography>
          )}
          {/* DPO Contact */}
          <Typography variant="body1" color="text.secondary">
            {t("legal.data_controller_dpo_label", "Data Protection")}:{" "}
            {t(
              "legal.data_controller_dpo_value",
              "Contact us at maris.heinolsh@gmail.com for any data-related requests",
            )}
          </Typography>
        </Stack>
      </Box>

      <Divider sx={{ mb: 4 }} />

      {/* Main Privacy Sections 1-6 */}
      {[1, 2, 3, 4, 5, 6].map((idx) => (
        <Box key={idx} sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 700 }}>
            {t(`legal.privacy_section${idx}_title`)}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {t(`legal.privacy_section${idx}_text`)}
          </Typography>
        </Box>
      ))}

      <Divider sx={{ mb: 4 }} />

      {/* Cookie Policy Section */}
      <Box sx={{ mb: 6 }} id="cookie-policy">
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 700 }}>
          {t("legal.cookie_policy_title", "7. Cookie Policy")}
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          {t(
            "legal.cookie_policy_intro",
            "We use the following technologies on this platform. You can manage your preferences at any time via the Cookie settings link in the footer.",
          )}
        </Typography>
        <Table size="small" sx={{ mb: 2 }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>{t("legal.cookie_col_name", "Technology")}</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>{t("legal.cookie_col_type", "Type")}</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>{t("legal.cookie_col_purpose", "Purpose")}</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>{t("legal.cookie_col_provider", "Provider")}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>balticauto_cookie_consent</TableCell>
              <TableCell><Chip label={t("legal.cookie_type_essential", "Essential")} size="small" color="success" variant="outlined" /></TableCell>
              <TableCell>{t("legal.cookie_consent_purpose", "Stores your cookie consent preference")}</TableCell>
              <TableCell>BalticAuto</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Firebase Auth</TableCell>
              <TableCell><Chip label={t("legal.cookie_type_essential", "Essential")} size="small" color="success" variant="outlined" /></TableCell>
              <TableCell>{t("legal.cookie_firebase_purpose", "Authentication session management")}</TableCell>
              <TableCell>Google LLC</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Cloudflare Web Analytics</TableCell>
              <TableCell><Chip label={t("legal.cookie_type_analytics", "Analytics")} size="small" color="warning" variant="outlined" /></TableCell>
              <TableCell>{t("legal.cookie_analytics_purpose", "Aggregated usage statistics — only loaded with your consent")}</TableCell>
              <TableCell>Cloudflare Inc.</TableCell>
            </TableRow>
          </TableBody>
        </Table>
        <Typography variant="body2" color="text.secondary">
          {t(
            "legal.cookie_retention",
            "The consent cookie expires after 365 days. Analytics are processed without persistent cookies using privacy-preserving techniques.",
          )}
        </Typography>
      </Box>

      <Divider sx={{ mb: 4 }} />

      {/* Data Deletion Request — prominent, scanner-visible */}
      <Box
        id="data-deletion"
        sx={{
          mb: 6,
          p: 3,
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 2,
          bgcolor: "background.paper",
        }}
      >
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 700 }}>
          {t("legal.deletion_title", "8. Data Deletion Request")}
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          {t(
            "legal.deletion_text",
            "You have the right to request deletion of all personal data we hold about you (GDPR Art. 17). You can:",
          )}
        </Typography>
        <Box component="ul" sx={{ pl: 3, mb: 2 }}>
          <Typography component="li" variant="body1" color="text.secondary">
            {t("legal.deletion_option1", "Delete your account directly from your account dashboard (Settings → Delete Account).")}
          </Typography>
          <Typography component="li" variant="body1" color="text.secondary">
            {t(
              "legal.deletion_option2",
              "Send a deletion request by email — we will process it within 30 days.",
            )}
          </Typography>
        </Box>
        <Alert severity="info" sx={{ mb: 2 }}>
          {t(
            "legal.deletion_note",
            "Certain data may be retained for legal obligations (e.g. billing records) even after deletion. We will inform you of any such exceptions.",
          )}
        </Alert>
        <Button
          variant="contained"
          color="primary"
          component="a"
          href="mailto:support@baltic-auto.net?subject=Data%20Deletion%20Request&body=Please%20delete%20all%20personal%20data%20associated%20with%20my%20account."
          id="data-deletion-request-btn"
        >
          {t("legal.deletion_cta", "Request Data Deletion by Email")}
        </Button>
      </Box>
    </Container>
  );
}
