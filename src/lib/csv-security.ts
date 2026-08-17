const DANGEROUS_CSV_PREFIX = /^[=+\-@\t\r]/;
const DEFAULT_MAX_CSV_BYTES = 2 * 1024 * 1024;

export function sanitizeCsvCell(value: unknown): string {
  const text = String(value ?? '').replace(/\r?\n/g, ' ').trim();
  return DANGEROUS_CSV_PREFIX.test(text) ? `'${text}` : text;
}

export function csvContentType(): string {
  return 'text/csv; charset=utf-8';
}

export async function readCsvText(request: Request, maxBytes = DEFAULT_MAX_CSV_BYTES): Promise<string | null> {
  const declaredLength = Number(request.headers.get('content-length') ?? '0');
  if (declaredLength > maxBytes) return null;

  const text = await request.text().catch(() => '');
  if (!text || Buffer.byteLength(text, 'utf8') > maxBytes) return null;
  return text;
}

export function csvEscape(value: unknown): string {
  const safe = sanitizeCsvCell(value);
  return `"${safe.replace(/"/g, '""')}"`;
}

export function rowsToCsv(rows: unknown[][]): string {
  return rows.map((row) => row.map(csvEscape).join(',')).join('\r\n');
}
