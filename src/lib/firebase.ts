import { Firestore, Timestamp } from '@google-cloud/firestore';

export const FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID || 'apnipadhai-6ae4b';
export const FIREBASE_DATABASE_ID = process.env.FIREBASE_DATABASE_ID || 'apnipadhai';

/** Whether Firebase is configured on the server (drives the admin UI banner). */
export function isDbConfigured(): boolean {
  return Boolean(
    process.env.FIREBASE_SERVICE_ACCOUNT ||
      (process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) ||
      process.env.GOOGLE_APPLICATION_CREDENTIALS,
  );
}

function resolveCredentials(): Record<string, string> | undefined {
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (serviceAccount) {
    try {
      const parsed = JSON.parse(serviceAccount) as {
        client_email?: string;
        private_key?: string;
        project_id?: string;
      };
      if (parsed.client_email && parsed.private_key) {
        return { client_email: parsed.client_email, private_key: parsed.private_key };
      }
    } catch (error) {
      console.error('[firebase] invalid FIREBASE_SERVICE_ACCOUNT JSON', error);
    }
  }
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;
  if (clientEmail && privateKey) {
    return { client_email: clientEmail, private_key: privateKey.replace(/\\n/g, '\n') };
  }
  return undefined;
}

let db: Firestore | null = null;

/** Resolve the Firestore client. Callers handle "not configured" on their own
 * (admin routes surface an error, public readers fall back to WordPress).
 *
 * Built directly from @google-cloud/firestore with `ignoreUndefinedProperties`
 * so optional fields that are undefined (e.g. book author, course tag) are
 * omitted instead of aborting the write. firebase-admin's getFirestore() does
 * not forward this setting and its .settings() may only be called once, which
 * breaks on dev hot-reload — hence the direct construction. */
export function getDb(): Firestore {
  if (db) return db;
  const credentials = resolveCredentials();
  db = new Firestore({
    projectId: FIREBASE_PROJECT_ID,
    databaseId: FIREBASE_DATABASE_ID,
    ignoreUndefinedProperties: true,
    ...(credentials ? { credentials } : {}),
  });
  return db;
}

/** Convert a Firestore Timestamp back to a JS Date (Firestore stores dates as
 * Timestamps; JSON serializing a raw Timestamp yields `{_seconds, _nanoseconds}`). */
export function toJsDate(value: unknown): Date {
  if (value instanceof Timestamp) return value.toDate();
  if (value instanceof Date) return value;
  return new Date();
}