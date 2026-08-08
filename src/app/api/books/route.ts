import { NextResponse } from 'next/server';
import { getBooks } from '@/lib/woocommerce';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const books = await getBooks();
    return NextResponse.json(books);
  } catch (error) {
    console.error('[api/books] error', error);
    return NextResponse.json(
      { success: false, message: 'Failed to load books' },
      { status: 502 },
    );
  }
}
