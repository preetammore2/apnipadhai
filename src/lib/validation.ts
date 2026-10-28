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

/**
 * Clean and validate an email the way WordPress's is_email() does, because
 * WooCommerce rejects the whole order ("Invalid parameter(s): billing") for any
 * email it considers invalid. Strips spaces and the trailing "." that mobile
 * keyboards add on double-space, and lowercases. Returns null when invalid.
 */
export function normalizeEmail(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const email = value.replace(/\s+/g, '').replace(/\.+$/, '').toLowerCase();
  if (email.length < 6 || email.length > 254) return null;

  const parts = email.split('@');
  if (parts.length !== 2) return null;
  const [local, domain] = parts;
  if (!local || !/^[a-z0-9!#$%&'*+/=?^_`{|}~.-]+$/.test(local)) return null;
  if (!domain || domain.includes('..') || domain.startsWith('.')) return null;

  const labels = domain.split('.');
  if (labels.length < 2) return null;
  for (const label of labels) {
    if (!/^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/.test(label)) return null;
  }
  return email;
}

/** Merchant transaction IDs follow the format AP-<timestamp>-<12-hex>. */
export function isMerchantTransactionId(value: string): boolean {
  return /^AP-\d{10,14}-[A-F0-9]{12}$/.test(value);
}
