// API configuration
// In production, uses the production URL
// In development, can be overridden with VITE_API_URL environment variable
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://demoshop.skyramp.dev';

// Helper function to construct API URLs
export const apiUrl = (path: string) => `${API_BASE_URL}${path}`;
