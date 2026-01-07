// src/components/admin/store/settings/LocationSettings.tsx
import { Box, TextField, Typography, Stack, Button } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { setLocation } from "~/redux/slices/storeSettingsSlice";
import type { RootState } from "~/redux/store";

const LocationSettings = () => {
  const location = useSelector((s: RootState) => s.storeSettings.location);
  const dispatch = useDispatch();

  const handleChange = (key: "lat" | "lng", value: string) => {
    const num = value === "" ? null : Number(value);
    dispatch(
      setLocation({
        ...location,
        [key]: num,
      } as { lat: number; lng: number })
    );
  };

  return (
    <Box>
      <Typography variant="body1" sx={{ mb: 2 }}>
        Set the location of your store. These coordinates will be used on the
        map.
      </Typography>

      <Stack spacing={2}>
        <TextField
          label="Latitude"
          value={location.lat ?? ""}
          onChange={(e) => handleChange("lat", e.target.value)}
        />
        <TextField
          label="Longitude"
          value={location.lng ?? ""}
          onChange={(e) => handleChange("lng", e.target.value)}
        />

        {/* Later: integrate an editable map where user can click to set location */}

        <Button
          variant="outlined"
          onClick={() =>
            dispatch(
              setLocation({
                lat: 40.7128,
                lng: -74.006,
              })
            )
          }
        >
          Set to sample location (NYC)
        </Button>
      </Stack>
    </Box>
  );
};

export default LocationSettings;
