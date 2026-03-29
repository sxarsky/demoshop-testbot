/** Max upload size for product images (5 MiB). */
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export const ALLOWED_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export type AllowedImageMime = (typeof ALLOWED_IMAGE_MIME_TYPES)[number];

const EXT_TO_MIME: Record<string, AllowedImageMime> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

function mimeFromFilename(name: string): AllowedImageMime | null {
  const lower = name.toLowerCase();
  for (const [ext, mime] of Object.entries(EXT_TO_MIME)) {
    if (lower.endsWith(ext)) return mime;
  }
  return null;
}

export function isAllowedImageType(file: File): boolean {
  if (ALLOWED_IMAGE_MIME_TYPES.includes(file.type as AllowedImageMime)) {
    return true;
  }
  if (!file.type && file.name) {
    return mimeFromFilename(file.name) !== null;
  }
  return false;
}

/**
 * Returns an error message if the file is invalid, otherwise null.
 */
export function validateImageFile(file: File): string | null {
  if (!isAllowedImageType(file)) {
    return "Only JPG, PNG, and WEBP images are allowed.";
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return "Image must be 5MB or smaller.";
  }
  return null;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/**
 * Reads a file as a base64 data URL (e.g. data:image/png;base64,...).
 */
export function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === "string") {
        resolve(result);
      } else {
        reject(new Error("Could not read file as data URL"));
      }
    };
    reader.onerror = () => {
      reject(reader.error ?? new Error("Failed to read file"));
    };
    reader.readAsDataURL(file);
  });
}
