import { NextRequest } from 'next/server';
import { handlePhonePeS2S } from '@/lib/phonepe-s2s';

export const runtime = 'nodejs';

/**
 * Legacy callback path (kept for the classic PG V1 `callbackUrl`).
 *
 * This is now a thin alias of the shared S2S handler. New integrations should
 * use /api/phonepe/callback or /api/phonepe/webhook, but this route is
 * preserved so both paths can be registered with the proxy without breaking
 * existing session URLs.
 */
export async function POST(request: NextRequest): Promise<Response> {
  return handlePhonePeS2S(request);
}
