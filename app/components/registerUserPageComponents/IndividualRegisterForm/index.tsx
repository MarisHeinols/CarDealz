import React, { useState } from "react";
import { Box, TextField, Button, FormControl, InputLabel, Select, MenuItem, FormControlLabel, Checkbox, Link } from "@mui/material";
import { useTranslation } from "react-i18next";
import { Link as RouterLink } from "react-router";
import type { IndividualRegisterData } from "~/types/types";
import {
  completeSocialRegistration,
  formatAuthError,
  registerUser,
  sendVerificationEmail,
} from "../../../services/auth";
import { useNavigate } from "react-router";
import { useAppDispatch } from "~/redux/hooks";
import { showNotification } from "~/redux/slices/uiSlice";
import { COUNTRIES } from "~/constants/countries";
import { auth } from "~/firebase/auth";

const IndividualRegisterForm = ({ socialMode, onRegisterSuccess }: { socialMode?: boolean; onRegisterSuccess: () => void }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [formData, setFormData] = useState<IndividualRegisterData>({
    name: auth.currentUser?.displayName?.split(" ")[0] || "",
    surname: auth.currentUser?.displayName?.split(" ").slice(1).join(" ") || "",
    email: auth.currentUser?.email || "",
    phone: "",
    country: "",
    password: "",
    confirmPassword: "",
    acceptedTerms: false,
  });

  // Sync social data in case it arrived after initial mount
  React.useEffect(() => {
    if (socialMode && auth.currentUser) {
       setFormData(prev => ({
         ...prev,
         name: prev.name || auth.currentUser?.displayName?.split(" ")[0] || "",
         surname: prev.surname || auth.currentUser?.displayName?.split(" ").slice(1).join(" ") || "",
         email: prev.email || auth.currentUser?.email || "",
       }));
    }
  }, [socialMode]);

  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useAppDispatch();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async () => {
    if (!socialMode) {
      if (formData.password !== formData.confirmPassword) {
        dispatch(
          showNotification({
            message: t("auth.passwordsDontMatch"),
            severity: "error",
          }),
        );
        return;
      }
      if (!formData.email.trim()) {
        dispatch(
          showNotification({
            message: t("auth.emailRequired"),
            severity: "error",
          }),
        );
        return;
      }
    }

    if (!formData.name.trim() || !formData.surname.trim()) {
      dispatch(
        showNotification({
          message: t("auth.fieldsRequired"),
          severity: "error",
        }),
      );
      return;
    }

    const phone = formData.phone.trim();
    if (!phone.startsWith("+") || phone.length < 8) {
      dispatch(
        showNotification({
          message: t("auth.invalidPhone", "Phone number must start with '+' and have at least 8 characters."),
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
            name: formData.name,
            surname: formData.surname,
            phone: formData.phone,
            country: formData.country,
            acceptedTerms: true,
            acceptedTermsAt: new Date().toISOString(),
          },
          "individual",
        );
      } else {
        const cred = await registerUser(
          formData.email,
          formData.password,
          {
            name: formData.name,
            surname: formData.surname,
            phone: formData.phone,
            country: formData.country,
            acceptedTerms: true,
            acceptedTermsAt: new Date().toISOString(),
          },
          "individual",
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

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ height: "auto" }}>
      <TextField
        name="name"
        label={t("auth.firstName")}
        value={formData.name}
        onChange={handleChange}
        fullWidth
        margin="normal"
      />
      <TextField
        name="surname"
        label={t("auth.surname")}
        value={formData.surname}
        onChange={handleChange}
        fullWidth
        margin="normal"
      />
      <TextField
        name="email"
        label={t("auth.email")}
        type="email"
        value={formData.email}
        onChange={handleChange}
        fullWidth
        margin="normal"
        disabled={Boolean(socialMode)}
      />
      <TextField
        name="phone"
        label={t("auth.phone")}
        value={formData.phone}
        onChange={handleChange}
        fullWidth
        margin="normal"
      />
      <FormControl fullWidth margin="normal">
        <InputLabel id="country-label">{t("auth.country")}</InputLabel>
        <Select
          labelId="country-label"
          label={t("auth.country")}
          value={formData.country}
          onChange={(e) =>
            setFormData({ ...formData, country: e.target.value })
          }
        >
          {COUNTRIES.map((c) => (
            <MenuItem key={c} value={c}>
              {c}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <TextField
        name="password"
        label={t("auth.password")}
        type="password"
        value={formData.password}
        onChange={handleChange}
        fullWidth
        margin="normal"
        disabled={Boolean(socialMode)}
      />
      <TextField
        name="confirmPassword"
        label={t("auth.confirmPassword")}
        type="password"
        value={formData.confirmPassword}
        onChange={handleChange}
        fullWidth
        margin="normal"
        disabled={Boolean(socialMode)}
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
        sx={{ mt: 1 }}
      />

      <Button
        fullWidth
        variant="contained"
        sx={{ mt: 2 }}
        type="submit"
        disabled={isLoading}
      >
        {isLoading
          ? t("auth.registering")
          : socialMode
            ? t("auth.completeReg")
            : t("auth.registerIndividual")}
      </Button>

    </Box>
  );
};

export default IndividualRegisterForm;
