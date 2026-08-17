/**
 * Strip all non-digit characters and optionally truncate to maxLength.
 * Used on client-side inputs to enforce numeric-only fields.
 */
export function digitsOnly(value: string, maxLength?: number): string {
  const digits = value.replace(/\D/g, '');
  return typeof maxLength === 'number' ? digits.slice(0, maxLength) : digits;
}

/** Exactly 10 digits — no country code, no dashes, no spaces, no alphabets. */
export function isTenDigitPhone(value: string): boolean {
  return /^\d{10}$/.test(value);
}

/** Exactly 6 digits — Indian pincode format, no alphabets allowed. */
export function isSixDigitPincode(value: string): boolean {
  return /^\d{6}$/.test(value);
}

/**
 * Server-side phone normalizer. Strips any non-digit characters, then
 * validates that the result is exactly 10 digits. Returns null for
 * invalid / non-numeric / wrong-length input.
 */
export function normalizePhone(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const digits = value.replace(/\D/g, '');
  return isTenDigitPhone(digits) ? digits : null;
}

/**
 * Server-side pincode normalizer. Strips any non-digit characters, then
 * validates that the result is exactly 6 digits. Returns null for
 * invalid / non-numeric / wrong-length input.
 */
export function normalizePincode(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const digits = value.replace(/\D/g, '');
  return isSixDigitPincode(digits) ? digits : null;
}

/** Merchant transaction IDs follow the format AP-<timestamp>-<12-hex>. */
export function isMerchantTransactionId(value: string): boolean {
  return /^AP-\d{10,14}-[A-F0-9]{12}$/.test(value);
}
