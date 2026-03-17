import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import type { IndividualRegisterData } from "~/types/types";
import { registerUser } from "../../../services/auth";
import { useNavigate } from "react-router";
import { useAppDispatch } from "~/redux/hooks";
import { showNotification } from "~/redux/slices/uiSlice";
import { COUNTRIES } from "~/constants/countries";

const IndividualRegisterForm = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<IndividualRegisterData>({
    name: "",
    surname: "",
    email: "",
    phone: "",
    country: "",
    password: "",
    confirmPassword: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useAppDispatch();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async () => {
    if (formData.password !== formData.confirmPassword) {
      dispatch(showNotification({ message: "Passwords do not match", severity: "error" }));
      return;
    }

    setIsLoading(true);
    try {
      await registerUser(
        formData.email,
        formData.password,
        {
          name: formData.name,
          surname: formData.surname,
          phone: formData.phone,
          country: formData.country,
        },
        "individual",
      );

      dispatch(showNotification({ message: "Registration successful! Please log in.", severity: "success" }));
      navigate("/login");
    } catch (err: any) {
      dispatch(showNotification({ message: err.message, severity: "error" }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box component="form" sx={{ height: "auto" }}>
      <TextField
        name="name"
        label="First Name"
        value={formData.name}
        onChange={handleChange}
        fullWidth
        margin="normal"
      />
      <TextField
        name="surname"
        label="Surname"
        value={formData.surname}
        onChange={handleChange}
        fullWidth
        margin="normal"
      />
      <TextField
        name="email"
        label="Email"
        type="email"
        value={formData.email}
        onChange={handleChange}
        fullWidth
        margin="normal"
      />
      <TextField
        name="phone"
        label="Phone"
        value={formData.phone}
        onChange={handleChange}
        fullWidth
        margin="normal"
      />
      <FormControl fullWidth margin="normal">
        <InputLabel id="country-label">Country</InputLabel>
        <Select
          labelId="country-label"
          label="Country"
          value={formData.country}
          onChange={(e) => setFormData({ ...formData, country: e.target.value })}
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
        label="Password"
        type="password"
        value={formData.password}
        onChange={handleChange}
        fullWidth
        margin="normal"
      />
      <TextField
        name="confirmPassword"
        label="Confirm Password"
        type="password"
        value={formData.confirmPassword}
        onChange={handleChange}
        fullWidth
        margin="normal"
      />

      <Button
        fullWidth
        variant="contained"
        sx={{ mt: 2 }}
        onClick={handleRegister}
        disabled={isLoading}
      >
        {isLoading ? "Registering…" : "Register Individual"}
      </Button>
    </Box>
  );
};

export default IndividualRegisterForm;
