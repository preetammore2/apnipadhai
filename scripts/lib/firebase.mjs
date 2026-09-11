#!/usr/bin/env node
/**
 * Shared config + Firestore bootstrap for the admin maintenance scripts.
 * Reads `.env.local` (project root) for Firebase service-account credentials
 * and returns a Firestore instance.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..', '..');

export function loadEnv(file) {
  const env = {};
  if (!fs.existsSync(file)) return env;
  for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (!match) continue;
    let value = match[2];
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    env[match[1]] = value;
  }
  return env;
}

export function getFirestoreDb({ exit = true, label = 'operation' } = {}) {
  const env = loadEnv(path.join(ROOT, '.env.local'));

  const read = (name) => env[name] ?? process.env[name];
  const projectId = read('FIREBASE_PROJECT_ID') || 'apnipadhai-6ae4b';
  const databaseId = read('FIREBASE_DATABASE_ID') || 'apnipadhai';
  const serviceAccount = read('FIREBASE_SERVICE_ACCOUNT');
  const clientEmail = read('FIREBASE_CLIENT_EMAIL');
  const privateKey = read('FIREBASE_PRIVATE_KEY');
  const googleCreds = read('GOOGLE_APPLICATION_CREDENTIALS');

  if (!serviceAccount && !(clientEmail && privateKey) && !googleCreds) {
    console.error(`Firebase not configured — set FIREBASE_SERVICE_ACCOUNT (or FIREBASE_CLIENT_EMAIL + FIREBASE_PRIVATE_KEY) in .env.local to run ${label}.`);
    if (exit) process.exit(1);
  }

  if (getApps().length === 0) {
    let credential;
    if (serviceAccount) {
      try {
        credential = cert(JSON.parse(serviceAccount));
      } catch (error) {
        console.error('Invalid FIREBASE_SERVICE_ACCOUNT JSON:', error.message);
        if (exit) process.exit(1);
      }
    } else if (clientEmail && privateKey) {
      credential = cert({
        projectId,
        clientEmail,
        privateKey: privateKey.replace(/\\n/g, '\n'),
      });
    }

    initializeApp({
      projectId,
      ...(credential ? { credential } : {}),
    });
  }

  return getFirestore(getApps()[0], databaseId);
}