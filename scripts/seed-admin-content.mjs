#!/usr/bin/env node
/**
 * Seed default content into the admin MongoDB so the portal and public site
 * have something to show. Only writes when a collection/section is empty —
 * never overwrites existing content.
 *
 * Usage: node scripts/seed-admin-content.mjs
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

function avatarDataUrl(initial, color) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="400"><rect width="300" height="400" fill="${color}"/><text x="150" y="225" font-size="90" fill="#ffffff" text-anchor="middle" font-family="Arial, sans-serif" font-weight="bold">${initial}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

const env = loadEnv(path.join(ROOT, '.env.local'));
const URI =
  env.MONGODB_DIRECT_URI ||
  process.env.MONGODB_DIRECT_URI ||
  env.MONGODB_URI ||
  process.env.MONGODB_URI;
const DB_NAME = env.MONGODB_DB || process.env.MONGODB_DB || 'apni_padhai';

if (!URI) {
  console.error('MONGODB_URI not found in .env.local — nothing to seed.');
  process.exit(1);
}

const now = new Date();
const iso = now.toISOString();

const SECTIONS = {
  hero: {
    title: 'Learn with Expert Educators & Crack Your Dream Exam',
    highlight: 'Dream Exam',
    subtitle:
      'Apni Padhai helps you prepare for Rajasthan Police, RAS, REET and other state exams with expert faculty, quality books and personal mentorship.',
  },
  courses: [
    {
      title: 'RAS Foundation Course',
      description: 'Complete prelims + mains preparation for Rajasthan Administrative Service with test series and mentoring.',
      url: 'https://apnipadhaipublication.com/ras-foundation/',
    },
    {
      title: 'Rajasthan Police SI & Constable',
      description: 'Full syllabus coverage, daily practice sets and mock tests for Sub Inspector and Constable exams.',
      url: 'https://apnipadhaipublication.com/police-course/',
    },
    {
      title: 'REET Level 1 & Level 2',
      description: 'Subject-wise preparation for the Rajasthan Eligibility Examination for Teachers with previous papers.',
      url: 'https://apnipadhaipublication.com/reet-course/',
    },
    {
      title: 'Patwari & Other State Exams',
      description: 'Practice-oriented course for Patwari, Rajasthan CET and other state-level examinations.',
      url: 'https://apnipadhaipublication.com/patwari-course/',
    },
  ],
  faqs: [
    {
      question: 'What exams does Apni Padhai prepare students for?',
      answer:
        'We focus on Rajasthan state exams including Rajasthan Police (SI & Constable), RAS, REET, Patwari and other CET-based exams.',
    },
    {
      question: 'Do you provide printed books along with courses?',
      answer:
        'Yes. Our published books cover the full syllabus of these exams and can be ordered from the website, with study material aligned to the courses.',
    },
    {
      question: 'How do I enrol in a course?',
      answer:
        'Choose the course you are interested in from the Courses section and click the enrolment link. Our team will reach out with the next steps.',
    },
    {
      question: 'Do you share previous year papers?',
      answer:
        'Yes, official solved previous year papers for RAS and Police exams are available for download from the Previous Year Papers section.',
    },
  ],
  testimonials: [
    {
      name: 'Rahul Sharma',
      exam: 'Rajasthan Police SI 2025',
      city: 'Jaipur',
      quote:
        'The daily practice sets and mentorship made a huge difference. I cleared the SI exam in my first attempt thanks to Apni Padhai.',
      photo: avatarDataUrl('R', '#2563eb'),
    },
    {
      name: 'Priya Verma',
      exam: 'REET L1 2025',
      city: 'Jodhpur',
      quote:
        'Subject-wise notes and the previous paper practice helped me qualify REET comfortably. Highly recommend their REET course.',
      photo: avatarDataUrl('P', '#059669'),
    },
    {
      name: 'Amit Singh',
      exam: 'RAS Mains 2024',
      city: 'Udaipur',
      quote:
        'Their RAS course is very well structured. The test series and answer writing practice gave me the confidence for Mains.',
      photo: avatarDataUrl('A', '#7c3aed'),
    },
  ],
};

const FEEDBACK = [
  {
    name: 'Sneha Jain',
    exam: 'Rajasthan Police Constable',
    date: 'Aug 2025',
    message:
      'The PDFs and practice sets are excellent. I practised daily with their material and cleared the constable written exam with a good rank.',
    photo: avatarDataUrl('S', '#0891b2'),
  },
  {
    name: 'Vikram Chouhan',
    exam: 'REET L2',
    date: 'Jul 2025',
    message:
      'Very helpful faculty and honest mentoring. The solved previous year papers were the most useful part of my preparation.',
    photo: avatarDataUrl('V', '#d97706'),
  },
  {
    name: 'Kiran Rathore',
    exam: 'RAS Prelims 2025',
    date: 'Jun 2025',
    message:
      'I loved the daily current affairs and GK updates. Apni Padhai is the best coaching I have tried for RAS preparation.',
    photo: avatarDataUrl('K', '#be123c'),
  },
];

const RESULTS = [
  { name: 'Mahendra K. Kumawat', district: 'Nagaur', category: 'Rajasthan Police', photo: avatarDataUrl('M', '#1d4ed8') },
  { name: 'Sunita Gurjar', district: 'Dausa', category: 'Rajasthan Police', photo: avatarDataUrl('S', '#0369a1') },
  { name: 'Rakesh Meena', district: 'Karauli', category: 'Rajasthan Police', photo: avatarDataUrl('R', '#4338ca') },
  { name: 'Pooja Bairwa', district: 'Sawai Madhopur', category: 'Rajasthan Police', photo: avatarDataUrl('P', '#0f766e') },
  { name: 'Deepak Saini', district: 'Alwar', category: 'REET L1/L2', photo: avatarDataUrl('D', '#047857') },
  { name: 'Anjali Yadav', district: 'Bharatpur', category: 'REET L1/L2', photo: avatarDataUrl('A', '#7e22ce') },
];

const WELCOME_POST = {
  slug: 'welcome-to-the-apni-padhai-blog',
  title: 'Welcome to the Apni Padhai Blog',
  excerpt:
    'News, exam alerts and study tips from the Apni Padhai team — your companion for Rajasthan state exam preparation.',
  content:
    'Welcome to the Apni Padhai blog. Here we share exam notifications, syllabus updates, preparation tips and success stories from our students across Rajasthan.',
  contentHtml:
    '<h2>Welcome to Apni Padhai</h2><p>This is where we publish exam notifications, syllabus updates, preparation strategies and success stories from our students.</p><p>Bookmark this page or check back regularly to stay on top of the latest updates for Rajasthan Police, RAS, REET, Patwari and other state exams.</p>',
  status: 'publish',
  categories: ['Blog'],
  imageUrl: '',
  author: 'Apni Padhai',
  date: iso,
  modified: iso,
  createdAt: now,
  updatedAt: now,
};

async function main() {
  const client = new MongoClient(URI, { serverSelectionTimeoutMS: 15000 });
  const report = [];
  try {
    await client.connect();
    const db = client.db(DB_NAME);
    const content = db.collection('siteContent');
    const feedback = db.collection('feedback');
    const results = db.collection('results');
    const updates = db.collection('updates');

    for (const [section, value] of Object.entries(SECTIONS)) {
      const existing = await content.findOne({ section });
      if (!existing) {
        await content.insertOne({ section, value, updatedAt: now });
        report.push(`siteContent: seeded "${section}"`);
      } else {
        report.push(`siteContent: skipped "${section}" (already has content)`);
      }
    }

    const feedbackCount = await feedback.countDocuments({});
    if (feedbackCount === 0) {
      await feedback.insertMany(
        FEEDBACK.map((item, index) => ({ ...item, order: index + 1 })),
      );
      report.push(`feedback: seeded ${FEEDBACK.length} entries`);
    } else {
      report.push(`feedback: skipped (already has ${feedbackCount} entries)`);
    }

    const resultsCount = await results.countDocuments({});
    if (resultsCount === 0) {
      await results.insertMany(
        RESULTS.map((item, index) => ({ ...item, order: index + 1 })),
      );
      report.push(`results: seeded ${RESULTS.length} entries`);
    } else {
      report.push(`results: skipped (already has ${resultsCount} entries)`);
    }

    const updatesCount = await updates.countDocuments({});
    if (updatesCount === 0) {
      await updates.insertOne(WELCOME_POST);
      report.push('updates: seeded welcome blog post');
    } else {
      report.push(`updates: skipped (already has ${updatesCount} posts)`);
    }

    console.log(`Seeded database "${DB_NAME}" at ${URI.split('@')[1] ?? URI}`);
    for (const line of report) console.log(`  - ${line}`);
  } finally {
    await client.close();
  }
}

main().catch((error) => {
  console.error('Seed failed:', error.message);
  process.exit(1);
});
