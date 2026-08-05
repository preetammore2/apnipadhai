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
    } catch (e) {
      console.error('Failed to load cart from storage', e);
    }
    hydrated.current = true;
  }, [dispatch]);

  useEffect(() => {
    if (!hydrated.current) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error('Failed to save cart to storage', e);
    }
  }, [items]);

  return null;
};
