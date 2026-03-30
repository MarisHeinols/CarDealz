import StorePage from "~/pages/StorePage";
import { useParams } from "react-router";
import type { Route } from "./+types/store.$handle";

export async function loader({ params }: Route.LoaderArgs) {
  const { handle } = params;
  if (!handle || typeof handle !== "string" || !handle.trim()) {
    return { storeTitle: "Store" };
  }
  // Return handle as title; StorePage component fetches actual data client-side
  // Server-side Firebase isn't initialized, so we avoid Firestore calls here
  return { storeTitle: handle };
}

export function meta({ data, params }: Route.MetaArgs) {
  const storeName = data?.storeTitle || params.handle;
  return [
    { title: `${storeName} | Car Dealer in the Baltics - BalticAuto` },
    {
      name: "description",
      content: `Browse all cars and services from ${storeName} on BalticAuto. Verified dealership platform for Estonia, Latvia, and Lithuania.`,
    },
  ];
}

export default function StoreRoute() {
  const { handle } = useParams<{ handle: string }>();
  if (!handle) return <div>Not found</div>;
  return <StorePage handle={handle} />;
}
