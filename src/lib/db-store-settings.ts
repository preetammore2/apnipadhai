import { COLLECTIONS, getDb, isDbConfigured } from '@/lib/db';
import {
  getWpStoreSettings,
  STORE_SETTINGS_DEFAULTS,
  type StoreSettings,
} from '@/lib/store-settings';

/**
 * Delivery charges saved from the admin panel (/admin/delivery). Stored in
 * Firestore as `storeSettings/delivery` so they work without the WordPress
 * plugin. Server-only — the browser gets them through /api/store-settings.
 */
export type DeliverySettings = StoreSettings['shipping'];

const DELIVERY_DOC = 'delivery';
export const MAX_DELIVERY_AMOUNT = 10000;

export async function getDeliverySettings(): Promise<DeliverySettings | null> {
  if (!isDbConfigured()) return null;
  const doc = await getDb().collection(COLLECTIONS.storeSettings).doc(DELIVERY_DOC).get();
  if (!doc.exists) return null;
  const data = doc.data() ?? {};
  const amount = Number(data.amount);
  const perExtraItem = Number(data.perExtraItem);
  return {
    amount: Number.isFinite(amount) && amount >= 0 ? amount : STORE_SETTINGS_DEFAULTS.shipping.amount,
    perExtraItem:
      Number.isFinite(perExtraItem) && perExtraItem >= 0
        ? perExtraItem
        : STORE_SETTINGS_DEFAULTS.shipping.perExtraItem,
    label:
      typeof data.label === 'string' && data.label.trim()
        ? data.label.trim()
        : STORE_SETTINGS_DEFAULTS.shipping.label,
  };
}

export async function setDeliverySettings(value: DeliverySettings): Promise<void> {
  await getDb()
    .collection(COLLECTIONS.storeSettings)
    .doc(DELIVERY_DOC)
    .set({ ...value, updatedAt: new Date() });
}

/**
 * Store settings for pricing: WordPress/default settings with the admin-panel
 * delivery charges on top. A Firestore failure never blocks checkout — it
 * falls back to the WordPress/default delivery charges.
 */
export async function getStoreSettings(): Promise<StoreSettings> {
  const [base, delivery] = await Promise.all([
    getWpStoreSettings(),
    getDeliverySettings().catch((error) => {
      console.error('[store-settings] could not read delivery settings from Firebase', error);
      return null;
    }),
  ]);
  return delivery ? { ...base, shipping: delivery } : base;
}
