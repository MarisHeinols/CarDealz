import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import i18n from "~/i18n";

type UserLocation = {
  city: string;
  country: string;
  lat: number | null;
  lng: number | null;
  updatedAt: number;
};

type UserPreferences = {
  location: UserLocation | null;
  locationLoading: boolean;
  refreshLocation: () => void;
};

const STORAGE_KEY = "app.userLocation";

const UserPreferencesContext = createContext<UserPreferences | undefined>(
  undefined
);

function normalizeText(v: unknown) {
  return String(v || "").trim();
}

function pickCity(address: any) {
  return (
    normalizeText(address?.city) ||
    normalizeText(address?.town) ||
    normalizeText(address?.village) ||
    normalizeText(address?.county) ||
    ""
  );
}

async function reverseGeocode(lat: number, lng: number, lang: string) {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
    { headers: { "Accept-Language": lang || "en" } }
  );
  const data = await res.json();
  const country = normalizeText(data?.address?.country);
  const city = pickCity(data?.address);
  return { city, country };
}

export function UserPreferencesProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [locationLoading, setLocationLoading] = useState<boolean>(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as UserLocation;
      if (parsed && typeof parsed === "object") setLocation(parsed);
    } catch {
      // ignore
    }
  }, []);

  const resolveCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) return;

    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          const { city, country } = await reverseGeocode(lat, lng, i18n.language);

          const next: UserLocation = {
            city,
            country,
            lat,
            lng,
            updatedAt: Date.now(),
          };

          setLocation(next);
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
          } catch {
            // ignore
          }
        } finally {
          setLocationLoading(false);
        }
      },
      () => {
        setLocationLoading(false);
      },
      { timeout: 10000 }
    );
  }, []);

  useEffect(() => {
    if (location) return;
    resolveCurrentLocation();
  }, [location, resolveCurrentLocation]);

  const value = useMemo<UserPreferences>(
    () => ({
      location,
      locationLoading,
      refreshLocation: resolveCurrentLocation,
    }),
    [location, locationLoading, resolveCurrentLocation]
  );

  return (
    <UserPreferencesContext.Provider value={value}>
      {children}
    </UserPreferencesContext.Provider>
  );
}

export function useUserPreferences() {
  const ctx = useContext(UserPreferencesContext);
  if (!ctx) throw new Error("useUserPreferences must be used within UserPreferencesProvider");
  return ctx;
}
