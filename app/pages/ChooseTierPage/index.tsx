import React, { useContext, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Divider,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import { useNavigate, useSearchParams } from "react-router";
import { FirebaseAuthContext } from "~/provider/FirebaseAuthProvider";
import {
  getPricingConfig,
  type TierDefinition,
  type TierId,
} from "~/services/pricingService";
import {
  selectFreeIndividualPlan,
  startStripeCheckout,
} from "~/services/billingService";
import { useTranslation } from "react-i18next";

function TierCard({
  tier,
  disabled,
  actionLabel,
  onAction,
}: {
  tier: TierDefinition;
  disabled?: boolean;
  actionLabel: string;
  onAction: () => void;
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

          <Button
            variant={tier.highlight ? "contained" : "outlined"}
            onClick={onAction}
            disabled={disabled}
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
        </Stack>
      </CardContent>
    </Card>
  );
}

export default function ChooseTierPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const authCtx = useContext(FirebaseAuthContext);
  const user = authCtx?.user;
  const [searchParams] = useSearchParams();

  const [tiers, setTiers] = useState<TierDefinition[] | null>(null);
  const [busyId, setBusyId] = useState<TierId | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) navigate("/login");
  }, [navigate, user]);

  useEffect(() => {
    getPricingConfig()
      .then((cfg) => setTiers(cfg.tiers))
      .catch((e) => {
        setError(e instanceof Error ? e.message : String(e));
        setTiers([]);
      });
  }, []);

  const grouped = useMemo(() => {
    const list = tiers || [];
    return {
      individual: list.filter((t) => t.role === "individual"),
      business: list.filter((t) => t.role === "business"),
    };
  }, [tiers]);

  const success = searchParams.get("success") === "1";
  const canceled = searchParams.get("canceled") === "1";

  const chooseTier = async (tierId: TierId) => {
    if (!user) return;
    setError(null);
    setBusyId(tierId);
    try {
      if (tierId === "individual_free") {
        await selectFreeIndividualPlan(user.uid);
        navigate("/");
        return;
      }

      await startStripeCheckout(tierId as Exclude<TierId, "individual_free">);
    } catch (e: any) {
      setError(
        e?.message ||
          t("pricing.startCheckoutFailed", {
            defaultValue: "Failed to start checkout",
          }),
      );
    } finally {
      setBusyId(null);
    }
  };

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
            {t("pricing.chooseTierTitle", { defaultValue: "Choose your tier" })}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {t("pricing.chooseTierSubtitle", {
              defaultValue:
                "Select a plan to unlock listings, analytics, and customization.",
            })}
          </Typography>
        </Box>
        <Button
          variant="outlined"
          onClick={() => navigate("/pricing")}
          sx={{
            borderRadius: 2,
            height: 44,
            textTransform: "none",
            fontWeight: 800,
          }}
        >
          {t("pricing.viewPricingCta", { defaultValue: "View pricing" })}
        </Button>
      </Box>

      {success ? (
        <Alert severity="success" sx={{ mb: 2 }}>
          {t("pricing.paymentCompleted", {
            defaultValue: "Payment completed. Your access will update shortly.",
          })}
        </Alert>
      ) : null}
      {canceled ? (
        <Alert severity="info" sx={{ mb: 2 }}>
          {t("pricing.checkoutCanceled", {
            defaultValue: "Checkout canceled.",
          })}
        </Alert>
      ) : null}
      {error ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      ) : null}

      <Typography variant="h6" fontWeight={900} sx={{ mb: 1.5 }}>
        {t("pricing.individualSection", { defaultValue: "Individual" })}
      </Typography>
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        {(grouped.individual || []).map((tier) => (
          <Grid key={tier.id} size={{ xs: 12, sm: 6, md: 4 }}>
            <TierCard
              tier={tier}
              disabled={Boolean(busyId)}
              actionLabel={
                tier.id === "individual_free"
                  ? t("pricing.selectFree", { defaultValue: "Select free" })
                  : t("pricing.subscribe", { defaultValue: "Subscribe" })
              }
              onAction={() => chooseTier(tier.id)}
            />
          </Grid>
        ))}
      </Grid>

      <Typography variant="h6" fontWeight={900} sx={{ mb: 1.5 }}>
        {t("pricing.businessSection", { defaultValue: "Business" })}
      </Typography>
      <Grid container spacing={2.5}>
        {(grouped.business || []).map((tier) => (
          <Grid key={tier.id} size={{ xs: 12, sm: 6, md: 4 }}>
            <TierCard
              tier={tier}
              disabled={Boolean(busyId)}
              actionLabel={t("pricing.subscribe", {
                defaultValue: "Subscribe",
              })}
              onAction={() => chooseTier(tier.id)}
            />
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}
