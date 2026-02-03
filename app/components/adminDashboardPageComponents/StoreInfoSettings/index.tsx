// src/components/admin/store/settings/StoreInfoSettings.tsx
import { Box, TextField, Typography, Stack } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import {
  setStoreName,
  setDescription,
  setContactInfo,
  setWorkTime,
} from "~/redux/slices/storeSettingsSlice";
import type { RootState } from "~/redux/store";

const StoreInfoSettings = () => {
  const { name, description, contact, workTime } = useSelector(
    (s: RootState) => s.storeSettings,
  );
  const dispatch = useDispatch();

  return (
    <Box>
      <Stack spacing={3}>
        <TextField
          label="Store name"
          fullWidth
          value={name}
          onChange={(e) => dispatch(setStoreName(e.target.value))}
        />

        <TextField
          label="Description"
          fullWidth
          multiline
          minRows={3}
          value={description}
          onChange={(e) => dispatch(setDescription(e.target.value))}
        />

        <TextField
          label="Phone"
          fullWidth
          value={contact.phone}
          onChange={(e) =>
            dispatch(
              setContactInfo({
                ...contact,
                phone: e.target.value,
              }),
            )
          }
        />

        <TextField
          label="Email"
          fullWidth
          value={contact.email}
          onChange={(e) =>
            dispatch(
              setContactInfo({
                ...contact,
                email: e.target.value,
              }),
            )
          }
        />

        <TextField
          label="Work Time"
          fullWidth
          value={workTime}
          onChange={(e) => dispatch(setWorkTime(e.target.value))}
        />
      </Stack>
    </Box>
  );
};

export default StoreInfoSettings;
