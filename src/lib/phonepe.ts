import crypto from 'crypto';
import { isSameOriginOrAllowed } from '@/lib/request-security';

/**
 * PhonePe Payment Gateway — supports both Classic PG (v1, salt-based) and
 * Standard Checkout (v2, OAuth2-based) integrations.
 *
 * Detection logic:
 *   If PHONEPE_CLIENT_ID + PHONEPE_CLIENT_SECRET are set → v2 (OAuth2)
 *   If PHONEPE_MERCHANT_ID + PHONEPE_SALT_KEY + PHONEPE_SALT_INDEX → v1 (X-VERIFY)
 *   If neither → mock mode
 *
 * Never expose secrets to the browser, and never log them.
 */

export type PhonePeMode = 'mock' | 'test' | 'live';
export type PhonePeApiVersion = 'v1' | 'v2';

export interface PhonePeConfig {
  mode: PhonePeMode;
  apiVersion: PhonePeApiVersion;
  merchantId: string;
  clientId: string;
  clientSecret: string;
  saltKey: string;
  saltIndex: string;
  apiBaseUrl: string;
  signingSecret: string;
}

export interface PhonePePaymentResponse {
  ok: boolean;
  status: number;
  data: PhonePePaymentData | null;
}

export interface PhonePePaymentData {
  merchantId?: string;
  merchantOrderId?: string;
  merchantTransactionId?: string;
  orderId?: string;
  transactionId?: string;
  state?: string;
  amount?: number;
  redirectUrl?: string;
  responseCode?: string;
  errorCode?: string;
  detailedErrorCode?: string;
  code?: string;
  message?: string;
}

/* ───────── Base URLs ───────── */

const DEFAULT_API_BASE_URLS: Record<Exclude<PhonePeMode, 'mock'>, string> = {
  test: 'https://api-preprod.phonepe.com/apis/pg-sandbox',
  live: 'https://api.phonepe.com/apis/hermes',
};

/* ───────── Mock defaults ───────── */

const MOCK_MERCHANT_ID = 'mock-merchant';
const MOCK_CLIENT_ID = 'mock-client-id';
const MOCK_CLIENT_SECRET = 'mock-client-secret';
const MOCK_SALT_KEY = 'mock-salt-key';
const MOCK_SALT_INDEX = '1';
const MOCK_SIGNING_SECRET = 'dev-only-mock-signing-secret';

/* ───────── OAuth2 token cache (v2 only) ───────── */

let cachedToken: { token: string; expiresAt: number } | null = null;

/* ───────── Config ───────── */

export function getPhonePeConfig(): PhonePeConfig {
  const mode = (process.env.PHONEPE_ENV || 'mock').trim().toLowerCase() as PhonePeMode;

  const clientId = (process.env.PHONEPE_CLIENT_ID || '').trim();
  const clientSecret = (process.env.PHONEPE_CLIENT_SECRET || '').trim();
  const merchantId = (process.env.PHONEPE_MERCHANT_ID || '').trim();
  const saltKey = process.env.PHONEPE_SALT_KEY || '';
  const saltIndex = (process.env.PHONEPE_SALT_INDEX || '').trim();
  const signingSecret = process.env.PAYMENT_SIGNING_SECRET || '';

  const hasV2 = Boolean(clientId && clientSecret);
  const hasV1 = Boolean(merchantId && saltKey && saltIndex);
  const apiVersion: PhonePeApiVersion = hasV2 ? 'v2' : 'v1';

  if (mode === 'mock') {
    return {
      mode,
      apiVersion,
      merchantId: merchantId || MOCK_MERCHANT_ID,
      clientId: clientId || MOCK_CLIENT_ID,
      clientSecret: clientSecret || MOCK_CLIENT_SECRET,
      saltKey: saltKey || MOCK_SALT_KEY,
      saltIndex: saltIndex || MOCK_SALT_INDEX,
      apiBaseUrl: process.env.PHONEPE_API_BASE_URL || DEFAULT_API_BASE_URLS.test,
      signingSecret: signingSecret || MOCK_SIGNING_SECRET,
    };
  }

  if (apiVersion === 'v2') {
    return {
      mode,
      apiVersion: 'v2',
      merchantId,
      clientId,
      clientSecret,
      saltKey: '',
      saltIndex: '',
      apiBaseUrl:
        process.env.PHONEPE_API_BASE_URL ||
        DEFAULT_API_BASE_URLS[mode === 'live' ? 'live' : 'test'],
      signingSecret,
    };
  }

  // v1
  if (!merchantId || !saltKey || !saltIndex) {
    throw new Error(
      'PhonePe is not configured. Set either v2 credentials (PHONEPE_CLIENT_ID + PHONEPE_CLIENT_SECRET) or v1 credentials (PHONEPE_MERCHANT_ID + PHONEPE_SALT_KEY + PHONEPE_SALT_INDEX).',
    );
  }

  return {
    mode,
    apiVersion: 'v1',
    merchantId,
    clientId: '',
    clientSecret: '',
    saltKey,
    saltIndex,
    apiBaseUrl:
      process.env.PHONEPE_API_BASE_URL ||
      DEFAULT_API_BASE_URLS[mode === 'live' ? 'live' : 'test'],
    signingSecret,
  };
}

