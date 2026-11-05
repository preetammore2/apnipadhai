'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { X } from 'lucide-react';

interface PopupData {
  enabled: boolean;
  image?: string;
  alt?: string;
  version?: number;
}

const SEEN_KEY = 'apni_padhai_popup_seen';
/** Never interrupt admin work or someone who is paying. */
const HIDDEN_PREFIXES = ['/admin', '/checkout', '/payment'];

/**
 * Photo popup set in /admin/popup. Shown once per visit (browser session):
 * closing it keeps it closed while the visitor browses; a new photo saved by
 * the admin is shown again.
 */
export const SitePopup: React.FC = () => {
  const pathname = usePathname();
  const [popup, setPopup] = useState<PopupData | null>(null);
  const [open, setOpen] = useState(false);

  const hiddenHere = HIDDEN_PREFIXES.some((prefix) => pathname?.startsWith(prefix));

  useEffect(() => {
    if (hiddenHere || popup) return;
    let ignore = false;
    fetch('/api/popup')
      .then((res) => (res.ok ? res.json() : null))
      .then((data: PopupData | null) => {
        if (ignore || !data?.enabled || !data.image) return;
        let seen: string | null = null;
        try {
          seen = sessionStorage.getItem(SEEN_KEY);
        } catch {
          // Storage unavailable (private mode): just show it.
        }
        if (seen === String(data.version)) return;
        setPopup(data);
        setOpen(true);
      })
      .catch(() => undefined);
    return () => {
      ignore = true;
    };
  }, [hiddenHere, popup]);

  const close = () => {
    setOpen(false);
    try {
      sessionStorage.setItem(SEEN_KEY, String(popup?.version ?? ''));
    } catch {
      // Ignore storage failures; the popup simply may show again next page load.
    }
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    document.addEventListener('keydown', onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previousOverflow;
    };
    // close only reads the current popup version
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open || !popup?.image || hiddenHere) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4"
      onClick={close}
      role="dialog"
      aria-modal="true"
      aria-label={popup.alt || 'Announcement'}
    >
      <div className="relative max-w-lg w-full" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          onClick={close}
          className="absolute -top-3 -right-3 w-9 h-9 rounded-full bg-white text-navy-900 shadow-lg flex items-center justify-center hover:bg-slate-100 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={popup.image}
          alt={popup.alt || 'Announcement'}
          className="w-full h-auto max-h-[80vh] object-contain rounded-2xl shadow-2xl bg-white"
        />
      </div>
    </div>
  );
};
