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
    // If it's not an image, or we are on the server (which shouldn't happen for this flow), just do standard FileReader
    if (!file.type.startsWith("image/") || typeof document === "undefined") {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
      return;
    }

    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      
      const MAX_WIDTH = 1024;
      const MAX_HEIGHT = 1024;
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > MAX_WIDTH) {
          height = Math.round((height * MAX_WIDTH) / width);
          width = MAX_WIDTH;
        }
      } else {
        if (height > MAX_HEIGHT) {
          width = Math.round((width * MAX_HEIGHT) / height);
          height = MAX_HEIGHT;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        // Fallback if canvas is not supported
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      // Compress aggressively to webp to fit multiple images in 1MB Firestore limit
      const dataUrl = canvas.toDataURL("image/webp", 0.6);
      resolve(dataUrl);
    };

    img.onerror = (err) => {
      URL.revokeObjectURL(objectUrl);
      reject(err);
    };

    img.src = objectUrl;
  });
}

