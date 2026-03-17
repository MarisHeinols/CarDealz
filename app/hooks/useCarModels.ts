import { useEffect, useState } from "react";

export function useCarModels(make: string) {
  const [models, setModels] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!make) {
      setModels([]);
      return;
    }

    let cancelled = false;
    setLoading(true);

    fetch(
      `https://vpic.nhtsa.dot.gov/api/vehicles/GetModelsForMake/${encodeURIComponent(make)}?format=json`
    )
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        const results = data?.Results || [];
        const modelNames = Array.from(
          new Set(results.map((r: any) => r.Model_Name as string))
        ).sort();
        setModels(modelNames as string[]);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("Failed to fetch models", err);
        setModels([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [make]);

  return { models, loading };
}

