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

function newClient(): MongoClient {
  return new MongoClient(URI, {
    serverSelectionTimeoutMS: 5000,
  });
}

/** True once the shared client's topology has been torn down (e.g. after a
 * failed handshake). Reusing such a client fails with "Topology is closed". */
function isClientDead(client: MongoClient): boolean {
  const topology = (client as unknown as {
    topology?: { hasBeenDestroyed?: () => boolean };
  }).topology;
  return topology?.hasBeenDestroyed?.() === true;
}

function recycleClient(): void {
  const existing = globalForMongo._apMongoClient;
  globalForMongo._apMongoClient = undefined;
  if (existing) {
    existing.close().catch(() => {});
  }
}

function getClient(): MongoClient {
  if (!URI) {
    throw new Error('MONGODB_URI is not configured on the server.');
  }
  if (!globalForMongo._apMongoClient || isClientDead(globalForMongo._apMongoClient)) {
    globalForMongo._apMongoClient = newClient();
  }
  return globalForMongo._apMongoClient;
}

function isRecoverableTopologyError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  return (
    error.name === 'MongoTopologyClosedError' ||
    error.message.includes('Topology is closed')
  );
}

/**
 * Resolve the database. Throws when MongoDB is not configured or unreachable —
 * callers decide how to handle that (admin routes surface an error, public
 * readers fall back to the WordPress source).
 *
 * If a connection attempt fails and leaves the shared client's topology closed,
 * the client is recycled so the next call opens a fresh connection instead of
 * permanently failing with "Topology is closed".
 */
export async function getDb(): Promise<Db> {
  if (!isDbConfigured()) {
    throw new Error('MONGODB_URI is not configured on the server.');
  }

  try {
    const client = getClient();
    await client.connect();
    return client.db(DB_NAME);
  } catch (error) {
    if (isRecoverableTopologyError(error)) {
      recycleClient();
      const client = getClient();
      await client.connect();
      return client.db(DB_NAME);
    }
    throw error;
  }
}

export function isValidObjectId(value: string): boolean {
  return /^[a-f\d]{24}$/i.test(value);
}
