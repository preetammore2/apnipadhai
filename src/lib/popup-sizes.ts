/**
 * Popup sizes the admin can choose in /admin/popup. `maxWidth` is the widest
 * the photo gets on a computer; on phones it always fits the screen width.
 * Shared by the admin preview and the popup on the website.
 */
export const POPUP_SIZES = [
  { key: 'small', label: 'Small', maxWidth: 384 },
  { key: 'medium', label: 'Medium', maxWidth: 512 },
  { key: 'large', label: 'Large', maxWidth: 768 },
  { key: 'xlarge', label: 'Extra large', maxWidth: 1024 },
] as const;

export type PopupSize = (typeof POPUP_SIZES)[number]['key'];

/** Size used for popups saved before sizes existed. */
export const DEFAULT_POPUP_SIZE: PopupSize = 'medium';

export function isPopupSize(value: unknown): value is PopupSize {
  return POPUP_SIZES.some((size) => size.key === value);
}

export function popupMaxWidth(size: PopupSize | undefined): number {
  return (POPUP_SIZES.find((s) => s.key === size) ?? POPUP_SIZES[1]).maxWidth;
}
