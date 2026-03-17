// location string format: "City, Country"
export function parseLocation(location: string) {
  const parts = (location || "").split(",").map((p) => p.trim()).filter(Boolean);
  if (parts.length >= 2) {
    return { city: parts.slice(0, -1).join(", "), country: parts[parts.length - 1] };
  }
  return { city: "", country: parts[0] || "" };
}

export function buildLocation(city: string, country: string) {
  const c = (city || "").trim();
  const co = (country || "").trim();
  if (c && co) return `${c}, ${co}`;
  return co || c;
}

