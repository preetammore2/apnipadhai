#!/usr/bin/env node
/**
 * Add real student testimonials to the admin MongoDB (siteContent -> testimonials).
 *
 * Upserts by name so running it more than once never creates duplicates.
 * The public home page merges these with the WordPress ap_testimonial items.
 *
 * Usage: node scripts/add-testimonials.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { MongoClient } from 'mongodb';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

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
  const env = loadEnv(path.join(ROOT, '.env.local'));
  const URI =
    env.MONGODB_DIRECT_URI ||
    process.env.MONGODB_DIRECT_URI ||
    env.MONGODB_URI ||
    process.env.MONGODB_URI;
  const DB_NAME = env.MONGODB_DB || process.env.MONGODB_DB || 'apni_padhai';

  if (!URI) {
    console.error('MONGODB_URI not found in .env.local — nothing to add.');
    process.exit(1);
  }

  const client = new MongoClient(URI, { serverSelectionTimeoutMS: 15000 });
  try {
    await client.connect();
    const db = client.db(DB_NAME);
    const content = db.collection('siteContent');

    const existing = await content.findOne({ section: 'testimonials' });
    const items = Array.isArray(existing?.value) ? existing.value : [];
    const now = new Date();

    let added = 0;
    let updated = 0;
    for (const testimonial of TESTIMONIALS) {
      const found = items.find((item) => (item.name ?? '').trim().toLowerCase() === testimonial.name.toLowerCase());
      if (found) {
        Object.assign(found, testimonial, { updatedAt: now });
        updated++;
      } else {
        items.push({ ...testimonial, createdAt: now, updatedAt: now });
        added++;
      }
    }

    await content.updateOne(
      { section: 'testimonials' },
      { $set: { value: items, updatedAt: now } },
      { upsert: true },
    );

    console.log(`Testimonials updated in "${DB_NAME}" at ${URI.split('@')[1] ?? URI}`);
    console.log(`  - added: ${added}, updated: ${updated}, total: ${items.length}`);
    for (const item of items) console.log(`  - ${item.name} (${item.city})`);
  } finally {
    await client.close();
  }
}

main().catch((error) => {
  console.error('Failed:', error.message);
  process.exit(1);
});
