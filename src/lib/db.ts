import { MongoClient, type Db } from 'mongodb';

const URI = process.env.MONGODB_DIRECT_URI ?? process.env.MONGODB_URI ?? '';
const DB_NAME = process.env.MONGODB_DB ?? 'apni_padhai';

export const COLLECTIONS = {
  content: 'siteContent',
  updates: 'updates',
  feedback: 'feedback',
  results: 'results',
  pages: 'pages',
  books: 'books',
  pyqs: 'pyqs',
} as const;

/** Whether MongoDB is configured on the server (drives the admin UI banner). */
export function isDbConfigured(): boolean {
  return Boolean(URI);
}

const globalForMongo = globalThis as unknown as { _apMongoClient?: MongoClient };

function getClient(): MongoClient {
  if (!URI) {
    throw new Error('MONGODB_URI is not configured on the server.');
  }
  if (!globalForMongo._apMongoClient) {
    globalForMongo._apMongoClient = new MongoClient(URI, {
      serverSelectionTimeoutMS: 5000,
    });
  }
  return globalForMongo._apMongoClient;
}

/**
 * Resolve the database. Throws when MongoDB is not configured or unreachable —
 * callers decide how to handle that (admin routes surface an error, public
 * readers fall back to the WordPress source).
 */
export async function getDb(): Promise<Db> {
  if (!isDbConfigured()) {
    throw new Error('MONGODB_URI is not configured on the server.');
  }
  return getClient().db(DB_NAME);
}

export function isValidObjectId(value: string): boolean {
  return /^[a-f\d]{24}$/i.test(value);
}
