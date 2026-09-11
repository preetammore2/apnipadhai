import { getDb, isDbConfigured, toJsDate } from '@/lib/firebase';

export { getDb, isDbConfigured, toJsDate };

export const COLLECTIONS = {
  content: 'siteContent',
  updates: 'updates',
  feedback: 'feedback',
  results: 'results',
  pages: 'pages',
  books: 'books',
  pyqs: 'pyqs',
} as const;

/**
 * Validate a Firestore document ID (used by the admin updates `[id]` route).
 * Firestore auto-IDs are arbitrary strings: non-empty, no '/', max 1500 bytes.
 */
export function isValidDocId(value: string): boolean {
  return (
    typeof value === 'string' &&
    value.length > 0 &&
    value.length <= 1500 &&
    !value.includes('/')
  );
}