import { configureStore } from "@reduxjs/toolkit";
import storeSettingsReducer from "./slices/storeSettingsSlice";

export const store = configureStore({
  reducer: {
    storeSettings: storeSettingsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;