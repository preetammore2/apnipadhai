#!/usr/bin/env node
/**
 * Sync the results photo-wall from public/images into MongoDB.
 *
 * The real student photos live in:
 *   public/images/Rajasthan_Police/  -> category "Rajasthan Police"
 *   public/images/REET_L1_L2/        -> category "REET L1/L2"
 *
 * Each file is named "Student Name (District).ext". This script upserts one
 * `results` document per photo (keyed by name + category) so it is idempotent,
 * and removes the old SVG letter placeholders so real photos take over.
 *
 * The public /results page merges MongoDB results with the WordPress ap-results
 * page, so images come from both stores (MongoDB wins on name conflicts).
 *
 * Usage: node scripts/sync-results-images.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { MongoClient } from 'mongodb';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const SUPPORTED_EXT = new Set(['.jpg', '.jpeg', '.png', '.webp', '.heif', '.heic', '.avif']);

function loadEnv(file) {
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

function parseFilename(filename) {
  const base = path.basename(filename, path.extname(filename));
  const openIdx = base.indexOf('(');
  const closeIdx = base.indexOf(')', openIdx + 1);
  if (openIdx >= 0 && closeIdx > openIdx) {
    return {
      name: base.slice(0, openIdx).trim().replace(/\s+/g, ' '),
      district: base.slice(openIdx + 1, closeIdx).trim().replace(/\s+/g, ' '),
    };
  }
  return { name: base.trim(), district: '' };
}

function readFolder(folder) {
  const dir = path.join(ROOT, 'public', 'images', folder);
  let files = [];
  try {
    files = fs.readdirSync(dir);
  } catch {
    return [];
  }
  return files
    .filter((file) => SUPPORTED_EXT.has(path.extname(file).toLowerCase()))
    .map((file) => {
      const { name, district } = parseFilename(file);
      return {
        name,
        district,
        photo: `/images/${folder}/${encodeURI(file)}`,
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}

async function main() {
  const env = loadEnv(path.join(ROOT, '.env.local'));
  const URI =
    env.MONGODB_DIRECT_URI ||
    process.env.MONGODB_DIRECT_URI ||
    env.MONGODB_URI ||
    process.env.MONGODB_URI;
  const DB_NAME = env.MONGODB_DB || process.env.MONGODB_DB || 'apni_padhai';

  if (!URI) {
    console.error('MONGODB_URI not found in .env.local — nothing to sync.');
    process.exit(1);
  }

  const rajasthanPolice = readFolder('Rajasthan_Police').map((student) => ({
    ...student,
    category: 'Rajasthan Police',
  }));
  const reet = readFolder('REET_L1_L2').map((student) => ({
    ...student,
    category: 'REET L1/L2',
  }));
  const all = [...rajasthanPolice, ...reet];

  if (all.length === 0) {
    console.error('No student images found under public/images — nothing to sync.');
    process.exit(1);
  }

  const client = new MongoClient(URI, { serverSelectionTimeoutMS: 15000 });
  try {
    await client.connect();
    const db = client.db(DB_NAME);
    const results = db.collection('results');

    const removed = await results.deleteMany({ photo: { $regex: '^data:image/svg' } });

    const now = new Date();
    let inserted = 0;
    let updated = 0;
    for (let index = 0; index < all.length; index++) {
      const item = all[index];
      const doc = { ...item, order: index + 1, updatedAt: now };
      const existing = await results.findOne({ name: item.name, category: item.category });
      if (existing) {
        await results.updateOne({ _id: existing._id }, { $set: doc });
        updated++;
      } else {
        await results.insertOne({ ...doc, createdAt: now });
        inserted++;
      }
    }

    const rpCount = await results.countDocuments({ category: 'Rajasthan Police' });
    const reetCount = await results.countDocuments({ category: 'REET L1/L2' });

    console.log(`Results synced into "${DB_NAME}" at ${URI.split('@')[1] ?? URI}`);
    console.log(`  - inserted: ${inserted}, updated: ${updated}, SVG placeholders removed: ${removed.deletedCount}`);
    console.log(`  - Rajasthan Police: ${rpCount} entries`);
    console.log(`  - REET L1/L2: ${reetCount} entries`);
  } finally {
    await client.close();
  }
}

main().catch((error) => {
  console.error('Sync failed:', error.message);
  process.exit(1);
});
