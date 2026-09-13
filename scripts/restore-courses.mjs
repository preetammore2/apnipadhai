import { getFirestoreDb } from './lib/firebase.mjs';

const CATALOG_URL = 'https://apnipadhai.org/new-courses';
const FEATURED_URLS = [
  'https://apnipadhai.org/new-courses/75-reet-pre-complete-online-batch-sst-level-ii',
  'https://apnipadhai.org/new-courses/74-reet-pre-complete-online-batch-math-science-level-ii',
  'https://apnipadhai.org/new-courses/73-reet-pre-complete-online-batch-level-i',
  'https://apnipadhai.org/new-courses/61-ssc-gd-foundation-complete-online-course-30',
  'https://apnipadhai.org/new-courses/50-si-sub-inspector-2026-complete-online-batch-3-0',
  'https://apnipadhai.org/new-courses/59-bsf-constable-tradesman-2026-complete-online-course-30',
  'https://apnipadhai.org/new-courses/41-rajasthan-gk-complete-online-batch-20',
];

function decode(s) {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#039;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&#8211;/g, '\u2013')
    .replace(/&#8212;/g, '\u2014')
    .replace(/&#8216;/g, '\u2018')
    .replace(/&#8217;/g, '\u2019')
    .replace(/&#8220;/g, '\u201c')
    .replace(/&#8221;/g, '\u201d');
}

async function fetchHtml(url) {
  const res = await fetch(url, { next: { revalidate: 60 } });
  if (!res.ok) return '';
  return res.text();
}

function extractCourseObjects(html) {
  const out = [];
  const slugRe = /"course_slug"\s*:\s*"([^"]+)"/g;
  let match;
  while ((match = slugRe.exec(html)) !== null) {
    const slugIdx = match.index;
    let open = -1;
    for (let cand = slugIdx - 1; cand >= Math.max(0, slugIdx - 6000); cand -= 1) {
      if (html[cand] !== '{') continue;
      let depth = 0;
      let inString = false;
      let escaped = false;
      let close = -1;
      for (let k = cand; k < html.length; k += 1) {
        const ch = html[k];
        if (inString) {
          if (escaped) escaped = false;
          else if (ch === '\\') escaped = true;
          else if (ch === '"') inString = false;
          continue;
        }
        if (ch === '"') inString = true;
        else if (ch === '{') depth += 1;
        else if (ch === '}') {
          depth -= 1;
          if (depth === 0) {
            close = k;
            break;
          }
        }
      }
      if (close !== -1 && close >= slugIdx) {
        open = cand;
        break;
      }
    }
    if (open === -1) continue;
    let depth = 0;
    let inString = false;
    let escaped = false;
    let close = -1;
    for (let k = open; k < html.length; k += 1) {
      const ch = html[k];
      if (inString) {
        if (escaped) escaped = false;
        else if (ch === '\\') escaped = true;
        else if (ch === '"') inString = false;
        continue;
      }
      if (ch === '"') inString = true;
      else if (ch === '{') depth += 1;
      else if (ch === '}') {
        depth -= 1;
        if (depth === 0) {
          close = k;
          break;
        }
      }
    }
    if (close === -1) continue;
    try {
      const obj = JSON.parse(html.slice(open, close + 1));
      if (!obj.course_slug) continue;
      out.push({
        id: Number(obj.id ?? 0) || 0,
        course_name: obj.course_name ?? '',
        course_slug: obj.course_slug,
        course_thumbnail: obj.course_thumbnail ?? obj.image ?? obj.small_course_logo ?? '',
      });
    } catch {
      // malformed object; skip
    }
  }
  return out;
}

function mapClassx(item) {
  const title = decode(item.course_name).trim();
  const url = item.id ? `https://apnipadhai.org/new-courses/${item.id}-${item.course_slug}` : '';
  const image = item.course_thumbnail ? decode(item.course_thumbnail).trim() : '';
  return { title, url, image };
}

const db = getFirestoreDb();

const [catalogHtml, ...featuredHtml] = await Promise.all([
  fetchHtml(CATALOG_URL),
  ...FEATURED_URLS.map((url) => fetchHtml(url)),
]);

const seen = new Set();
const courses = [];
const pushAll = (html) => {
  for (const obj of extractCourseObjects(html)) {
    if (!obj.id || seen.has(obj.id)) continue;
    seen.add(obj.id);
    courses.push(mapClassx(obj));
  }
};
featuredHtml.forEach((html) => pushAll(html));
pushAll(catalogHtml);

if (courses.length === 0) {
  console.error('RESTORE ABORTED — no courses extracted from catalog');
  process.exit(1);
}

await db.collection('siteContent').doc('courses').set(
  { section: 'courses', value: courses, updatedAt: new Date() },
  { merge: true },
);

const doc = await db.collection('siteContent').doc('courses').get();
const stored = doc.data()?.value ?? [];
console.log('RESTORED OK —', stored.length, 'courses written to Firebase');
process.exit(0);