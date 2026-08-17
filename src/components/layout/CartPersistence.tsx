'use client';

import React, { useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { hydrateCart } from '@/redux/features/cart/cartSlice';

const STORAGE_KEY = 'apni_padhai_cart';

export const CartPersistence: React.FC = () => {
  const dispatch = useAppDispatch();
  const items = useAppSelector((state) => state.cart.items);
  const hydrated = useRef(false);

  useEffect(() => {
    if (hydrated.current) return;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          dispatch(hydrateCart(parsed));
        }
      }
    } catch {
      // Ignore unavailable or corrupted storage; the cart can rebuild from state.
    }
    hydrated.current = true;
  }, [dispatch]);

  useEffect(() => {
    if (!hydrated.current) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Ignore storage write failures, such as private browsing quota limits.
    }
  }, [items]);

  return null;
};
