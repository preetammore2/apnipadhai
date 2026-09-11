import { getApps, initializeApp, cert, type App } from 'firebase-admin/app';
import { getFirestore, Timestamp, type Firestore } from 'firebase-admin/firestore';

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

function resolveCredential() {
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (serviceAccount) {
    try {
      return cert(JSON.parse(serviceAccount) as Record<string, unknown>);
    } catch (error) {
      console.error('[firebase] invalid FIREBASE_SERVICE_ACCOUNT JSON', error);
    }
  }
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;
  if (clientEmail && privateKey) {
    return cert({
      projectId: FIREBASE_PROJECT_ID,
      clientEmail,
      privateKey: privateKey.replace(/\\n/g, '\n'),
    });
  }
  return undefined;
}

function getApp(): App {
  const existing = getApps()[0];
  if (existing) return existing;
  const credential = resolveCredential();
  return initializeApp({
    projectId: FIREBASE_PROJECT_ID,
    ...(credential ? { credential } : {}),
  });
}

/** Resolve the Firestore client. Callers handle "not configured" on their own
 * (admin routes surface an error, public readers fall back to WordPress). */
export function getDb(): Firestore {
  return getFirestore(getApp(), FIREBASE_DATABASE_ID);
}

/** Convert a Firestore Timestamp back to a JS Date (Firestore stores dates as
 * Timestamps; JSON serializing a raw Timestamp yields `{_seconds, _nanoseconds}`). */
export function toJsDate(value: unknown): Date {
  if (value instanceof Timestamp) return value.toDate();
  if (value instanceof Date) return value;
  return new Date();
}