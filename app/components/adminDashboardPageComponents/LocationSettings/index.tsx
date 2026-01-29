import { Box, TextField, Typography, Stack, Button } from "@mui/material";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setLocation } from "~/redux/slices/storeSettingsSlice";
import type { RootState } from "~/redux/store";

const LocationSettings = () => {
  const location = useSelector((s: RootState) => s.storeSettings.location);

  const [adress, setAdress] = useState(location.adress);
  const [lat, setLat] = useState(location.cords.lat);
  const [lng, setLng] = useState(location.cords.lng);

  const dispatch = useDispatch();

  const handleSubmit = () => {
    if (verifyValues()) {
      dispatch(
        setLocation({
          adress: adress,
          cords: {
            lat: lat,
            lng: lng,
          },
        }),
      );
    }
  };

  const verifyValues = () => {
    return adress && lat && lng;
  };

  return (
    <Box>
      <Stack spacing={2}>
        <TextField
          label="Adress"
          value={adress}
          onChange={(e) => setAdress(e.target.value)}
          placeholder="Street, City, Country"
        />
        <TextField
          label="Latitude"
          value={lat}
          onChange={(e) => setLat(parseFloat(e.target.value) || null)}
          placeholder="56.9730"
        />

        <TextField
          label="Longitude"
          value={lng}
          onChange={(e) => setLng(parseFloat(e.target.value) || null)}
          placeholder="24.3336"
        />

        <Button
          variant="outlined"
          onClick={handleSubmit}
          disabled={!verifyValues()}
        >
          Confirm
        </Button>
      </Stack>
    </Box>
  );
};

export default LocationSettings;
