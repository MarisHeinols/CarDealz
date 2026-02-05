import React, { useState } from "react";
import { Box, TextField, Button } from "@mui/material";
import type { IndividualRegisterData } from "~/types/types";

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

      <Button fullWidth variant="contained" sx={{ mt: 2 }}>
        Register Individual
      </Button>
    </Box>
  );
};

export default IndividualRegisterForm;
