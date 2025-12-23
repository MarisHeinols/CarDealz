import type { CarFeature } from "~/types/types";

export type FeatureCategory =
  | "comfort"
  | "infotainment"
  | "safety"
  | "lighting"
  | "security"
  | "performance"
  | "exterior"
  | "wheels"
  | "ev";

export const featureDefinitions: Record<
  CarFeature,
  { label: string; category: FeatureCategory }
> = {
  // Comfort & Convenience
  power_windows: { label: "Power Windows", category: "comfort" },
  power_steering: { label: "Power Steering", category: "comfort" },
  air_conditioning: { label: "Air Conditioning", category: "comfort" },
  climate_control: { label: "Climate Control", category: "comfort" },
  dual_zone_climate: { label: "Dual-Zone Climate Control", category: "comfort" },
  tri_zone_climate: { label: "Tri-Zone Climate Control", category: "comfort" },
  heated_seats: { label: "Heated Seats", category: "comfort" },
  ventilated_seats: { label: "Ventilated Seats", category: "comfort" },
  heated_steering_wheel: {
    label: "Heated Steering Wheel",
    category: "comfort",
  },
  leather_seats: { label: "Leather Seats", category: "comfort" },
  memory_seats: { label: "Memory Seats", category: "comfort" },
  power_adjustable_seats: {
    label: "Power-Adjustable Seats",
    category: "comfort",
  },
  auto_dimming_mirrors: {
    label: "Auto-Dimming Mirrors",
    category: "comfort",
  },
  rain_sensing_wipers: {
    label: "Rain-Sensing Wipers",
    category: "comfort",
  },
  ambient_lighting: {
    label: "Ambient Interior Lighting",
    category: "comfort",
  },
  rear_window_sunshade: {
    label: "Rear Window Sunshade",
    category: "comfort",
  },

  // Infotainment & Connectivity
  navigation: { label: "Built-in Navigation", category: "infotainment" },
  bluetooth: { label: "Bluetooth Connectivity", category: "infotainment" },
  usb_ports: { label: "USB Ports", category: "infotainment" },
  wireless_charging: {
    label: "Wireless Phone Charging",
    category: "infotainment",
  },
  apple_carplay: { label: "Apple CarPlay", category: "infotainment" },
  android_auto: { label: "Android Auto", category: "infotainment" },
  touchscreen_display: {
    label: "Touchscreen Display",
    category: "infotainment",
  },
  voice_control: { label: "Voice Control", category: "infotainment" },
  premium_sound_system: {
    label: "Premium Sound System",
    category: "infotainment",
  },
  rear_seat_entertainment: {
    label: "Rear Seat Entertainment",
    category: "infotainment",
  },
  digital_instrument_cluster: {
    label: "Digital Instrument Cluster",
    category: "infotainment",
  },
  head_up_display: {
    label: "Head-Up Display (HUD)",
    category: "infotainment",
  },

  // Driver Assistance & Safety
  cruise_control: { label: "Cruise Control", category: "safety" },
  adaptive_cruise_control: {
    label: "Adaptive Cruise Control",
    category: "safety",
  },
  lane_assist: { label: "Lane Assist", category: "safety" },
  lane_keep_assist: { label: "Lane Keep Assist", category: "safety" },
  lane_departure_warning: {
    label: "Lane Departure Warning",
    category: "safety",
  },
  blind_spot_monitor: {
    label: "Blind Spot Monitoring",
    category: "safety",
  },
  forward_collision_warning: {
    label: "Forward Collision Warning",
    category: "safety",
  },
  automatic_emergency_braking: {
    label: "Automatic Emergency Braking",
    category: "safety",
  },
  pedestrian_detection: {
    label: "Pedestrian Detection",
    category: "safety",
  },
  traffic_sign_recognition: {
    label: "Traffic Sign Recognition",
    category: "safety",
  },
  driver_attention_monitor: {
    label: "Driver Attention Monitoring",
    category: "safety",
  },
  parking_sensors: { label: "Parking Sensors", category: "safety" },
  rear_camera: { label: "Rear View Camera", category: "safety" },
  "360_camera": {
    label: "360° Surround View Camera",
    category: "safety",
  },
  night_vision: { label: "Night Vision Assist", category: "safety" },
  cross_traffic_alert: {
    label: "Rear Cross-Traffic Alert",
    category: "safety",
  },

  // Lighting & Visibility
  led_headlights: { label: "LED Headlights", category: "lighting" },
  matrix_led_headlights: {
    label: "Matrix LED Headlights",
    category: "lighting",
  },
  adaptive_lights: { label: "Adaptive Headlights", category: "lighting" },
  automatic_headlights: {
    label: "Automatic Headlights",
    category: "lighting",
  },
  fog_lights: { label: "Fog Lights", category: "lighting" },
  daytime_running_lights: {
    label: "Daytime Running Lights",
    category: "lighting",
  },
  cornering_lights: { label: "Cornering Lights", category: "lighting" },

  // Security & Access
  keyless_entry: { label: "Keyless Entry", category: "security" },
  keyless_start: { label: "Keyless Engine Start", category: "security" },
  remote_start: { label: "Remote Engine Start", category: "security" },
  digital_key: { label: "Digital Key (Phone Access)", category: "security" },
  alarm_system: { label: "Alarm System", category: "security" },
  engine_immobilizer: {
    label: "Engine Immobilizer",
    category: "security",
  },
  gps_tracking: { label: "GPS Vehicle Tracking", category: "security" },

  // Performance & Driving
  drive_modes: { label: "Selectable Drive Modes", category: "performance" },
  sport_mode: { label: "Sport Driving Mode", category: "performance" },
  eco_mode: { label: "Eco Driving Mode", category: "performance" },
  adaptive_suspension: {
    label: "Adaptive Suspension",
    category: "performance",
  },
  air_suspension: { label: "Air Suspension", category: "performance" },
  limited_slip_differential: {
    label: "Limited Slip Differential",
    category: "performance",
  },
  paddle_shifters: { label: "Paddle Shifters", category: "performance" },
  launch_control: { label: "Launch Control", category: "performance" },
  start_stop_system: {
    label: "Auto Start-Stop System",
    category: "performance",
  },

  // Exterior & Utility
  sunroof: { label: "Sunroof", category: "exterior" },
  panoramic_roof: {
    label: "Panoramic Glass Roof",
    category: "exterior",
  },
  power_tailgate: { label: "Power Tailgate", category: "exterior" },
  hands_free_tailgate: {
    label: "Hands-Free Tailgate",
    category: "exterior",
  },
  roof_rails: { label: "Roof Rails", category: "exterior" },
  tow_package: { label: "Tow Package", category: "exterior" },
  trailer_assist: { label: "Trailer Assist", category: "exterior" },
  running_boards: { label: "Running Boards", category: "exterior" },

  // Wheels & Tires
  alloy_wheels: { label: "Alloy Wheels", category: "wheels" },
  performance_tires: {
    label: "Performance Tires",
    category: "wheels",
  },
  all_season_tires: {
    label: "All-Season Tires",
    category: "wheels",
  },
  run_flat_tires: { label: "Run-Flat Tires", category: "wheels" },
  spare_tire: { label: "Spare Tire", category: "wheels" },
  tire_pressure_monitoring: {
    label: "Tire Pressure Monitoring System (TPMS)",
    category: "wheels",
  },

  // Electric & Hybrid
  regenerative_braking: {
    label: "Regenerative Braking",
    category: "ev",
  },
  battery_preconditioning: {
    label: "Battery Preconditioning",
    category: "ev",
  },
  fast_charging: { label: "Fast Charging Capability", category: "ev" },
  home_charging_cable: {
    label: "Home Charging Cable Included",
    category: "ev",
  },
  range_estimator: { label: "Driving Range Estimator", category: "ev" },
  energy_consumption_display: {
    label: "Energy Consumption Display",
    category: "ev",
  },
};