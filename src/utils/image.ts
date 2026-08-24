export const DEFAULT_GROCERY_ICON_URL = 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80';

/**
 * Validates or returns fallback image URL for product images.
 * Returns default grocery store image URL if input URL is invalid or empty.
 */
export function getImageFallback(url?: string | null): string {
  if (!url || typeof url !== 'string' || url.trim() === '') {
    return DEFAULT_GROCERY_ICON_URL;
  }

  const lower = url.toLowerCase();
  if (
    lower.includes('example.com') ||
    lower.includes('placeholder') ||
    lower.includes('invalid') ||
    lower.includes('null') ||
    lower.includes('undefined')
  ) {
    return DEFAULT_GROCERY_ICON_URL;
  }

  return url;
}
