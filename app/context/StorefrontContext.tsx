import { createContext } from "react";
import type { StoreSettingsState } from "~/redux/slices/storeSettingsSlice";

export type StorefrontSettings = Omit<StoreSettingsState, "isEditMode">;

export const StorefrontContext = createContext<StorefrontSettings | null>(null);

