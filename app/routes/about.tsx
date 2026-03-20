import AboutPage from "~/pages/AboutPage";

export function meta() {
  return [
    { title: "About" },
    { name: "description", content: "About CarDealz" },
  ];
}

export default function AboutRoute() {
  return <AboutPage />;
}
