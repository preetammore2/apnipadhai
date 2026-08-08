import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import {
  deleteBook,
  getBookById,
  parseBookPayload,
  updateBook,
  WooCommerceError,
} from '@/lib/woocommerce';
import { hasAdminAccess } from '@/lib/auth';

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
  if (!hasAdminAccess(request)) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json(
        { success: false, message: 'Invalid request body' },
        { status: 400 },
      );
    }
    const payload = parseBookPayload(body);
    const book = await updateBook(id, payload);
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
  if (!hasAdminAccess(request)) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    await deleteBook(id);
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
