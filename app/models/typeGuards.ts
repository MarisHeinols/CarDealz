/**
 * Type Guards for Runtime Type Checking
 * 
 * Provides runtime validation to ensure data conforms to expected types,
 * especially useful when dealing with external data sources or API responses.
 */

import type { 
  CarListingDetailsJson, 
  CarListingSummary,
  ListingImage,
  SellerInfo,
  CarFeature 
} from "~/types/types";

/**
 * Checks if a value is a valid SellerInfo object
 */
export function isSellerInfo(value: any): value is SellerInfo {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof value.name === "string" &&
    typeof value.isDealer === "boolean" &&
    (value.phone === undefined || typeof value.phone === "string") &&
    (value.email === undefined || typeof value.email === "string")
  );
}

/**
 * Checks if a value is a valid ListingImage object
 */
export function isListingImage(value: any): value is ListingImage {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof value.id === "string" &&
    typeof value.url === "string" &&
    (value.isPrimary === undefined || typeof value.isPrimary === "boolean")
  );
}

/**
 * Checks if a value is a valid CarListingSummary object
 */
export function isCarListingSummary(value: any): value is CarListingSummary {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof value.id === "string" &&
    typeof value.make === "string" &&
    typeof value.model === "string" &&
    typeof value.year === "number" &&
    typeof value.mileage === "number" &&
    typeof value.price === "number" &&
    (value.condition === "new" || value.condition === "used" || value.condition === "certified") &&
    typeof value.location === "string" &&
    typeof value.color === "string" &&
    typeof value.marketRange === "object" &&
    typeof value.marketRange.min === "number" &&
    typeof value.marketRange.max === "number" &&
    typeof value.thumbnailUrl === "string" &&
    typeof value.viewCount === "number"
  );
}

/**
 * Checks if a value is a valid CarListingDetailsJson object
 */
export function isCarListingDetailsJson(value: any): value is CarListingDetailsJson {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof value.id === "string" &&
    typeof value.vin === "number" &&
    typeof value.make === "string" &&
    typeof value.model === "string" &&
    typeof value.year === "number" &&
    typeof value.mileage === "number" &&
    (value.fuelType === "diesel" || value.fuelType === "petrol" || 
     value.fuelType === "hybrid" || value.fuelType === "electric") &&
    typeof value.displacement === "number" &&
    (value.transmission === "automatic" || value.transmission === "manual") &&
    (value.drivetrain === "fwd" || value.drivetrain === "rwd" || 
     value.drivetrain === "awd" || value.drivetrain === "4wd") &&
    typeof value.horsepower === "number" &&
    typeof value.price === "number" &&
    typeof value.interiorColor === "string" &&
    (value.condition === "new" || value.condition === "used" || value.condition === "certified") &&
    typeof value.color === "string" &&
    typeof value.location === "string" &&
    typeof value.marketRange === "object" &&
    typeof value.marketRange.min === "number" &&
    typeof value.marketRange.max === "number" &&
    Array.isArray(value.images) &&
    Array.isArray(value.features) &&
    typeof value.description === "string" &&
    isSellerInfo(value.seller) &&
    typeof value.viewCount === "number" &&
    typeof value.lastViewed === "string" &&
    typeof value.createdAt === "string"
  );
}

/**
 * Checks if an array contains only valid ListingImage objects
 */
export function isListingImageArray(value: any): value is ListingImage[] {
  return Array.isArray(value) && value.every(isListingImage);
}

/**
 * Checks if an array contains only valid CarFeature strings
 */
export function isCarFeatureArray(value: any): value is CarFeature[] {
  return Array.isArray(value) && value.every(item => typeof item === "string");
}

/**
 * Safely parses a listing from unknown data
 * Returns null if the data is invalid
 */
export function parseListingFromUnknown(data: unknown): CarListingDetailsJson | null {
  if (!isCarListingDetailsJson(data)) {
    return null;
  }
  return data;
}

/**
 * Safely parses a listing summary from unknown data
 * Returns null if the data is invalid
 */
export function parseListingSummaryFromUnknown(data: unknown): CarListingSummary | null {
  if (!isCarListingSummary(data)) {
    return null;
  }
  return data;
}

/**
 * Validates that a string is a valid condition type
 */
export function isValidCondition(value: string): value is "new" | "used" | "certified" {
  return value === "new" || value === "used" || value === "certified";
}

/**
 * Validates that a string is a valid fuel type
 */
export function isValidFuelType(value: string): value is "diesel" | "petrol" | "hybrid" | "electric" {
  return value === "diesel" || value === "petrol" || value === "hybrid" || value === "electric";
}

/**
 * Validates that a string is a valid transmission type
 */
export function isValidTransmission(value: string): value is "automatic" | "manual" {
  return value === "automatic" || value === "manual";
}

/**
 * Validates that a string is a valid drivetrain type
 */
export function isValidDrivetrain(value: string): value is "fwd" | "rwd" | "awd" | "4wd" {
  return value === "fwd" || value === "rwd" || value === "awd" || value === "4wd";
}
