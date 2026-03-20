import React, { useState } from "react";
import { Box, Paper, Tabs, Tab, Typography, Button } from "@mui/material";
import IndividualRegisterForm from "~/components/registerUserPageComponents/IndividualRegisterForm";
import BusinessRegisterForm from "~/components/registerUserPageComponents/BusinessRegisterForm";
import { useNavigate, useSearchParams } from "react-router";
import { useTranslation } from "react-i18next";
import { auth } from "~/firebase/auth";
import { useAuth } from "~/hooks/userStore/useAuth";

const RegisterUserPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const socialMode = searchParams.get("social") === "1";

  const { user: currentUser } = useAuth();
  const [tab, setTab] = useState(0);

  React.useEffect(() => {
    // If we're forcing profile completion but user is gone
    if (socialMode && !currentUser) {
      navigate("/login");
      return;
    }

    // If logged in and just visiting registration, go home
    if (!socialMode && currentUser) {
      navigate("/");
    }
  }, [navigate, socialMode, currentUser]);

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
        <Typography variant="h5" align="center" mb={2}>
          {t("auth.registerTitle")}
        </Typography>

        {socialMode ? (
          <Typography
            variant="body2"
            color="text.secondary"
            align="center"
            mb={2}
          >
            You signed in successfully. Please complete your profile to
            continue.
          </Typography>
        ) : null}

        <Tabs value={tab} onChange={(_, v) => setTab(v)} centered>
          <Tab label={t("auth.individual")} />
          <Tab label={t("auth.business")} />
        </Tabs>

        {tab === 0 && <IndividualRegisterForm socialMode={socialMode} />}
        {tab === 1 && <BusinessRegisterForm socialMode={socialMode} />}
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
