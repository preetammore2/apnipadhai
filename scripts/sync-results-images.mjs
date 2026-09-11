#!/usr/bin/env node
/**
 * Sync the results photo-wall from public/images into Firestore.
 *
 * Images are base64-encoded and stored directly in each Firestore document
 * so the site has zero dependency on the public/images folder at runtime.
 * Firebase Storage is not available (billing not enabled), so this is the
 * reliable path for hosting images entirely in the database.
 *
 * Each file is named "Student Name (District).ext". The script upserts one
 * `results` document per photo (keyed by name + category) so it is idempotent,
 * and removes old SVG-letter placeholders so real photos take over.
 *
 * Usage: node scripts/sync-results-images.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getFirestoreDb } from './lib/firebase.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const SUPPORTED_EXT = new Set(['.jpg', '.jpeg', '.png', '.webp', '.heif', '.heic', '.avif']);

const MIME_MAP = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.heif': 'image/heif',
  '.heic': 'image/heic',
  '.avif': 'image/avif',
};

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
      const ext = path.extname(file).toLowerCase();
      const mimeType = MIME_MAP[ext] || 'application/octet-stream';
      const buffer = fs.readFileSync(path.join(dir, file));
      const base64 = buffer.toString('base64');
      return {
        name,
        district,
        photoData: `data:${mimeType};base64,${base64}`,
        photo: `/images/${folder}/${encodeURI(file)}`,
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}

async function main() {
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

  const db = getFirestoreDb({ label: 'sync' });
  const results = db.collection('results');

  const existing = await results.get();
  const removed = await Promise.all(
    existing.docs
      .filter((doc) => {
        const p = doc.data().photo;
        return typeof p === 'string' && p.startsWith('data:image/svg');
      })
      .map((doc) => doc.ref.delete()),
  );

  const now = new Date();
  let inserted = 0;
  let updated = 0;
  let errors = 0;

  for (let index = 0; index < all.length; index++) {
    const item = all[index];
    const doc = {
      name: item.name,
      district: item.district,
      category: item.category,
      photo: item.photoData,
      order: index + 1,
      updatedAt: now,
    };
    try {
      const found = existing.docs.find(
        (d) => d.data().name === item.name && d.data().category === item.category,
      );
      if (found) {
        await found.ref.set(doc);
        updated++;
      } else {
        await results.add({ ...doc, createdAt: now });
        inserted++;
      }
    } catch (error) {
      console.error(`  ERROR [${item.name}]`, error.message);
      errors++;
    }
  }

  const rpDocs = (await results.where('category', '==', 'Rajasthan Police').get()).size;
  const reetDocs = (await results.where('category', '==', 'REET L1/L2').get()).size;

  console.log(`Results synced into Firestore "${db.databaseId || 'default'}"`);
  console.log(`  - inserted: ${inserted}, updated: ${updated}, errors: ${errors}, SVG placeholders removed: ${removed.length}`);
  console.log(`  - total photos stored: ${inserted + updated}`);
  console.log(`  - Rajasthan Police: ${rpDocs} entries`);
  console.log(`  - REET L1/L2: ${reetDocs} entries`);
}

main().catch((error) => {
  console.error('Sync failed:', error.message);
  process.exit(1);
});