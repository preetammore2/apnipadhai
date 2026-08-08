import { Book } from '@/types';

const WOO_URL = process.env.WOO_URL ?? 'https://apnipadhaipublication.com';
const WOO_CONSUMER_KEY = process.env.WOO_CONSUMER_KEY ?? '';
const WOO_CONSUMER_SECRET = process.env.WOO_CONSUMER_SECRET ?? '';

const WOO_API = `${WOO_URL}/wp-json/wc/v3`;

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
  cache: RequestCache | undefined = 'no-store',
): Promise<T> {
  const res = await fetch(`${WOO_API}${path}`, {
    ...options,
    cache,
    headers: {
      Authorization: authHeader,
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
  });

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
    'force-cache',
  );
  return products.map(mapProduct);
}

export async function getBookById(id: string): Promise<Book | undefined> {
  const books = await getBooks();
  return books.find((b) => b.id === id);
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
      'no-store',
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
