import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "~/firebase/fireStore";
import type { StoreSettingsState } from "~/redux/slices/storeSettingsSlice";
import { cacheKeyStoreSettings, getAnyCachedValue, setCachedValue } from "~/services/storeCache";

const SETTINGS_COLLECTION = "storeSettings";

/**
 * Saves store settings to Firestore under storeSettings/{uid}
 */
export async function saveStoreSettings(
  uid: string,
  settings: StoreSettingsState
): Promise<void> {
  const settingsRef = doc(db, SETTINGS_COLLECTION, uid);
  // Omit isEditMode — that's UI-only state
  const { isEditMode, ...settingsToSave } = settings;
  await setDoc(settingsRef, settingsToSave, { merge: true });
  setCachedValue(cacheKeyStoreSettings(uid), settingsToSave);
}

/**
 * Loads store settings from Firestore for the given uid.
 * Returns null if no settings have been saved yet.
 */
export async function loadStoreSettingsFromDb(
  uid: string
): Promise<Omit<StoreSettingsState, "isEditMode"> | null> {
  const cached = getAnyCachedValue<Omit<StoreSettingsState, "isEditMode">>(cacheKeyStoreSettings(uid));
  if (cached) return cached;
  const settingsRef = doc(db, SETTINGS_COLLECTION, uid);
  const snap = await getDoc(settingsRef);
  if (!snap.exists()) return null;
  const value = snap.data() as Omit<StoreSettingsState, "isEditMode">;
  setCachedValue(cacheKeyStoreSettings(uid), value);
  return value;
}
