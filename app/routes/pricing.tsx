import PricingPage from "~/pages/PricingPage";

export function meta() {
  return [
    { title: "Pricing & Listing Plans | BalticAuto" },
    { name: "description", content: "Affordable listing options for private sellers and comprehensive business plans for car dealerships on BalticAuto." },
  ];
}

export default function PricingRoute() {
  return <PricingPage />;
}
