import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  IconButton,
  InputAdornment,
  Divider,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import React, { useState } from "react";
import { useNavigate } from "react-router";
import { login } from "~/services/auth";
import { useAppDispatch } from "~/redux/hooks";
import { showNotification } from "~/redux/slices/uiSlice";
import { useTranslation } from "react-i18next";

const LoginPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useAppDispatch();

  const handleLogin = async () => {
    const e = email.trim();
    if (!e || !password) {
      dispatch(showNotification({ message: t("auth.pleaseEnterEmailPassword"), severity: "error" }));
      return;
    }
    
    setIsLoading(true);
    try {
      await login(e, password);
      dispatch(showNotification({ message: t("auth.loginSuccess"), severity: "success" }));
      navigate("/");
    } catch (err: any) {
      const msg =
        typeof err?.code === "string"
          ? `${err.code}: ${err.message || t("auth.loginFailed")}`
          : err?.message || t("auth.loginFailed");
      dispatch(showNotification({ message: msg, severity: "error" }));
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
