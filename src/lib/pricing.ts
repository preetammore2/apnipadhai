import { STORE_SETTINGS_DEFAULTS, StoreSettings } from './store-settings';

export interface CartTotals {
  subtotal: number;
  discount: number;
  discountLabel: string;
  shipping: number;
  total: number;
}

export function findActiveCoupon(
  settings: StoreSettings | null,
  couponCode: string | null | undefined,
) {
  const code = (couponCode ?? '').trim().toUpperCase();
  if (!code) return undefined;
  return (settings?.coupons ?? []).find(
    (coupon) => coupon.active && coupon.code.trim().toUpperCase() === code,
  );
}

export function computeCartTotals(
  subtotal: number,
  settings: StoreSettings | null,
  couponCode?: string | null,
): CartTotals {
  const s = settings ?? STORE_SETTINGS_DEFAULTS;
  const shipping = s.shipping.amount;

  let discount = 0;
  let discountLabel = '';

  const coupon = findActiveCoupon(s, couponCode);
  if (coupon && coupon.value > 0 && subtotal > 0) {
    discountLabel = coupon.label || 'Discount';
    if (coupon.type === 'flat') {
      discount = Math.min(coupon.value, subtotal);
    } else {
      discount = Math.round((subtotal * coupon.value) / 100);
    }
    discount = Math.min(discount, subtotal);
  } else if (s.discount.enabled && s.discount.value > 0 && subtotal > 0) {
    discountLabel = s.discount.label;
    if (s.discount.type === 'flat') {
      discount = Math.min(s.discount.value, subtotal);
    } else {
      discount = Math.round((subtotal * s.discount.value) / 100);
    }
    discount = Math.min(discount, subtotal);
  }

  return {
    subtotal,
    discount,
    discountLabel,
    shipping,
    total: Math.max(0, subtotal - discount + shipping),
  };
}
