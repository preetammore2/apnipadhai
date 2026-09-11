/**
 * Results (Selections). Entries managed through the admin portal are stored in
 * Firebase; when none exist yet the public reader falls back to the WordPress
 * `ap-results` page (and /results further falls back to the photo folders).
 */

import { getWordPressPage } from '@/lib/wordpress';
import { listResults, type ResultCategory, type ResultInput } from '@/lib/db-results';
import type { FolderStudent } from '@/lib/resultStudents';

const RESULTS_PAGE_SLUG = 'ap-results';

export type { ResultCategory, ResultInput };

export type ResultGroup = {
  rajasthanPolice: FolderStudent[];
  reet: FolderStudent[];
};

function stripHtml(html: string): string {
  return (html ?? '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function decodeEntities(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'");
}

function parseNameDistrict(caption: string): { name: string; district: string } {
  const districtMatch = caption.match(/\(([^)]*)\)/);
  const district = districtMatch?.[1]?.trim() ?? '';
  const name = caption.replace(/\([^)]*\)/g, '').trim();
  return { name, district };
}

export function parseResults(html: string): ResultGroup {
  const group: ResultGroup = { rajasthanPolice: [], reet: [] };
  let current: ResultCategory | null = null;

  const headingRe = /<h([23])[^>]*>([\s\S]*?)<\/h\1>/gi;
  let match: RegExpExecArray | null;

  let lastHeadingIndex = 0;
  while ((match = headingRe.exec(html)) !== null) {
    const headingText = stripHtml(decodeEntities(match[2]));
    const index = match.index;
    for (const [key, cat] of Object.entries({
      'rajasthan police': 'Rajasthan Police',
      reet: 'REET L1/L2',
    })) {
      if (headingText.toLowerCase().includes(key)) {
        parseFiguresInto(html.slice(lastHeadingIndex, index), group, current);
        current = cat as ResultCategory;
        lastHeadingIndex = index;
        break;
      }
    }
  }
  parseFiguresInto(html.slice(lastHeadingIndex), group, current);

  return group;
}

function parseFiguresInto(
  slice: string,
  group: ResultGroup,
  category: ResultCategory | null,
) {
  const figureRe = /<figure[^>]*>([\s\S]*?)<\/figure>/gi;
  let match: RegExpExecArray | null;
  const bucket: FolderStudent[] =
    category === 'REET L1/L2'
      ? group.reet
      : category === 'Rajasthan Police'
        ? group.rajasthanPolice
        : [];
  while ((match = figureRe.exec(slice)) !== null) {
    const inner = match[1];
    const imgMatch = inner.match(/<img[^>]+src=["']([^"']+)["']/i);
    const figMatch = inner.match(/<figcaption[^>]*>([\s\S]*?)<\/figcaption>/i);
    const { name, district } = parseNameDistrict(
      figMatch ? stripHtml(decodeEntities(figMatch[1])) : '',
    );
    if (!name) continue;
    bucket.push({
      id: `result-${bucket.length + 1}`,
      name,
      district,
      photo: imgMatch?.[1] ?? '',
      category: category ?? 'Rajasthan Police',
    });
  }
}

function toFolderStudents(items: ResultInput[]): FolderStudent[] {
  return items.map((item, index) => ({
    id: `managed-result-${index + 1}`,
    name: item.name,
    district: item.district,
    photo: item.photo,
    category: item.category,
  }));
}

/** Public (unauthenticated) read of the managed results (Firebase-first). */
export async function getManagedResults(): Promise<ResultGroup> {
  const group: ResultGroup = { rajasthanPolice: [], reet: [] };

  try {
    const items = await listResults();
    if (items.length > 0) {
      group.rajasthanPolice = toFolderStudents(
        items.filter((i) => i.category === 'Rajasthan Police'),
      );
      group.reet = toFolderStudents(items.filter((i) => i.category === 'REET L1/L2'));
    }
  } catch (error) {
    console.error('[results] Firebase unavailable, using WordPress only', error);
  }

  // Merge the WordPress ap-results page so images come from BOTH stores.
  // Firebase entries win; WordPress adds any students not already present.
  try {
    const page = await getWordPressPage(RESULTS_PAGE_SLUG);
    if (page) {
      const wp = parseResults(page.contentHtml);
      group.rajasthanPolice = mergeGroups(group.rajasthanPolice, wp.rajasthanPolice);
      group.reet = mergeGroups(group.reet, wp.reet);
    }
  } catch (error) {
    console.error('[results] WordPress unavailable, using Firebase only', error);
  }

  return group;
}

function normalizeName(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, ' ');
}

function mergeGroups(primary: FolderStudent[], secondary: FolderStudent[]): FolderStudent[] {
  const seen = new Set(primary.map((student) => normalizeName(student.name)));
  const extra = secondary.filter((student) => !seen.has(normalizeName(student.name)));
  return [...primary, ...extra];
}
