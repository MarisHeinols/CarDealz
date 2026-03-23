import { createPagesFunctionHandler } from "@react-router/cloudflare";
import type { PagesFunction } from "@cloudflare/workers-types";

// @ts-ignore - The build output won't exist until you run `npm run build`
import * as build from "../build/server/index.js";

const handler = createPagesFunctionHandler({ build });

export const onRequest: PagesFunction = async (context) => {
  const url = new URL(context.request.url);
  console.log("[pages]", context.request.method, url.pathname);

  const response = await handler(context);

  console.log("[pages]", context.request.method, url.pathname, "->", response.status);
  return response;
};
