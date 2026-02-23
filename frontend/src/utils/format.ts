/**
 * Shared formatting utilities for the Furniro e-commerce app
 */

/**
 * Format a price in Nigerian Naira (NGN)
 * @param price - Price in kobo (smallest currency unit)
 * @returns Formatted price string with NGN currency symbol
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(price);
}

/**
 * Format a date for display
 * @param date - Date string or Date object
 * @returns Formatted date string
 */
export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("en-NG", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date));
}

/**
 * Format a date with time
 * @param date - Date string or Date object
 * @returns Formatted date and time string
 */
export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat("en-NG", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}
