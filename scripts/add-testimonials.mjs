#!/usr/bin/env node
/**
 * Add real student testimonials to Firestore (siteContent -> testimonials).
 *
 * Images are read from public/images and stored as base64 data URLs directly
 * in Firestore so the site has zero dependency on the public/images folder.
 * Upserts by name so running it more than once never creates duplicates.
 *
 * Usage: node scripts/add-testimonials.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getFirestoreDb } from './lib/firebase.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const MIME_MAP = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.heif': 'image/heif',
  '.heic': 'image/heic',
  '.avif': 'image/avif',
};

function toBase64DataUrl(localPath) {
  try {
    const decoded = decodeURIComponent(localPath);
    const fullPath = path.join(ROOT, 'public', decoded.startsWith('/') ? decoded.slice(1) : decoded);
    const ext = path.extname(fullPath).toLowerCase();
    const mime = MIME_MAP[ext] || 'application/octet-stream';
    const buf = fs.readFileSync(fullPath);
    return `data:${mime};base64,${buf.toString('base64')}`;
  } catch {
    return localPath;
  }
}

const TESTIMONIALS = [
  {
    name: 'Dipesh',
    exam: 'Teacher Recruitment L1',
    city: 'Jhunjhunu',
    quote:
      'मैंने कुछ टॉपिक आपकी ज्योग्राफी की किताब से और कुछ टॉपिक कल्चर वाली किताब से कवर किए थे, जिसका मुझे कम समय में ज्यादा फायदा हुआ और मैंने 672 रैंक (NTSP) हासिल की 🙏🙏',
    photo: '/images/REET_L1_L2/Dipesh%20(Jhunjhunu).webp',
  },
  {
    name: 'Lalit',
    exam: 'Teacher Recruitment L1',
    city: 'Salumbar',
    quote:
      "I'm really glad to say that your content is so good. Your marathon video for Rajasthan GK is amazing and it's helpful for me to quick revision before the appearing to exam. I have one requested that please do...",
    photo: '/images/REET_L1_L2/Lalit%20(Salumbar).webp',
  },
  {
    name: 'Nand kishor',
    exam: 'Teacher Recruitment L1',
    city: 'Kota',
    quote:
      'मेरी सफलता में रोहित सर के द्वारा निकाले गए GK के ब्रह्मास्त्र का बहुत योगदान रहा, मैंने इन ब्रह्मास्त्र को पढ़कर आज लेवल 1 अध्यापक भर्ती परीक्षा में 1178 रैंक प्राप्त की। अध्यापक बनने के इस सफर में बहुत मित्रो...',
    photo: '/images/REET_L1_L2/Nand%20kishor%20(kota).webp',
  },
];

async function main() {
  const db = getFirestoreDb({ label: 'testimonials' });
  const content = db.collection('siteContent');

  const testimonialsRef = content.doc('testimonials');
  const existing = await testimonialsRef.get();
  const items = Array.isArray(existing.data()?.value) ? existing.data().value : [];
  const now = new Date();

  let added = 0;
  let updated = 0;
  for (const testimonial of TESTIMONIALS) {
    const photo = toBase64DataUrl(testimonial.photo);
    const entry = { ...testimonial, photo };

    const found = items.find(
      (item) => (item.name ?? '').trim().toLowerCase() === testimonial.name.toLowerCase(),
    );
    if (found) {
      Object.assign(found, entry, { updatedAt: now });
      updated++;
    } else {
      items.push({ ...entry, createdAt: now, updatedAt: now });
      added++;
    }
  }

  await testimonialsRef.set({ section: 'testimonials', value: items, updatedAt: now });

  console.log(`Testimonials updated in Firestore "${db.databaseId || 'default'}"`);
  console.log(`  - added: ${added}, updated: ${updated}, total: ${items.length}`);
  for (const item of items) console.log(`  - ${item.name} (${item.city}) photo: ${item.photo.startsWith('data:') ? 'base64' : 'path'}`);
}

main().catch((error) => {
  console.error('Failed:', error.message);
  process.exit(1);
});