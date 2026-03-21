import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  IconButton,
  InputAdornment,
  Divider,
  Stack,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import GoogleIcon from "@mui/icons-material/Google";
import React, { useState } from "react";
import { useNavigate } from "react-router";
import {
  formatAuthError,
  isEmailVerified,
  login,
  loginWithGoogle,
  needsPhoneVerification,
  refreshCurrentUser,
  sendVerificationEmail,
} from "~/services/auth";
import { useAuth } from "~/hooks/userStore/useAuth";
import { useAppDispatch } from "~/redux/hooks";
import { showNotification } from "~/redux/slices/uiSlice";
import { useTranslation } from "react-i18next";
import { auth } from "~/firebase/auth";
import { getUserProfile } from "~/services/usersService";

const LoginPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user: currentUser } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useAppDispatch();

  React.useEffect(() => {
    if (currentUser) {
      navigate("/");
    }
  }, [currentUser, navigate]);

  const handleLogin = async () => {
    const e = email.trim();
    if (!e || !password) {
      dispatch(
        showNotification({
          message: t("auth.pleaseEnterEmailPassword"),
          severity: "error",
        }),
      );
      return;
    }

    setIsLoading(true);
    try {
      await login(e, password);
      await refreshCurrentUser();
      const user = auth.currentUser;

      if (user) {
        const profile = await getUserProfile(user.uid).catch(() => null);
        if (!profile) {
          dispatch(
            showNotification({
              message: t("auth.finishRegistrationPrompt", {
                defaultValue: "Finish registration to create your profile.",
              }),
              severity: "info",
            }),
          );
          navigate("/register?social=1");
          return;
        }
      }
      if (!isEmailVerified(user)) {
        try {
          if (user) await sendVerificationEmail(user);
        } catch {
          // ignore
        }
        dispatch(
          showNotification({
            message: t("auth.verifyEmailPrompt", {
              defaultValue:
                "Please verify your email address. We have sent a verification link to your email.",
            }),
            severity: "warning",
          }),
        );
        return;
      }

      if (needsPhoneVerification(user)) {
        dispatch(
          showNotification({
            message: t("auth.verifyPhonePrompt", {
              defaultValue: "Please verify your phone number to continue.",
            }),
            severity: "info",
          }),
        );
        navigate("/verify-phone");
        return;
      }

      dispatch(
        showNotification({
          message: t("auth.loginSuccess"),
          severity: "success",
        }),
      );
      navigate("/");
    } catch (err: any) {
      dispatch(
        showNotification({ message: formatAuthError(err), severity: "error" }),
      );
    } finally {
      setIsLoading(false);
    }
  };

  const socialLogin = async () => {
    setIsLoading(true);
    try {
      await loginWithGoogle();

      await refreshCurrentUser();
      const user = auth.currentUser;

      if (user) {
        const profile = await getUserProfile(user.uid).catch(() => null);
        if (!profile) {
          dispatch(
            showNotification({
              message: t("auth.finishRegistrationPrompt", {
                defaultValue: "Finish registration to create your profile.",
              }),
              severity: "info",
            }),
          );
          navigate("/register?social=1");
          return;
        }
      }

      if (needsPhoneVerification(user)) {
        dispatch(
          showNotification({
            message: t("auth.verifyPhonePrompt", {
              defaultValue: "Please verify your phone number to continue.",
            }),
            severity: "info",
          }),
        );
        navigate("/verify-phone");
        return;
      }

      dispatch(
        showNotification({
          message: t("auth.loginSuccess"),
          severity: "success",
        }),
      );
      navigate("/");
    } catch (err: any) {
      dispatch(
        showNotification({ message: formatAuthError(err), severity: "error" }),
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "#f5f5f5",
      }}
    >
      <Paper elevation={3} sx={{ p: 4, width: 350 }}>
        <Typography variant="h5" align="center" mb={2}>
          {t("auth.loginTitle")}
        </Typography>

        <Stack
          spacing={1.25}
          sx={{
            mb: 2,
            p: 1.5,
            borderRadius: 2,
            border: "1px solid",
            borderColor: "divider",
            bgcolor: "rgba(0,0,0,0.02)",
          }}
        >
          <Button
            fullWidth
            variant="outlined"
            onClick={() => socialLogin()}
            disabled={isLoading}
            startIcon={<GoogleIcon />}
            sx={{ height: 44, textTransform: "none", fontWeight: 700 }}
          >
            {t("auth.continueWithGoogle", {
              defaultValue: "Continue with Google",
            })}
          </Button>
        </Stack>

        <Divider sx={{ my: 2 }}>{t("common.or")}</Divider>

        <TextField
          fullWidth
          label={t("auth.email")}
          margin="normal"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading}
        />

        <TextField
          fullWidth
          label={t("auth.password")}
          margin="normal"
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isLoading}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword((p) => !p)}>
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <Button
          fullWidth
          variant="contained"
          sx={{ mt: 2 }}
          onClick={handleLogin}
          disabled={isLoading}
        >
          {isLoading ? t("auth.signingIn") : t("auth.signIn")}
        </Button>

        <Divider sx={{ my: 3 }}>{t("common.or")}</Divider>

        <Button
          fullWidth
          variant="outlined"
          onClick={() => navigate("/register")}
        >
          {t("auth.register")}
        </Button>
      </Paper>
    </Box>
  );
};

export default LoginPage;
