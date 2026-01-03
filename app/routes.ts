import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("listing/:id", "routes/listing.$id.tsx"),
  route("new-listing","routes/newListing.tsx"),
  route("user","routes/userStorePage.tsx")
] satisfies RouteConfig;
