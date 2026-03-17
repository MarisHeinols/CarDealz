import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import type { BusinessRegisterData } from "~/types/types";
import { registerUser } from "../../../services/auth";
import { useNavigate } from "react-router";
import { useAppDispatch } from "~/redux/hooks";
import { showNotification } from "~/redux/slices/uiSlice";
import { COUNTRIES } from "~/constants/countries";

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
    country: "",
    lat: "",
    lng: "",
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
        formData.ownerEmail,
        formData.password,
        { ...formData },
        "business",
      );

      dispatch(showNotification({ message: "Business registration successful! Please log in.", severity: "success" }));
      navigate("/login");
    } catch (err: any) {
      dispatch(showNotification({ message: err.message, severity: "error" }));
    } finally {
      setIsLoading(false);
    }
  };

  const textField = (name: keyof BusinessRegisterData, label: string, type = "text") => (
    <Grid size={{ xs: 12, sm: 6 }} key={name}>
      <TextField
        fullWidth
        name={name}
        label={label}
        type={type}
        value={formData[name]}
        onChange={handleChange}
      />
    </Grid>
  );

  return (
    <Box component="form" p={2} sx={{ height: "auto" }}>
      <Grid container spacing={2}>
        {textField("ownerName", "Owner First Name")}
        {textField("ownerSurname", "Owner Surname")}
        {textField("ownerEmail", "Owner Email", "email")}
        {textField("ownerPhone", "Owner Phone")}
        {textField("password", "Password", "password")}
        {textField("confirmPassword", "Confirm Password", "password")}
        {textField("storeName", "Store / Business Name")}
        {textField("businessEmail", "Business Email", "email")}
        {textField("businessPhone", "Business Phone")}
        {textField("address", "Address")}

        {/* Country */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormControl fullWidth>
            <InputLabel id="bus-country-label">Country</InputLabel>
            <Select
              labelId="bus-country-label"
              label="Country"
              value={formData.country}
              onChange={(e) =>
                setFormData({ ...formData, country: e.target.value })
              }
            >
              {COUNTRIES.map((c) => (
                <MenuItem key={c} value={c}>
                  {c}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {textField("lat", "Latitude")}
        {textField("lng", "Longitude")}
      </Grid>

      <Button
        fullWidth
        variant="contained"
        sx={{ mt: 3, alignSelf: "end" }}
        onClick={handleRegister}
        disabled={isLoading}
      >
        {isLoading ? "Registering…" : "Register Business"}
      </Button>
    </Box>
  );
};

export default BusinessRegisterForm;
