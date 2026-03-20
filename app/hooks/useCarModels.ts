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
        ).filter(Boolean).sort();
        
        // Fallbacks for non-US makes that NHTSA misses
        if (modelNames.length === 0) {
          const lowerMake = make.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
          if (lowerMake === "skoda") {
            setModels(["Octavia", "Superb", "Kodiaq", "Karoq", "Kamiq", "Fabia", "Scala", "Enyaq"]);
          } else if (lowerMake === "seat") {
            setModels(["Leon", "Ibiza", "Ateca", "Arona", "Tarraco", "Toledo", "Alhambra"]);
          } else if (lowerMake === "peugeot") {
            setModels(["208", "308", "508", "2008", "3008", "5008", "Rifter"]);
          } else if (lowerMake === "renault") {
            setModels(["Clio", "Megane", "Captur", "Kadjar", "Austral", "Koleos", "Zoe", "Arkana"]);
          } else if (lowerMake === "dacia") {
            setModels(["Sandero", "Duster", "Jogger", "Spring", "Logan"]);
          } else {
            setModels([]);
          }
        } else {
          setModels(modelNames as string[]);
        }
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

