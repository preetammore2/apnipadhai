import { NextRequest, NextResponse } from 'next/server';
import { getBooks } from '@/lib/woocommerce';
import { getClientIp, rateLimitResponse } from '@/lib/rate-limit';
import { denyIfCrossOrigin, readJsonBody } from '@/lib/request-security';

export const runtime = 'nodejs';

/**
 * Current WooCommerce prices for the books in a shopper's cart. The cart is
 * saved in the browser with the prices from when each book was added, while
 * the order is always charged at WooCommerce's current price — this keeps the
 * cart display in sync with what PhonePe will ask for.
 */
export async function POST(request: NextRequest) {
  const crossOrigin = denyIfCrossOrigin(request);
  if (crossOrigin) return crossOrigin;

  const throttled = rateLimitResponse(request, {
    limit: 120,
    windowMs: 15 * 60 * 1000,
    key: `cart-prices:${getClientIp(request)}`,
  });
  if (throttled) return throttled;

  const body = await readJsonBody<{ ids?: unknown }>(request, 8 * 1024);
  const ids = Array.isArray(body?.ids)
    ? [...new Set(body.ids.filter((id): id is string => typeof id === 'string' && /^\d+$/.test(id)))].slice(0, 50)
    : [];
  if (ids.length === 0) {
    return NextResponse.json({ success: true, books: [] });
  }

  try {
    const wanted = new Set(ids);
    const books = (await getBooks())
      .filter((book) => wanted.has(book.id))
      .map((book) => ({
        id: book.id,
        price: book.price,
        originalPrice: book.originalPrice,
        inStock: book.inStock,
      }));
    return NextResponse.json(
      { success: true, books },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  } catch (error) {
    console.error('[api/cart/prices] error', error);
    return NextResponse.json(
      { success: false, message: 'Could not load current prices' },
      { status: 502 },
    );
  }
}
