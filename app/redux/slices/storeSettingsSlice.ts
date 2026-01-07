import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface StoreTheme {
  primary: string;
  secondary: string;
  background: string;
  accent: string;
}

export interface StoreLocation {
  lat: number | null;
  lng: number | null;
}

export interface StoreSettingsState {
  name: string;
  description: string;
  contact: {
    phone: string;
    email: string;
  };
  bannerImage: string | null;
  logo: string | null;
  location: StoreLocation;
  theme: StoreTheme;
  isEditMode: boolean;
}

const initialState: StoreSettingsState = {
  name: "My Store",
  description: "Welcome to my dealership!",
  contact: {
    phone: "",
    email: "",
  },
  bannerImage: null,
  logo: null,
  location: {
    lat: null,
    lng: null,
  },
  theme: {
    primary: "#1976d2",
    secondary: "#ff9800",
    background: "#ffffff",
    accent: "#4caf50",
  },
  isEditMode: false,
};

export const storeSettingsSlice = createSlice({
  name: "storeSettings",
  initialState,
  reducers: {
    setStoreName: (state, action: PayloadAction<string>) => {
      state.name = action.payload;
    },
    setDescription: (state, action: PayloadAction<string>) => {
      state.description = action.payload;
    },
    setContactInfo: (
      state,
      action: PayloadAction<{ phone: string; email: string }>
    ) => {
      state.contact = action.payload;
    },
    setBannerImage: (state, action: PayloadAction<string | null>) => {
      state.bannerImage = action.payload;
    },
    setLogo: (state, action: PayloadAction<string | null>) => {
      state.logo = action.payload;
    },
    setLocation: (
      state,
      action: PayloadAction<{ lat: number; lng: number }>
    ) => {
      state.location = action.payload;
    },
    updateTheme: (state, action: PayloadAction<Partial<StoreTheme>>) => {
      state.theme = { ...state.theme, ...action.payload };
    },
    toggleEditMode: (state) => {
      state.isEditMode = !state.isEditMode;
    },
    loadStoreSettings: (_state, action: PayloadAction<StoreSettingsState>) => {
      return action.payload;
    },
  },
});

export const {
  setStoreName,
  setDescription,
  setContactInfo,
  setBannerImage,
  setLogo,
  setLocation,
  updateTheme,
  toggleEditMode,
  loadStoreSettings,
} = storeSettingsSlice.actions;

export default storeSettingsSlice.reducer;
