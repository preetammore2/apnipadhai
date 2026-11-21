/** Public base URL of the storefront, without a trailing slash. */
export function getSiteUrl(): string {
  const override = (process.env.NEXT_PUBLIC_SITE_URL ?? '').trim().replace(/\/+$/, '');
  return override || 'https://apnipadhaipublication.com';
}
