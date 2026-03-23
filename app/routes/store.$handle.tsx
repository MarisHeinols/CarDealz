import StorePage from "~/pages/StorePage";
import { useParams } from "react-router";
import type { Route } from "./+types/store.$handle";

export async function loader({ params }: Route.LoaderArgs) {
  const { handle } = params;
  const { resolveStoreUidByHandle } = await import("~/services/storeHandleService");
  const { getUserProfile } = await import("~/services/usersService");
  const { loadStoreSettingsFromDb } = await import("~/services/storeSettingsService");

  try {
    const uid = await resolveStoreUidByHandle(handle);
    if (!uid) return { storeTitle: handle };

    const [profile, settings] = await Promise.all([
      getUserProfile(uid),
      loadStoreSettingsFromDb(uid),
    ]);
    
    const storeName = profile?.storeName || profile?.businessName || settings?.name || handle;
    return { storeTitle: storeName };
  } catch {
    return { storeTitle: handle };
  }
}

export function meta({ data, params }: Route.MetaArgs) {
  const storeName = data?.storeTitle || params.handle;
  return [
    { title: `${storeName} | Car Dealer in the Baltics - BalticAuto` },
    { name: "description", content: `Browse all cars and services from ${storeName} on BalticAuto. Verified dealership platform for Estonia, Latvia, and Lithuania.` },
  ];
}

export default function StoreRoute() {
  const { handle } = useParams<{ handle: string }>();
  if (!handle) return <div>Not found</div>;
  return <StorePage handle={handle} />;
}