/* ───────── Helpers ───────── */

function base64Encode(value: string): string {
  return Buffer.from(value, 'utf8').toString('base64');
}

function decodeBase64Json<T>(value: string): T | null {
  try {
    return JSON.parse(Buffer.from(value, 'base64').toString('utf8')) as T;
  } catch {
    return null;
  }
}

function normalizeData(data: unknown): Record<string, unknown> {
  if (typeof data === 'string') {
    return decodeBase64Json<Record<string, unknown>>(data) ?? {};
  }
  return data && typeof data === 'object' ? (data as Record<string, unknown>) : {};
}

function toNumber(value: unknown): number | undefined {
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) ? n : undefined;
}

function toStr(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

/**
 * v1 X-VERIFY checksum:
 * SHA256(base64Payload + apiPath + saltKey) + "###" + saltIndex
 */
function generateV1Checksum(data: string, apiPath: string, saltKey: string, saltIndex: string): string {
  const hash = crypto.createHash('sha256').update(`${data}${apiPath}${saltKey}`).digest('hex');
  return `${hash}###${saltIndex}`;
}

/**
 * v2 callback X-VERIFY checksum:
 * SHA256(base64Response + path + saltKey) + "###" + saltIndex
 * For callbacks, the "path" is the callback endpoint path (without query params).
 */
function generateV2CallbackChecksum(response: string, path: string, saltKey: string, saltIndex: string): string {
  const hash = crypto.createHash('sha256').update(`${response}${path}${saltKey}`).digest('hex');
  return `${hash}###${saltIndex}`;
}

/* ───────── OAuth2 token (v2) ───────── */

async function getAccessToken(config: PhonePeConfig): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) {
    return cachedToken.token;
  }

  const res = await fetch(`${config.apiBaseUrl}/pg/v1/oauth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      clientId: config.clientId,
      clientSecret: config.clientSecret,
      grantType: 'client_credentials',
    }).toString(),
    cache: 'no-store',
  });

  const body = await res.json().catch(() => null) as Record<string, unknown> | null;
  if (!res.ok || !body) {
    throw new Error(`PhonePe OAuth2 token request failed (${res.status})`);
  }

  const token = String(body.accessToken ?? '');
  const expiresIn = Number(body.expiresIn ?? 600);
  if (!token) {
    throw new Error('PhonePe OAuth2 token response missing accessToken');
  }

  cachedToken = { token, expiresAt: Date.now() + expiresIn * 1000 };
  return token;
}

/* ───────── Response mapping ───────── */

function mapPhonePeResponse(
  raw: Record<string, unknown> | null,
): PhonePePaymentData | null {
  if (!raw) return null;
  const d = normalizeData(raw.data);

  const mapped: PhonePePaymentData = {
    merchantId: toStr(d.merchantId),
    merchantOrderId: toStr(d.merchantTransactionId) ?? toStr(d.orderId),
    merchantTransactionId: toStr(d.merchantTransactionId) ?? toStr(d.orderId),
    orderId: toStr(d.orderId),
    transactionId: toStr(d.transactionId),
    state: toStr(d.state),
    amount: toNumber(d.amount),
    responseCode: toStr(d.responseCode),
    errorCode: toStr(raw.code),
    detailedErrorCode: toStr(d.responseCode),
    code: toStr(raw.code),
    message: toStr(raw.message),
  };

  // v1: /pg/v1/pay returns the checkout page URL inside data.instrumentResponse
  const instrument = d.instrumentResponse as
    | { redirectInfo?: { url?: unknown } }
    | undefined;
  const redirectUrl = instrument?.redirectInfo?.url;
  if (typeof redirectUrl === 'string' && redirectUrl) {
    mapped.redirectUrl = redirectUrl;
  }

  // v2: /pg/v1/order/create may return redirectUrl directly or checkoutUrl
  if (!mapped.redirectUrl && typeof d.redirectUrl === 'string' && d.redirectUrl) {
    mapped.redirectUrl = d.redirectUrl;
  }
  if (!mapped.redirectUrl && typeof d.checkoutUrl === 'string' && d.checkoutUrl) {
    mapped.redirectUrl = d.checkoutUrl;
  }

  return mapped;
}

/* ───────── Merchant Transaction ID ───────── */

/**
 * Unique merchant transaction id per payment. Never reused across orders, and
 * namespaced (AP-) so it cannot collide with ids generated by the WordPress
 * site on the same merchant account.
 */
export function generateMerchantTransactionId(): string {
  const random = crypto.randomBytes(6).toString('hex').toUpperCase();
  return `AP-${Date.now()}-${random}`;
}

/* ───────── URL builders ───────── */

export function getRequestBaseUrl(headers: Headers): string {
  const proto = headers.get('x-forwarded-proto') ?? 'http';
  const host = headers.get('x-forwarded-host') ?? headers.get('host') ?? 'localhost:3000';
  return `${proto}://${host}`;
}

