import { Box, Paper, Typography, Button } from "@mui/material";
import React from "react";
import { useNavigate } from "react-router";

const PleaseLogin = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: "70vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 3,
      }}
    >
      <Paper
        sx={{
          p: 4,
          maxWidth: 480,
          textAlign: "center",
          borderRadius: 3,
        }}
      >
        <Typography variant="h5" fontWeight={600} mb={1}>
          You don’t have access
        </Typography>

        <Typography color="text.secondary" mb={3}>
          Please register or log in to have access to this feature
        </Typography>

        <Button variant="contained" onClick={() => navigate("/login")}>
          Go to Login
        </Button>
      </Paper>
    </Box>
  );
};

export default PleaseLogin;
