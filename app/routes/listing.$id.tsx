import ListingPage from "~/pages/ListingPage";
import type { Route } from "./+types/listing.$id";
import { useParams } from "react-router";

export async function loader({ params }: Route.LoaderArgs) {
  const { id } = params;
  const { getListingDetails } = await import("~/services/listingsService");
  const listing = await getListingDetails(id);
  if (!listing) {
    throw new Response("Not Found", { status: 404 });
  }
  return { listing };
}

export function meta({ data, params }: Route.MetaArgs) {
  if (!data?.listing) return [{ title: "Listing Not Found | BalticAuto" }];
  const { year, make, model, price, location, description } = data.listing;
  const title = `${year} ${make} ${model} for sale in ${location} - €${price.toLocaleString()} | BalticAuto`;
  const desc = description?.slice(0, 160) || `Check out this ${year} ${make} ${model} on BalticAuto.`;
  
  return [
    { title },
    { name: "description", content: desc },
    { property: "og:title", content: title },
    { property: "og:description", content: desc },
    { property: "og:type", content: "website" },
  ];
}

export default function ListingRoute() {
  const { id } = useParams<{ id: string }>();

  if (!id) return <div>Not found</div>;

  return <ListingPage id={id} />;
}
