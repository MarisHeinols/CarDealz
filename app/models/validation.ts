/**
 * Listing Validation Utilities
 * 
 * Provides validation functions to ensure listing data integrity
 * before submission to the database.
 */

import type { CarListingDetailsJson } from "~/types/types";

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

/**
 * Validates a complete listing before submission
 */
export function validateListing(listing: CarListingDetailsJson): ValidationResult {
  const errors: ValidationError[] = [];

  // Basic Information
  if (!listing.make || listing.make.trim() === "") {
    errors.push({ field: "make", message: "validation.required" });
  }

  if (!listing.model || listing.model.trim() === "") {
    errors.push({ field: "model", message: "validation.required" });
  }

  if (!listing.year || listing.year < 1900 || listing.year > new Date().getFullYear() + 1) {
    errors.push({ 
      field: "year", 
      message: "validation.yearRange"
    });
  }

  if (listing.mileage < 0) {
    errors.push({ field: "mileage", message: "validation.negative" });
  }

  // Pricing
  if (!listing.price || listing.price <= 0) {
    errors.push({ field: "price", message: "validation.minPrice" });
  }

  if (typeof listing.selfCost !== "number" || listing.selfCost < 0) {
    errors.push({ field: "selfCost", message: "validation.negative" });
  }

  if (listing.marketRange.min < 0 || listing.marketRange.max < 0) {
    errors.push({ field: "marketRange", message: "validation.negative" });
  }

  if (listing.marketRange.min > listing.marketRange.max) {
    errors.push({ 
      field: "marketRange", 
      message: "validation.marketRangeOrder" 
    });
  }

  // Specs
  if (listing.displacement < 0) {
    errors.push({ field: "displacement", message: "validation.negative" });
  }

  if (listing.horsepower < 0) {
    errors.push({ field: "horsepower", message: "validation.negative" });
  }

  // Colors
  if (!listing.color || listing.color.trim() === "") {
    errors.push({ field: "color", message: "validation.required" });
  }

  if (!listing.interiorColor || listing.interiorColor.trim() === "") {
    errors.push({ field: "interiorColor", message: "validation.required" });
  }

  // Location
  if (!listing.location || listing.location.trim() === "") {
    errors.push({ field: "location", message: "validation.required" });
  }

  // Dealer MVP fields
  if (!listing.conditionTier || String(listing.conditionTier).trim() === "") {
    errors.push({ field: "conditionTier", message: "validation.required" });
  }

  if (!listing.status || String(listing.status).trim() === "") {
    errors.push({ field: "status", message: "validation.required" });
  }

  // Images
  if (!listing.images || listing.images.length === 0) {
    errors.push({ field: "images", message: "validation.atLeastOneImage" });
  }

  // Description
  if (!listing.description || listing.description.trim() === "") {
    errors.push({ field: "description", message: "validation.required" });
  } else if (listing.description.length < 50) {
    errors.push({ 
      field: "description", 
      message: "validation.minDescription" 
    });
  }

  // Seller
  if (!listing.seller.name || listing.seller.name.trim() === "") {
    errors.push({ field: "seller.name", message: "validation.required" });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validates individual fields
 */
export function validateField(
  field: keyof CarListingDetailsJson,
  value: any
): ValidationError | null {
  switch (field) {
    case "make":
    case "model":
      if (!value || value.trim() === "") {
        return { field, message: "validation.required" };
      }
      break;

    case "year":
      if (!value || value < 1900 || value > new Date().getFullYear() + 1) {
        return { 
          field, 
          message: "validation.yearRange"
        };
      }
      break;

    case "price":
      if (!value || value <= 0) {
        return { field, message: "validation.minPrice" };
      }
      break;

    case "selfCost":
      if (value < 0) {
        return { field, message: "validation.negative" };
      }
      break;

    case "mileage":
    case "displacement":
    case "horsepower":
      if (value < 0) {
        return { field, message: "validation.negative" };
      }
      break;

    case "color":
    case "interiorColor":
    case "location":
      if (!value || value.trim() === "") {
        return { field, message: "validation.required" };
      }
      break;

    case "description":
      if (!value || value.trim() === "") {
        return { field, message: "validation.required" };
      } else if (value.length < 50) {
        return { field, message: "validation.minDescription" };
      }
      break;

    case "conditionTier":
    case "status":
      if (!value || String(value).trim() === "") {
        return { field, message: "validation.required" };
      }
      break;
  }

  return null;
}

/**
 * Checks if a listing is ready for submission
 */
export function isListingComplete(listing: CarListingDetailsJson): boolean {
  return validateListing(listing).isValid;
}

/**
 * Gets a user-friendly error message for a field
 */
export function getFieldError(
  errors: ValidationError[],
  field: string
): string | undefined {
  return errors.find(e => e.field === field)?.message;
}
