/**
 * Models Index
 * 
 * Central export point for all listing-related models, utilities, and constants.
 * Import from this file to access all listing functionality.
 * 
 * @example
 * import { createEmptyListing, validateListing, CAR_MAKES } from "~/models";
 */

// Factory functions and listing models
export {
  createEmptyListing,
  createEmptySeller,
  createEmptyListingImage,
  createEmptyListingSummary,
  listingToSummary,
  createPartialListing,
  mergeListing,
  generateListingId,
  cloneListing,
} from "./listing";

// Validation utilities
export {
  validateListing,
  validateField,
  isListingComplete,
  getFieldError,
  type ValidationError,
  type ValidationResult,
} from "./validation";

// Type guards
export {
  isSellerInfo,
  isListingImage,
  isCarListingSummary,
  isCarListingDetailsJson,
  isListingImageArray,
  isCarFeatureArray,
  parseListingFromUnknown,
  parseListingSummaryFromUnknown,
  isValidCondition,
  isValidFuelType,
  isValidTransmission,
  isValidDrivetrain,
} from "./typeGuards";

// Re-export constants from the constants folder for convenience
export {
  CAR_MAKES,
  FUEL_TYPES,
  TRANSMISSION_TYPES,
  DRIVETRAIN_TYPES,
  CONDITION_TIERS,
  EXTERIOR_COLORS,
  INTERIOR_COLORS,
  YEAR_RANGE,
  LISTING_DEFAULTS,
  VALIDATION_CONSTRAINTS,
  getYearOptions,
  getRecentYears,
} from "~/constants/listingOptions";
