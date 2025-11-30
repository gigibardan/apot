/**
 * Calculate reading time from HTML content
 * Average reading speed: 200 words per minute
 */
export function calculateReadingTime(htmlContent: string): number {
  if (!htmlContent) return 1;

  // Strip HTML tags and get plain text
  const text = htmlContent.replace(/<[^>]*>/g, " ");

  // Count words (split by whitespace and filter empty strings)
  const words = text.split(/\s+/).filter((word) => word.length > 0).length;

  // Calculate minutes (200 words per minute)
  const minutes = Math.ceil(words / 200);

  // Return at least 1 minute
  return Math.max(1, minutes);
}

/**
 * Format reading time for display
 */
export function formatReadingTime(minutes: number): string {
  return minutes === 1 ? "1 min citire" : `${minutes} min citire`;
}
