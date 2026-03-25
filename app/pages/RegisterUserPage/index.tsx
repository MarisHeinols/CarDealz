import React from "react";
import { Box, Paper, Typography, Button } from "@mui/material";
import BusinessRegisterForm from "~/components/registerUserPageComponents/BusinessRegisterForm";
import { useNavigate, useSearchParams } from "react-router";
import { useTranslation } from "react-i18next";
import { useAuth } from "~/hooks/userStore/useAuth";
import { useUserProfile } from "~/hooks/userStore/useUserProfile";

const RegisterUserPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const socialMode = searchParams.get("social") === "1";

  const { user: currentUser } = useAuth();
  const { profile } = useUserProfile();

  React.useEffect(() => {
    // If we're forcing profile completion but user is gone
    if (socialMode && !currentUser) {
      navigate("/login");
      return;
    }

    // If fully logged in (with role) and just visiting registration, go home
    if (!socialMode && currentUser && profile?.role) {
      navigate("/");
    }
  }, [navigate, socialMode, currentUser, profile?.role]);

  const handleRegisterSuccess = () => {
    navigate("/?registered=1");
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        bgcolor: "#f5f5f5",
      }}
    >
      <Paper sx={{ p: 4, width: "100%", maxWidth: 700 }}>
        <Typography variant="h5" fontWeight={900} align="center" mb={2}>
          {t("auth.registerTitle")}
        </Typography>

        {socialMode &&
        currentUser?.providerData?.some((p) => p.providerId !== "password") ? (
          <Typography
            variant="body2"
            color="text.secondary"
            align="center"
            mb={2}
          >
            {t(
              "auth.socialSignInSuccess",
              "You signed in successfully. Please complete your profile to continue.",
            )}
          </Typography>
        ) : null}

        <BusinessRegisterForm
          socialMode={socialMode}
          onRegisterSuccess={handleRegisterSuccess}
        />

        <Button
          sx={{ width: "100%", my: "1rem" }}
          onClick={() => {
            navigate("/login");
          }}
        >
          {t("common.cancel")}
        </Button>
      </Paper>
    </Box>
  );
};

export default RegisterUserPage;
