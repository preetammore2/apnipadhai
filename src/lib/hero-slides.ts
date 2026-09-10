export interface HeroSlide {
  src: string;
  alt: string;
  ratio?: number;
}

export const DEFAULT_HERO_RATIO = 1280 / 611;

export const DEFAULT_HERO_SLIDES: HeroSlide[] = [
  { src: '/images/hero/Hero1.png', alt: 'Apni Padhai Hero Banner 1', ratio: 1280 / 611 },
  { src: '/images/hero/Hero2.png', alt: 'Apni Padhai Hero Banner 2', ratio: 7185 / 3650 },
  { src: '/images/hero/Hero3.png', alt: 'Apni Padhai Hero Banner 3', ratio: 2356 / 1294 },
  { src: '/images/hero/Hero4.jpeg', alt: 'Apni Padhai Hero Banner 4', ratio: 1600 / 900 },
  { src: '/images/hero/Hero5.png', alt: 'Apni Padhai Hero Banner 5', ratio: 2356 / 1382 },
];

/** Guarantee every slide has a usable URL and an aspect ratio. */
export function normalizeHeroSlides(value: unknown): HeroSlide[] {
  if (!Array.isArray(value)) return [];
  const slides: HeroSlide[] = [];
  for (const raw of value.slice(0, 20)) {
    const item = (raw ?? {}) as Record<string, unknown>;
    const src = typeof item.src === 'string' ? item.src.trim() : '';
    if (!src) continue;
    const alt = typeof item.alt === 'string' ? item.alt.trim().slice(0, 300) : '';
    const ratio = typeof item.ratio === 'number' && Number.isFinite(item.ratio) && item.ratio > 0
      ? item.ratio
      : typeof item.ratio === 'string'
        ? Number(parseFloat(item.ratio))
        : NaN;
    slides.push({
      src,
      alt: alt || 'Apni Padhai promo banner',
      ratio: Number.isFinite(ratio) && ratio > 0 ? ratio : DEFAULT_HERO_RATIO,
    });
  }
  return slides;
}