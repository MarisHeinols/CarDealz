import React, { useState } from "react";
import { Box, TextField, Button, Grid } from "@mui/material";
import type { BusinessRegisterData } from "~/types/types";
import { registerUser } from "../../../services/auth";
import { useNavigate } from "react-router";

const BusinessRegisterForm = () => {
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
    lat: "",
    lng: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async () => {
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      await registerUser(
        formData.ownerEmail,
        formData.password,
        {
          ...formData,
        },
        "business",
      );

      navigate("/login");
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <Box component="form" p={2} sx={{ height: "33rem" }}>
      <Grid container spacing={2}>
        {Object.entries(formData).map(([key, value]) => (
          <Grid size={{ xs: 12, sm: 6 }} key={key}>
            <TextField
              fullWidth
              name={key}
              label={key}
              value={value}
              onChange={handleChange}
            />
          </Grid>
        ))}
      </Grid>

      <Button
        fullWidth
        variant="contained"
        sx={{ mt: 3, alignSelf: "end" }}
        onClick={handleRegister}
      >
        Register Business
      </Button>
    </Box>
  );
};

export default BusinessRegisterForm;
