import { NextRequest } from 'next/server';
import { handlePhonePeS2S } from '@/lib/phonepe-s2s';

export const runtime = 'nodejs';

/**
 * PhonePe S2S callback endpoint (classic PG V1).
 * PhonePe POSTs the base64-encoded transaction response here when a payment
 * reaches a terminal state. Must be HTTPS.
 */
export async function POST(request: NextRequest): Promise<Response> {
  return handlePhonePeS2S(request);
}
