import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { createBook, getBooks, parseBookPayload, WooCommerceError } from '@/lib/woocommerce';
import { enrichBooksWithSamples, getBookSamples } from '@/lib/wordpress';
import { hasAdminAccess } from '@/lib/auth';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const [books, samples] = await Promise.all([getBooks(), getBookSamples()]);
    return NextResponse.json(enrichBooksWithSamples(books, samples));
  } catch (error) {
    console.error('[api/books] error', error);
    return NextResponse.json(
      { success: false, message: 'Failed to load books' },
      { status: 502 },
    );
  }
}

export async function POST(request: NextRequest) {
  if (!hasAdminAccess(request)) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => null);
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
