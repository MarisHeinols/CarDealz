# Listing Models Documentation

This directory contains all the structured models, utilities, and constants for managing car listings in the CarDealz platform.

## Overview

The models system provides a centralized, type-safe way to work with car listings throughout the application. It includes:

- **Factory functions** for creating empty listing objects
- **Validation utilities** for ensuring data integrity
- **Type guards** for runtime type checking
- **Constants** for dropdown options and defaults

## Quick Start

```typescript
import {
  createEmptyListing,
  validateListing,
  CAR_MAKES,
  FUEL_TYPES,
} from "~/models";

// Create a new empty listing
const listing = createEmptyListing();

// Validate before submission
const validation = validateListing(listing);
if (!validation.isValid) {
  console.error(validation.errors);
}

// Use constants for dropdowns
const makeOptions = CAR_MAKES;
const fuelOptions = FUEL_TYPES;
```

## Files

### `listing.ts`

Factory functions for creating and manipulating listing objects.

**Key Functions:**

- `createEmptyListing()` - Creates a new empty listing with all fields initialized
- `createEmptySeller()` - Creates an empty seller info object
- `createEmptyListingImage()` - Creates an empty listing image object
- `createEmptyListingSummary()` - Creates an empty listing summary
- `listingToSummary()` - Converts a full listing to a summary
- `generateListingId()` - Generates a unique listing ID
- `cloneListing()` - Clones a listing for duplication
- `mergeListing()` - Merges partial updates into a listing

**Example:**

```typescript
import { createEmptyListing, generateListingId } from "~/models";

const newListing = createEmptyListing();
newListing.id = generateListingId();
newListing.make = "Toyota";
newListing.model = "Camry";
```

### `validation.ts`

Validation utilities for ensuring listing data integrity.

**Key Functions:**

- `validateListing()` - Validates a complete listing
- `validateField()` - Validates a single field
- `isListingComplete()` - Checks if a listing is ready for submission
- `getFieldError()` - Gets error message for a specific field

**Example:**

```typescript
import { validateListing, getFieldError } from "~/models";

const validation = validateListing(listing);
if (!validation.isValid) {
  const makeError = getFieldError(validation.errors, "make");
  console.error(makeError); // "Make is required"
}
```

### `typeGuards.ts`

Runtime type checking utilities.

**Key Functions:**

- `isCarListingDetailsJson()` - Checks if value is a valid listing
- `isCarListingSummary()` - Checks if value is a valid summary
- `isListingImage()` - Checks if value is a valid image
- `isSellerInfo()` - Checks if value is valid seller info
- `parseListingFromUnknown()` - Safely parses listing from unknown data
- `isValidCondition()` - Validates condition type
- `isValidFuelType()` - Validates fuel type
- `isValidTransmission()` - Validates transmission type
- `isValidDrivetrain()` - Validates drivetrain type

**Example:**

```typescript
import { isCarListingDetailsJson, parseListingFromUnknown } from "~/models";

const data = await fetchListingFromAPI();
const listing = parseListingFromUnknown(data);
if (listing) {
  // Safe to use listing
}
```

### `index.ts`

Central export point for all models functionality. Import from here for convenience.

## Constants

### Available in `~/constants/listingOptions.ts`

**Car Makes:**

```typescript
CAR_MAKES; // Array of 40+ car brands
```

**Fuel Types:**

```typescript
FUEL_TYPES; // [{ value: "petrol", label: "Petrol/Gasoline" }, ...]
```

**Transmission Types:**

```typescript
TRANSMISSION_TYPES; // [{ value: "automatic", label: "Automatic" }, ...]
```

**Drivetrain Types:**

```typescript
DRIVETRAIN_TYPES; // [{ value: "fwd", label: "Front-Wheel Drive (FWD)" }, ...]
```

**Condition Types:**

```typescript
CONDITION_TYPES; // [{ value: "new", label: "New" }, ...]
```

**Colors:**

```typescript
EXTERIOR_COLORS; // ["Black", "White", "Silver", ...]
INTERIOR_COLORS; // ["Black", "Gray", "Beige", ...]
```

**Validation Constraints:**

```typescript
VALIDATION_CONSTRAINTS; // Min/max values for all fields
```

**Helper Functions:**

```typescript
getYearOptions(); // Returns array of years from 1900 to current+1
getRecentYears(); // Returns last 30 years
```

## Usage Examples

### Creating a New Listing

```typescript
import { createEmptyListing } from "~/models";

function NewListingForm() {
  const [listing, setListing] = useState(createEmptyListing());

  // Update fields
  const updateMake = (make: string) => {
    setListing((prev) => ({ ...prev, make }));
  };
}
```

### Validating Before Submission

```typescript
import { validateListing, createListing } from "~/models";

async function handleSubmit() {
  const validation = validateListing(listing);

  if (!validation.isValid) {
    // Show errors to user
    validation.errors.forEach((error) => {
      console.error(`${error.field}: ${error.message}`);
    });
    return;
  }

  // Safe to submit
  await createListing(userId, listing);
}
```

### Using Constants in Forms

```typescript
import { CAR_MAKES, FUEL_TYPES } from "~/models";

function BasicInfoSection() {
  return (
    <>
      <Select>
        {CAR_MAKES.map(make => (
          <MenuItem key={make} value={make}>{make}</MenuItem>
        ))}
      </Select>

      <Select>
        {FUEL_TYPES.map(({ value, label }) => (
          <MenuItem key={value} value={value}>{label}</MenuItem>
        ))}
      </Select>
    </>
  );
}
```

### Type-Safe API Responses

```typescript
import { parseListingFromUnknown } from "~/models";

async function fetchListing(id: string) {
  const response = await fetch(`/api/listings/${id}`);
  const data = await response.json();

  const listing = parseListingFromUnknown(data);
  if (!listing) {
    throw new Error("Invalid listing data");
  }

  return listing; // Type-safe!
}
```

## Best Practices

1. **Always use factory functions** instead of manually creating objects
2. **Validate before submission** to catch errors early
3. **Use type guards** when dealing with external data
4. **Import from `~/models`** for convenience
5. **Use constants** for dropdown options to ensure consistency
6. **Check validation constraints** before setting field values

## Integration with Services

The models integrate seamlessly with the services layer:

```typescript
// app/services/createListing.ts
import { validateListing, generateListingId } from "~/models";

export async function createListing(
  userId: string,
  listing: CarListingDetailsJson,
) {
  // Automatic validation
  const validation = validateListing(listing);
  if (!validation.isValid) {
    throw new Error("Validation failed");
  }

  // Generate ID if needed
  const listingId = listing.id || generateListingId();

  // Save to database...
}
```

## Type Safety

All functions are fully typed with TypeScript, providing:

- Autocomplete in your IDE
- Compile-time type checking
- Runtime validation with type guards
- Clear error messages

## Future Enhancements

Potential additions to the models system:

- Image optimization utilities
- Price calculation helpers
- Market value estimation
- Listing comparison functions
- Export/import utilities
- Bulk operations support
