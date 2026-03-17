import { configureStore } from "@reduxjs/toolkit";
import storeSettingsReducer from "./slices/storeSettingsSlice";
import uiReducer from "./slices/uiSlice";

export const store = configureStore({
  reducer: {
    storeSettings: storeSettingsReducer,
    ui: uiReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;