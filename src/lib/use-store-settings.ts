'use client';

import { useEffect, useState } from 'react';
import type { StoreSettings } from './store-settings';

let cachedSettings: StoreSettings | null = null;
let cacheInFlight: Promise<StoreSettings | null> | null = null;

export function useStoreSettings(): StoreSettings | null {
  const [settings, setSettings] = useState<StoreSettings | null>(cachedSettings);

  useEffect(() => {
    if (cachedSettings) return;

    if (!cacheInFlight) {
      cacheInFlight = fetch('/api/store-settings')
        .then((res) => res.json())
        .then((data: StoreSettings) => data)
        .catch(() => null)
        .then((data) => {
          cachedSettings = data;
          cacheInFlight = null;
          return data;
        });
    }

    let active = true;
    cacheInFlight.then((data) => {
      if (active && data) setSettings(data);
    });

    return () => {
      active = false;
    };
  }, []);

  return settings;
}
