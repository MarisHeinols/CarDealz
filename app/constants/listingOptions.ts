/**
 * Listing Options and Constants
 * 
 * Centralized constants for dropdown options, defaults, and
 * configuration values used throughout the listing creation process.
 */

/**
 * Available car makes (brands)
 */
export const CAR_MAKES = [
  // Expanded list of common manufacturers (curated).
  // Kept local so the UI never depends on external APIs.
  "Abarth",
  "Acura",
  "Alfa Romeo",
  "Alpine",
  "Aston Martin",
  "Audi",
  "BAIC",
  "Bentley",
  "BMW",
  "Buick",
  "BYD",
  "Cadillac",
  "Changan",
  "Chery",
  "Chevrolet",
  "Chrysler",
  "Citroën",
  "Cupra",
  "Dacia",
  "Daewoo",
  "Daihatsu",
  "Dodge",
  "Dongfeng",
  "DS Automobiles",
  "Ferrari",
  "Fiat",
  "Fisker",
  "Ford",
  "GAC",
  "GAZ",
  "Geely",
  "Genesis",
  "GMC",
  "Great Wall",
  "Haval",
  "Holden",
  "Honda",
  "Hummer",
  "Hyundai",
  "Ineos",
  "Infiniti",
  "Isuzu",
  "JAC",
  "Jaguar",
  "Jeep",
  "Karma",
  "Kia",
  "Koenigsegg",
  "Lamborghini",
  "Lancia",
  "Land Rover",
  "Lexus",
  "Li Auto",
  "Lincoln",
  "Lotus",
  "Lucid",
  "Lynk & Co",
  "Mahindra",
  "Maserati",
  "Mazda",
  "McLaren",
  "Mercedes-Benz",
  "Mercury",
  "MG",
  "Mini",
  "Mitsubishi",
  "Morgan",
  "NIO",
  "Nissan",
  "Opel",
  "Pagani",
  "Peugeot",
  "Polestar",
  "Pontiac",
  "Porsche",
  "Proton",
  "Ram",
  "Renault",
  "Rivian",
  "Rolls-Royce",
  "Saab",
  "Saturn",
  "Scion",
  "SEAT",
  "Škoda",
  "Smart",
  "SsangYong",
  "Subaru",
  "Suzuki",
  "Tata",
  "Tesla",
  "Toyota",
  "Vauxhall",
  "VinFast",
  "Volkswagen",
  "Volvo",
  "Wuling",
  "Xpeng",
  "Zeekr",
] as const;

/**
 * Fuel type options
 */
export const FUEL_TYPES = [
  { value: "petrol", label: "Petrol/Gasoline" },
  { value: "diesel", label: "Diesel" },
  { value: "hybrid", label: "Hybrid" },
  { value: "electric", label: "Electric" },
] as const;

/**
 * Transmission options
 */
export const TRANSMISSION_TYPES = [
  { value: "automatic", label: "Automatic" },
  { value: "manual", label: "Manual" },
] as const;

/**
 * Drivetrain options
 */
export const DRIVETRAIN_TYPES = [
  { value: "fwd", label: "Front-Wheel Drive (FWD)" },
  { value: "rwd", label: "Rear-Wheel Drive (RWD)" },
  { value: "awd", label: "All-Wheel Drive (AWD)" },
  { value: "4wd", label: "Four-Wheel Drive (4WD)" },
] as const;

export const CONDITION_TIERS = [
  { value: "new", label: "New" },
  { value: "slightly_used", label: "Slightly used" },
  { value: "used", label: "Used" },
  { value: "first_payment", label: "First payment car" },
] as const;

/**
 * Common exterior colors
 */
export const EXTERIOR_COLORS = [
  "Black",
  "White",
  "Silver",
  "Gray",
  "Red",
  "Blue",
  "Green",
  "Brown",
  "Beige",
  "Gold",
  "Orange",
  "Yellow",
  "Purple",
  "Other",
] as const;

/**
 * Common interior colors
 */
export const INTERIOR_COLORS = [
  "Black",
  "Gray",
  "Beige",
  "Tan",
  "Brown",
  "White",
  "Red",
  "Blue",
  "Other",
] as const;

/**
 * Year range for listings
 */
export const YEAR_RANGE = {
  min: 1900,
  max: new Date().getFullYear() + 1,
} as const;

/**
 * Default values for new listings
 */
export const LISTING_DEFAULTS = {
  year: new Date().getFullYear(),
  mileage: 0,
  fuelType: "petrol" as const,
  transmission: "automatic" as const,
  drivetrain: "fwd" as const,
  conditionTier: "used" as const,
  displacement: 0,
  horsepower: 0,
  price: 0,
  viewCount: 0,
} as const;

/**
 * Validation constraints
 */
export const VALIDATION_CONSTRAINTS = {
  description: {
    minLength: 50,
    maxLength: 5000,
  },
  images: {
    minCount: 1,
    maxCount: 20,
    maxSizeMB: 10,
  },
  price: {
    min: 0,
    max: 10000000,
  },
  mileage: {
    min: 0,
    max: 1000000,
  },
  year: {
    min: YEAR_RANGE.min,
    max: YEAR_RANGE.max,
  },
  displacement: {
    min: 0,
    max: 10000, // in cc
  },
  horsepower: {
    min: 0,
    max: 2000,
  },
} as const;

/**
 * Helper function to generate year options for dropdowns
 */
export function getYearOptions(): number[] {
  const years: number[] = [];
  for (let year = YEAR_RANGE.max; year >= YEAR_RANGE.min; year--) {
    years.push(year);
  }
  return years;
}

/**
 * Helper function to get recent years (last 30 years)
 */
export function getRecentYears(): number[] {
  const currentYear = new Date().getFullYear();
  const years: number[] = [];
  for (let year = currentYear + 1; year >= currentYear - 30; year--) {
    years.push(year);
  }
  return years;
}
