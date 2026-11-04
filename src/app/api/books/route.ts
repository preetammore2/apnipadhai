import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { createBook, getBooks, parseBookPayload, WooCommerceError } from '@/lib/woocommerce';
import { enrichBooksWithSamples, getBookSamples } from '@/lib/wordpress';
import { mirrorBooksSafe, replaceMirroredBooks, upsertMirroredBook } from '@/lib/db-books';
import { hasAdminAccess, hasAnyAdminAccess } from '@/lib/auth';
import { withBookDiscount } from '@/lib/db-book-discount';
import { getClientIp, rateLimitResponse } from '@/lib/rate-limit';
import { denyIfCrossOrigin, readJsonBody } from '@/lib/request-security';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const [books, samples] = await Promise.all([getBooks(), getBookSamples()]);
    const result = enrichBooksWithSamples(books, samples);
    // Keep the Firebase mirror fresh (best-effort, never blocks the response).
    void mirrorBooksSafe(() => replaceMirroredBooks(result));
    // Admin screens edit and save prices, so they get the real WooCommerce
    // prices (?raw=1). Everyone else sees the store-wide book discount.
    if (request.nextUrl.searchParams.get('raw') === '1' && hasAnyAdminAccess(request)) {
      return NextResponse.json(result);
    }
    return NextResponse.json(await withBookDiscount(result));
  } catch (error) {
    console.error('[api/books] error', error);
    return NextResponse.json(
      { success: false, message: 'Failed to load books' },
      { status: 502 },
    );
  }
}

export async function POST(request: NextRequest) {
  const crossOrigin = denyIfCrossOrigin(request);
  if (crossOrigin) return crossOrigin;

  const throttled = rateLimitResponse(request, {
    limit: 30,
    windowMs: 15 * 60 * 1000,
    key: `books-write:${getClientIp(request)}`,
  });
  if (throttled) return throttled;

  if (!hasAdminAccess(request)) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await readJsonBody<unknown>(request);
    if (!body) {
      return NextResponse.json(
        { success: false, message: 'Invalid request body' },
        { status: 400 },
      );
    }
    const payload = parseBookPayload(body);
    if (!payload.title) {
      return NextResponse.json({ success: false, message: 'Title is required' }, { status: 400 });
    }
    const book = await createBook(payload);
    void mirrorBooksSafe(() => upsertMirroredBook(book));
    revalidatePath('/api/books');
    revalidatePath('/books');
    return NextResponse.json({ success: true, book }, { status: 201 });
  } catch (error) {
    console.error('[api/books] POST error', error);
    const status = error instanceof WooCommerceError ? error.status : 500;
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Could not create book' },
      { status },
    );
  }
}
