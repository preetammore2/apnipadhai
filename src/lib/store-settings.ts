const WP_URL = process.env.WP_URL ?? 'https://apnipadhaipublication.com';
const SETTINGS_REVALIDATE_SECONDS = Number(process.env.WP_REVALIDATE_SECONDS ?? '60');

export interface StoreCoupon {
  code: string;
  type: 'flat' | 'percent';
  value: number;
  label: string;
  active: boolean;
}

export interface StoreSettings {
  shipping: { amount: number; label: string };
  discount: {
    enabled: boolean;
    type: 'flat' | 'percent';
    value: number;
    label: string;
  };
  coupons: StoreCoupon[];
}

export const STORE_SETTINGS_DEFAULTS: StoreSettings = {
  shipping: { amount: 40, label: 'Delivery Charges' },
  discount: { enabled: false, type: 'percent', value: 0, label: 'Discount' },
  coupons: [],
};

interface WpCouponItem {
  id: number;
  title?: { rendered?: string };
  content_fields?: Record<string, unknown>;
}

function toNumber(value: unknown, fallback: number): number {
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
}

function toLabel(value: unknown, fallback: string): string {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}

function toEnabled(value: unknown): boolean {
  return value === true || value === '1' || value === 1;
}

async function fetchCoupons(): Promise<StoreCoupon[]> {
  try {
    const params = new URLSearchParams({
      per_page: '100',
      orderby: 'menu_order',
      order: 'asc',
      _fields: 'id,title,content_fields',
    });
    const res = await fetch(`${WP_URL}/wp-json/wp/v2/ap_coupon?${params.toString()}`, {
      next: { revalidate: SETTINGS_REVALIDATE_SECONDS },
    });
    if (!res.ok) return [];
    const data = (await res.json()) as unknown;
    if (!Array.isArray(data)) return [];

    const coupons: StoreCoupon[] = [];
    for (const item of data as WpCouponItem[]) {
      const code = (item.title?.rendered ?? '')
        .replace(/<[^>]*>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .toUpperCase();
      if (!code) continue;
      coupons.push({
        code,
        type: item.content_fields?.type === 'flat' ? 'flat' : 'percent',
        value: toNumber(item.content_fields?.value, 0),
        label: toLabel(item.content_fields?.label, 'Discount'),
        active: toEnabled(item.content_fields?.active),
      });
    }
    return coupons;
  } catch {
    return [];
  }
}

export async function getStoreSettings(): Promise<StoreSettings> {
  const [settingsResult, couponsResult] = await Promise.allSettled([
    fetchSettings(),
    fetchCoupons(),
  ]);

  const settings = settingsResult.status === 'fulfilled' ? settingsResult.value : STORE_SETTINGS_DEFAULTS;
  const coupons = couponsResult.status === 'fulfilled' ? couponsResult.value : [];
  return { ...settings, coupons };
}

async function fetchSettings(): Promise<StoreSettings> {
  const res = await fetch(`${WP_URL}/wp-json/apni-padhai/v1/store-settings`, {
    next: { revalidate: SETTINGS_REVALIDATE_SECONDS },
  });
  if (!res.ok) return STORE_SETTINGS_DEFAULTS;

  const data = (await res.json()) as Record<string, unknown>;
  const shipping = (data?.shipping ?? {}) as Record<string, unknown>;
  const discount = (data?.discount ?? {}) as Record<string, unknown>;

  return {
    shipping: {
      amount: toNumber(shipping.amount, STORE_SETTINGS_DEFAULTS.shipping.amount),
      label: toLabel(shipping.label, STORE_SETTINGS_DEFAULTS.shipping.label),
    },
    discount: {
      enabled: toEnabled(discount.enabled),
      type: discount.type === 'flat' ? 'flat' : 'percent',
      value: toNumber(discount.value, 0),
      label: toLabel(discount.label, STORE_SETTINGS_DEFAULTS.discount.label),
    },
    coupons: [],
  };
}
