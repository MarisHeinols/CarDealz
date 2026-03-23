import { createPagesFunctionHandler } from "@react-router/cloudflare";

// @ts-ignore - The build output won't exist until you run `npm run build`
import * as build from "../build/server/index.js";

export const onRequest = createPagesFunctionHandler({ build });
