import { COLLECTIONS, getDb, isDbConfigured } from '@/lib/db';

/**
 * Site popup: a photo shown to visitors when they open the website, set in
 * /admin/popup. Stored in Firestore as `storeSettings/popup`. Server-only.
 */
export interface SitePopup {
  enabled: boolean;
  /** Uploaded image (data URL) or an https image link. */
  image: string;
  alt: string;
  /** YYYY-MM-DD: shown until the end of this day (IST). Always required. */
  expiresAt: string;
  /** Changes on every save so visitors who closed the old photo see a new one. */
  version: number;
}

const POPUP_DOC = 'popup';
const CACHE_MS = 30 * 1000;
/** Firestore documents are limited to 1 MB; uploads are compressed well below this. */
export const MAX_POPUP_IMAGE_LENGTH = 900 * 1024;

export const POPUP_DEFAULTS: SitePopup = { enabled: false, image: '', alt: '', expiresAt: '', version: 0 };

export function isPopupDate(value: unknown): value is string {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

/** True when the date's end of day (IST) has already passed. */
export function isPopupExpired(expiresAt: string, now = Date.now()): boolean {
  if (!isPopupDate(expiresAt)) return true;
  const end = new Date(`${expiresAt}T23:59:59+05:30`).getTime();
  return !Number.isFinite(end) || end < now;
}

/** On, has a photo and an end date that has not passed. */
export function isPopupActive(popup: SitePopup, now = Date.now()): boolean {
  return popup.enabled && popup.image !== '' && !isPopupExpired(popup.expiresAt, now);
}

let cached: { value: SitePopup; at: number } | null = null;

export function isValidPopupImage(value: string): boolean {
  if (!value || value.length > MAX_POPUP_IMAGE_LENGTH) return false;
  if (/^data:image\/(png|jpe?g|webp|gif);base64,/i.test(value)) return true;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
}

export async function getPopup(): Promise<SitePopup> {
  if (!isDbConfigured()) return POPUP_DEFAULTS;
  const doc = await getDb().collection(COLLECTIONS.storeSettings).doc(POPUP_DOC).get();
  if (!doc.exists) return POPUP_DEFAULTS;
  const data = doc.data() ?? {};
  const image = typeof data.image === 'string' && isValidPopupImage(data.image) ? data.image : '';
  return {
    enabled: data.enabled === true && image !== '',
    image,
    alt: typeof data.alt === 'string' ? data.alt.slice(0, 200) : '',
    expiresAt: isPopupDate(data.expiresAt) ? data.expiresAt : '',
    version: Number(data.version) || 0,
  };
}

export async function setPopup(value: Omit<SitePopup, 'version'>): Promise<SitePopup> {
  const saved: SitePopup = { ...value, version: Date.now() };
  await getDb()
    .collection(COLLECTIONS.storeSettings)
    .doc(POPUP_DOC)
    .set({ ...saved, updatedAt: new Date() });
  cached = { value: saved, at: Date.now() };
  return saved;
}

/** Popup for visitors, cached briefly. A Firebase failure means "no popup". */
export async function getPublicPopup(): Promise<SitePopup> {
  if (cached && Date.now() - cached.at < CACHE_MS) return cached.value;
  const value = await getPopup().catch((error) => {
    console.error('[popup] could not read popup from Firebase', error);
    return POPUP_DEFAULTS;
  });
  cached = { value, at: Date.now() };
  return value;
}
