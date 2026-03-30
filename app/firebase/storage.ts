import { getStorage } from "firebase/storage";
import { app } from "./fireBaseConfig";

export const storage = getStorage(app, "gs://cardealz-ba34b.firebasestorage.app");
