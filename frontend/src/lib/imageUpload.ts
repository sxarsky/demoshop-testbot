export const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const ALLOWED_EXTENSIONS = ["JPG", "PNG", "WEBP"];
export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export interface ImageUploadResult {
  dataUrl: string;
  fileName: string;
  fileSize: number;
}

export interface ImageValidationError {
  message: string;
}

/** Returns a human-readable string for a byte count (e.g. "1.4 MB"). */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Validates file type and size. Returns an error object or null if valid. */
export function validateImageFile(file: File): ImageValidationError | null {
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return {
      message: `Only ${ALLOWED_EXTENSIONS.join(", ")} files are allowed.`,
    };
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return { message: "File size must be 5 MB or less." };
  }
  return null;
}

/** Reads a File and resolves with its base64 data URL. */
export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Failed to read file."));
    reader.readAsDataURL(file);
  });
}

/**
 * Validates and converts an image File to a base64 data URL.
 * Throws an ImageValidationError message string on failure.
 */
export async function processImageFile(file: File): Promise<ImageUploadResult> {
  const error = validateImageFile(file);
  if (error) throw new Error(error.message);
  const dataUrl = await readFileAsDataUrl(file);
  return { dataUrl, fileName: file.name, fileSize: file.size };
}
