import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { en } from "./locales/en";
import { lv } from "./locales/lv";
import { lt } from "./locales/lt";
import { et } from "./locales/et";
import { de } from "./locales/de";
import { es } from "./locales/es";

const STORAGE_KEY = "app.lang";

const resources = {
  en,
  lv,
  lt,
  et,
  de,
  es,
};

type Lang = keyof typeof resources;

function normalizeLang(raw: string | null | undefined): Lang | null {
  if (!raw) return null;
  const code = String(raw).toLowerCase().trim();
  const base = code.split("-")[0];
  return resources[base as Lang] ? (base as Lang) : null;
}

function detectDefaultLanguage(): Lang {
  let stored: Lang | null = null;
  try {
    stored = normalizeLang(
      typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null,
    );
  } catch (e) {
    console.warn("Language detection: Storage blocked or inaccessible");
  }
  if (stored) return stored;

  const nav = typeof navigator !== "undefined" ? navigator : null;
  const candidates = [...(nav?.languages || []), nav?.language].filter(
    Boolean,
  ) as string[];

  for (const c of candidates) {
    const n = normalizeLang(c);
    if (n) return n;
  }
  return "en";
}

i18n.use(initReactI18next).init({
  resources,
  lng: detectDefaultLanguage(),
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

i18n.on("languageChanged", (lng) => {
  try {
    localStorage.setItem(STORAGE_KEY, lng);
  } catch {
    // ignore
  }
});

export function setAppLanguage(lng: Lang) {
  return i18n.changeLanguage(lng);
}

export const SUPPORTED_LANGS = Object.keys(resources) as Lang[];

export default i18n;
