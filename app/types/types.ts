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

export type StoreAdminSection = "appearance" | "branding" | "info" | "location";

export type StoreThemeConfig = {
  mode: "light" | "dark";

  colors: {
    background: string;        // page background
    surface: string;           // cards, panels
    banner: string;            // store header bg
    accent: string;            // primary action color
    textPrimary: string;
    textSecondary: string;
  };

  banner: {
    type: "color" | "gradient" | "image";
    value: string;             // hex | css gradient | image URL
    overlayOpacity?: number;   // for images
  };

  accents: {
    buttonRadius: number;
    cardRadius: number;
  };
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

export type SpecLevel = "low" | "normal" | "high";

export interface CarListingDetails {
  id: string;

  // Vehicle identity
  vin: number;
  ta: Date;

  make: string;
  model: string;
  year: number;

  // Usage & condition
  mileage: number;
  condition: "new" | "used" | "certified";

  // Powertrain
  fuelType: "diesel" | "petrol" | "hybrid" | "electric";
  displacement: number;
  transmission: "automatic" | "manual";
  drivetrain: "fwd" | "rwd" | "awd" | "4wd";
  horsepower: number;

  // Pricing
  price: number;
  marketRange: {
    min: number;
    max: number;
  };

  // Appearance
  color: string;
  interiorColor: string;

  // Location
  location: string;

  // Media
  images: ListingImage[];

  // Features
  features: CarFeature[];

  // Description
  description: string;

  // Seller
  seller: SellerInfo;

  // Analytics & timestamps
  viewCount: number;
  lastViewed: Date;
  createdAt: Date;
}

export type CarListingDetailsJson = {
  id: string;
  vin:number;
  ta:Date;
  make: string;
  model: string;
  year: number;
  mileage: number;
  fuelType:"diesel"|"petrol"|"hybrid"|"electric";
  displacement:number;
  transmission: "automatic"|"manual";
  drivetrain: "fwd" | "rwd" | "awd" | "4wd";
  horsepower:number;
  price: number;
  interiorColor: string;
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
  // Comfort & Convenience
  | "power_windows"
  | "power_steering"
  | "air_conditioning"
  | "climate_control"
  | "dual_zone_climate"
  | "tri_zone_climate"
  | "heated_seats"
  | "ventilated_seats"
  | "heated_steering_wheel"
  | "leather_seats"
  | "memory_seats"
  | "power_adjustable_seats"
  | "auto_dimming_mirrors"
  | "rain_sensing_wipers"
  | "ambient_lighting"
  | "rear_window_sunshade"

  // Infotainment & Connectivity
  | "navigation"
  | "bluetooth"
  | "usb_ports"
  | "wireless_charging"
  | "apple_carplay"
  | "android_auto"
  | "touchscreen_display"
  | "voice_control"
  | "premium_sound_system"
  | "rear_seat_entertainment"
  | "digital_instrument_cluster"
  | "head_up_display"

  // Driver Assistance & Safety
  | "cruise_control"
  | "adaptive_cruise_control"
  | "lane_assist"
  | "lane_keep_assist"
  | "lane_departure_warning"
  | "blind_spot_monitor"
  | "forward_collision_warning"
  | "automatic_emergency_braking"
  | "pedestrian_detection"
  | "traffic_sign_recognition"
  | "driver_attention_monitor"
  | "parking_sensors"
  | "rear_camera"
  | "360_camera"
  | "night_vision"
  | "cross_traffic_alert"

  // Lighting & Visibility
  | "led_headlights"
  | "matrix_led_headlights"
  | "adaptive_lights"
  | "automatic_headlights"
  | "fog_lights"
  | "daytime_running_lights"
  | "cornering_lights"

  // Security & Access
  | "keyless_entry"
  | "keyless_start"
  | "remote_start"
  | "digital_key"
  | "alarm_system"
  | "engine_immobilizer"
  | "gps_tracking"

  // Performance & Driving
  | "drive_modes"
  | "sport_mode"
  | "eco_mode"
  | "adaptive_suspension"
  | "air_suspension"
  | "limited_slip_differential"
  | "paddle_shifters"
  | "launch_control"
  | "start_stop_system"

  // Exterior & Utility
  | "sunroof"
  | "panoramic_roof"
  | "power_tailgate"
  | "hands_free_tailgate"
  | "roof_rails"
  | "tow_package"
  | "trailer_assist"
  | "running_boards"

  // Wheels & Tires
  | "alloy_wheels"
  | "performance_tires"
  | "all_season_tires"
  | "run_flat_tires"
  | "spare_tire"
  | "tire_pressure_monitoring"

  // Electric & Hybrid Specific
  | "regenerative_braking"
  | "battery_preconditioning"
  | "fast_charging"
  | "home_charging_cable"
  | "range_estimator"
  | "energy_consumption_display";