import { useTranslation } from "react-i18next";
import { Box, TextField, Typography, Stack, Grid, Checkbox, FormControlLabel, CircularProgress, Button, Divider } from "@mui/material";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  setStoreName,
  setDescription,
  setContactInfo,
  setWorkTime,
  setLocation,
} from "~/redux/slices/storeSettingsSlice";
import type { RootState } from "~/redux/store";
import { auth } from "~/firebase/auth";
import { db } from "~/firebase/fireStore";
import { doc, getDoc } from "firebase/firestore";
import { useAppDispatch } from "~/redux/hooks";
import { showNotification } from "~/redux/slices/uiSlice";

const DAYS_OF_WEEK = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

const StoreInfoSettings = () => {
  const { t } = useTranslation();
  const { name, description, contact, workTime, location } = useSelector(
    (s: RootState) => s.storeSettings,
  );
  const dispatch = useAppDispatch();
  const [loadingUserData, setLoadingUserData] = useState(false);

  // Auto-fill phone and email from user data
  const handleFetchUserData = async () => {
    if (!auth.currentUser) return;
    setLoadingUserData(true);
    try {
      const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        const newPhone = data.businessPhone || data.ownerPhone || data.phone || contact.phone;
        const newEmail = data.businessEmail || data.ownerEmail || data.email || contact.email;
        const newWebsite = data.website || contact.website;
        if (newPhone !== contact.phone || newEmail !== contact.email || newWebsite !== contact.website) {
          dispatch(setContactInfo({ phone: newPhone, email: newEmail, website: newWebsite }));
        }
        if (data.storeName && data.storeName !== name) {
          dispatch(setStoreName(data.storeName));
        }
        dispatch(showNotification({ message: t("dashboard.settings.storeInfo.reloadedSuccess"), severity: "success" }));
      }
    } catch (error) {
      console.error("Failed to fetch user data", error);
      dispatch(showNotification({ message: t("dashboard.settings.storeInfo.reloadError"), severity: "error" }));
    } finally {
      setLoadingUserData(false);
    }
  };

  useEffect(() => {
    if (!contact.phone && !contact.email) {
      handleFetchUserData();
    }
  }, []);

  const handleWorkTimeChange = (day: string, field: "open" | "close" | "isClosed", value: any) => {
    dispatch(
      setWorkTime({
        ...workTime,
        [day]: {
          ...workTime[day],
          [field]: value,
        },
      })
    );
  };

  const handleLocationChange = (field: "adress" | "lat" | "lng", value: string) => {
    const newLoc = { ...location, cords: { ...location.cords } };
    if (field === "adress") {
      newLoc.adress = value;
    } else {
      const val = value.trim() === "" ? null : Number(value);
      newLoc.cords[field] = val;
    }
    dispatch(setLocation(newLoc));
  };

  return (
    <Box>
      <Stack spacing={3}>
        <TextField
          label={t("dashboard.settings.storeInfo.name")}
          fullWidth
          value={name}
          onChange={(e) => dispatch(setStoreName(e.target.value))}
        />

        <TextField
          label={t("dashboard.settings.storeInfo.description")}
          fullWidth
          multiline
          minRows={3}
          value={description}
          onChange={(e) => dispatch(setDescription(e.target.value))}
        />

        <Divider />

        <Box>
          <Typography variant="subtitle2" sx={{ mb: 2 }}>{t("dashboard.settings.storeInfo.locationTitle")}</Typography>
          <Stack spacing={2}>
            <TextField
              label={t("dashboard.settings.storeInfo.address")}
              fullWidth
              value={location?.adress || ""}
              onChange={(e) => handleLocationChange("adress", e.target.value)}
            />
            <Stack direction="row" spacing={2}>
              <TextField
                label={t("dashboard.settings.storeInfo.lat")}
                fullWidth
                type="number"
                value={location?.cords?.lat ?? ""}
                onChange={(e) => handleLocationChange("lat", e.target.value)}
              />
              <TextField
                label={t("dashboard.settings.storeInfo.lng")}
                fullWidth
                type="number"
                value={location?.cords?.lng ?? ""}
                onChange={(e) => handleLocationChange("lng", e.target.value)}
              />
            </Stack>
          </Stack>
        </Box>

        <Divider />

        <Box>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
            <Typography variant="subtitle2">{t("dashboard.settings.storeInfo.contactTitle")}</Typography>
            <Button size="small" variant="text" onClick={handleFetchUserData} disabled={loadingUserData}>
              {loadingUserData ? <CircularProgress size={16} /> : t("dashboard.settings.storeInfo.reloadCta")}
            </Button>
          </Stack>
          <Stack spacing={2}>
            <TextField
              label={t("dashboard.settings.storeInfo.phone")}
              fullWidth
              value={contact.phone}
              onChange={(e) =>
                dispatch(
                  setContactInfo({
                    ...contact,
                    phone: e.target.value,
                    email: contact.email,
                  })
                )
              }
            />
            <TextField
              label={t("dashboard.settings.storeInfo.email")}
              fullWidth
              value={contact.email}
              onChange={(e) =>
                dispatch(
                  setContactInfo({
                    ...contact,
                    phone: contact.phone,
                    email: e.target.value,
                  })
                )
              }
            />
            <TextField
              label={t("dashboard.settings.storeInfo.website", "Website")}
              fullWidth
              value={contact.website || ""}
              onChange={(e) =>
                dispatch(
                  setContactInfo({
                    ...contact,
                    website: e.target.value,
                  })
                )
              }
            />
          </Stack>
        </Box>

        <Divider />

        <Box>
          <Typography variant="subtitle2" sx={{ mb: 2 }}>{t("dashboard.settings.storeInfo.workTimeTitle")}</Typography>
          <Stack spacing={1.5}>
            {DAYS_OF_WEEK.map((day) => {
               const wt = workTime[day] || { open: "09:00", close: "18:00", isClosed: false };
               return (
                <Grid container spacing={1} alignItems="center" key={day}>
                  <Grid size={{ xs: 3 }}>
                    <Typography variant="body2">{t(`dashboard.settings.storeInfo.days.${day}`)}</Typography>
                  </Grid>
                  <Grid size={{ xs: 3 }}>
                    <TextField
                      type="time"
                      size="small"
                      disabled={wt.isClosed}
                      value={wt.open}
                      onChange={(e) => handleWorkTimeChange(day, "open", e.target.value)}
                      inputProps={{ 
                        onClick: (e: any) => e.target.showPicker?.() 
                      }}
                    />
                  </Grid>
                  <Grid size={{ xs: 3 }}>
                    <TextField
                      type="time"
                      size="small"
                      disabled={wt.isClosed}
                      value={wt.close}
                      onChange={(e) => handleWorkTimeChange(day, "close", e.target.value)}
                      inputProps={{ 
                        onClick: (e: any) => e.target.showPicker?.() 
                      }}
                    />
                  </Grid>
                  <Grid size={{ xs: 3 }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          size="small"
                          checked={wt.isClosed}
                          onChange={(e) => handleWorkTimeChange(day, "isClosed", e.target.checked)}
                        />
                      }
                      label={t("dashboard.settings.storeInfo.closed")}
                    />
                  </Grid>
                </Grid>
              );
            })}
          </Stack>
        </Box>
      </Stack>
    </Box>
  );
};

export default StoreInfoSettings;
