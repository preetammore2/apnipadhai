import { NextResponse } from 'next/server';
import { getStoreSettings, STORE_SETTINGS_DEFAULTS } from '@/lib/store-settings';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const settings = await getStoreSettings();
    return NextResponse.json(settings, {
      headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120' },
    });
  } catch (error) {
    console.error('[api/store-settings] error', error);
    return NextResponse.json(STORE_SETTINGS_DEFAULTS);
  }
}
