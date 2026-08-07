import crypto from 'crypto';

export type PhonePeMode = 'mock' | 'test' | 'live';

export interface PhonePeConfig {
  mode: PhonePeMode;
  merchantId: string;
  saltKey: string;
  saltIndex: number;
  baseUrl: string;
  signingSecret: string;
}

export interface PhonePePaymentResponse {
  ok: boolean;
  status: number;
  data: PhonePePaymentData | null;
}

export interface PhonePePaymentData {
  success?: boolean;
  code?: string;
  message?: string;
  data?: {
    merchantTransactionId?: string;
    transactionId?: string;
    redirectUrl?: string;
    state?: string;
    amount?: number;
    providerReferenceId?: string;
  };
}

const DEFAULT_BASE_URLS: Record<Exclude<PhonePeMode, 'mock'>, string> = {
  test: 'https://api-preprod.phonepe.com/apis/pg-sandbox',
  live: 'https://api.phonepe.com/apis/hermes',
};

const MOCK_SIGNING_SECRET = 'dev-only-mock-signing-secret';

export function getPhonePeConfig(): PhonePeConfig {
  const mode = (process.env.PHONEPE_ENV || 'mock').trim().toLowerCase() as PhonePeMode;
  const merchantId = process.env.PHONEPE_MERCHANT_ID || '';
  const saltKey = process.env.PHONEPE_SALT_KEY || '';
  const saltIndex = Number(process.env.PHONEPE_SALT_INDEX || 1);
  const signingSecret = process.env.PAYMENT_SIGNING_SECRET || '';

  if (mode === 'mock') {
    return {
      mode,
      merchantId: merchantId || 'MOCKMERCHANT',
      saltKey: saltKey || 'mock-salt-key',
      saltIndex,
      baseUrl: process.env.PHONEPE_API_BASE_URL || DEFAULT_BASE_URLS.test,
      signingSecret: signingSecret || MOCK_SIGNING_SECRET,
    };
  }

  if (!merchantId || !saltKey || !signingSecret) {
    throw new Error(
      'PhonePe is not configured. Set PHONEPE_ENV=test/live, PHONEPE_MERCHANT_ID, PHONEPE_SALT_KEY and PAYMENT_SIGNING_SECRET.',
    );
  }

  return {
    mode,
    merchantId,
    saltKey,
    saltIndex,
    baseUrl: process.env.PHONEPE_API_BASE_URL || DEFAULT_BASE_URLS[mode === 'live' ? 'live' : 'test'],
    signingSecret,
  };
}

export function generateChecksum(
  base64Payload: string,
  apiEndpoint: string,
  saltKey: string,
  saltIndex: number,
): string {
  const hash = crypto
    .createHash('sha256')
    .update(`${base64Payload}${apiEndpoint}${saltKey}`)
    .digest('hex');
  return `${hash}###${saltIndex}`;
}

export function generateMerchantTransactionId(): string {
  return `AP${Date.now()}${Math.floor(Math.random() * 90000 + 10000)}`;
}

export function generateMerchantUserId(): string {
  return `MUID${Date.now()}${Math.floor(Math.random() * 9000 + 1000)}`;
}

export function getRequestBaseUrl(headers: Headers): string {
  const proto = headers.get('x-forwarded-proto') ?? 'http';
  const host = headers.get('x-forwarded-host') ?? headers.get('host') ?? 'localhost:3000';
  return `${proto}://${host}`;
}

export interface CreatePaymentParams {
  merchantId: string;
  merchantTransactionId: string;
  merchantUserId: string;
  amountPaise: number;
  mobileNumber: string;
  redirectUrl: string;
  callbackUrl: string;
  baseUrl: string;
  saltKey: string;
  saltIndex: number;
}

export async function createPhonePePayment(
  params: CreatePaymentParams,
): Promise<PhonePePaymentResponse> {
  const payload = {
    merchantId: params.merchantId,
    merchantTransactionId: params.merchantTransactionId,
    merchantUserId: params.merchantUserId,
    amount: params.amountPaise,
    mobileNumber: params.mobileNumber,
    redirectUrl: params.redirectUrl,
    redirectMode: 'REDIRECT',
    callbackUrl: params.callbackUrl,
    paymentInstrument: { type: 'PAY_PAGE' },
  };

  const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64');
  const endpoint = '/pg/v1/pay';
  const xVerify = generateChecksum(base64Payload, endpoint, params.saltKey, params.saltIndex);

  const res = await fetch(`${params.baseUrl}${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-VERIFY': xVerify,
    },
    body: JSON.stringify({ request: base64Payload }),
    cache: 'no-store',
  });

  const data = (await res.json().catch(() => null)) as PhonePePaymentData | null;
  return { ok: res.ok, status: res.status, data };
}

export interface PaymentStatusParams {
  merchantId: string;
  merchantTransactionId: string;
  baseUrl: string;
  saltKey: string;
  saltIndex: number;
}

export async function getPhonePePaymentStatus(
  params: PaymentStatusParams,
): Promise<PhonePePaymentResponse> {
  const endpoint = `/pg/v1/status/${params.merchantId}/${params.merchantTransactionId}`;
  const xVerify = generateChecksum('', endpoint, params.saltKey, params.saltIndex);

  const res = await fetch(`${params.baseUrl}${endpoint}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'X-VERIFY': xVerify,
    },
    cache: 'no-store',
  });

  const data = (await res.json().catch(() => null)) as PhonePePaymentData | null;
  return { ok: res.ok, status: res.status, data };
}

export const ORDER_TOKEN_TTL_MS = 30 * 60 * 1000;

export interface OrderTokenPayload {
  merchantTransactionId: string;
  amountPaise: number;
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
    if (!parsed.merchantTransactionId || typeof parsed.amountPaise !== 'number') return null;
    return parsed;
  } catch {
    return null;
  }
}
