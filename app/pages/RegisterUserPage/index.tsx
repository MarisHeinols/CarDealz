import React, { useState } from "react";
import { Box, Paper, Tabs, Tab, Typography } from "@mui/material";
import IndividualRegisterForm from "~/components/registerUserPageComponents/IndividualRegisterForm";
import BusinessRegisterForm from "~/components/registerUserPageComponents/BusinessRegisterForm";

const RegisterUserPage: React.FC = () => {
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
          Register
        </Typography>

        <Tabs value={tab} onChange={(_, v) => setTab(v)} centered>
          <Tab label="Individual" />
          <Tab label="Business" />
        </Tabs>

        {tab === 0 && <IndividualRegisterForm />}
        {tab === 1 && <BusinessRegisterForm />}
      </Paper>
    </Box>
  );
};

export default RegisterUserPage;
