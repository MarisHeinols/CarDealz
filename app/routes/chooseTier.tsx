import ChooseTierPage from "~/pages/ChooseTierPage";

export function meta() {
  return [
    { title: "Choose Tier" },
    { name: "Choose Tier", content: "Select subscription tier" },
  ];
}

export default function ChooseTierRoute() {
  return <ChooseTierPage />;
}
