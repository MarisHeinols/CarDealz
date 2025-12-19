import ListingPage from "~/pages/ListingPage";
import type { Route } from "./+types/listing.$id";
import { useParams } from "react-router";

export function meta({ params }: { params: { id: string } }) {
  return [{ title: `Listing ${params.id}` }];
}

export default function ListingRoute() {
  const { id } = useParams<{ id: string }>();

  if (!id) return <div>Not found</div>;

  return <ListingPage id={id} />;
}
