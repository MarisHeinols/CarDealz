import { useTranslation } from "react-i18next";
import {
  Box,
  TextField,
  Typography,
  Stack,
  Checkbox,
  FormControlLabel,
  MenuItem,
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
      <Box sx={{ minWidth: { xs: 120, sm: 160 }, pr: 1, flexShrink: 0 }}>
        <Typography variant="body2" fontWeight={500} noWrap>
          {label}
        </Typography>
      </Box>

      <Box sx={{ width: 48, flexShrink: 0 }}>
        <TextField
          type="color"
          size="small"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={() => onChange(draft)}
          sx={{
            "& .MuiInputBase-input": {
              p: "4px",
              height: "32px",
              cursor: "pointer",
            },
          }}
          fullWidth
        />
      </Box>

      <TextField
        size="small"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => onChange(draft)}
        sx={{
          flex: 1,
          "& .MuiInputBase-input": {
            fontFamily: "monospace",
            fontSize: "0.9rem",
          },
        }}
      />
    </Stack>
  );
};

const AppearanceSettings = () => {
  const { t } = useTranslation();
  const theme = useSelector((s: RootState) => s.storeSettings.theme);

  const dispatch = useDispatch();

  const handleChange = (key: keyof typeof theme, value: string | boolean) => {
    dispatch(updateTheme({ [key]: value }));
  };

  return (
    <Box>
      <Typography variant="body1" sx={{ mb: 2 }}>
        {t("dashboard.settings.appearance.desc")}
      </Typography>

      <TextField
        select
        label={t("dashboard.settings.appearance.layoutTitle")}
        fullWidth
        value={theme.layout || "classic"}
        onChange={(e) => handleChange("layout", e.target.value)}
        sx={{ mb: 3 }}
      >
        <MenuItem value="classic">{t("dashboard.settings.appearance.layoutClassic")}</MenuItem>
        <MenuItem value="modern">{t("dashboard.settings.appearance.layoutModern")}</MenuItem>
        <MenuItem value="minimal">{t("dashboard.settings.appearance.layoutMinimal")}</MenuItem>
      </TextField>

      <ColorField
        label={t("dashboard.settings.appearance.colorPrimary") || "Primary Color"}
        value={theme.primary}
        onChange={(v) => handleChange("primary", v)}
      />
      <ColorField
        label={t("dashboard.settings.appearance.colorAccent") || "Accent Color"}
        value={theme.accent}
        onChange={(v) => handleChange("accent", v)}
      />
      <ColorField
        label={t("dashboard.settings.appearance.colorHeading") || "Heading Color"}
        value={theme.heading}
        onChange={(v) => handleChange("heading", v)}
      />
      <ColorField
        label={t("dashboard.settings.appearance.colorBg") || "Background Color"}
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
        label={t("dashboard.settings.appearance.lightText")}
      />
    </Box>
  );
};

export default AppearanceSettings;
