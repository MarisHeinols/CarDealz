import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Stack,
  Divider,
  Button,
} from "@mui/material";
import { useNavigate } from "react-router";
import {
  getPricingConfig,
  type TierDefinition,
} from "~/services/pricingService";
import { useTranslation } from "react-i18next";

function TierCard({
  tier,
  actionLabel,
  onAction,
}: {
  tier: TierDefinition;
  actionLabel?: string;
  onAction?: () => void;
}) {
  const { t } = useTranslation();
  const priceLabel =
    tier.priceEur <= 0
      ? t("pricing.free", { defaultValue: "Free" })
      : `€${tier.priceEur.toFixed(2)}/${tier.interval}`;

  const title = t(`tiers.${tier.id}.title`, { defaultValue: tier.title });
  const lines = [
    t(`tiers.${tier.id}.line1`, {
      defaultValue: tier.descriptionLines?.[0] || "",
    }),
    t(`tiers.${tier.id}.line2`, {
      defaultValue: tier.descriptionLines?.[1] || "",
    }),
    t(`tiers.${tier.id}.line3`, {
      defaultValue: tier.descriptionLines?.[2] || "",
    }),
  ].filter(Boolean);

  return (
    <Card
      variant={tier.highlight ? "outlined" : undefined}
      sx={{
        height: "100%",
        borderRadius: 3,
        borderColor: tier.highlight ? "primary.main" : undefined,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {tier.highlight ? (
        <Box sx={{ position: "absolute", top: 12, right: 12 }}>
          <Chip
            label={t("pricing.popular", { defaultValue: "Popular" })}
            color="primary"
            size="small"
          />
        </Box>
      ) : null}
      <CardContent>
        <Stack spacing={1}>
          <Typography variant="h6" fontWeight={800}>
            {title}
          </Typography>
          <Typography variant="h4" fontWeight={900}>
            {priceLabel}
          </Typography>

          <Divider />

          <Stack spacing={0.75}>
            {lines.map((line) => (
              <Typography key={line} variant="body2" color="text.secondary">
                {line}
              </Typography>
            ))}
          </Stack>

          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", pt: 0.5 }}>
            <Chip
              size="small"
              label={t("pricing.listingsChip", {
                count: tier.listingLimit,
                defaultValue: `${tier.listingLimit} listings`,
              })}
              color={tier.role === "business" ? "secondary" : "default"}
              variant="outlined"
            />
            <Chip
              size="small"
              label={
                tier.adsFree
                  ? t("pricing.noAdsChip", { defaultValue: "No ads" })
                  : t("pricing.adsChip", { defaultValue: "Ads" })
              }
              color={tier.adsFree ? "success" : "default"}
              variant="outlined"
            />
          </Box>

          {actionLabel && onAction ? (
            <Button
              variant={tier.highlight ? "contained" : "outlined"}
              onClick={onAction}
              sx={{
                mt: 1.5,
                borderRadius: 2,
                height: 44,
                textTransform: "none",
                fontWeight: 800,
              }}
              fullWidth
            >
              {actionLabel}
            </Button>
          ) : null}
        </Stack>
      </CardContent>
    </Card>
  );
}

export default function PricingPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [tiers, setTiers] = useState<TierDefinition[] | null>(null);

  useEffect(() => {
    getPricingConfig()
      .then((cfg) => setTiers(cfg.tiers))
      .catch(() => setTiers([]));
  }, []);

  const grouped = useMemo(() => {
    const list = tiers || [];
    return {
      individual: list.filter((t) => t.role === "individual"),
      business: list.filter((t) => t.role === "business"),
    };
  }, [tiers]);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h4" fontWeight={900}>
            {t("pricing.title", { defaultValue: "Pricing" })}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {t("pricing.subtitle", {
              defaultValue:
                "Choose a plan that fits your needs. You can upgrade or change at any time.",
            })}
          </Typography>
        </Box>
        <Button
          variant="contained"
          onClick={() => navigate("/choose-tier")}
          sx={{
            borderRadius: 2,
            height: 44,
            textTransform: "none",
            fontWeight: 800,
          }}
        >
          {t("pricing.chooseTierCta", { defaultValue: "Choose tier" })}
        </Button>
      </Box>

      <Typography variant="h6" fontWeight={900} sx={{ mb: 1.5 }}>
        {t("pricing.individualSection", { defaultValue: "Individual" })}
      </Typography>
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        {(grouped.individual || []).map((tier) => (
          <Grid key={tier.id} size={{ xs: 12, sm: 6, md: 4 }}>
            <TierCard tier={tier} />
          </Grid>
        ))}
      </Grid>

      <Typography variant="h6" fontWeight={900} sx={{ mb: 1.5 }}>
        {t("pricing.businessSection", { defaultValue: "Business" })}
      </Typography>
      <Grid container spacing={2.5}>
        {(grouped.business || []).map((tier) => (
          <Grid key={tier.id} size={{ xs: 12, sm: 6, md: 4 }}>
            <TierCard tier={tier} />
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}
