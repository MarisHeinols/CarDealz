import AboutPage from "~/pages/AboutPage";

export function meta() {
  return [
    { title: "About BalticAuto" },
    { name: "description", content: "About BalticAuto - The premier car market in the Baltics" },
  ];
}

export default function AboutRoute() {
  return <AboutPage />;
}
