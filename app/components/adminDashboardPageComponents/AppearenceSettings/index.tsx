// src/components/admin/store/settings/AppearanceSettings.tsx
import {
  Box,
  TextField,
  Typography,
  Stack,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import { useEffect, useState } from "react";
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
}) => {
  const [draft, setDraft] = useState(value);
  useEffect(() => setDraft(value), [value]);
  return (
    <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
      <Box sx={{ minWidth: 100 }}>
        <Typography>{label}</Typography>
      </Box>

      <TextField
        type="color"
        size="small"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => onChange(draft)}
        sx={{ width: 60 }}
      />

      <TextField
        size="small"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => onChange(draft)}
        sx={{ flex: 1 }}
      />
    </Stack>
  );
};

const AppearanceSettings = () => {
  const theme = useSelector((s: RootState) => s.storeSettings.theme);

  const dispatch = useDispatch();

  const handleChange = (key: keyof typeof theme, value: string | boolean) => {
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
      <FormControlLabel
        control={
          <Checkbox
            checked={theme.isTextLight}
            onChange={() => {
              handleChange("isTextLight", !theme.isTextLight);
            }}
          />
        }
        label="Light text"
      />
    </Box>
  );
};

export default AppearanceSettings;
