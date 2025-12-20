import { Stack, Typography, LinearProgress, Box } from "@mui/material";

type MarketRange = {
  min: number;
  max: number;
};

type Props = {
  price: number;
  marketRange: MarketRange;
};

const getLabel = (value: number) => {
  if (value < 33) return "Good Deal";
  if (value < 66) return "Fair Price";
  return "Above Market";
};

const getColor = (value: number): "success" | "warning" | "error" => {
  if (value < 33) return "success";
  if (value < 66) return "warning";
  return "error";
};

const MarketValueBar = ({ price, marketRange }: Props) => {
  const percentage =
    ((price - marketRange.min) / (marketRange.max - marketRange.min)) * 100;

  const value = Math.max(0, Math.min(100, percentage));
  const color = getColor(value);
  const label = getLabel(value);

  return (
    <Stack spacing={1}>
      <Stack direction="row" justifyContent="space-between">
        <Typography variant="subtitle2">Market Value</Typography>
        <Typography
          variant="subtitle2"
          color={`${color}.main`}
          fontWeight={600}
        >
          {label}
        </Typography>
      </Stack>

      <LinearProgress
        variant="determinate"
        value={value}
        color={color}
        sx={{ height: 8, borderRadius: 4 }}
      />

      <Box display="flex" justifyContent="space-between">
        <Typography variant="caption" color="text.secondary">
          ${marketRange.min.toLocaleString("en-US")}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          ${marketRange.max.toLocaleString("en-US")}
        </Typography>
      </Box>
    </Stack>
  );
};

export default MarketValueBar;
