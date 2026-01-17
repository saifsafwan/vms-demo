import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// ============================================
// CSS Utilities
// ============================================

/**
 * Combines Tailwind CSS classes safely, handling conflicts
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// ============================================
// Code Generation
// ============================================

// Characters that are unambiguous (removed: I, O, 0, 1, L)
const PASS_CODE_CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const PASS_CODE_LENGTH = 6;

/**
 * Generates a random 6-character alphanumeric pass code
 * Uses only unambiguous characters to avoid confusion
 */
export function generatePassCode(): string {
  return Array.from(
    { length: PASS_CODE_LENGTH },
    () => PASS_CODE_CHARS.charAt(Math.floor(Math.random() * PASS_CODE_CHARS.length))
  ).join('');
}

// ============================================
// Formatting Utilities
// ============================================

/**
 * Formats a phone number for display
 * Handles Malaysian format (10-11 digits)
 */
export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');

  // Malaysian mobile: 01X-XXX XXXX (10-11 digits)
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
  }
  if (cleaned.length === 11) {
    return `${cleaned.slice(0, 4)}-${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
  }

  return phone;
}

/**
 * Formats a date as relative time (e.g., "5m ago", "2h ago")
 */
export function formatTimeAgo(dateString: string): string {
  const now = Date.now();
  const then = new Date(dateString).getTime();
  const diffMs = now - then;
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

/**
 * Formats remaining time until expiration
 */
export function formatCountdown(expiresAt: string): string {
  const now = Date.now();
  const expires = new Date(expiresAt).getTime();
  const diffMs = expires - now;

  if (diffMs <= 0) return 'Expired';

  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 0) {
    return `${hours}h ${mins}m remaining`;
  }
  return `${mins}m remaining`;
}

// ============================================
// Validation Utilities
// ============================================

/**
 * Checks if a pass has expired
 */
export function isExpired(expiresAt: string | null): boolean {
  if (!expiresAt) return false;
  return new Date(expiresAt).getTime() < Date.now();
}

// ============================================
// Date Utilities
// ============================================

/**
 * Gets the start of today in ISO format
 */
export function getTodayStart(): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today.toISOString();
}

/**
 * Gets a date X hours from now in ISO format
 */
export function getExpiryTime(hoursFromNow: number = 3): string {
  const expiry = new Date();
  expiry.setHours(expiry.getHours() + hoursFromNow);
  return expiry.toISOString();
}
