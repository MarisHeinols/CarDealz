import PricingPage from "~/pages/PricingPage";

export function meta() {
  return [
    { title: "Pricing" },
    { name: "Pricing", content: "Pricing and subscription tiers" },
  ];
}

export default function PricingRoute() {
  return <PricingPage />;
}
