// src/components/admin/store/settings/BrandingSettings.tsx
import { Box, Typography, Stack, Button } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { setBannerImage, setLogo } from "~/redux/slices/storeSettingsSlice";
import type { RootState } from "~/redux/store";
import { fileToBase64 } from "~/services/fileToBase64";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

const BrandingSettings = () => {
  const { bannerImage, logo } = useSelector((s: RootState) => s.storeSettings);
  const dispatch = useDispatch();

  const handleUploadLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const b64 = await fileToBase64(e.target.files[0]);
      dispatch(setLogo(b64));
    }
  };

  const handleUploadBanner = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const b64 = await fileToBase64(e.target.files[0]);
      dispatch(setBannerImage(b64));
    }
  };

  return (
    <Box>
      <Typography variant="body1" sx={{ mb: 2 }}>
        Configure your logo and banner image.
      </Typography>

      <Stack spacing={3}>
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>Store Logo</Typography>
          <Stack direction="row" spacing={2} alignItems="center">
            {logo && (
              <Box
                component="img"
                src={logo}
                alt="Logo"
                sx={{ width: 64, height: 64, borderRadius: "50%", objectFit: "cover", border: "1px solid #ddd" }}
              />
            )}
            <Button
              component="label"
              variant="outlined"
              startIcon={<CloudUploadIcon />}
              sx={{ width: 180, justifyContent: "flex-start" }}
            >
              Upload Logo
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={handleUploadLogo}
              />
            </Button>
            {logo && (
              <Button color="error" onClick={() => dispatch(setLogo(null))}>
                Remove
              </Button>
            )}
          </Stack>
        </Box>

        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>Store Banner</Typography>
          <Stack direction="column" spacing={2}>
            {bannerImage && (
              <Box
                component="img"
                src={bannerImage}
                alt="Banner"
                sx={{ width: "100%", height: 120, borderRadius: 2, objectFit: "cover", border: "1px solid #ddd" }}
              />
            )}
            <Stack direction="row" spacing={2}>
              <Button
                component="label"
                variant="outlined"
                startIcon={<CloudUploadIcon />}
                sx={{ width: 180, justifyContent: "flex-start" }}
              >
                Upload Banner
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleUploadBanner}
                />
              </Button>
              {bannerImage && (
                <Button color="error" onClick={() => dispatch(setBannerImage(null))}>
                  Remove
                </Button>
              )}
            </Stack>
          </Stack>
        </Box>
      </Stack>
    </Box>
  );
};

export default BrandingSettings;
