export const COUNTRIES = [
  "Afghanistan", "Albania", "Algeria", "Argentina", "Armenia", "Australia",
  "Austria", "Azerbaijan", "Bahrain", "Bangladesh", "Belarus", "Belgium",
  "Bolivia", "Bosnia and Herzegovina", "Brazil", "Bulgaria", "Canada",
  "Chile", "China", "Colombia", "Croatia", "Cyprus", "Czech Republic",
  "Denmark", "Ecuador", "Egypt", "Estonia", "Ethiopia", "Finland", "France",
  "Georgia", "Germany", "Ghana", "Greece", "Guatemala", "Hungary", "India",
  "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy", "Japan",
  "Jordan", "Kazakhstan", "Kenya", "Kuwait", "Latvia", "Lebanon", "Lithuania",
  "Luxembourg", "Malaysia", "Malta", "Mexico", "Morocco", "Netherlands",
  "New Zealand", "Nigeria", "Norway", "Oman", "Pakistan", "Peru",
  "Philippines", "Poland", "Portugal", "Qatar", "Romania", "Russia",
  "Saudi Arabia", "Serbia", "Singapore", "Slovakia", "Slovenia", "South Africa",
  "South Korea", "Spain", "Sri Lanka", "Sweden", "Switzerland", "Taiwan",
  "Thailand", "Tunisia", "Turkey", "Ukraine", "United Arab Emirates",
  "United Kingdom", "United States", "Uruguay", "Uzbekistan", "Venezuela",
  "Vietnam"
] as const;

export type Country = typeof COUNTRIES[number];
