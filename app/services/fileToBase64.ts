import type { ListingImage } from "~/types/types";

/**
 * Converts an array of File objects to base64 strings
 * @param files - Array of File objects to convert
 * @returns Promise resolving to array of base64 strings
 */
export async function filesToBase64(files: File[]): Promise<string[]> {
  const promises = files.map((file) => fileToBase64(file));
  return Promise.all(promises);
}

/**
 * Converts an array of File objects to ListingImage objects with base64 URLs
 * @param files - Array of File objects to convert
 * @returns Promise resolving to array of ListingImage objects
 */
export async function filesToListingImages(files: File[]): Promise<ListingImage[]> {
  const base64Strings = await filesToBase64(files);
  return base64Strings.map((url, index) => ({
    id: `img_${Date.now()}_${index}`,
    url,
    isPrimary: index === 0, // First image is primary by default
  }));
}

/**
 * Converts a single File object to a base64 string
 * @param file - File object to convert
 * @returns Promise resolving to base64 string
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}
