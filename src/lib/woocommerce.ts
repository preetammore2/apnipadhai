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
    categories: Array.isArray(b.categories)
      ? b.categories.filter((c): c is string => typeof c === 'string').map((c) => c.trim()).filter(Boolean)
      : undefined,
    price: asNum(b.price),
    regularPrice: asNum(b.regularPrice) ?? asNum(b.regular_price),
    salePrice: asNum(b.salePrice) ?? asNum(b.sale_price),
    inStock: typeof b.inStock === 'boolean' ? b.inStock : undefined,
    sku: typeof b.sku === 'string' ? b.sku.trim() : undefined,
    coverImage:
      (typeof b.coverImage === 'string' ? b.coverImage.trim() : undefined) ??
      (typeof b.image === 'string' ? b.image.trim() : undefined),
  };
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
}

interface WoocommerceOrderDetails extends WoocommerceOrder {
  date_created?: string;
  billing?: { phone?: string };
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
  couponCode?: string;
  paymentMethod?: PaymentMethod;
  merchantTransactionId?: string;
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

  if (input.merchantTransactionId) {
    body.meta_data = [
      { key: '_ap_phonepe_merchant_transaction_id', value: input.merchantTransactionId },
    ];
  }

  if (input.couponCode) {
    body.coupon_lines = [{ code: input.couponCode }];
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
      `/orders/${orderId}?_fields=id,status,total,currency,date_created,billing`,
      {},
      { cache: 'no-store' },
    );
    return {
      id: order.id,
      status: order.status,
      total: order.total,
      currency: order.currency,
      dateCreated: order.date_created ?? '',
      billingPhone: order.billing?.phone ?? '',
    };
  } catch (error) {
    if (error instanceof WooCommerceError && error.status === 404) {
      return undefined;
    }
    throw error;
  }
}

export function phoneMatchesOrder(order: TrackedOrder, phone: string): boolean {
  const expected = normalizePhone(order.billingPhone);
  const actual = normalizePhone(phone);
  return expected !== '' && actual !== '' && expected === actual;
}
