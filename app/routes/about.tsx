import AboutPage from "~/pages/AboutPage";

export function meta() {
  return [
    { title: "About Us | BalticAuto - The Baltic Car Marketplace" },
    { name: "description", content: "Learn about BalticAuto's mission to transform how people buy and sell cars in the Baltic states. Our platform connects thousands of buyers and sellers daily." },
  ];
}

export default function AboutRoute() {
  return <AboutPage />;
}
