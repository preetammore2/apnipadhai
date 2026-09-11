import { NextRequest, NextResponse } from 'next/server';
import { getBookCover } from '@/lib/db-book-covers';

export const runtime = 'nodejs';

/**
 * Serves book cover images that admins/moderators uploaded through the books
 * manager (stored in Firebase). Public because these are product covers and the
 * storefront renders them directly; only authenticated back-office users can
 * write them.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const cover = await getBookCover(id);
    if (!cover) {
      return NextResponse.json({ success: false, message: 'Cover not found' }, { status: 404 });
    }
    return new NextResponse(Uint8Array.from(cover.data), {
      headers: {
        'Content-Type': cover.contentType || 'image/jpeg',
        'Cache-Control': 'public, max-age=86400, immutable',
      },
    });
  } catch (error) {
    console.error('[api/book-covers/[id]] error', error);
    return NextResponse.json({ success: false, message: 'Cover unavailable' }, { status: 404 });
  }
}