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
  Typography,
  Alert,
} from "@mui/material";
import { Link as RouterLink, useNavigate } from "react-router";
import type { BusinessRegisterData } from "~/types/types";
import {
  completeSocialRegistration,
  formatAuthError,
  registerUser,
  sendVerificationEmail,
} from "../../../services/auth";
import { useTranslation } from "react-i18next";
import { useAppDispatch } from "~/redux/hooks";
import { showNotification } from "~/redux/slices/uiSlice";
import { COUNTRIES } from "~/constants/countries";
import { useCities } from "~/hooks/useCities";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import { auth } from "~/firebase/auth";

const BusinessRegisterForm = ({
  socialMode,
  onRegisterSuccess,
}: {
  socialMode?: boolean;
  onRegisterSuccess: () => void;
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<BusinessRegisterData>({
    ownerEmail: auth.currentUser?.email || "",
    password: "",
    confirmPassword: "",
    storeName: "",
    businessEmail: auth.currentUser?.email || "",
    businessPhone: "",
    address: "",
    city: "",
    country: "",
    lat: "",
    lng: "",
    registrationNumber: "",
    website: "",
    acceptedTerms: false,
    confirmedDealer: false,
  });

  // Sync social data in case it arrived after initial mount
  React.useEffect(() => {
    if (socialMode && auth.currentUser) {
      setFormData((prev) => ({
        ...prev,
        ownerEmail: prev.ownerEmail || auth.currentUser?.email || "",
        businessEmail: prev.businessEmail || auth.currentUser?.email || "",
      }));
    }
  }, [socialMode]);

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
          message: t(
            "common.geolocationNotSupported",
            "Geolocation is not supported by your browser.",
          ),
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
              message: t(
                "common.locationError",
                "Could not determine your location.",
              ),
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
            message: t(
              "common.locationDenied",
              "Location access denied or failed.",
            ),
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
    if (!formData.registrationNumber.trim()) {
      dispatch(
        showNotification({
          message: t("auth.registrationNumberRequired", {
            defaultValue:
              "Registration Number is required for business accounts.",
          }),
          severity: "error",
        }),
      );
      return;
    }
    const bPhone = formData.businessPhone.trim();
    if (bPhone && (!bPhone.startsWith("+") || bPhone.length < 8)) {
      dispatch(
        showNotification({
          message: t(
            "auth.invalidBusinessPhone",
            "Business phone must start with '+' and have at least 8 characters.",
          ),
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

    if (!formData.confirmedDealer) {
      dispatch(
        showNotification({
          message: t("auth.confirmRegisteredDealer"),
          severity: "error",
        }),
      );
      return;
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
      } else {
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
      }

      onRegisterSuccess();
    } catch (err: any) {
      dispatch(
        showNotification({ message: formatAuthError(err), severity: "error" }),
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleRegister();
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
    <Box component="form" onSubmit={handleSubmit} p={2} sx={{ height: "auto" }}>
      <Alert severity="info" sx={{ mb: 3, borderRadius: 2, fontWeight: 600 }}>
        {t("auth.onlyVerifiedDealersNote")}
      </Alert>

      <Grid container spacing={2}>
        {textField("ownerEmail", t("auth.email"), "email")}
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
              getOptionLabel={(option) => t(`common.countries.${option}`, option)}
              onChange={(_, v) =>
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
              {geoLoading
                ? t("common.loading")
                : t("common.useMyLocation", "Use my location")}
            </Button>
          </Stack>
        </Grid>

        {textField("lat", t("auth.lat"))}
        {textField("lng", t("auth.lng"))}

        {/* Business specific verification fields */}
        {textField(
          "registrationNumber",
          t("auth.registrationNumber", {
            defaultValue: "Registration Number / VAT ID",
          }),
        )}
        {textField(
          "website",
          t("auth.website", { defaultValue: "Business Website (Optional)" }),
        )}
      </Grid>
      
      <Stack spacing={1} sx={{ mt: 2 }}>
        <FormControlLabel
          control={
            <Checkbox
              checked={formData.confirmedDealer}
              onChange={(e) =>
                setFormData({ ...formData, confirmedDealer: e.target.checked })
              }
            />
          }
          label={t("auth.confirmRegisteredDealer")}
        />

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
        />
      </Stack>

      <Button
        fullWidth
        variant="contained"
        sx={{ mt: 3, alignSelf: "end" }}
        type="submit"
        disabled={isLoading}
      >
        {isLoading
          ? t("auth.registering")
          : socialMode
            ? t("auth.completeReg")
            : t("auth.registerBusiness")}
      </Button>
    </Box>
  );
};

export default BusinessRegisterForm;
