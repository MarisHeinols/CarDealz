// src/components/admin/store/settings/BrandingSettings.tsx
import { Box, TextField, Typography, Stack } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { setBannerImage, setLogo } from "~/redux/slices/storeSettingsSlice";
import type { RootState } from "~/redux/store";

const BrandingSettings = () => {
  const { bannerImage, logo } = useSelector((s: RootState) => s.storeSettings);
  const dispatch = useDispatch();

  return (
    <Box>
      <Typography variant="body1" sx={{ mb: 2 }}>
        Configure your logo and banner image.
      </Typography>

      <Stack spacing={3}>
        <TextField
          label="Logo URL"
          fullWidth
          value={logo ?? ""}
          onChange={(e) => dispatch(setLogo(e.target.value || null))}
        />

        <TextField
          label="Banner image URL"
          fullWidth
          value={bannerImage ?? ""}
          onChange={(e) => dispatch(setBannerImage(e.target.value || null))}
        />

        {/* Later: replace with real upload controls */}
      </Stack>
    </Box>
  );
};

export default BrandingSettings;
