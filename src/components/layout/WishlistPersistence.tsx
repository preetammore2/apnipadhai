'use client';

import React, { useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { hydrateWishlist } from '@/redux/features/wishlist/wishlistSlice';

const STORAGE_KEY = 'apni_padhai_wishlist';

export const WishlistPersistence: React.FC = () => {
  const dispatch = useAppDispatch();
  const items = useAppSelector((state) => state.wishlist.items);
  const hydrated = useRef(false);

  useEffect(() => {
    if (hydrated.current) return;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          dispatch(hydrateWishlist(parsed));
        }
      }
    } catch {
      // Ignore unavailable or corrupted storage; wishlist state can continue in memory.
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
