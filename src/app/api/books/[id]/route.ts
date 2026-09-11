import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import {
  deleteBook,
  getBookById,
  parseBookPayload,
  updateBook,
  type BookPayload,
  WooCommerceError,
} from '@/lib/woocommerce';
import { deleteMirroredBook, mirrorBooksSafe, upsertMirroredBook } from '@/lib/db-books';
import { deleteBookCover, setBookCover } from '@/lib/db-book-covers';
import { getRequestAdminRole } from '@/lib/auth';
import { getClientIp, rateLimitResponse } from '@/lib/rate-limit';
import { denyIfCrossOrigin, readJsonBody } from '@/lib/request-security';

export const runtime = 'nodejs';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const book = await getBookById(id);
    if (!book) {
      return NextResponse.json(
        { success: false, message: 'Book not found' },
        { status: 404 },
      );
    }
    return NextResponse.json(book);
  } catch (error) {
    console.error('[api/books/[id]] error', error);
    return NextResponse.json(
      { success: false, message: 'Failed to load book' },
      { status: 502 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const crossOrigin = denyIfCrossOrigin(request);
  if (crossOrigin) return crossOrigin;

  const throttled = rateLimitResponse(request, {
    limit: 30,
    windowMs: 15 * 60 * 1000,
    key: `books-write:${getClientIp(request)}`,
  });
  if (throttled) return throttled;

  const role = getRequestAdminRole(request);
  if (!role) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await readJsonBody<unknown>(request);
    if (!body) {
      return NextResponse.json(
        { success: false, message: 'Invalid request body' },
        { status: 400 },
      );
    }

    const b = body as Record<string, unknown>;
    const rawCover =
      typeof b.coverImage === 'string'
        ? b.coverImage.trim()
        : typeof b.image === 'string'
          ? b.image.trim()
          : '';
    const isModerator = role === 'moderator';

    let payload: BookPayload;
    if (isModerator) {
      // Moderators may only change the book cover image — every other field is
      // ignored by the server.
      const coverUrl = rawCover ? await resolveCoverUrl(request, id, rawCover) : undefined;
      if (!coverUrl) {
        return NextResponse.json(
          { success: false, message: 'A valid cover image is required' },
          { status: 400 },
        );
      }
      payload = { coverImage: coverUrl };
    } else {
      payload = parseBookPayload(body);
      if (rawCover) {
        payload.coverImage = await resolveCoverUrl(request, id, rawCover);
      }
    }

    if (rawCover && !rawCover.startsWith('data:image/')) {
      // An external https URL is the source of truth now; drop any previously
      // uploaded Mongo copy (best-effort).
      void mirrorBooksSafe(() => deleteBookCover(id));
    }

    const book = await updateBook(id, payload);
    void mirrorBooksSafe(() => upsertMirroredBook(book));
    revalidatePath('/api/books');
    revalidatePath('/books');
    return NextResponse.json({ success: true, book });
  } catch (error) {
    console.error('[api/books/[id]] PUT error', error);
    const status = error instanceof WooCommerceError ? error.status : 500;
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Could not update book' },
      { status },
    );
  }
}

/**
 * Turn an admin/moderator-supplied cover image into a URL that WooCommerce can
 * use as images[].src. Data URLs (client uploads) are stored in Firebase and
 * served back through /api/book-covers/:id so a real https URL is always sent
 * to the store.
 */
async function resolveCoverUrl(
  request: NextRequest,
  bookId: string,
  raw: string,
): Promise<string | undefined> {
  const value = raw.trim();
  if (!value) return undefined;

  if (value.startsWith('data:image/')) {
    const comma = value.indexOf(',');
    if (comma === -1) return undefined;
    const header = value.slice(5, comma);
    const mime = header.match(/^image\/[\w.+-]+/i)?.[0];
    if (!mime) return undefined;
    const data = value.slice(comma + 1);
    const buffer = /;base64$/i.test(header)
      ? Buffer.from(data, 'base64')
      : Buffer.from(decodeURIComponent(data), 'utf8');
    if (buffer.length === 0) return undefined;

    await setBookCover(bookId, buffer, mime.toLowerCase());
    const proto = request.headers.get('x-forwarded-proto') ?? 'https';
    const host = request.headers.get('host');
    return host ? `${proto}://${host}/api/book-covers/${bookId}` : value;
  }

  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return undefined;
    return value;
  } catch {
    return undefined;
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const crossOrigin = denyIfCrossOrigin(request);
  if (crossOrigin) return crossOrigin;

  const throttled = rateLimitResponse(request, {
    limit: 30,
    windowMs: 15 * 60 * 1000,
    key: `books-write:${getClientIp(request)}`,
  });
  if (throttled) return throttled;

  if (getRequestAdminRole(request) !== 'admin') {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    await deleteBook(id);
    void mirrorBooksSafe(() => deleteMirroredBook(id));
    void mirrorBooksSafe(() => deleteBookCover(id));
    revalidatePath('/api/books');
    revalidatePath('/books');
    return NextResponse.json({ success: true, message: 'Book deleted' });
  } catch (error) {
    console.error('[api/books/[id]] DELETE error', error);
    const status = error instanceof WooCommerceError ? error.status : 500;
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Could not delete book' },
      { status },
    );
  }
}
