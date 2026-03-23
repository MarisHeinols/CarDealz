import { createPagesFunctionHandler } from "@react-router/cloudflare";

// @ts-ignore - The build output won't exist until you run `npm run build`
import * as build from "../build/server/index.js";

const handler = createPagesFunctionHandler({ build });

export const onRequest = async (context: any) => {
  const url = new URL(context.request.url);
  console.log("[pages]", context.request.method, url.pathname);

  const response = await handler(context);

  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("text/html")) {
    response.headers.set("Cache-Control", "no-store");
  }

  console.log("[pages]", context.request.method, url.pathname, "->", response.status);
  return response;
};
