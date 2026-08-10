import crypto from 'crypto';

export type PhonePeMode = 'mock' | 'test' | 'live';

export interface PhonePeConfig {
  mode: PhonePeMode;
  clientId: string;
  clientSecret: string;
  clientVersion: string;
  authBaseUrl: string;
  apiBaseUrl: string;
  signingSecret: string;
}

export interface PhonePePaymentResponse {
  ok: boolean;
  status: number;
  data: PhonePePaymentData | null;
}

export interface PhonePePaymentData {
  orderId?: string;
  merchantOrderId?: string;
  state?: string;
  amount?: number;
  redirectUrl?: string;
  expireAt?: number;
  errorCode?: string;
  detailedErrorCode?: string;
  paymentDetails?: {
    transactionId?: string;
    paymentMode?: string;
    amount?: number;
    state?: string;
    timestamp?: number;
    utr?: string;
    errorCode?: string;
    detailedErrorCode?: string;
  }[];
  code?: string;
  message?: string;
}

const DEFAULT_AUTH_BASE_URLS: Record<Exclude<PhonePeMode, 'mock'>, string> = {
  test: 'https://api-preprod.phonepe.com/apis/pg-sandbox',
  live: 'https://api.phonepe.com/apis/identity-manager',
};

const DEFAULT_API_BASE_URLS: Record<Exclude<PhonePeMode, 'mock'>, string> = {
  test: 'https://api-preprod.phonepe.com/apis/pg-sandbox',
  live: 'https://api.phonepe.com/apis/pg',
};

const MOCK_SIGNING_SECRET = 'dev-only-mock-signing-secret';

export function getPhonePeConfig(): PhonePeConfig {
  const mode = (process.env.PHONEPE_ENV || 'mock').trim().toLowerCase() as PhonePeMode;
  const clientId = process.env.PHONEPE_CLIENT_ID || '';
  const clientSecret = process.env.PHONEPE_CLIENT_SECRET || '';
  const clientVersion = process.env.PHONEPE_CLIENT_VERSION || '1';
  const signingSecret = process.env.PAYMENT_SIGNING_SECRET || '';

  if (mode === 'mock') {
    return {
      mode,
      clientId: clientId || 'mock-client-id',
      clientSecret: clientSecret || 'mock-client-secret',
      clientVersion,
      authBaseUrl: process.env.PHONEPE_AUTH_BASE_URL || DEFAULT_AUTH_BASE_URLS.test,
      apiBaseUrl: process.env.PHONEPE_API_BASE_URL || DEFAULT_API_BASE_URLS.test,
      signingSecret: signingSecret || MOCK_SIGNING_SECRET,
    };
  }

  if (!clientId || !clientSecret || !signingSecret) {
    throw new Error(
      'PhonePe is not configured. Set PHONEPE_ENV=test/live, PHONEPE_CLIENT_ID, PHONEPE_CLIENT_SECRET and PAYMENT_SIGNING_SECRET.',
    );
  }

  return {
    mode,
    clientId,
    clientSecret,
    clientVersion,
    authBaseUrl: process.env.PHONEPE_AUTH_BASE_URL || DEFAULT_AUTH_BASE_URLS[mode === 'live' ? 'live' : 'test'],
    apiBaseUrl: process.env.PHONEPE_API_BASE_URL || DEFAULT_API_BASE_URLS[mode === 'live' ? 'live' : 'test'],
    signingSecret,
  };
}

let cachedToken: { accessToken: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt - 60_000 > Date.now()) {
    return cachedToken.accessToken;
  }

  const config = getPhonePeConfig();
  const body = new URLSearchParams({
    client_id: config.clientId,
    client_version: config.clientVersion,
    client_secret: config.clientSecret,
    grant_type: 'client_credentials',
  });

  const res = await fetch(`${config.authBaseUrl}/v1/oauth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
    cache: 'no-store',
  });

  const data = (await res.json().catch(() => null)) as {
    access_token?: string;
    expires_at?: number;
    message?: string;
  } | null;

  if (!res.ok || !data?.access_token) {
    throw new Error(data?.message || 'Failed to obtain PhonePe access token');
  }

  const expiresAtRaw = Number(data.expires_at ?? 0);
  const expiresAt =
    expiresAtRaw > 1_000_000_000_000 ? expiresAtRaw : expiresAtRaw * 1000;

  cachedToken = {
    accessToken: data.access_token,
    expiresAt: Math.max(expiresAt, Date.now() + 60_000),
  };
  return cachedToken.accessToken;
}

export function generateMerchantTransactionId(): string {
  return `AP${Date.now()}${Math.floor(Math.random() * 90000 + 10000)}`;
}

export function getRequestBaseUrl(headers: Headers): string {
  const proto = headers.get('x-forwarded-proto') ?? 'http';
  const host = headers.get('x-forwarded-host') ?? headers.get('host') ?? 'localhost:3000';
  return `${proto}://${host}`;
}

export function getRedirectBaseUrl(headers: Headers): string {
  const override = (process.env.PHONEPE_REDIRECT_BASE_URL ?? '').trim().replace(/\/+$/, '');
  if (override) return override;
  const base = getRequestBaseUrl(headers);
  return /^https?:\/\/.+/.test(base) ? base : 'https://apnipadhai.vercel.app';
}

