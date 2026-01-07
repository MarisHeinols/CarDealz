// src/components/admin/store/settings/AppearanceSettings.tsx
import { Box, TextField, Typography, Stack } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { updateTheme } from "~/redux/slices/storeSettingsSlice";
import type { RootState } from "~/redux/store";

const ColorField = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) => (
  <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
    <Box sx={{ minWidth: 140 }}>
      <Typography>{label}</Typography>
    </Box>
    <TextField
      type="color"
      size="small"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      sx={{ width: 80 }}
    />
    <TextField
      size="small"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      sx={{ flex: 1 }}
    />
  </Stack>
);

const AppearanceSettings = () => {
  const theme = useSelector((s: RootState) => s.storeSettings.theme);
  const dispatch = useDispatch();

  const handleChange = (key: keyof typeof theme, value: string) => {
    dispatch(updateTheme({ [key]: value }));
  };

  return (
    <Box>
      <Typography variant="body1" sx={{ mb: 2 }}>
        Customize the colors of your store page.
      </Typography>

      <ColorField
        label="Primary"
        value={theme.primary}
        onChange={(v) => handleChange("primary", v)}
      />
      <ColorField
        label="Secondary"
        value={theme.secondary}
        onChange={(v) => handleChange("secondary", v)}
      />
      <ColorField
        label="Accent"
        value={theme.accent}
        onChange={(v) => handleChange("accent", v)}
      />
      <ColorField
        label="Background"
        value={theme.background}
        onChange={(v) => handleChange("background", v)}
      />
    </Box>
  );
};

export default AppearanceSettings;
