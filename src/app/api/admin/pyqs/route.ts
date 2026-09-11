import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { isDbConfigured } from '@/lib/db';
import {
  listPyqs,
  replacePyqs,
  PYQ_CATEGORIES,
  PYQ_STATES,
  type PyqInput,
} from '@/lib/db-pyqs';
import { hasAdminAccess } from '@/lib/auth';
import { getClientIp, rateLimitResponse } from '@/lib/rate-limit';
import { denyIfCrossOrigin, readJsonBody } from '@/lib/request-security';

export const runtime = 'nodejs';

function cleanItems(value: unknown): PyqInput[] | null {
  if (!Array.isArray(value)) return null;
  const items: PyqInput[] = value
    .map((raw) => {
      const item = (raw ?? {}) as Record<string, unknown>;
      const category =
        typeof item.category === 'string' && (PYQ_CATEGORIES as readonly string[]).includes(item.category)
          ? (item.category as PyqInput['category'])
          : 'RAS';
      const state =
        typeof item.state === 'string' && (PYQ_STATES as readonly string[]).includes(item.state)
          ? (item.state as PyqInput['state'])
          : 'Rajasthan';
      const year = typeof item.year === 'number' ? Math.max(0, Math.floor(item.year)) : 0;
      return {
        title: typeof item.title === 'string' ? item.title.trim().slice(0, 300) : '',
        examName:
          typeof item.examName === 'string' ? item.examName.trim().slice(0, 200) : '',
        category,
        year,
        state,
        questionsCount:
          typeof item.questionsCount === 'number' && item.questionsCount > 0
            ? Math.floor(item.questionsCount)
            : undefined,
        pdfSize:
          typeof item.pdfSize === 'string' && item.pdfSize.trim()
            ? item.pdfSize.trim().slice(0, 50)
            : undefined,
        downloadUrl:
          typeof item.downloadUrl === 'string' ? item.downloadUrl.trim().slice(0, 2000) : '',
        hasSolution: Boolean(item.hasSolution),
        subject: typeof item.subject === 'string' ? item.subject.trim().slice(0, 300) : '',
      };
    })
    .filter((item) => item.title && item.downloadUrl);
  return items.length > 0 ? items : null;
}

export async function GET(request: NextRequest) {
  if (!hasAdminAccess(request)) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const configured = isDbConfigured();
    if (!configured) {
      return NextResponse.json({ success: true, configured: false, items: [] });
    }
    const items = await listPyqs();
    return NextResponse.json({ success: true, configured, items });
  } catch (error) {
    console.error('[api/admin/pyqs] list error', error);
    return NextResponse.json(
      { success: false, message: 'Failed to load PYQs from Firebase' },
      { status: 502 },
    );
  }
}

export async function PUT(request: NextRequest) {
  const crossOrigin = denyIfCrossOrigin(request);
  if (crossOrigin) return crossOrigin;

  if (!hasAdminAccess(request)) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  const throttled = rateLimitResponse(request, {
    limit: 30,
    windowMs: 15 * 60 * 1000,
    key: `admin-pyqs-write:${getClientIp(request)}`,
  });
  if (throttled) return throttled;

  try {
    const body = await readJsonBody<{ items?: unknown }>(request);
    const items = cleanItems(body?.items);
    if (!items) {
      return NextResponse.json(
        { success: false, message: 'Add at least one paper with a title and download link' },
        { status: 400 },
      );
    }

    await replacePyqs(items);
    revalidatePath('/api/pyqs');
    revalidatePath('/pyqs');
    revalidatePath('/');

    const saved = await listPyqs();
    return NextResponse.json({ success: true, items: saved });
  } catch (error) {
    console.error('[api/admin/pyqs] save error', error);
    return NextResponse.json(
      { success: false, message: 'Failed to save PYQs to Firebase' },
      { status: 502 },
    );
  }
}
