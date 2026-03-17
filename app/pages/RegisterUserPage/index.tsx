import React, { useState } from "react";
import { Box, Paper, Tabs, Tab, Typography, Button } from "@mui/material";
import IndividualRegisterForm from "~/components/registerUserPageComponents/IndividualRegisterForm";
import BusinessRegisterForm from "~/components/registerUserPageComponents/BusinessRegisterForm";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";

const RegisterUserPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [tab, setTab] = useState(0);

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

        <Tabs value={tab} onChange={(_, v) => setTab(v)} centered>
          <Tab label={t("auth.individual")} />
          <Tab label={t("auth.business")} />
        </Tabs>

        {tab === 0 && <IndividualRegisterForm />}
        {tab === 1 && <BusinessRegisterForm />}
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
