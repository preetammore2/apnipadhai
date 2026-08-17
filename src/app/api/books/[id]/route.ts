import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import {
  deleteBook,
  getBookById,
  parseBookPayload,
  updateBook,
  WooCommerceError,
} from '@/lib/woocommerce';
import { deleteMirroredBook, mirrorBooksSafe, upsertMirroredBook } from '@/lib/db-books';
import { hasAdminAccess } from '@/lib/auth';
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

  if (!hasAdminAccess(request)) {
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
    const payload = parseBookPayload(body);
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

  if (!hasAdminAccess(request)) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    await deleteBook(id);
    void mirrorBooksSafe(() => deleteMirroredBook(id));
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
