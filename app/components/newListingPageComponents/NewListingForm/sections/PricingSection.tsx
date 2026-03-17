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

interface Props {
  listing: CarListingDetailsJson;
  setListing: React.Dispatch<React.SetStateAction<CarListingDetailsJson>>;
}

const DEAL_COLOR = {
  good: "success",
  fair: "warning",
  above_market: "error",
} as const;

const DEAL_LABEL = {
  good: "Good Deal",
  fair: "Fair Price",
  above_market: "Above Market",
};

export default function PricingSection({ listing, setListing }: Props) {
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
      // Auto-fill the market range fields
      setListing((prev) => ({
        ...prev,
        marketRange: { min: result.min, max: result.max },
        marketRangeUpdatedAt: new Date().toISOString(),
      }));
    } catch (err) {
      setAiError(err instanceof Error ? err.message : "AI estimation failed");
    } finally {
      setEstimating(false);
    }
  };

  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, sm: 6 }}>
        <TextField
          label="Price"
          type="number"
          fullWidth
          value={listing.price}
          onChange={(e) =>
            setListing((prev) => ({ ...prev, price: Number(e.target.value) }))
          }
        />
      </Grid>

      {/* AI Estimation */}
      <Grid size={{ xs: 12 }}>
        <Button
          variant="outlined"
          startIcon={
            estimating ? <CircularProgress size={16} /> : <AutoAwesomeIcon />
          }
          onClick={handleEstimate}
          disabled={estimating || !listing.make || !listing.model}
          sx={{ borderStyle: "dashed" }}
        >
          {estimating ? "Estimating…" : "Estimate Market Value"}
        </Button>
        {!listing.make || !listing.model ? (
          <Typography variant="caption" color="text.secondary" sx={{ ml: 2 }}>
            Fill in make &amp; model first
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
                Market Value Estimate
              </Typography>
              <Chip
                label={DEAL_LABEL[aiResult.dealRating]}
                color={DEAL_COLOR[aiResult.dealRating]}
                size="small"
              />
            </Stack>

            <Divider sx={{ my: 1 }} />

            <Stack direction="row" spacing={3} flexWrap="wrap" mb={1.5}>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Market Range
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  ${aiResult.min.toLocaleString()} – $
                  {aiResult.max.toLocaleString()}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Recommended Sell Price
                </Typography>
                <Typography
                  variant="body2"
                  fontWeight={700}
                  color="primary.main"
                >
                  ${aiResult.recommendedSellPrice.toLocaleString()}
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
