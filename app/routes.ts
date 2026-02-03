import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("listing/:id", "routes/listing.$id.tsx"),
  route("new-listing","routes/newListing.tsx"),
  route("user","routes/userStorePage.tsx"),
  route("admin","routes/admin.tsx"),
  route("login","routes/login.tsx"),
  route("register","routes/registerUser.tsx")
] satisfies RouteConfig;
