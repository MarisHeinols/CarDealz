import { useContext } from "react";
import { useAppSelector } from "~/redux/hooks";
import { StorefrontContext } from "~/context/StorefrontContext";

/**
 * Storefront settings should be store-specific (per `/store/:handle`).
 * - On public store pages, we provide settings via `StorefrontContext`.
 * - In admin/editor/preview, we fall back to Redux `storeSettings`.
 */
export function useStorefrontSettings() {
  const ctx = useContext(StorefrontContext);
  const redux = useAppSelector((s) => s.storeSettings);
  return ctx ?? redux;
}

