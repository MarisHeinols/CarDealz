import type { ListingImage } from "~/types/types";
import imageCompression from "browser-image-compression";

import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "~/firebase/storage";
import { auth } from "~/firebase/auth";

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
 * Uploads a single File object to Firebase Storage
 * @param file - File object to upload
 * @returns Promise resolving to download URL
 */
export async function uploadFileToStorage(file: File): Promise<string> {
  const options = {
    maxSizeMB: 0.5, // 500KB is plenty for a high quality image 
    maxWidthOrHeight: 1600,
    useWebWorker: true,
    fileType: "image/webp",
    initialQuality: 0.8,
  };
  
  let processedFile = file;
  try {
    processedFile = await imageCompression(file, options);
  } catch (err) {
    console.error("Image compression failed before upload:", err);
  }

  const user = auth.currentUser;
  if (!user) {
    throw new Error("User must be authenticated to upload images");
  }
  const uid = user.uid;
  const fileName = `${uid}_${Date.now()}_${Math.random().toString(36).substring(7)}.webp`;
  const storageRef = ref(storage, `listings/${fileName}`);

  await uploadBytes(storageRef, processedFile, {
    contentType: processedFile.type || "image/webp",
  });
  return await getDownloadURL(storageRef);
}

async function uploadBlobToStorage(path: string, blob: Blob, contentType: string): Promise<string> {
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, blob, { contentType });
  return await getDownloadURL(storageRef);
}

export async function uploadListingImageToStorage(file: File): Promise<Pick<ListingImage, "url" | "thumbnailUrl">> {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("User must be authenticated to upload images");
  }

  const uid = user.uid;
  const baseName = `${uid}_${Date.now()}_${Math.random().toString(36).substring(7)}`;

  const fullOptions = {
    maxSizeMB: 0.6,
    maxWidthOrHeight: 1600,
    useWebWorker: true,
    fileType: "image/webp",
    initialQuality: 0.82,
  };

  const thumbOptions = {
    maxSizeMB: 0.2,
    maxWidthOrHeight: 720,
    useWebWorker: true,
    fileType: "image/webp",
    initialQuality: 0.82,
  };

  const MAX_UPLOAD_BYTES = 2 * 1024 * 1024;
  const SAFE_MAX_BYTES = Math.floor(MAX_UPLOAD_BYTES * 0.95);

  let full: Blob = file;
  let thumb: Blob = file;

  try {
    full = await imageCompression(file, fullOptions);
  } catch (err) {
    console.error("Image compression failed for full image:", err);
  }

  try {
    thumb = await imageCompression(file, thumbOptions);
  } catch (err) {
    console.error("Image compression failed for thumbnail:", err);
  }

  // If compression failed, we may still have the original file (which can exceed Storage rules).
  // Retry with more aggressive settings before attempting upload.
  if (full.size > SAFE_MAX_BYTES) {
    try {
      full = await imageCompression(file, {
        maxSizeMB: 0.35,
        maxWidthOrHeight: 1280,
        useWebWorker: true,
        fileType: "image/webp",
        initialQuality: 0.75,
      });
    } catch (err) {
      console.error("Aggressive compression failed for full image:", err);
    }
  }

  if (thumb.size > SAFE_MAX_BYTES) {
    try {
      thumb = await imageCompression(file, {
        maxSizeMB: 0.15,
        maxWidthOrHeight: 540,
        useWebWorker: true,
        fileType: "image/webp",
        initialQuality: 0.78,
      });
    } catch (err) {
      console.error("Aggressive compression failed for thumbnail:", err);
    }
  }

  if (full.size >= MAX_UPLOAD_BYTES) {
    throw new Error(
      `Image too large after compression (${Math.ceil(full.size / 1024)}KB). Please choose a smaller image.`,
    );
  }
  if (thumb.size >= MAX_UPLOAD_BYTES) {
    throw new Error(
      `Thumbnail too large after compression (${Math.ceil(thumb.size / 1024)}KB). Please choose a smaller image.`,
    );
  }

  // Force contentType to satisfy Storage rules (request.resource.contentType.matches('image/.*')).
  const contentType = "image/webp";
  const thumbContentType = "image/webp";

  const [url, thumbnailUrl] = await Promise.all([
    uploadBlobToStorage(`listings/${baseName}_full.webp`, full, contentType),
    uploadBlobToStorage(`listings/${baseName}_thumb.webp`, thumb, thumbContentType),
  ]);

  return { url, thumbnailUrl };
}

/**
 * Converts an array of File objects to ListingImage objects by uploading to Storage
 * @param files - Array of File objects to convert
 * @returns Promise resolving to array of ListingImage objects
 */
export async function filesToListingImages(files: File[]): Promise<ListingImage[]> {
  const promises = files.map((f) => uploadListingImageToStorage(f));
  const results = await Promise.all(promises);

  return results.map(({ url, thumbnailUrl }, index) => ({
    id: `img_${Date.now()}_${index}`,
    url,
    thumbnailUrl,
    isPrimary: index === 0, // First image is primary by default
  }));
}

/**
 * Converts a single File object to a base64 string
 * @param file - File object to convert
 * @returns Promise resolving to base64 string
 */
export async function fileToBase64(file: File): Promise<string> {
  // If it's not an image, or we are on the server (which shouldn't happen for this flow), just do standard FileReader
  if (!file.type.startsWith("image/") || typeof document === "undefined") {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  }

  try {
    const options = {
      maxSizeMB: 0.15, // Aim for 150KB max per image to easily fit several in 1MB limit
      maxWidthOrHeight: 1024,
      useWebWorker: true,
      fileType: "image/webp",
      initialQuality: 0.7,
    };
    
    // Compress the image
    const compressedFile = await imageCompression(file, options);
    
    // Convert to base64
    return await imageCompression.getDataUrlFromFile(compressedFile);
  } catch (error) {
    console.error("Image compression failed:", error);
    
    // Fallback if compression fails
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  }
}
