import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("listing/:id", "routes/listing.$id.tsx"),
  route("new-listing","routes/newListing.tsx"),
  route("businesses","routes/businesses.tsx"),
  route("about","routes/about.tsx"),
  route("store/:handle","routes/store.$handle.tsx"),
  route("user","routes/userStorePage.tsx"),
  route("admin","routes/admin.tsx"),
  route("pricing","routes/pricing.tsx"),
  route("choose-tier","routes/chooseTier.tsx"),
  route("login","routes/login.tsx"),
  route("register","routes/registerUser.tsx"),
  route("verify-phone","routes/verifyPhone.tsx"),
  route("super-admin", "routes/superAdmin.tsx"),
  route("privacy-policy", "routes/privacyPolicy.tsx"),
  route("terms-of-service", "routes/termsOfService.tsx"),
  route("sitemap.xml", "routes/sitemap.tsx")
] satisfies RouteConfig;
