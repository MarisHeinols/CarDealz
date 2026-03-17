import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const STORAGE_KEY = "app.lang";

const resources = {
  en: {
    translation: {
      common: {
        or: "OR",
        cancel: "Cancel",
        save: "Save",
        loading: "Loading…",
      },
      nav: {
        listings: "Listings",
        profile: "Profile",
        admin: "Admin",
        newListing: "New Listing",
        login: "Log In",
        logout: "Log Out",
        language: "Language",
        languageHint: "Choose your language",
      },
      auth: {
        loginTitle: "Login",
        email: "Email",
        password: "Password",
        signIn: "Sign In",
        signingIn: "Signing In…",
        register: "Register",
        registerTitle: "Register",
        individual: "Individual",
        business: "Business",
        pleaseEnterEmailPassword: "Please enter email and password",
        loginSuccess: "Login successful!",
        loginFailed: "Login failed",
      },
      listing: {
        contactSeller: "Contact Seller",
        description: "Description",
        specsAndFeatures: "Specifications & Features",
        dealer: "Dealer",
        privateSeller: "Private Seller",
      },
      sellerCard: {
        contactHidden: "Contact information hidden",
        visitStore: "Visit Store",
        moreFromSeller: "More from this seller",
        reviewsCount: "({{count}} reviews)",
      },
      table: {
        image: "Image",
        make: "Make",
        model: "Model",
        year: "Year",
        condition: "Condition",
        price: "Price",
        mileage: "Mileage",
        deal: "Deal",
        location: "Location",
        actions: "Actions",
        changePrice: "Change Price",
        deleteListing: "Delete Listing",
        enterNewPrice: "Enter New Price:",
        confirmDeleteListing: "Are you sure you want to delete this listing?",
      },
      filters: {
        searchTitle: "Search",
        searchPlaceholder: "Search by make, model, color, location...",
        brand: "Brand",
        allBrands: "All Brands",
      },
      details: {
        vin: "VIN",
        ta: "TA",
        plate: "Plate",
        na: "N/A",
        fuelType: "Fuel type",
        displacement: "Displacement",
        drivetrain: "Drivetrain",
        transmission: "Transmission",
        interiorColor: "Interior color",
        color: "Color",
      },
      newListing: {
        mustBeLoggedIn: "You must be logged in to create a listing",
        createdSuccess: "Listing created successfully!",
        createFailed: "Failed to create listing",
        back: "Back",
        creating: "Creating…",
        create: "Create Listing",
      },
    },
  },
  lv: {
    translation: {
      common: { or: "VAI", cancel: "Atcelt", save: "Saglabāt", loading: "Ielādē…" },
      nav: { listings: "Sludinājumi", profile: "Profils", admin: "Administrēšana", newListing: "Jauns sludinājums", login: "Pieteikties", logout: "Izrakstīties", language: "Valoda", languageHint: "Izvēlies valodu" },
      auth: { loginTitle: "Pieteikšanās", email: "E-pasts", password: "Parole", signIn: "Ienākt", signingIn: "Ienāk…", register: "Reģistrēties", registerTitle: "Reģistrācija", individual: "Privātpersona", business: "Uzņēmums", pleaseEnterEmailPassword: "Lūdzu ievadi e‑pastu un paroli", loginSuccess: "Pieteikšanās veiksmīga!", loginFailed: "Pieteikšanās neizdevās" },
      listing: { contactSeller: "Sazināties ar pārdevēju", description: "Apraksts", specsAndFeatures: "Specifikācija un aprīkojums", dealer: "Dīleris", privateSeller: "Privātais pārdevējs" },
      sellerCard: { contactHidden: "Kontaktinformācija paslēpta", visitStore: "Apmeklēt veikalu", moreFromSeller: "Vairāk no šī pārdevēja", reviewsCount: "({{count}} atsauksmes)" },
    },
  },
  lt: {
    translation: {
      common: { or: "ARBA", cancel: "Atšaukti", save: "Išsaugoti", loading: "Kraunama…" },
      nav: { listings: "Skelbimai", profile: "Profilis", admin: "Administravimas", newListing: "Naujas skelbimas", login: "Prisijungti", logout: "Atsijungti", language: "Kalba", languageHint: "Pasirink kalbą" },
      auth: { loginTitle: "Prisijungimas", email: "El. paštas", password: "Slaptažodis", signIn: "Prisijungti", signingIn: "Jungiama…", register: "Registruotis", registerTitle: "Registracija", individual: "Privatus", business: "Verslas", pleaseEnterEmailPassword: "Įveskite el. paštą ir slaptažodį", loginSuccess: "Prisijungta sėkmingai!", loginFailed: "Prisijungti nepavyko" },
      listing: { contactSeller: "Susisiekti su pardavėju", description: "Aprašymas", specsAndFeatures: "Specifikacijos ir įranga", dealer: "Dealeris", privateSeller: "Privatus pardavėjas" },
      sellerCard: { contactHidden: "Kontaktinė informacija paslėpta", visitStore: "Aplankyti parduotuvę", moreFromSeller: "Daugiau iš šio pardavėjo", reviewsCount: "({{count}} atsiliepimai)" },
    },
  },
  et: {
    translation: {
      common: { or: "VÕI", cancel: "Tühista", save: "Salvesta", loading: "Laadimine…" },
      nav: { listings: "Kuulutused", profile: "Profiil", admin: "Admin", newListing: "Uus kuulutus", login: "Logi sisse", logout: "Logi välja", language: "Keel", languageHint: "Vali keel" },
      auth: { loginTitle: "Sisselogimine", email: "E-post", password: "Parool", signIn: "Logi sisse", signingIn: "Sisenen…", register: "Registreeru", registerTitle: "Registreerimine", individual: "Eraisik", business: "Ettevõte", pleaseEnterEmailPassword: "Sisesta e-post ja parool", loginSuccess: "Sisselogimine õnnestus!", loginFailed: "Sisselogimine ebaõnnestus" },
      listing: { contactSeller: "Võta müüjaga ühendust", description: "Kirjeldus", specsAndFeatures: "Spetsifikatsioonid ja varustus", dealer: "Edasimüüja", privateSeller: "Eraisik" },
      sellerCard: { contactHidden: "Kontaktandmed on peidetud", visitStore: "Külasta poodi", moreFromSeller: "Rohkem sellelt müüjalt", reviewsCount: "({{count}} arvustust)" },
    },
  },
  es: {
    translation: {
      common: { or: "O", cancel: "Cancelar", save: "Guardar", loading: "Cargando…" },
      nav: { listings: "Anuncios", profile: "Perfil", admin: "Admin", newListing: "Nuevo anuncio", login: "Iniciar sesión", logout: "Cerrar sesión", language: "Idioma", languageHint: "Elige idioma" },
      auth: { loginTitle: "Iniciar sesión", email: "Correo", password: "Contraseña", signIn: "Entrar", signingIn: "Entrando…", register: "Registrarse", registerTitle: "Registro", individual: "Particular", business: "Empresa", pleaseEnterEmailPassword: "Introduce correo y contraseña", loginSuccess: "¡Inicio de sesión correcto!", loginFailed: "Error al iniciar sesión" },
      listing: { contactSeller: "Contactar vendedor", description: "Descripción", specsAndFeatures: "Especificaciones y equipamiento", dealer: "Concesionario", privateSeller: "Vendedor particular" },
      sellerCard: { contactHidden: "Información de contacto oculta", visitStore: "Visitar tienda", moreFromSeller: "Más de este vendedor", reviewsCount: "({{count}} reseñas)" },
    },
  },
  de: {
    translation: {
      common: { or: "ODER", cancel: "Abbrechen", save: "Speichern", loading: "Lädt…" },
      nav: { listings: "Angebote", profile: "Profil", admin: "Admin", newListing: "Neues Inserat", login: "Anmelden", logout: "Abmelden", language: "Sprache", languageHint: "Sprache auswählen" },
      auth: { loginTitle: "Anmeldung", email: "E‑Mail", password: "Passwort", signIn: "Einloggen", signingIn: "Anmelden…", register: "Registrieren", registerTitle: "Registrierung", individual: "Privat", business: "Geschäft", pleaseEnterEmailPassword: "Bitte E‑Mail und Passwort eingeben", loginSuccess: "Anmeldung erfolgreich!", loginFailed: "Anmeldung fehlgeschlagen" },
      listing: { contactSeller: "Verkäufer kontaktieren", description: "Beschreibung", specsAndFeatures: "Spezifikationen & Ausstattung", dealer: "Händler", privateSeller: "Privatverkäufer" },
      sellerCard: { contactHidden: "Kontaktinformationen verborgen", visitStore: "Shop besuchen", moreFromSeller: "Mehr von diesem Verkäufer", reviewsCount: "({{count}} Bewertungen)" },
    },
  },
} as const;

function normalizeLang(raw: string | null | undefined): keyof typeof resources | null {
  if (!raw) return null;
  const code = String(raw).toLowerCase().trim();
  const base = code.split("-")[0] as keyof typeof resources;
  return resources[base] ? base : null;
}

function detectDefaultLanguage(): keyof typeof resources {
  const stored = normalizeLang(typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null);
  if (stored) return stored;

  const nav = typeof navigator !== "undefined" ? navigator : null;
  const candidates = [
    ...(nav?.languages || []),
    nav?.language,
  ].filter(Boolean) as string[];

  for (const c of candidates) {
    const n = normalizeLang(c);
    if (n) return n;
  }
  return "en";
}

i18n
  .use(initReactI18next)
  .init({
    resources: resources as any,
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

export function setAppLanguage(lng: keyof typeof resources) {
  return i18n.changeLanguage(lng);
}

export const SUPPORTED_LANGS = Object.keys(resources) as (keyof typeof resources)[];

export default i18n;

