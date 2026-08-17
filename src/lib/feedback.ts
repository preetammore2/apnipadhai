/**
 * Feedbacks (student reviews). Entries managed through the admin portal are
 * stored in MongoDB; when none exist yet the public reader falls back to the
 * WordPress `ap-feedback` page so existing content keeps rendering.
 */

import { getWordPressPage } from '@/lib/wordpress';
import { listFeedback, type FeedbackInput } from '@/lib/db-feedback';

const FEEDBACK_PAGE_SLUG = 'ap-feedback';

export interface FeedbackItem extends FeedbackInput {
  id: string;
}

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

export function parseFeedback(html: string): FeedbackItem[] {
  const items: FeedbackItem[] = [];
  const blockquoteRe = /<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi;
  let match: RegExpExecArray | null;
  while ((match = blockquoteRe.exec(html)) !== null && items.length < 100) {
    const inner = match[1];
    const message = stripHtml(
      decodeEntities(
        inner
          .replace(/<(cite|figcaption|footer)[^>]*>[\s\S]*?<\/\1>/gi, '')
          .replace(/<img[^>]*>/gi, ''),
      ),
    );
    if (!message) continue;

    const citeMatch = inner.match(/(?:<footer[^>]*>|^)([\s\S]*?)(?:<\/footer>|$)/i);
    const citeText = citeMatch
      ? stripHtml(decodeEntities(citeMatch[1]))
      : '';
    const [name = '', exam = '', date = ''] = citeText
      .split(/[|•·]/)
      .map((part) => part.trim());

    const imgMatch = inner.match(/<img[^>]+src=["']([^"']+)["']/i);

    items.push({
      id: `fb-${items.length + 1}`,
      name,
      exam,
      date,
      message,
      photo: imgMatch?.[1] ?? '',
    });
  }
  return items;
}

/** Public (unauthenticated) read of the approved feedback list. */
export async function getApprovedFeedback(): Promise<FeedbackItem[]> {
  try {
    const items = await listFeedback();
    if (items.length > 0) return items;
  } catch (error) {
    console.error('[feedback] MongoDB unavailable, using WordPress', error);
  }

  const page = await getWordPressPage(FEEDBACK_PAGE_SLUG);
  if (!page) return [];
  return parseFeedback(page.contentHtml);
}
