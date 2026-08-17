'use client';

import { useEffect, useState } from 'react';
import type { SiteContent } from './site-content';

let cachedContent: SiteContent | null = null;
let cacheInFlight: Promise<SiteContent | null> | null = null;

export function useSiteContent(): SiteContent | null {
  const [content, setContent] = useState<SiteContent | null>(cachedContent);

  useEffect(() => {
    if (cachedContent) return;

    if (!cacheInFlight) {
      cacheInFlight = fetch('/api/site-content')
        .then((res) => res.json())
        .then((data: SiteContent) => data)
        .catch(() => null)
        .then((data) => {
          cachedContent = data;
          cacheInFlight = null;
          return data;
        });
    }

    let active = true;
    cacheInFlight.then((data) => {
      if (active && data) setContent(data);
    });

    return () => {
      active = false;
    };
  }, []);

  return content;
}
