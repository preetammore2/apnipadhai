import { NextResponse } from 'next/server';
import { getChannelVideos, CHANNEL_ID, CHANNEL_URL } from '@/lib/youtube';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const videos = await getChannelVideos();
    return NextResponse.json({
      channel: {
        id: CHANNEL_ID,
        url: CHANNEL_URL,
        handle: '@AapniPadhai',
      },
      videos,
    });
  } catch (error) {
    console.error('[api/youtube] error', error);
    return NextResponse.json(
      { success: false, message: 'Failed to load videos' },
      { status: 502 },
    );
  }
}
