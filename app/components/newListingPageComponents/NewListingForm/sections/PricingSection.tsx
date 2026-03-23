import React, { useState } from "react";
import {
  Grid,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Box,
  Typography,
  Chip,
  Stack,
  Divider,
} from "@mui/material";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import type { CarListingDetailsJson } from "~/types/types";
import {
  estimateMarketValue,
  type MarketValuationResult,
} from "~/services/estimateMarketValue";
import { useTranslation } from "react-i18next";

interface Props {
  listing: CarListingDetailsJson;
  setListing: React.Dispatch<React.SetStateAction<CarListingDetailsJson>>;
}

const DEAL_COLOR = {
  good: "success",
  fair: "warning",
  above_market: "error",
} as const;

export default function PricingSection({ listing, setListing }: Props) {
  const { t } = useTranslation();
  const [estimating, setEstimating] = useState(false);
  const [aiResult, setAiResult] = useState<MarketValuationResult | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  const handleEstimate = async () => {
    setEstimating(true);
    setAiError(null);
    setAiResult(null);
    try {
      const result = await estimateMarketValue(listing);
      setAiResult(result);
      setListing((prev) => ({
        ...prev,
        marketRange: { min: result.min, max: result.max },
        marketRangeUpdatedAt: new Date().toISOString(),
      }));
    } catch (err) {
      setAiError(
        err instanceof Error ? err.message : t("newListing.createFailed"),
      );
    } finally {
      setEstimating(false);
    }
  };

  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, sm: 6 }}>
        <TextField
          label={t("form.price")}
          type="number"
          fullWidth
          value={listing.price}
          onChange={(e) =>
            setListing((prev) => ({
              ...prev,
              price: Math.max(0, Number(e.target.value)),
            }))
          }
          inputProps={{ min: 0 }}
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 6 }}>
        <TextField
          label={t("form.selfCost", { defaultValue: "Self cost" })}
          type="number"
          fullWidth
          value={listing.selfCost}
          onChange={(e) =>
            setListing((prev) => ({
              ...prev,
              selfCost: Math.max(0, Number(e.target.value)),
            }))
          }
          inputProps={{ min: 0 }}
        />
      </Grid>

      {/* AI Estimation */}
      <Grid size={{ xs: 12 }}>
        <Button
          variant="outlined"
          color="primary"
          startIcon={
            estimating ? <CircularProgress size={16} /> : <AutoAwesomeIcon />
          }
          onClick={handleEstimate}
          disabled={estimating || !listing.make || !listing.model}
          sx={{
            borderStyle: "dashed",
            fontWeight: 700,
            px: 3,
          }}
        >
          {estimating ? t("form.estimating") : t("form.estimateMarketValue")}
        </Button>
        {!listing.make || !listing.model ? (
          <Typography variant="caption" color="text.secondary" sx={{ ml: 2 }}>
            {t("form.fillMakeModelFirst")}
          </Typography>
        ) : null}
      </Grid>

      {aiError && (
        <Grid size={{ xs: 12 }}>
          <Alert severity="error" onClose={() => setAiError(null)}>
            {aiError}
          </Alert>
        </Grid>
      )}

      {aiResult && (
        <Grid size={{ xs: 12 }}>
          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              border: "1px solid",
              borderColor: "divider",
              background: (t) =>
                t.palette.mode === "dark"
                  ? "rgba(255,255,255,0.04)"
                  : "rgba(0,0,0,0.02)",
            }}
          >
            <Stack direction="row" spacing={1} alignItems="center" mb={1}>
              <AutoAwesomeIcon fontSize="small" color="primary" />
              <Typography variant="subtitle2" fontWeight={700}>
                {t("form.marketValueEstimate")}
              </Typography>
              <Chip
                label={t(`carValues.deal_${aiResult.dealRating}`)}
                color={DEAL_COLOR[aiResult.dealRating]}
                size="small"
              />
            </Stack>

            <Divider sx={{ my: 1 }} />

            <Stack direction="row" spacing={3} flexWrap="wrap" mb={1.5}>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  {t("form.marketRange")}
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  €{aiResult.min.toLocaleString()} – €
                  {aiResult.max.toLocaleString()}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  {t("form.recommendedSellPrice")}
                </Typography>
                <Typography
                  variant="body2"
                  fontWeight={700}
                  color="primary.main"
                >
                  €{aiResult.recommendedSellPrice.toLocaleString()}
                </Typography>
              </Box>
            </Stack>

            <Typography variant="body2" color="text.secondary">
              {aiResult.verdict}
            </Typography>
          </Box>
        </Grid>
      )}
    </Grid>
  );
}
