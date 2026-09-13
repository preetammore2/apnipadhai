import { NextRequest, NextResponse } from 'next/server';
import { addFeedback } from '@/lib/db-feedback';
import { getClientIp, rateLimitResponse } from '@/lib/rate-limit';
import { denyIfCrossOrigin, readJsonBody } from '@/lib/request-security';

export const runtime = 'nodejs';

interface FeedbackPayload {
  name?: unknown;
  exam?: unknown;
  message?: unknown;
}

function cleanText(value: unknown, maxLength: number): string {
  if (typeof value !== 'string') return '';
  return value.trim().replace(/\s+/g, ' ').slice(0, maxLength);
}

export async function POST(request: NextRequest) {
  const crossOrigin = denyIfCrossOrigin(request);
  if (crossOrigin) return crossOrigin;

  const throttled = rateLimitResponse(request, {
    limit: 3,
    windowMs: 10 * 60 * 1000,
    key: `feedback-write:${getClientIp(request)}`,
  });
  if (throttled) return throttled;

  try {
    const body = await readJsonBody<FeedbackPayload>(request, 32 * 1024);
    if (!body) {
      return NextResponse.json(
        { success: false, message: 'Invalid request body' },
        { status: 400 },
      );
    }

    const name = cleanText(body.name, 100);
    const message = cleanText(body.message, 2000);
    const exam = cleanText(body.exam, 100);

    if (!name || !message) {
      return NextResponse.json(
        { success: false, message: 'Name and message are required' },
        { status: 400 },
      );
    }

    await addFeedback({
      name,
      exam,
      message,
      photo: '',
      date: new Date().toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
    });

    return NextResponse.json(
      { success: true, message: 'Thank you! Your feedback has been submitted.' },
      { status: 201 },
    );
  } catch (error) {
    console.error('[api/feedback] POST error', error);
    return NextResponse.json(
      { success: false, message: 'Could not submit feedback. Please try again later.' },
      { status: 500 },
    );
  }
}