export function isPaymentRequestAllowed(headers: Headers): boolean {
  const origin = (headers.get('origin') ?? '').trim().replace(/\/+$/, '');
  if (!origin) return true;

  const self = (getRequestBaseUrl(headers) ?? '').replace(/\/+$/, '');
  if (origin === self) return true;

  const allowed = (process.env.CORS_ALLOWED_ORIGINS ?? '')
    .split(',')
    .map((item) => item.trim().replace(/\/+$/, ''))
    .filter(Boolean)
    .filter((item) => item !== '*');

  return allowed.some((candidate) => {
    if (candidate === origin) return true;
    const pattern = candidate
      .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      .replace(/\*/g, '.*');
    return new RegExp(`^${pattern}$`).test(origin);
  });
}

export interface CreatePaymentParams {
  merchantOrderId: string;
  amountPaise: number;
  mobileNumber: string;
  redirectUrl: string;
  config: PhonePeConfig;
}

export async function createPhonePePayment(
  params: CreatePaymentParams,
): Promise<PhonePePaymentResponse> {
  const accessToken = await getAccessToken();

  const phoneNumber = /^\d{10}$/.test(params.mobileNumber)
    ? `+91 ${params.mobileNumber}`
    : params.mobileNumber;

  const payload = {
    merchantOrderId: params.merchantOrderId,
    amount: params.amountPaise,
    expireAfter: ORDER_TOKEN_TTL_MS / 1000,
    paymentFlow: {
      type: 'PG_CHECKOUT',
      merchantUrls: {
        redirectUrl: params.redirectUrl,
      },
    },
    prefillUserLoginDetails: {
      phoneNumber,
    },
    disablePaymentRetry: true,
  };

  const res = await fetch(`${params.config.apiBaseUrl}/checkout/v2/pay`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `O-Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
    cache: 'no-store',
  });

  const data = (await res.json().catch(() => null)) as PhonePePaymentData | null;
  return { ok: res.ok, status: res.status, data };
}

export interface PaymentStatusParams {
  merchantOrderId: string;
  config: PhonePeConfig;
}

export async function getPhonePePaymentStatus(
  params: PaymentStatusParams,
): Promise<PhonePePaymentResponse> {
  const accessToken = await getAccessToken();

  const res = await fetch(
    `${params.config.apiBaseUrl}/checkout/v2/order/${encodeURIComponent(params.merchantOrderId)}/status?details=false`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `O-Bearer ${accessToken}`,
      },
      cache: 'no-store',
    },
  );

  const data = (await res.json().catch(() => null)) as PhonePePaymentData | null;
  if (!res.ok || data?.state === 'FAILED') {
    console.error('[phonepe] order status', {
      status: res.status,
      merchantOrderId: params.merchantOrderId,
      state: data?.state,
      errorCode: data?.errorCode,
      detailedErrorCode: data?.detailedErrorCode,
      data,
    });
  }
  return { ok: res.ok, status: res.status, data };
}

export const ORDER_TOKEN_TTL_MS = 30 * 60 * 1000;

export interface InitiateRefundParams {
  merchantOrderId: string;
  merchantRefundId: string;
  amountPaise: number;
  config: PhonePeConfig;
}

export interface RefundStatusParams {
  merchantRefundId: string;
  config: PhonePeConfig;
}

export async function createPhonePeRefund(
  params: InitiateRefundParams,
): Promise<PhonePePaymentResponse> {
  const accessToken = await getAccessToken();

  const payload = {
    merchantOrderId: params.merchantOrderId,
    merchantRefundId: params.merchantRefundId,
    amount: params.amountPaise,
    currency: 'INR',
  };

  const res = await fetch(`${params.config.apiBaseUrl}/payments/v2/refund`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `O-Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
    cache: 'no-store',
  });

  const data = (await res.json().catch(() => null)) as PhonePePaymentData | null;
  return { ok: res.ok, status: res.status, data };
}

export async function getPhonePeRefundStatus(
  params: RefundStatusParams,
): Promise<PhonePePaymentResponse> {
  const accessToken = await getAccessToken();

  const res = await fetch(
    `${params.config.apiBaseUrl}/payments/v2/refund/${encodeURIComponent(params.merchantRefundId)}/status`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `O-Bearer ${accessToken}`,
      },
      cache: 'no-store',
    },
  );

  const data = (await res.json().catch(() => null)) as PhonePePaymentData | null;
  return { ok: res.ok, status: res.status, data };
}

export interface OrderTokenPayload {
  merchantTransactionId: string;
  woocommerceOrderId: number;
  amountPaise: number;
  redirectUrl?: string;
  items?: { productId: number; quantity: number }[];
  customer: {
    name: string;
    phone: string;
    email: string;
    address: string;
    city: string;
    pincode: string;
  };
  exp: number;
}

export function signOrderToken(payload: OrderTokenPayload, secret: string): string {
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto.createHmac('sha256', secret).update(body).digest('base64url');
  return `${body}.${signature}`;
}

export function verifyOrderToken(token: string, secret: string): OrderTokenPayload | null {
  const [body, signature] = token.split('.');
  if (!body || !signature) return null;

  const expected = crypto.createHmac('sha256', secret).update(body).digest();
  const provided = Buffer.from(signature, 'base64url');
  if (expected.length !== provided.length) return null;
  if (!crypto.timingSafeEqual(expected, provided)) return null;

  try {
    const parsed = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as OrderTokenPayload;
    if (!parsed.merchantTransactionId || typeof parsed.woocommerceOrderId !== 'number') return null;
    return parsed;
  } catch {
    return null;
  }
}
