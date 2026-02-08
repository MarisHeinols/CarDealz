import React, { useState } from "react";
import { Box, TextField, Button } from "@mui/material";
import type { IndividualRegisterData } from "~/types/types";
import { registerUser } from "../../../services/auth";

const IndividualRegisterForm = () => {
  const [formData, setFormData] = useState<IndividualRegisterData>({
    name: "",
    surname: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
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
        formData.email,
        formData.password,
        {
          name: formData.name,
          surname: formData.surname,
          phone: formData.phone,
        },
        "individual",
      );

      alert("Registered successfully!");
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <Box component="form" sx={{ height: "33rem" }}>
      {Object.entries(formData).map(([key, value]) => (
        <TextField
          key={key}
          name={key}
          label={key}
          value={value}
          onChange={handleChange}
          fullWidth
          margin="normal"
        />
      ))}

      <Button
        fullWidth
        variant="contained"
        sx={{ mt: 2 }}
        onClick={handleRegister}
      >
        Register Individual
      </Button>
    </Box>
  );
};

export default IndividualRegisterForm;
