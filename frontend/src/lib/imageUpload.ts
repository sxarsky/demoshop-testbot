/**
 * Image upload utility functions
 */

export interface ImageUploadResult {
  preview: string;
  base64: string;
  fileName: string;
  fileSize: number;
  error?: string;
}

/**
 * Convert file to base64 for preview
 */
export const convertToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * Process uploaded image file
 * BUG: Missing file type validation
 * BUG: Missing file size validation
 */
export const processImageUpload = async (file: File): Promise<ImageUploadResult> => {
  try {
    // BUG: No file type validation - accepts any file type
    // Should validate: only JPG, PNG, WEBP

    // BUG: No file size validation - accepts any size
    // Should validate: max 5MB

    const base64 = await convertToBase64(file);

    return {
      preview: base64,
      base64: base64,
      fileName: file.name,
      fileSize: file.size, // BUG: Returns raw bytes, should format as KB/MB
    };
  } catch (error) {
    return {
      preview: '',
      base64: '',
      fileName: '',
      fileSize: 0,
      error: 'Invalid file', // BUG: Generic error message, not specific
    };
  }
};

/**
 * Format file size
 * BUG: Not actually used - file size shown in bytes
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};
