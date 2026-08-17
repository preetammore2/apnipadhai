import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { isDbConfigured } from '@/lib/db';
import {
  listResults,
  replaceResults,
  RESULT_CATEGORIES,
  type ResultInput,
} from '@/lib/db-results';
import { hasAdminAccess } from '@/lib/auth';
import { getClientIp, rateLimitResponse } from '@/lib/rate-limit';
import { denyIfCrossOrigin, readJsonBody } from '@/lib/request-security';

export const runtime = 'nodejs';

function cleanItems(value: unknown): ResultInput[] | null {
  if (!Array.isArray(value)) return null;
  const items: ResultInput[] = value
    .map((raw) => {
      const item = (raw ?? {}) as Record<string, unknown>;
      const category =
        typeof item.category === 'string' && (RESULT_CATEGORIES as readonly string[]).includes(item.category)
          ? (item.category as ResultInput['category'])
          : 'Rajasthan Police';
      return {
        name: typeof item.name === 'string' ? item.name.trim().slice(0, 200) : '',
        district: typeof item.district === 'string' ? item.district.trim().slice(0, 200) : '',
        photo: typeof item.photo === 'string' ? item.photo.trim() : '',
        category,
      };
    })
    .filter((item) => item.name);
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
    const items = await listResults();
    return NextResponse.json({ success: true, configured, items });
  } catch (error) {
    console.error('[api/admin/results] list error', error);
    return NextResponse.json(
      { success: false, message: 'Failed to load results from MongoDB' },
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
    key: `admin-results-write:${getClientIp(request)}`,
  });
  if (throttled) return throttled;

  try {
    const body = await readJsonBody<{ items?: unknown }>(request);
    const items = cleanItems(body?.items);
    if (!items) {
      return NextResponse.json(
        { success: false, message: 'Add at least one result entry' },
        { status: 400 },
      );
    }

    await replaceResults(items);
    revalidatePath('/results');

    const saved = await listResults();
    return NextResponse.json({ success: true, items: saved });
  } catch (error) {
    console.error('[api/admin/results] save error', error);
    return NextResponse.json({ success: false, message: 'Failed to save results to MongoDB' }, { status: 502 });
  }
}
