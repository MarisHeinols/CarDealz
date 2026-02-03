import React, { useState } from "react";
import { Box, TextField, Button, Grid } from "@mui/material";
import type { BusinessRegisterData } from "~/types/types";

const BusinessRegisterForm = () => {
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

  return (
    <Box component="form" p={2}>
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

      <Button fullWidth variant="contained" sx={{ mt: 3 }}>
        Register Business
      </Button>
    </Box>
  );
};

export default BusinessRegisterForm;
