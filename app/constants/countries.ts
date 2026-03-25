export const COUNTRIES = [
  "Estonia",
  "Latvia",
  "Lithuania",
] as const;

export type Country = typeof COUNTRIES[number];

