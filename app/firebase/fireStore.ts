import { getFirestore } from "firebase/firestore";
import { app } from "./fireBaseConfig";

export const db = getFirestore(app);