import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { email?: string };
    const email = body?.email?.trim() ?? '';

    if (!EMAIL_REGEX.test(email)) {
      return NextResponse.json(
        { success: false, message: 'Invalid email address' },
        { status: 400 },
      );
    }

    console.info('[api/newsletter] subscription request', { email });

    return NextResponse.json({
      success: true,
      message: 'Subscription recorded',
      email,
    });
  } catch (error) {
    console.error('[api/newsletter] error', error);
    return NextResponse.json(
      { success: false, message: 'Failed to subscribe' },
      { status: 500 },
    );
  }
}
