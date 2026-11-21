'use client';

import { useEffect } from 'react';
import { toast } from 'sonner';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { removeFromCart, syncCartPrices } from '@/redux/features/cart/cartSlice';
import { useTranslation } from '@/i18n/useTranslation';

interface LatestPrice {
  id: string;
  price: number;
  originalPrice: number;
  inStock?: boolean;
}

/**
 * Refresh cart prices from WooCommerce whenever `active` becomes true (cart
 * drawer opened, checkout page shown). The cart is stored in the browser with
 * the prices from when each book was added; the order is charged at the
 * current WooCommerce price, so the cart must show that same price.
 */
export function useCartPriceSync(active: boolean): void {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const items = useAppSelector((state) => state.cart.items);
  const idsKey = items.map((item) => item.id).sort().join(',');

  useEffect(() => {
    if (!active || !idsKey) return;
    let ignore = false;

    fetch('/api/cart/prices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: idsKey.split(',') }),
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { books?: LatestPrice[] } | null) => {
        if (ignore || !data?.books?.length) return;
        const soldOut = data.books.filter((latest) => latest.inStock === false);
        for (const latest of soldOut) {
          const item = items.find((i) => i.id === latest.id);
          dispatch(removeFromCart(latest.id));
          toast.error(`${item?.title ?? t('A book')} ${t('is out of stock and was removed from your cart.')}`);
        }
        const changed = data.books.filter((latest) => {
          if (latest.inStock === false) return false;
          const item = items.find((i) => i.id === latest.id);
          return item && (item.price !== latest.price || item.originalPrice !== latest.originalPrice);
        });
        if (changed.length === 0) return;
        dispatch(syncCartPrices(changed));
        toast.info(t('Prices in your cart were updated to the latest prices.'));
      })
      .catch(() => undefined);

    return () => {
      ignore = true;
    };
    // Re-check only when the cart is opened or its books change — not on
    // quantity changes, and not on the price update this hook dispatches.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, idsKey, dispatch, t]);
}
