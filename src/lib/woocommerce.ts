import { Book } from '@/types';

const WOO_URL = process.env.WOO_URL ?? 'https://apnipadhaipublication.com';
const WOO_CONSUMER_KEY = process.env.WOO_CONSUMER_KEY ?? '';
const WOO_CONSUMER_SECRET = process.env.WOO_CONSUMER_SECRET ?? '';

const WOO_API = `${WOO_URL}/wp-json/wc/v3`;

const BOOKS_REVALIDATE_SECONDS = Number(process.env.BOOKS_REVALIDATE_SECONDS ?? '60');

const authHeader =
  'Basic ' +
  Buffer.from(`${WOO_CONSUMER_KEY}:${WOO_CONSUMER_SECRET}`).toString('base64');

export class WooCommerceError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'WooCommerceError';
    this.status = status;
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  opts: { cache?: RequestCache; revalidate?: number } = {},
): Promise<T> {
  const init: RequestInit = {
    ...options,
    headers: {
      Authorization: authHeader,
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
  };

  if (opts.revalidate !== undefined) {
    init.next = { revalidate: opts.revalidate };
  } else if (opts.cache !== undefined) {
    init.cache = opts.cache;
  }

  const res = await fetch(`${WOO_API}${path}`, init);

  if (!res.ok) {
    let message = `WooCommerce request failed (${res.status})`;
    try {
      const body = await res.json();
      message = (body?.message as string) ?? message;
    } catch {
      // ignore parse failure, keep default message
    }
    throw new WooCommerceError(res.status, message);
  }

  return (await res.json()) as T;
}

function stripHtml(html: string | undefined): string {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

/**
 * Accept only absolute http(s) URLs for user/admin-supplied asset links
 * (cover images, sample PDFs). Blocks javascript:, data:, and relative paths
 * that could be abused downstream as links/images.
 */
function safeHttpUrl(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const url = value.trim();
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return undefined;
    return url;
  } catch {
    return undefined;
  }
}

interface WoocommerceCategory {
  id: number;
  name: string;
  slug?: string;
}

export interface BookPayload {
  title?: string;
  subtitle?: string;
  description?: string;
  category?: string;
  categories?: string[];
  price?: number;
  regularPrice?: number;
  salePrice?: number;
  inStock?: boolean;
  sku?: string;
  coverImage?: string;
  author?: string;
  edition?: string;
  pages?: number;
  examTarget?: string;
  samplePdfUrl?: string;
  features?: string[];
  tableOfContents?: string[];
}

function asStringList(v: unknown): string[] | undefined {
  if (!Array.isArray(v)) return undefined;
  const list = v
    .filter((item): item is string => typeof item === 'string')
    .map((item) => item.trim())
    .filter(Boolean);
  return list.length > 0 ? list : undefined;
}

export function parseBookPayload(body: unknown): BookPayload {
  if (typeof body !== 'object' || body === null) return {};
  const b = body as Record<string, unknown>;
  const asNum = (v: unknown): number | undefined => {
    if (typeof v === 'number') return Number.isFinite(v) ? v : undefined;
    if (typeof v === 'string' && v.trim() !== '') {
      const n = Number(v);
      return Number.isFinite(n) ? n : undefined;
    }
    return undefined;
  };
  return {
    title: typeof b.title === 'string' ? b.title.trim() : undefined,
    subtitle: typeof b.subtitle === 'string' ? b.subtitle.trim() : undefined,
    description: typeof b.description === 'string' ? b.description.trim() : undefined,
    category: typeof b.category === 'string' ? b.category.trim() : undefined,
    categories: asStringList(b.categories),
    price: asNum(b.price),
    regularPrice: asNum(b.regularPrice) ?? asNum(b.regular_price),
    salePrice: asNum(b.salePrice) ?? asNum(b.sale_price),
    inStock: typeof b.inStock === 'boolean' ? b.inStock : undefined,
    sku: typeof b.sku === 'string' ? b.sku.trim() : undefined,
    coverImage: safeHttpUrl(
      (typeof b.coverImage === 'string' ? b.coverImage.trim() : undefined) ??
        (typeof b.image === 'string' ? b.image.trim() : undefined),
    ),
    author: typeof b.author === 'string' ? b.author.trim() : undefined,
    edition: typeof b.edition === 'string' ? b.edition.trim() : undefined,
    pages: asNum(b.pages),
    examTarget: typeof b.examTarget === 'string' ? b.examTarget.trim() : undefined,
    samplePdfUrl: safeHttpUrl(
      typeof b.samplePdfUrl === 'string' ? b.samplePdfUrl.trim() : undefined,
    ),
    features: asStringList(b.features),
    tableOfContents: asStringList(b.tableOfContents),
  };
}

interface WoocommerceAttribute {
  name: string;
  options?: string[];
}

interface WoocommerceMeta {
  key: string;
  value: unknown;
}

interface WoocommerceProduct {
  id: number;
  name: string;
  slug: string;
  permalink: string;
  type: string;
  sku: string;
  price: string;
  regular_price: string;
  sale_price: string;
  stock_status: string;
  categories: WoocommerceCategory[];
  images: { id: number; src: string }[];
  short_description: string;
  description: string;
  attributes?: WoocommerceAttribute[];
  meta_data?: WoocommerceMeta[];
}

export interface WoocommerceOrder {
  id: number;
  status: string;
  total: string;
  currency: string;
  payment_url?: string;
}

export interface TrackedOrder {
  id: number;
  status: string;
  total: string;
  currency: string;
  dateCreated: string;
  billingPhone: string;
  billingEmail?: string;
  billingName?: string;
  items?: { name: string; quantity: number; price: number }[];
}

interface WoocommerceOrderDetails extends WoocommerceOrder {
  date_created?: string;
  billing?: { phone?: string; email?: string; first_name?: string; last_name?: string };
  line_items?: {
    name: string;
    quantity: number;
    total: string;
  }[];
}

function enrichBook(product: WoocommerceProduct): {
  author?: string;
  edition?: string;
  pages?: number;
  examTarget?: string;
  samplePdfUrl?: string;
  features?: string[];
  tableOfContents?: string[];
} {
  const meta: Record<string, string> = {};
  for (const entry of product.meta_data ?? []) {
    if (typeof entry.value === 'string') meta[entry.key] = entry.value;
  }
  const attribute = (name: string): string | undefined =>
    product.attributes?.find(
      (a) => a.name.toLowerCase() === name.toLowerCase(),
    )?.options?.[0];
  const pages = Number(meta['_ap_pages'] ?? attribute('Pages'));
  const features = meta['_ap_features'] ? meta['_ap_features'].split('\n').filter(Boolean) : undefined;
  const tableOfContents = meta['_ap_table_of_contents']
    ? meta['_ap_table_of_contents'].split('\n').filter(Boolean)
    : undefined;
  return {
    author: meta['_ap_author'] ?? attribute('Author'),
    edition: meta['_ap_edition'] ?? attribute('Edition'),
    pages: Number.isFinite(pages) && pages > 0 ? pages : undefined,
    examTarget: meta['_ap_exam_target'] ?? attribute('Exam Target'),
    samplePdfUrl: meta['_ap_sample_pdf_url'] ?? undefined,
    features,
    tableOfContents,
  };
}

function mapProduct(product: WoocommerceProduct): Book {
  const price = Number(product.price || '0');
  const originalPrice = Number(product.regular_price || product.price || '0');
  const discountPercentage =
    originalPrice > price
      ? Math.round(((originalPrice - price) / originalPrice) * 100)
      : 0;
  const isCombo = product.type !== 'simple';
  const categoryNames = product.categories.map((c) =>
    stripHtml(c.name),
  );

  return {
    id: String(product.id),
    title: product.name,
    subtitle: stripHtml(product.short_description) || undefined,
    category: isCombo ? 'Combo' : (categoryNames[0] ?? 'Books'),
    categories: isCombo
      ? ['Combo', ...categoryNames]
      : categoryNames,
    price,
    originalPrice,
    discountPercentage,
    inStock: product.stock_status !== 'outofstock',
    coverImage: product.images[0]?.src ?? '',
    description: stripHtml(product.description) || undefined,
    sku: product.sku,
    ...enrichBook(product),
  };
}

export async function getBooks(): Promise<Book[]> {
  const params = new URLSearchParams({
    per_page: '100',
    status: 'publish',
    _fields: [
      'id',
      'name',
      'slug',
      'permalink',
      'type',
      'sku',
      'price',
      'regular_price',
      'sale_price',
      'stock_status',
      'categories',
      'images',
      'short_description',
      'description',
      'attributes',
      'meta_data',
    ].join(','),
  });

  const products = await request<WoocommerceProduct[]>(
    `/products?${params.toString()}`,
    {},
    { revalidate: BOOKS_REVALIDATE_SECONDS },
  );
  return products.map(mapProduct);
}

export async function getBookById(id: string): Promise<Book | undefined> {
  if (!/^\d+$/.test(id)) return undefined;
  try {
    const product = await request<WoocommerceProduct>(`/products/${id}`, {}, { cache: 'no-store' });
    return mapProduct(product);
  } catch (error) {
    if (error instanceof WooCommerceError && error.status === 404) {
      return undefined;
    }
    throw error;
  }
}

async function resolveCategories(names: string[]): Promise<{ id: number }[]> {
  const unique = [...new Set(names.filter(Boolean))];
  const resolved: { id: number }[] = [];
  for (const name of unique) {
    const existing = await request<WoocommerceCategory[]>(
      `/products/categories?search=${encodeURIComponent(name)}&per_page=10`,
      {},
      { cache: 'no-store' },
    );
    const match = existing.find((c) => c.name.toLowerCase() === name.toLowerCase());
    if (match) {
      resolved.push({ id: match.id });
    } else {
      const created = await request<WoocommerceCategory>('/products/categories', {
        method: 'POST',
        body: JSON.stringify({ name }),
      });
      resolved.push({ id: created.id });
    }
  }
  return resolved;
}

function buildProductBody(
  input: BookPayload,
): { body: Record<string, unknown>; categoryNames: string[] } {
  const body: Record<string, unknown> = { type: 'simple', status: 'publish' };
  if (input.title) body.name = input.title;
  if (input.subtitle) body.short_description = input.subtitle;
  if (input.description) body.description = input.description;

  const regularPrice = input.regularPrice ?? input.price;
  if (typeof regularPrice === 'number' && regularPrice >= 0) {
    body.regular_price = String(regularPrice);
  }
  if (typeof input.salePrice === 'number' && input.salePrice >= 0) {
    if (typeof regularPrice === 'number' && input.salePrice >= regularPrice) {
      body.sale_price = String(regularPrice);
    } else {
      body.sale_price = String(input.salePrice);
    }
  }
  if (input.inStock === false) {
    body.stock_status = 'outofstock';
  } else if (input.inStock === true) {
    body.stock_status = 'instock';
  }
  if (input.sku) body.sku = input.sku;
  if (input.coverImage) body.images = [{ src: input.coverImage }];

  const meta: { key: string; value: string }[] = [];
  if (input.author) meta.push({ key: '_ap_author', value: input.author });
  if (input.edition) meta.push({ key: '_ap_edition', value: input.edition });
  if (typeof input.pages === 'number') meta.push({ key: '_ap_pages', value: String(input.pages) });
  if (input.examTarget) meta.push({ key: '_ap_exam_target', value: input.examTarget });
  if (input.samplePdfUrl) meta.push({ key: '_ap_sample_pdf_url', value: input.samplePdfUrl });
  if (input.features?.length) meta.push({ key: '_ap_features', value: input.features.join('\n') });
  if (input.tableOfContents?.length)
    meta.push({ key: '_ap_table_of_contents', value: input.tableOfContents.join('\n') });
  if (meta.length > 0) body.meta_data = meta;

  const categoryNames = [...(input.categories ?? [])];
  if (input.category && !categoryNames.includes(input.category)) {
    categoryNames.push(input.category);
  }
  return { body, categoryNames };
}

export async function createBook(input: BookPayload): Promise<Book> {
  const { body, categoryNames } = buildProductBody(input);
  if (!body.name) {
    throw new WooCommerceError(400, 'Title is required');
  }
  if (categoryNames.length > 0) {
    body.categories = await resolveCategories(categoryNames);
  }
  const product = await request<WoocommerceProduct>('/products', {
    method: 'POST',
    body: JSON.stringify(body),
  });
  return mapProduct(product);
}

export async function updateBook(id: string, input: BookPayload): Promise<Book> {
  if (!/^\d+$/.test(id)) {
    throw new WooCommerceError(400, 'Invalid book ID');
  }
  const { body, categoryNames } = buildProductBody(input);
  if (categoryNames.length > 0) {
    body.categories = await resolveCategories(categoryNames);
  }
  const product = await request<WoocommerceProduct>(`/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
  return mapProduct(product);
}

export async function deleteBook(id: string): Promise<void> {
  if (!/^\d+$/.test(id)) {
    throw new WooCommerceError(400, 'Invalid book ID');
  }
  await request<unknown>(`/products/${id}?force=true`, { method: 'DELETE' }, { cache: 'no-store' });
}

export type PaymentMethod = 'phonepe';

const PAYMENT_METHODS: Record<PaymentMethod, { id: string; title: string }> = {
  phonepe: { id: 'phonepe', title: 'PhonePe UPI / Cards / NetBanking' },
};

export interface CreateOrderInput {
  items: { productId: number; quantity: number }[];
  billing?: {
    firstName?: string;
    lastName?: string;
    address?: string;
    city?: string;
    postcode?: string;
    phone?: string;
    email?: string;
  };
  paymentMethod?: PaymentMethod;
  merchantTransactionId?: string;
  shippingAmount?: number;
  shippingLabel?: string;
  discountAmount?: number;
  discountLabel?: string;
}

export async function createOrder(input: CreateOrderInput): Promise<WoocommerceOrder> {  const method = PAYMENT_METHODS[input.paymentMethod ?? 'phonepe'];
  const body: Record<string, unknown> = {
    payment_method: method.id,
    payment_method_title: method.title,
    set_paid: false,
    line_items: input.items.map((item) => ({
      product_id: item.productId,
      quantity: item.quantity,
    })),
  };

  if (input.shippingAmount && input.shippingAmount > 0) {
    body.shipping_lines = [
      {
        method_id: 'flat_rate',
        method_title: input.shippingLabel || 'Delivery Charges',
        total: input.shippingAmount.toFixed(2),
      },
    ];
  }

  if (input.discountAmount && input.discountAmount > 0) {
    body.fee_lines = [
      {
        name: input.discountLabel || 'Discount',
        total: `-${input.discountAmount.toFixed(2)}`,
      },
    ];
  }

  if (input.merchantTransactionId) {
    body.meta_data = [
      { key: '_ap_phonepe_merchant_transaction_id', value: input.merchantTransactionId },
    ];
  }

  if (input.billing) {
    const billing = {
      first_name: input.billing.firstName,
      last_name: input.billing.lastName,
      address_1: input.billing.address,
      city: input.billing.city,
      postcode: input.billing.postcode,
      phone: input.billing.phone,
      email: input.billing.email,
    };
    body.billing = billing;
    body.shipping = billing;
  }

  const order = await request<WoocommerceOrder>('/orders', {
    method: 'POST',
    body: JSON.stringify(body),
  });

  return order;
}

export async function updateOrder(
  orderId: number,
  data: Record<string, unknown>,
): Promise<WoocommerceOrder> {
  return request<WoocommerceOrder>(`/orders/${orderId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function markOrderPaid(orderId: number): Promise<WoocommerceOrder> {
  return updateOrder(orderId, { set_paid: true });
}

function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) return digits.slice(2);
  if (digits.length === 13 && digits.startsWith('91')) return digits.slice(2);
  return digits;
}

export async function getOrderById(orderId: number): Promise<TrackedOrder | undefined> {
  try {
    const order = await request<WoocommerceOrderDetails>(
      `/orders/${orderId}?_fields=id,status,total,currency,date_created,billing,line_items`,
      {},
      { cache: 'no-store' },
    );
    const firstName = order.billing?.first_name ?? '';
    const lastName = order.billing?.last_name ?? '';
    return {
      id: order.id,
      status: order.status,
      total: order.total,
      currency: order.currency,
      dateCreated: order.date_created ?? '',
      billingPhone: order.billing?.phone ?? '',
      billingEmail: order.billing?.email ?? undefined,
      billingName: `${firstName} ${lastName}`.trim() || undefined,
      items: (order.line_items ?? []).map((item) => ({
        name: item.name,
        quantity: item.quantity,
        price: Number(item.total) || 0,
      })),
    };
  } catch (error) {
    if (error instanceof WooCommerceError && error.status === 404) {
      return undefined;
    }
    throw error;
  }
}

export const PAID_ORDER_STATUSES = new Set(['processing', 'completed']);

/**
 * Mark an order paid only if it is not already paid. Returns 'paid' when this
 * call performed the transition, 'already' when it was already paid, or
 * 'missing' when the order could not be found. Callers use the return value to
 * run side effects (e.g. success notifications) exactly once per order.
 */
export async function markOrderPaidIfNeeded(
  orderId: number,
): Promise<'paid' | 'already' | 'missing'> {
  const order = await getOrderById(orderId).catch(() => undefined);
  if (!order) return 'missing';
  if (PAID_ORDER_STATUSES.has(order.status)) return 'already';
  await markOrderPaid(orderId);
  return 'paid';
}

export function phoneMatchesOrder(order: TrackedOrder, phone: string): boolean {
  const expected = normalizePhone(order.billingPhone);
  const actual = normalizePhone(phone);
  return expected !== '' && actual !== '' && expected === actual;
}
