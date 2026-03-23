import BusinessesPage from "~/pages/BusinessesPage";

export function meta() {
  return [
    { title: "Car Dealerships & Automotive Businesses | BalticAuto" },
    { name: "description", content: "Discover top verified car dealerships, repair shops, and automotive businesses across Estonia, Latvia, and Lithuania." },
  ];
}

export default function BusinessesRoute() {
  return <BusinessesPage />;
}

