import NewListingPage from "~/pages/NewListingPage";

export function meta() {
  return [
    { title: "Create New Listing" },
    { name: "description", content: "Create a new car listing" },
  ];
}

export default function NewListingRoute() {
  return <NewListingPage />;
}
