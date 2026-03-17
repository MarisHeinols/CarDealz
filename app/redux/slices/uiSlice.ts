import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface SnackbarState {
  open: boolean;
  message: string;
  severity: "success" | "info" | "warning" | "error";
}

const initialState: SnackbarState = {
  open: false,
  message: "",
  severity: "info",
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    showNotification: (
      state,
      action: PayloadAction<{ message: string; severity?: "success" | "info" | "warning" | "error" }>
    ) => {
      state.message = action.payload.message;
      state.severity = action.payload.severity || "info";
      state.open = true;
    },
    hideNotification: (state) => {
      state.open = false;
    },
  },
});

export const { showNotification, hideNotification } = uiSlice.actions;
export default uiSlice.reducer;
