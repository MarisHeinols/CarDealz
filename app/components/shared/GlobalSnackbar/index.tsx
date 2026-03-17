import React from "react";
import { Snackbar, Alert } from "@mui/material";
import { useAppDispatch, useAppSelector } from "~/redux/hooks";
import { hideNotification } from "~/redux/slices/uiSlice";

const GlobalSnackbar = () => {
  const dispatch = useAppDispatch();
  const { open, message, severity } = useAppSelector((state) => state.ui);

  const handleClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === "clickaway") return;
    dispatch(hideNotification());
  };

  return (
    <Snackbar
      open={open}
      autoHideDuration={4000}
      onClose={handleClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
    >
      <Alert onClose={handleClose} severity={severity} sx={{ width: "100%" }} variant="filled">
        {message}
      </Alert>
    </Snackbar>
  );
};

export default GlobalSnackbar;
