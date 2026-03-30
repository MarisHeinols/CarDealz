import StorePage from "~/pages/StorePage";
import { useParams } from "react-router";
import type { Route } from "./+types/store.$handle";

export async function loader({ params }: Route.LoaderArgs) {
  const { handle } = params;
  if (!handle || typeof handle !== "string" || !handle.trim()) {
    return { storeTitle: "Store" };
  }
  const { resolveStoreUidByHandle } =
    await import("~/services/storeHandleService");
  const { loadStoreSettingsFromDb } =
    await import("~/services/storeSettingsService");

  try {
    const uid = await resolveStoreUidByHandle(handle);
    if (!uid) return { storeTitle: handle };

    const settings = await loadStoreSettingsFromDb(uid);
    const storeName = settings?.name || handle;
    return { storeTitle: storeName };
  } catch (e) {
    console.error("Store loader failed", { handle, error: e });
    return { storeTitle: handle };
  }
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
