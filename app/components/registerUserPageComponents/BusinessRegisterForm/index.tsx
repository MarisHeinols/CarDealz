import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Grid,
  Autocomplete,
  CircularProgress,
  Stack,
  FormControlLabel,
  Checkbox,
  Link,
} from "@mui/material";
import { Link as RouterLink } from "react-router";
import type { BusinessRegisterData } from "~/types/types";
import {
  completeSocialRegistration,
  formatAuthError,
  registerUser,
  sendVerificationEmail,
} from "../../../services/auth";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { useAppDispatch } from "~/redux/hooks";
import { showNotification } from "~/redux/slices/uiSlice";
import { COUNTRIES } from "~/constants/countries";
import { useCities } from "~/hooks/useCities";
import MyLocationIcon from "@mui/icons-material/MyLocation";

const BusinessRegisterForm = ({ socialMode }: { socialMode?: boolean }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<BusinessRegisterData>({
    ownerName: "",
    ownerSurname: "",
    ownerEmail: "",
    ownerPhone: "",
    password: "",
    confirmPassword: "",
    storeName: "",
    businessEmail: "",
    businessPhone: "",
    address: "",
    city: "",
    country: "",
    lat: "",
    lng: "",
    acceptedTerms: false,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const dispatch = useAppDispatch();
  const { cities, loading: citiesLoading } = useCities(formData.country);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const detectLocation = () => {
    if (!navigator.geolocation) {
      dispatch(
        showNotification({
          message: t("common.geolocationNotSupported", "Geolocation is not supported by your browser."),
          severity: "error",
        }),
      );
      return;
    }
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
            { headers: { "Accept-Language": "en" } },
          );
          const data = await res.json();
          const detectedCountry = data.address?.country || "";
          const detectedCity =
            data.address?.city ||
            data.address?.town ||
            data.address?.village ||
            data.address?.county ||
            "";
          setFormData((prev) => ({
            ...prev,
            country: detectedCountry,
            city: detectedCity,
            lat: String(latitude),
            lng: String(longitude),
          }));
        } catch {
          dispatch(
            showNotification({
              message: t("common.locationError", "Could not determine your location."),
              severity: "error",
            }),
          );
        } finally {
          setGeoLoading(false);
        }
      },
      () => {
        dispatch(
          showNotification({
            message: t("common.locationDenied", "Location access denied or failed."),
            severity: "error",
          }),
        );
        setGeoLoading(false);
      },
      { timeout: 10000 },
    );
  };

  const handleRegister = async () => {
    if (!formData.storeName.trim()) {
      dispatch(
        showNotification({
          message: t("auth.businessNameRequired"),
          severity: "error",
        }),
      );
      return;
    }
    if (!formData.ownerName.trim() || !formData.ownerSurname.trim()) {
      dispatch(
        showNotification({
          message: t("auth.ownerFieldsRequired"),
          severity: "error",
        }),
      );
      return;
    }

    if (!socialMode) {
      if (!formData.ownerEmail.trim()) {
        dispatch(
          showNotification({
            message: t("auth.emailRequired"),
            severity: "error",
          }),
        );
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        dispatch(
          showNotification({
            message: t("auth.passwordsDontMatch"),
            severity: "error",
          }),
        );
        return;
      }
    }

    if (!formData.acceptedTerms) {
      dispatch(
        showNotification({
          message: t("auth.mustAcceptTerms"),
          severity: "error",
        }),
      );
      return;
    }

    setIsLoading(true);
    try {
      if (socialMode) {
        await completeSocialRegistration(
          {
            ...formData,
            acceptedTerms: true,
            acceptedTermsAt: new Date().toISOString(),
          },
          "business",
        );
        dispatch(
          showNotification({
            message: t("auth.profileCreated"),
            severity: "success",
          }),
        );
        navigate("/verify-phone");
        return;
      }

      const cred = await registerUser(
        formData.ownerEmail,
        formData.password,
        {
          ...formData,
          acceptedTerms: true,
          acceptedTermsAt: new Date().toISOString(),
        },
        "business",
      );

      try {
        await sendVerificationEmail(cred.user);
      } catch {
        // ignore
      }

      dispatch(
        showNotification({
          message: t("auth.accountCreated"),
          severity: "success",
        }),
      );
      navigate("/verify-phone");
    } catch (err: any) {
      dispatch(
        showNotification({ message: formatAuthError(err), severity: "error" }),
      );
    } finally {
      setIsLoading(false);
    }
  };

  const textField = (
    name: keyof BusinessRegisterData,
    label: string,
    type = "text",
  ) => (
    <Grid size={{ xs: 12, sm: 6 }} key={name}>
      <TextField
        fullWidth
        name={name}
        label={label}
        type={type}
        value={formData[name]}
        onChange={handleChange}
        disabled={
          Boolean(socialMode) &&
          (name === "ownerEmail" ||
            name === "password" ||
            name === "confirmPassword")
        }
      />
    </Grid>
  );

  return (
    <Box component="form" p={2} sx={{ height: "auto" }}>
      <Grid container spacing={2}>
        {textField("ownerName", t("auth.firstName"))}
        {textField("ownerSurname", t("auth.surname"))}
        {textField("ownerEmail", t("auth.email"), "email")}
        {textField("ownerPhone", t("auth.phone"))}
        {textField("password", t("auth.password"), "password")}
        {textField("confirmPassword", t("auth.confirmPassword"), "password")}
        {textField("storeName", t("auth.businessName"))}
        {textField("businessEmail", t("auth.businessEmail"), "email")}
        {textField("businessPhone", t("auth.businessPhone"))}
        {textField("address", t("auth.address"))}

        {/* Location (searchable dropdowns + optional precise coords) */}
        <Grid size={{ xs: 12 }}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            alignItems={{ md: "center" }}
          >
            <Autocomplete
              options={COUNTRIES as unknown as string[]}
              value={formData.country}
              onInputChange={(_, v) =>
                setFormData((prev) => ({
                  ...prev,
                  country: v || "",
                  city: prev.country === v ? prev.city : "",
                }))
              }
              renderInput={(params) => (
                <TextField {...params} label={t("auth.country")} fullWidth />
              )}
              sx={{ flex: 1 }}
            />
            <Autocomplete
              freeSolo
              options={cities}
              loading={citiesLoading}
              value={formData.city}
              onInputChange={(_, v) =>
                setFormData((prev) => ({ ...prev, city: v || "" }))
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={citiesLoading ? t("common.loading") : t("auth.city")}
                  fullWidth
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <React.Fragment>
                        {citiesLoading ? (
                          <CircularProgress color="inherit" size={20} />
                        ) : null}
                        {params.InputProps.endAdornment}
                      </React.Fragment>
                    ),
                  }}
                />
              )}
              disabled={!formData.country}
              sx={{ flex: 1 }}
            />
            <Button
              variant="outlined"
              startIcon={
                geoLoading ? <CircularProgress size={16} /> : <MyLocationIcon />
              }
              onClick={detectLocation}
              disabled={geoLoading}
              sx={{ height: 56, whiteSpace: "nowrap" }}
            >
              {geoLoading ? t("common.loading") : t("common.useMyLocation", "Use my location")}
            </Button>
          </Stack>
        </Grid>

        {textField("lat", t("auth.lat"))}
        {textField("lng", t("auth.lng"))}
      </Grid>

      <FormControlLabel
        control={
          <Checkbox
            checked={formData.acceptedTerms}
            onChange={(e) =>
              setFormData({ ...formData, acceptedTerms: e.target.checked })
            }
          />
        }
        label={
          <Box component="span">
            {t("auth.acceptTermsPart1")}{" "}
            <Link component={RouterLink} to="/terms-of-service">
              {t("footer.terms")}
            </Link>{" "}
            {t("auth.acceptTermsPart2")}{" "}
            <Link component={RouterLink} to="/privacy-policy">
              {t("footer.privacy")}
            </Link>
          </Box>
        }
        sx={{ mt: 2 }}
      />

      <Button
        fullWidth
        variant="contained"
        sx={{ mt: 3, alignSelf: "end" }}
        onClick={handleRegister}
        disabled={isLoading}
      >
        {isLoading ? t("auth.registering") : t("auth.registerBusiness")}
      </Button>
    </Box>
  );
};

export default BusinessRegisterForm;
