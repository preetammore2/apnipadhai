/**
 * Static page definitions for the admin "Pages" manager.
 *
 * Each entry maps an editable page to a WordPress page slug (prefixed `ap-`).
 * When an `ap-*` page exists on the WordPress site, the public route renders
 * its content instead of the bundled fallback layout.
 */

export interface EditablePage {
  key: string;
  slug: string;
  label: string;
  hint: string;
}

export const EDITABLE_PAGES: EditablePage[] = [
  {
    key: 'about',
    slug: 'ap-about',
    label: 'About Us',
    hint: 'Founder story, mission and values shown on /about.',
  },
  {
    key: 'careers',
    slug: 'ap-careers',
    label: 'Careers',
    hint: 'Openings and joining instructions shown on /careers.',
  },
  {
    key: 'download-app',
    slug: 'ap-download-app',
    label: 'Download App',
    hint: 'App promo content shown on /download-app.',
  },
  {
    key: 'privacy-policy',
    slug: 'ap-privacy-policy',
    label: 'Privacy Policy',
    hint: 'Legal text shown on /privacy-policy.',
  },
  {
    key: 'refund-policy',
    slug: 'ap-refund-policy',
    label: 'Return & Refund Policy',
    hint: 'Legal text shown on /refund-policy.',
  },
  {
    key: 'shipping-policy',
    slug: 'ap-shipping-policy',
    label: 'Shipping & Delivery Policy',
    hint: 'Legal text shown on /shipping-policy.',
  },
  {
    key: 'terms-conditions',
    slug: 'ap-terms-conditions',
    label: 'Terms & Conditions',
    hint: 'Legal text shown on /terms-conditions.',
  },
];

export const EDITABLE_PAGE_SLUGS: ReadonlySet<string> = new Set(
  EDITABLE_PAGES.map((page) => page.slug),
);

export function findEditablePageBySlug(slug: string): EditablePage | undefined {
  return EDITABLE_PAGES.find((page) => page.slug === slug);
}
