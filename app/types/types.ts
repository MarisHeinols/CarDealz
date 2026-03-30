export type CarListingJson = {
  id: string;
  make: string;
  model: string;
  year: number;
  mileage: number;
  price: number;
  conditionTier: ConditionTier;
  location: string;
  color: string;
  marketRange: { min: number; max: number };
  thumbnailUrl: string;
  viewCount: number;
};

export type ConditionTier =
  | "new"
  | "slightly_used"
  | "first_payment"
  | "used";

export type ListingStatus = "draft" | "published" | "closed";

export type LeadStatus = "new" | "contacted" | "closed";

export type LeadPreferredContactMethod = "phone" | "email";

export type UploadFunction = (files: File[]) => void;

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
  conditionTier: ConditionTier;
  location: string;
  color: string;
  marketRange: { min: number; max: number };
  thumbnailUrl: string;
  viewCount: number;
  leadCount?: number;
  createdAt?: string;
  isOnSale?: boolean;
  salePrice?: number;
  isSold?: boolean;
  soldAt?: string;
  status?: ListingStatus;
  // Seller info
  sellerId?: string;
  sellerName?: string;
  isDealer?: boolean;
}

export type SortKey =
  | "make"
  | "model"
  | "year"
  | "mileage"
  | "price"
  | "conditionTier"
  | "color"
  | "location"
  | "createdAt";

export type SortDir = "asc" | "desc";

export interface ListingsFiltersState {
  search: string;
  brand: string;
  year: string;
  conditionTier: string;
  color: string;
  priceFrom: string;
  priceTo: string;
  mileageFrom: string;
  mileageTo: string;
  country: string;
  city: string;
  model: string;
}

export interface SellerInfo {
  name: string;
  phone?: string;
  email?: string;
  isDealer: boolean;
}

export type StoreReview = {
  id: string;
  storeUid: string;
  reviewerUid: string;
  reviewerName: string;
  text: string;
  createdAt: string; // ISO
  updatedAt?: string; // ISO
};

export interface IndividualRegisterData {
  name: string;
  surname: string;
  email: string;
  phone: string;
  country: string;
  password: string;
  confirmPassword: string;
  acceptedTerms: boolean;
  acceptedTermsAt?: string;
}

export interface BusinessRegisterData {
  ownerEmail: string;
  password: string;
  confirmPassword: string;
  storeName: string;
  businessEmail: string;
  businessPhone: string;
  address: string;
  city: string;
  country: string;
  lat: string;
  lng: string;
  registrationNumber: string;
  website?: string;
  acceptedTerms: boolean;
  confirmedDealer: boolean;
  acceptedTermsAt?: string;
}

export interface ListingImage {
  id: string;
  url: string;
  thumbnailUrl?: string;
  isPrimary?: boolean;
}

export type SpecLevel = "low" | "normal" | "high";

export interface CarListingDetails {
  id: string;

  // Vehicle identity
  vin: string;
  ta: string;
  plateNumber?: string;

  make: string;
  model: string;
  year: number;

  // Usage & condition
  mileage: number;
  conditionTier: ConditionTier;

  // Powertrain
  fuelType: "diesel" | "petrol" | "hybrid" | "electric";
  displacement: number;
  transmission: "automatic" | "manual";
  drivetrain: "fwd" | "rwd" | "awd" | "4wd";
  horsepower: number;

  // Pricing
  price: number;
  selfCost: number;
  marketRange: {
    min: number;
    max: number;
  };

  status: ListingStatus;

  // Appearance
  color: string;
  interiorColor: string;

  // Location
  location: string;
  address?: string;

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
  leadCount?: number;
  lastViewed: string;
  createdAt: string;
  isSold?: boolean;
  soldAt?: string;
  deleted?: boolean;
}

export type CarListingDetailsJson = {
  id: string;
  vin: string;
  ta: string;
  plateNumber?: string;
  make: string;
  model: string;
  year: number;
  mileage: number;
  fuelType: "diesel" | "petrol" | "hybrid" | "electric";
  displacement: number;
  transmission: "automatic" | "manual";
  drivetrain: "fwd" | "rwd" | "awd" | "4wd";
  horsepower: number;
  price: number;
  selfCost: number;
  interiorColor: string;
  conditionTier: ConditionTier;
  status: ListingStatus;
  color: string;
  location: string;
  address?: string;
  marketRange: { min: number; max: number };

  /**
   * ISO timestamp of the last time we (re)estimated `marketRange`.
   * Optional for backwards compatibility with older listings.
   */
  marketRangeUpdatedAt?: string;
  images: { id: string; url: string; thumbnailUrl?: string; isPrimary?: boolean }[];
  features: string[];
  description: string;
  seller: {
    name: string;
    phone?: string;
    email?: string;
    isDealer: boolean;
  };
  viewCount: number;
  leadCount?: number;
  lastViewed: string;
  createdAt: string;
  isSold?: boolean;
  soldAt?: string;
  deleted?: boolean;
};

export type LeadDoc = {
  id: string;
  listingId: string;
  dealerId: string;

  buyerUid?: string;
  buyerName: string;
  buyerEmail?: string;
  buyerPhone?: string;
  preferredContactMethod: LeadPreferredContactMethod;
  message: string;

  status: LeadStatus;
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