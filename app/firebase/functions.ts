import { getFunctions } from "firebase/functions";
import { app } from "./fireBaseConfig";

export const functions = getFunctions(app, "europe-west1");
