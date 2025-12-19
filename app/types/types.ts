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
  thumbnailUrl: string;
  viewCount: number;
};

export interface CarListingSummary {
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
  thumbnailUrl: string;
  viewCount: number;

}

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

export interface SellerInfo {
  name: string;
  phone?: string;
  email?: string;
  isDealer: boolean;
}

export interface ListingImage {
  id: string;
  url: string;
  isPrimary?: boolean;
}

export interface CarListingDetails {
  id: string;

  make: string;
  model: string;
  year: number;
  mileage: number;
  price: number;
  condition: "new" | "used" | "certified";
  color: string;
  location: string;

  marketRange: {
    min: number;
    max: number;
  };

  images: ListingImage[];

  features: CarFeature[];

  description: string;

  seller: SellerInfo;

  viewCount: number;
  lastViewed: Date;
  createdAt: Date;
}

export type CarListingDetailsJson = {
  id: string;
  make: string;
  model: string;
  year: number;
  mileage: number;
  price: number;
  condition: "new" | "used" | "certified";
  color: string;
  location: string;
  marketRange: { min: number; max: number };
  images: { id: string; url: string; isPrimary?: boolean }[];
  features: string[];          
  description: string;
  seller: {
    name: string;
    phone?: string;
    email?: string;
    isDealer: boolean;
  };
  viewCount: number;
  lastViewed: string;       
  createdAt: string;           
};


export type CarFeature =
  | "power_windows"
  | "power_steering"
  | "air_conditioning"
  | "climate_control"
  | "heated_seats"
  | "ventilated_seats"
  | "leather_seats"
  | "cruise_control"
  | "adaptive_cruise_control"
  | "lane_assist"
  | "blind_spot_monitor"
  | "parking_sensors"
  | "rear_camera"
  | "360_camera"
  | "led_headlights"
  | "adaptive_lights"
  | "keyless_entry"
  | "remote_start"
  | "navigation"
  | "bluetooth"
  | "apple_carplay"
  | "android_auto";