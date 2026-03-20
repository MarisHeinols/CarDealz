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
    errors.push({ field: "make", message: "Make is required" });
  }

  if (!listing.model || listing.model.trim() === "") {
    errors.push({ field: "model", message: "Model is required" });
  }

  if (!listing.year || listing.year < 1900 || listing.year > new Date().getFullYear() + 1) {
    errors.push({ 
      field: "year", 
      message: `Year must be between 1900 and ${new Date().getFullYear() + 1}` 
    });
  }

  if (listing.mileage < 0) {
    errors.push({ field: "mileage", message: "Mileage cannot be negative" });
  }

  // Pricing
  if (!listing.price || listing.price <= 0) {
    errors.push({ field: "price", message: "Price must be greater than 0" });
  }

  if (typeof listing.selfCost !== "number" || listing.selfCost < 0) {
    errors.push({ field: "selfCost", message: "Self cost cannot be negative" });
  }

  if (listing.marketRange.min < 0 || listing.marketRange.max < 0) {
    errors.push({ field: "marketRange", message: "Market range values cannot be negative" });
  }

  if (listing.marketRange.min > listing.marketRange.max) {
    errors.push({ 
      field: "marketRange", 
      message: "Market range minimum cannot exceed maximum" 
    });
  }

  // Specs
  if (listing.displacement < 0) {
    errors.push({ field: "displacement", message: "Displacement cannot be negative" });
  }

  if (listing.horsepower < 0) {
    errors.push({ field: "horsepower", message: "Horsepower cannot be negative" });
  }

  // Colors
  if (!listing.color || listing.color.trim() === "") {
    errors.push({ field: "color", message: "Exterior color is required" });
  }

  if (!listing.interiorColor || listing.interiorColor.trim() === "") {
    errors.push({ field: "interiorColor", message: "Interior color is required" });
  }

  // Location
  if (!listing.location || listing.location.trim() === "") {
    errors.push({ field: "location", message: "Location is required" });
  }

  // Dealer MVP fields
  if (!listing.conditionTier || String(listing.conditionTier).trim() === "") {
    errors.push({ field: "conditionTier", message: "Condition tier is required" });
  }

  if (!listing.status || String(listing.status).trim() === "") {
    errors.push({ field: "status", message: "Status is required" });
  }

  // Images
  if (!listing.images || listing.images.length === 0) {
    errors.push({ field: "images", message: "At least one image is required" });
  }

  // Description
  if (!listing.description || listing.description.trim() === "") {
    errors.push({ field: "description", message: "Description is required" });
  } else if (listing.description.length < 50) {
    errors.push({ 
      field: "description", 
      message: "Description must be at least 50 characters" 
    });
  }

  // Seller
  if (!listing.seller.name || listing.seller.name.trim() === "") {
    errors.push({ field: "seller.name", message: "Seller name is required" });
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
        return { field, message: `${field} is required` };
      }
      break;

    case "year":
      if (!value || value < 1900 || value > new Date().getFullYear() + 1) {
        return { 
          field, 
          message: `Year must be between 1900 and ${new Date().getFullYear() + 1}` 
        };
      }
      break;

    case "price":
      if (!value || value <= 0) {
        return { field, message: "Price must be greater than 0" };
      }
      break;

    case "selfCost":
      if (value < 0) {
        return { field, message: "Self cost cannot be negative" };
      }
      break;

    case "mileage":
    case "displacement":
    case "horsepower":
      if (value < 0) {
        return { field, message: `${field} cannot be negative` };
      }
      break;

    case "color":
    case "interiorColor":
    case "location":
      if (!value || value.trim() === "") {
        return { field, message: `${field} is required` };
      }
      break;

    case "description":
      if (!value || value.trim() === "") {
        return { field, message: "Description is required" };
      } else if (value.length < 50) {
        return { field, message: "Description must be at least 50 characters" };
      }
      break;

    case "conditionTier":
    case "status":
      if (!value || String(value).trim() === "") {
        return { field, message: `${field} is required` };
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