/**
 * Base URL used to build the PhonePe redirect + callback URLs.
 *
 * PhonePe blocks every transaction (INTERNAL_SECURITY_BLOCK_1) whose payment /
 * redirect / callback URL domain is not registered during onboarding.
 * The merchant is registered with https://apnipadhaipublication.com. Keep this
 * set to that domain (or the domain PhonePe has approved) and proxy the paths
 * from it to this app. Do NOT point it at the Vercel domain unless PhonePe
 * support has explicitly added that domain to the merchant account.
 */
export function getRedirectBaseUrl(): string {
  const override = (process.env.PHONEPE_REDIRECT_BASE_URL ?? '').trim().replace(/\/+$/, '');
  return override || 'https://apnipadhaipublication.com';
}

export function isPaymentRequestAllowed(headers: Headers): boolean {
  return isSameOriginOrAllowed(headers);
}

/* ───────── Create payment ───────── */

export interface CreatePaymentParams {
  merchantOrderId: string;
  amountPaise: number;
  mobileNumber: string;
  redirectUrl: string;
  callbackUrl: string;
  config: PhonePeConfig;
}

/**
 * Initiate a payment via PhonePe.
 *   v1: Classic PG — X-VERIFY checksum + /pg/v1/pay
 *   v2: Standard Checkout — OAuth2 Bearer + /pg/v1/order/create
 */
export async function createPhonePePayment(
  params: CreatePaymentParams,
): Promise<PhonePePaymentResponse> {
  const { config } = params;

  const phoneNumber = /^\d{10}$/.test(params.mobileNumber)
    ? `+91${params.mobileNumber}`
    : params.mobileNumber;

  if (config.apiVersion === 'v2') {
    return createPaymentV2(params, config, phoneNumber);
  }
  return createPaymentV1(params, config, phoneNumber);
}

/* ────── v1: Classic PG ────── */

async function createPaymentV1(
  params: CreatePaymentParams,
  config: PhonePeConfig,
  phoneNumber: string,
): Promise<PhonePePaymentResponse> {
  const payload = {
    merchantId: config.merchantId,
    merchantTransactionId: params.merchantOrderId,
    merchantUserId: `MUID${params.merchantOrderId}`,
    amount: params.amountPaise,
    redirectUrl: params.redirectUrl,
    redirectMode: 'REDIRECT',
    callbackUrl: params.callbackUrl,
    mobileNumber: phoneNumber,
    paymentInstrument: { type: 'PAY_PAGE' },
  };

  const apiPath = '/pg/v1/pay';
  const requestB64 = base64Encode(JSON.stringify(payload));
  const checksum = generateV1Checksum(requestB64, apiPath, config.saltKey, config.saltIndex);

  let res: Response;
  try {
    res = await fetch(`${config.apiBaseUrl}${apiPath}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        accept: 'application/json',
        'X-VERIFY': checksum,
      },
      body: JSON.stringify({ request: requestB64 }),
      cache: 'no-store',
    });
  } catch (error) {
    console.error('[phonepe] v1 pay network error', {
      merchantOrderId: params.merchantOrderId,
      amount: params.amountPaise,
      apiHostname: new URL(config.apiBaseUrl).hostname,
      mode: config.mode,
    });
    throw error;
  }

  const raw = (await res.json().catch(() => null)) as Record<string, unknown> | null;
  const data = mapPhonePeResponse(raw);

  console.log('[phonepe] v1 pay', {
    ok: res.ok,
    status: res.status,
    merchantOrderId: params.merchantOrderId,
    amount: params.amountPaise,
    mode: config.mode,
    code: data?.code,
    message: data?.message,
  });

  return { ok: res.ok, status: res.status, data };
}

/* ────── v2: Standard Checkout (OAuth2) ────── */

async function createPaymentV2(
  params: CreatePaymentParams,
  config: PhonePeConfig,
  phoneNumber: string,
): Promise<PhonePePaymentResponse> {
  const accessToken = await getAccessToken(config);

  const payload: Record<string, unknown> = {
    orderId: params.merchantOrderId,
    amount: params.amountPaise,
    redirectUrl: params.redirectUrl,
    redirectMode: 'REDIRECT',
    callbackUrl: params.callbackUrl,
    paymentModes: ['UPI', 'CARD', 'NB', 'WALLET'],
  };

  // Optional: include phone if provided
  if (phoneNumber) {
    payload.mobileNumber = phoneNumber;
  }

  const apiPath = '/pg/v1/order/create';

  let res: Response;
  try {
    res = await fetch(`${config.apiBaseUrl}${apiPath}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        accept: 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(payload),
      cache: 'no-store',
    });
  } catch (error) {
    console.error('[phonepe] v2 pay network error', {
      merchantOrderId: params.merchantOrderId,
      amount: params.amountPaise,
      apiHostname: new URL(config.apiBaseUrl).hostname,
      mode: config.mode,
    });
    throw error;
  }

  const raw = (await res.json().catch(() => null)) as Record<string, unknown> | null;
  const data = mapPhonePeResponse(raw);

  console.log('[phonepe] v2 pay', {
    ok: res.ok,
    status: res.status,
    merchantOrderId: params.merchantOrderId,
    amount: params.amountPaise,
    mode: config.mode,
    code: data?.code,
    message: data?.message,
  });

  return { ok: res.ok, status: res.status, data };
}

