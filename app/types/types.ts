export interface CarListing { 
    id: string; 
    make: string; 
    model: string; 
    year: number; 
    mileage: number; 
    price: number; 
    condition: "new" | "used" | "certified"; 
    location: string; 
    color: string; 
    marketRange: { min: number; max: number }; 
    imageUrl: string; 
    viewCount: number; 
    lastViewed: Date; 
}

export type CarListingJson = {
  id: string;
  make: string;
  model: string;
  year: number;
  mileage: number;
  price: number;
  condition: string;       
  location: string;
  color: string;
  marketRange: { min: number; max: number };
  imageUrl: string;
  viewCount: number;
  lastViewed: string;      
};

export type SortKey =
  | "make"
  | "model"
  | "year"
  | "mileage"
  | "price"
  | "condition"
  | "color"
  | "location";

export type SortDir = "asc" | "desc";

export interface ListingsFiltersState {
  search: string;
  brand: string;
  year: string;
  condition: string;
  color: string;
  priceFrom: string;
  priceTo: string;
  mileageFrom: string;
  mileageTo: string;
}