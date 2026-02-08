import { getAuth } from "firebase/auth";
import { app } from "./fireBaseConfig";

export const auth = getAuth(app);