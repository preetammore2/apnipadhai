const WP_URL = process.env.WP_URL ?? 'https://apnipadhaipublication.com';
const SETTINGS_REVALIDATE_SECONDS = Number(process.env.WP_REVALIDATE_SECONDS ?? '60');

/**
 * A coupon that has been validated server-side against WooCommerce. Only the
 * single coupon a shopper typed is ever sent to the browser — the full list
 * of codes stays on the server.
 */
export interface StoreCoupon {
  code: string;
  /** flat = off the cart, flat_per_item = off each book, percent = % of subtotal. */
  type: 'flat' | 'flat_per_item' | 'percent';
  value: number;
  label: string;
}

export interface StoreSettings {
  /** Delivery = amount for the first book + perExtraItem for every further copy. */
  shipping: { amount: number; perExtraItem: number; label: string };
  discount: {
    enabled: boolean;
    type: 'flat' | 'percent';
    value: number;
    label: string;
  };
}

export const STORE_SETTINGS_DEFAULTS: StoreSettings = {
  shipping: { amount: 40, perExtraItem: 15, label: 'Delivery Charges' },
  discount: { enabled: false, type: 'percent', value: 0, label: 'Discount' },
};

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

/**
 * Settings from the WordPress "Apni Padhai Store" plugin page (or defaults).
 * Server code should call getStoreSettings() from db-store-settings, which
 * layers the delivery charges saved in the admin panel on top of this.
 */
export async function getWpStoreSettings(): Promise<StoreSettings> {
  try {
    return await fetchSettings();
  } catch {
    return STORE_SETTINGS_DEFAULTS;
  }
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
      perExtraItem: toNumber(shipping.perExtraItem, STORE_SETTINGS_DEFAULTS.shipping.perExtraItem),
      label: toLabel(shipping.label, STORE_SETTINGS_DEFAULTS.shipping.label),
    },
    discount: {
      enabled: toEnabled(discount.enabled),
      type: discount.type === 'flat' ? 'flat' : 'percent',
      value: toNumber(discount.value, 0),
      label: toLabel(discount.label, STORE_SETTINGS_DEFAULTS.discount.label),
    },
  };
}
