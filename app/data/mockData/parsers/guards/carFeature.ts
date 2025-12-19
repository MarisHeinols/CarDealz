import type { CarFeature } from "~/types/types";

const FEATURES: readonly CarFeature[] = [
  "power_windows",
  "power_steering",
  "air_conditioning",
  "climate_control",
  "heated_seats",
  "ventilated_seats",
  "leather_seats",
  "cruise_control",
  "adaptive_cruise_control",
  "lane_assist",
  "blind_spot_monitor",
  "parking_sensors",
  "rear_camera",
  "360_camera",
  "led_headlights",
  "adaptive_lights",
  "keyless_entry",
  "remote_start",
  "navigation",
  "bluetooth",
  "apple_carplay",
  "android_auto",
];

export const isCarFeature =(value: string): value is CarFeature => {
  return (FEATURES as readonly string[]).includes(value);
}