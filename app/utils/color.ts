function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}

function parseHexColor(input: string): { r: number; g: number; b: number } | null {
  const hex = input.replace("#", "").trim();
  if (![3, 6].includes(hex.length)) return null;
  const full =
    hex.length === 3
      ? hex.split("").map((c) => c + c).join("")
      : hex;
  const n = Number.parseInt(full, 16);
  if (!Number.isFinite(n)) return null;
  return {
    r: (n >> 16) & 255,
    g: (n >> 8) & 255,
    b: n & 255,
  };
}

function parseRgbColor(input: string): { r: number; g: number; b: number } | null {
  const m = input
    .trim()
    .match(/^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?\s*\)$/i);
  if (!m) return null;
  const r = Number(m[1]);
  const g = Number(m[2]);
  const b = Number(m[3]);
  if (![r, g, b].every((v) => Number.isFinite(v))) return null;
  return { r, g, b };
}

function relativeLuminance(rgb: { r: number; g: number; b: number }): number {
  const srgb = [rgb.r, rgb.g, rgb.b].map((v) => clamp01(v / 255));
  const lin = srgb.map((c) => (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)));
  return 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2];
}

export function parseColorToRgb(input: string | null | undefined): { r: number; g: number; b: number } | null {
  if (!input) return null;
  const s = String(input).trim();
  if (!s) return null;
  if (s.startsWith("#")) return parseHexColor(s);
  if (s.toLowerCase().startsWith("rgb")) return parseRgbColor(s);
  return null;
}

export function isDarkColor(input: string | null | undefined, fallbackIsDark = false): boolean {
  const rgb = parseColorToRgb(input);
  if (!rgb) return fallbackIsDark;
  // Threshold ~0.45 feels good for UI cards.
  return relativeLuminance(rgb) < 0.45;
}

export function readableTextOn(bg: string | null | undefined, fallback: "light" | "dark" = "dark") {
  const darkBg = isDarkColor(bg, fallback === "light");
  return {
    isDarkBg: darkBg,
    text: darkBg ? "#fff" : "#111",
    subtext: darkBg ? "rgba(255,255,255,0.75)" : "rgba(0,0,0,0.68)",
  };
}

