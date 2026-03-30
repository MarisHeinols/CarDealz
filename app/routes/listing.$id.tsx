import ListingPage from "~/pages/ListingPage";
import type { Route } from "./+types/listing.$id";
import { useParams, isRouteErrorResponse } from "react-router";
import ListingNotFound from "~/components/listingPageComponents/ListingNotFound";

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  const { id } = params;
  if (!id || typeof id !== "string" || !id.trim()) {
    throw new Response("Not Found", { status: 404 });
  }
  const { getListingDetails } = await import("~/services/listingsService");
  let listing = null;
  try {
    listing = await getListingDetails(id);
  } catch (e) {
    console.error("Listing loader failed", { id, error: e });
    throw new Response("Failed to load listing", { status: 500 });
  }
  if (!listing) {
    throw new Response("Not Found", { status: 404 });
  }
  return { listing };
}

export function meta({ data, params }: Route.MetaArgs) {
  // With clientLoader, data may not be available on initial SSR
  // Return default meta and let the client update it after loading
  if (!data?.listing) {
    const id = params.id;
    return [
      {
        title: id
          ? `Car Listing | BalticAuto`
          : "Listing Not Found | BalticAuto",
      },
      { name: "description", content: "View car details on BalticAuto" },
    ];
  }

  const { year, make, model, price, location, description } = data.listing;
  const safePrice = typeof price === "number" ? price.toLocaleString() : "N/A";
  const title =
    `${year || ""} ${make || ""} ${model || ""} for sale in ${location || ""} - €${safePrice} | BalticAuto`
      .replace(/\s+/g, " ")
      .trim();
  const desc =
    description?.slice(0, 160) ||
    `Check out this ${year || "car"} ${make || ""} ${model || ""} on BalticAuto.`.replace(
      /\s+/g,
      " ",
    );

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

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  if (isRouteErrorResponse(error) && error.status === 404) {
    return <ListingNotFound />;
  }

  // For other errors, we can fall back to the root error boundary
  // or show a generic error here.
  throw error;
}
