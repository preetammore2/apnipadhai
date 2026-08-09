import { NextResponse } from 'next/server';
import { getPyqs } from '@/lib/wordpress';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const pyqs = await getPyqs();
    return NextResponse.json(pyqs);
  } catch (error) {
    console.error('[api/pyqs] error', error);
    return NextResponse.json(
      { success: false, message: 'Failed to load PYQs' },
      { status: 502 },
    );
  }
}