/* ───────── Payment status ───────── */

export interface PaymentStatusParams {
  merchantOrderId: string;
  config: PhonePeConfig;
}

/**
 * Server-side transaction status check.
 *   v1: Classic PG — X-VERIFY + /pg/v1/status/{merchantId}/{merchantOrderId}
 *   v2: Standard Checkout — OAuth2 + /pg/v1/order/{merchantId}/{merchantOrderId}
 */
export async function getPhonePePaymentStatus(
  params: PaymentStatusParams,
): Promise<PhonePePaymentResponse> {
  const { config } = params;

  if (config.apiVersion === 'v2') {
    return getStatusV2(params, config);
  }
  return getStatusV1(params, config);
}

/* ────── v1 status ────── */

async function getStatusV1(
  params: PaymentStatusParams,
  config: PhonePeConfig,
): Promise<PhonePePaymentResponse> {
  const apiPath = `/pg/v1/status/${config.merchantId}/${encodeURIComponent(params.merchantOrderId)}`;
  const checksum = generateV1Checksum('', apiPath, config.saltKey, config.saltIndex);

  let res: Response;
  try {
    res = await fetch(`${config.apiBaseUrl}${apiPath}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        accept: 'application/json',
        'X-VERIFY': checksum,
        'X-MERCHANT-ID': config.merchantId,
      },
      cache: 'no-store',
    });
  } catch (error) {
    console.error('[phonepe] v1 status network error', {
      merchantOrderId: params.merchantOrderId,
      apiHostname: new URL(config.apiBaseUrl).hostname,
      mode: config.mode,
    });
    throw error;
  }

  const raw = (await res.json().catch(() => null)) as Record<string, unknown> | null;
  const data = mapPhonePeResponse(raw);

  if (!res.ok || data?.state === 'FAILED') {
    console.error('[phonepe] v1 order status', {
      status: res.status,
      merchantOrderId: params.merchantOrderId,
      state: data?.state,
      code: data?.code,
      message: data?.message,
    });
  }
  return { ok: res.ok, status: res.status, data };
}

/* ────── v2 status ────── */

async function getStatusV2(
  params: PaymentStatusParams,
  config: PhonePeConfig,
): Promise<PhonePePaymentResponse> {
  const accessToken = await getAccessToken(config);
  const apiPath = `/pg/v1/order/${config.merchantId}/${encodeURIComponent(params.merchantOrderId)}`;

  let res: Response;
  try {
    res = await fetch(`${config.apiBaseUrl}${apiPath}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        accept: 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      cache: 'no-store',
    });
  } catch (error) {
    console.error('[phonepe] v2 status network error', {
      merchantOrderId: params.merchantOrderId,
      apiHostname: new URL(config.apiBaseUrl).hostname,
      mode: config.mode,
    });
    throw error;
  }

  const raw = (await res.json().catch(() => null)) as Record<string, unknown> | null;
  const data = mapPhonePeResponse(raw);

  if (!res.ok || data?.state === 'FAILED') {
    console.error('[phonepe] v2 order status', {
      status: res.status,
      merchantOrderId: params.merchantOrderId,
      state: data?.state,
      code: data?.code,
      message: data?.message,
    });
  }
  return { ok: res.ok, status: res.status, data };
}

/* ───────── Order token (HMAC-signed, server-side only) ───────── */

export const ORDER_TOKEN_TTL_MS = 30 * 60 * 1000;

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
