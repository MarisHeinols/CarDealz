/**
 * Listing Models and Factory Functions
 * 
 * This module provides structured object creation for car listings,
 * ensuring consistency and type safety across the application.
 */

import type {
  CarListingDetails,
  CarListingDetailsJson,
  CarListingSummary,
  ListingImage,
  SellerInfo
} from "~/types/types";

/**
 * Creates an empty listing object with all required fields initialized
 * to sensible defaults. Use this when creating a new listing.
 */
export function createEmptyListing(): CarListingDetailsJson {
  return {
    id: "",
    vin: "",
    ta: "",
    plateNumber: "",
    make: "",
    model: "",
    year: new Date().getFullYear(),
    mileage: 0,
    fuelType: "petrol",
    displacement: 0,
    transmission: "automatic",
    drivetrain: "fwd",
    horsepower: 0,
    price: 0,
    selfCost: 0,
    interiorColor: "",
    conditionTier: "used",
    status: "draft",
    color: "",
    location: "",
    address: "",
    marketRange: { min: 0, max: 0 },
    marketRangeUpdatedAt: "",
    images: [],
    features: [],
    description: "",
    seller: createEmptySeller(),
    viewCount: 0,
    isSold: false,
    deleted: false,
    lastViewed: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  };
}

/**
 * Creates an empty seller info object
 */
export function createEmptySeller(): SellerInfo {
  return {
    name: "",
    isDealer: false,
  };
}

/**
 * Creates an empty listing image object
 */
export function createEmptyListingImage(id?: string): ListingImage {
  return {
    id: id || generateImageId(),
    url: "",
    isPrimary: false,
  };
}

/**
 * Creates an empty listing summary object (for list views)
 */
export function createEmptyListingSummary(): CarListingSummary {
  return {
    id: "",
    make: "",
    model: "",
    year: new Date().getFullYear(),
    mileage: 0,
    price: 0,
    conditionTier: "used",
    location: "",
    color: "",
    marketRange: { min: 0, max: 0 },
    thumbnailUrl: "",
    viewCount: 0,
  };
}

/**
 * Converts a full listing to a summary (for list views)
 */
export function listingToSummary(listing: CarListingDetails | CarListingDetailsJson): CarListingSummary {
  const primaryImage = Array.isArray(listing.images)
    ? listing.images.find(img => img.isPrimary) || listing.images[0]
    : null;

  return {
    id: listing.id,
    make: listing.make,
    model: listing.model,
    year: listing.year,
    mileage: listing.mileage,
    price: listing.price,
    conditionTier: listing.conditionTier,
    location: listing.location,
    color: listing.color,
    marketRange: listing.marketRange,
    thumbnailUrl: primaryImage?.url || "",
    viewCount: listing.viewCount,
    status: (listing as any).status,
  };
}

/**
 * Creates a partial listing with only the provided fields
 * Useful for updates or patches
 */
export function createPartialListing(
  partial: Partial<CarListingDetailsJson>
): Partial<CarListingDetailsJson> {
  return {
    ...partial,
  };
}

/**
 * Merges a partial listing into a full listing
 */
export function mergeListing(
  base: CarListingDetailsJson,
  updates: Partial<CarListingDetailsJson>
): CarListingDetailsJson {
  return {
    ...base,
    ...updates,
  };
}

/**
 * Generates a unique ID for images
 */
function generateImageId(): string {
  return `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Generates a unique ID for listings
 */
export function generateListingId(): string {
  return `listing_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Clones a listing (useful for duplicating listings)
 */
export function cloneListing(listing: CarListingDetailsJson): CarListingDetailsJson {
  return {
    ...listing,
    id: "", // Reset ID for new listing
    createdAt: new Date().toISOString(),
    lastViewed: new Date().toISOString(),
    viewCount: 0,
    images: listing.images.map(img => ({ ...img })),
    features: [...listing.features],
    marketRange: { ...listing.marketRange },
    seller: { ...listing.seller },
  };
}
