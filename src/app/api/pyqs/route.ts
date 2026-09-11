import { NextResponse } from 'next/server';
import { listPyqs, type StoredPyq } from '@/lib/db-pyqs';
import { getPyqs } from '@/lib/wordpress';

export const runtime = 'nodejs';

export async function GET() {
  let managed: StoredPyq[] = [];
  try {
    managed = await listPyqs();
  } catch (error) {
    console.error('[api/pyqs] Firebase unavailable, using WordPress', error);
  }

  try {
    const wp = await getPyqs();
    const seen = new Set(managed.map((pyq) => pyq.downloadUrl));
    const extra = wp.filter((pyq) => !seen.has(pyq.downloadUrl));
    return NextResponse.json([...managed, ...extra]);
  } catch (error) {
    console.error('[api/pyqs] error', error);
    if (managed.length > 0) {
      return NextResponse.json(managed);
    }
    return NextResponse.json(
      { success: false, message: 'Failed to load PYQs' },
      { status: 502 },
    );
  }
}
