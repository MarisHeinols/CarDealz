import BusinessesPage from "~/pages/BusinessesPage";

export function meta() {
  return [{ title: "Businesses" }];
}

export default function BusinessesRoute() {
  return <BusinessesPage />;
}

