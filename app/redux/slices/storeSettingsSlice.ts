import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface StoreTheme {
  primary: string;
  secondary: string;
  background: string;
  accent: string;
  heading: string;
  isTextLight: boolean;
  layout: "classic" | "modern" | "minimal";
}

export interface StoreLocation {
  adress: string;
  cords: {
    lat: number | null;
    lng: number | null;
  };
}

export interface WorkDay {
  open: string;
  close: string;
  isClosed: boolean;
}

export type WorkTime = Record<string, WorkDay>;

export interface StoreSettingsState {
  name: string;
  description: string;
  contact: {
    phone: string;
    email: string;
  };
  workTime: WorkTime;
  bannerImage: string | null;
  logo: string | null;
  location: StoreLocation;
  theme: StoreTheme;
  isEditMode: boolean;
}

const defaultDay: WorkDay = { open: "09:00", close: "18:00", isClosed: false };

const initialState: StoreSettingsState = {
  name: "My Store",
  description: "Welcome to my dealership!",
  contact: {
    phone: "",
    email: "",
  },
  workTime: {
    Monday: { ...defaultDay },
    Tuesday: { ...defaultDay },
    Wednesday: { ...defaultDay },
    Thursday: { ...defaultDay },
    Friday: { ...defaultDay },
    Saturday: { ...defaultDay, open: "10:00", close: "16:00" },
    Sunday: { ...defaultDay, isClosed: true },
  },
  bannerImage: null,
  logo: null,
  location: {
    adress: "",
    cords: {
      lat: null,
      lng: null,
    },
  },
  theme: {
    primary: "rgb(122, 0, 129)",
    secondary: "#ffffff",
    background: "#ffffff",
    accent: "#4caf50",
    heading: "#111827",
    isTextLight: false,
    layout: "classic",
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
      action: PayloadAction<StoreLocation>
    ) => {
      state.location = action.payload;
    },
    setWorkTime: (state, action: PayloadAction<WorkTime>) => {
      state.workTime = action.payload;
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
  setWorkTime,
  setLocation,
  updateTheme,
  toggleEditMode,
  loadStoreSettings,
} = storeSettingsSlice.actions;

export default storeSettingsSlice.reducer;
