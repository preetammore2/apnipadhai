import { NextResponse } from 'next/server';
import { getBooks } from '@/lib/woocommerce';

export const runtime = 'nodejs';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const books = await getBooks();
    const book = books.find((b) => b.id === id);
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
