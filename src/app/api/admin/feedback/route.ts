import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { isDbConfigured } from '@/lib/db';
import { listFeedback, replaceFeedback, type FeedbackInput } from '@/lib/db-feedback';
import { hasAdminAccess } from '@/lib/auth';
import { getClientIp, rateLimitResponse } from '@/lib/rate-limit';
import { denyIfCrossOrigin, readJsonBody } from '@/lib/request-security';

export const runtime = 'nodejs';

function cleanItems(value: unknown): FeedbackInput[] | null {
  if (!Array.isArray(value)) return null;
  const items: FeedbackInput[] = value
    .map((raw) => {
      const item = (raw ?? {}) as Record<string, unknown>;
      return {
        name: typeof item.name === 'string' ? item.name.trim().slice(0, 200) : '',
        exam: typeof item.exam === 'string' ? item.exam.trim().slice(0, 200) : '',
        date: typeof item.date === 'string' ? item.date.trim().slice(0, 100) : '',
        message: typeof item.message === 'string' ? item.message.trim().slice(0, 5000) : '',
        photo: typeof item.photo === 'string' ? item.photo.trim() : '',
      };
    })
    .filter((item) => item.message);
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
    const items = await listFeedback();
    return NextResponse.json({ success: true, configured, items });
  } catch (error) {
    console.error('[api/admin/feedback] list error', error);
    return NextResponse.json(
      { success: false, message: 'Failed to load feedback from Firebase' },
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
    key: `admin-feedback-write:${getClientIp(request)}`,
  });
  if (throttled) return throttled;

  try {
    const body = await readJsonBody<{ items?: unknown }>(request);
    const items = cleanItems(body?.items);
    if (!items) {
      return NextResponse.json(
        { success: false, message: 'Add at least one feedback entry' },
        { status: 400 },
      );
    }

    await replaceFeedback(items);
    revalidatePath('/feedback');

    const saved = await listFeedback();
    return NextResponse.json({ success: true, items: saved });
  } catch (error) {
    console.error('[api/admin/feedback] save error', error);
    return NextResponse.json({ success: false, message: 'Failed to save feedback to Firebase' }, { status: 502 });
  }
}
