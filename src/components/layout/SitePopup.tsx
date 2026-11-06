'use client';

import React, { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { X } from 'lucide-react';
import { popupMaxWidth, type PopupSize } from '@/lib/popup-sizes';

interface PopupData {
  enabled: boolean;
  image?: string;
  alt?: string;
  /** Optional page opened when the photo is clicked. */
  link?: string;
  size?: PopupSize;
  version?: number;
}

/** "/books/81" or a link to this same website → navigate in the same tab. */
function internalPath(link: string): string | null {
  if (link.startsWith('/') && !link.startsWith('//')) return link;
  try {
    const url = new URL(link);
    if (url.origin === window.location.origin) return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    // not a URL
  }
  return null;
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
  const router = useRouter();
  const [popup, setPopup] = useState<PopupData | null>(null);
  const [open, setOpen] = useState(false);
  /** Page the popup opened on; moving to another page closes it. */
  const openedOn = useRef<string | null>(null);

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
        openedOn.current = window.location.pathname;
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

  // Close as soon as the visitor goes to another page (link, menu, back button).
  useEffect(() => {
    if (open && openedOn.current !== null && pathname !== openedOn.current) close();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  /** Close first, then go — the popup is gone before the next page loads. */
  const followLink = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const link = popup?.link;
    close();
    if (!link) return;
    const path = internalPath(link);
    if (path) {
      e.preventDefault();
      router.push(path);
    }
    // Other websites open in a new tab through the anchor itself.
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
      <div
        className="relative w-full"
        style={{ maxWidth: popupMaxWidth(popup.size) }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={close}
          className="absolute -top-3 -right-3 w-9 h-9 rounded-full bg-white text-navy-900 shadow-lg flex items-center justify-center hover:bg-slate-100 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>
        {popup.link ? (
          <a
            href={popup.link}
            onClick={followLink}
            {...(internalPath(popup.link) ? {} : { target: '_blank', rel: 'noopener noreferrer' })}
            className="block cursor-pointer"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={popup.image}
              alt={popup.alt || 'Announcement'}
              className="w-full h-auto max-h-[80vh] object-contain rounded-2xl shadow-2xl bg-white"
            />
          </a>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={popup.image}
            alt={popup.alt || 'Announcement'}
            className="w-full h-auto max-h-[80vh] object-contain rounded-2xl shadow-2xl bg-white"
          />
        )}
      </div>
    </div>
  );
};
