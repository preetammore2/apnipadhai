import { NextRequest } from 'next/server';
import { handlePhonePeS2S } from '@/lib/phonepe-s2s';

export const runtime = 'nodejs';

/**
 * Webhook alias for the classic PG V1 integration.
 *
 * Note: the V1 PG API has no separate webhook product — the server-to-server
 * callback IS the webhook. This route accepts the identical S2S payload so
 * both /api/phonepe/callback and /api/phonepe/webhook can be registered with
 * PhonePe / your proxy.
 */
export async function POST(request: NextRequest): Promise<Response> {
  return handlePhonePeS2S(request);
}
