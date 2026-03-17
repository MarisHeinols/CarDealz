import { useEffect, useState } from "react";

export function useCities(country: string) {
  const [cities, setCities] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!country) {
      setCities([]);
      return;
    }

    let cancelled = false;
    setLoading(true);

    fetch("https://countriesnow.space/api/v0.1/countries/cities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ country }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        if (!data?.error && Array.isArray(data?.data)) {
          setCities(data.data);
        } else {
          setCities([]);
        }
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("Failed to fetch cities", err);
        setCities([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [country]);

  return { cities, loading };
}

