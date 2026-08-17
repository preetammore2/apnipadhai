import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { timingSafeEqual } from 'crypto';
import {
  getPhonePeConfig,
  getPhonePePaymentStatus,
  isPaymentRequestAllowed,
} from '@/lib/phonepe';
import { getOrderById, markOrderPaidIfNeeded } from '@/lib/woocommerce';
import { sendOrderSuccessNotification } from '@/lib/notifications';
import { getClientIp, rateLimitResponse } from '@/lib/rate-limit';
import { readJsonBody } from '@/lib/request-security';
import { isMerchantTransactionId } from '@/lib/validation';

/**
 * Server-to-server (S2S) callback / webhook handler for the classic PG V1 API.
 *
 * The classic PG integration has NO separate "webhook" — the S2S callback
 * (posted to `callbackUrl` when a transaction reaches a terminal state) is the
 * server-to-server notification. Both /api/phonepe/callback and
 * /api/phonepe/webhook route here.
 *
 * Security model (never trust the frontend or redirect query string):
 *  1. Verify the X-VERIFY signature over the raw base64 `response` body.
 *  2. Confirm the response belongs to our merchantId.
 *  3. Re-verify the transaction server-side with the status API.
 *  4. Validate the order amount against PhonePe's reported amount.
 *  5. Mark the WooCommerce order paid via markOrderPaidIfNeeded so this path
 *     and the /api/payments/verify fallback are mutually idempotent.
 *  6. Send the customer order-success notification exactly once.
 *
 * PhonePe retries the callback (up to 2 times) until it gets HTTP 200, so this
 * returns 200 only after successful processing.
 */

/**
 * Optional bearer token to restrict who can post to the callback. PhonePe never
 * sends one, so when PHONEPE_S2S_TOKEN is unset only the X-VERIFY signature is
 * checked. When set, requests MUST present `Authorization: Bearer <token>`
 * (useful for proxying/callbacks from an internal reverse proxy, or for manual
 * test scripts).
 */
function authorized(request: NextRequest): boolean {
  const expected = (process.env.PHONEPE_S2S_TOKEN ?? '').trim();
  if (!expected) return true;
  const provided = (request.headers.get('authorization') ?? '').replace(/^Bearer\s+/i, '');
  if (!provided) return false;
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

function decodeBase64Json<T>(value: string): T | null {
  try {
    return JSON.parse(Buffer.from(value, 'base64').toString('utf8')) as T;
  } catch {
    return null;
  }
}

/**
 * X-VERIFY for S2S callbacks:
 *
 * v1: SHA256(response + saltKey) + "###" + saltIndex, where `response` is the
 *     raw base64 `response` string received in the body.
 *
 * v2: For v2 (OAuth2-based) callbacks, PhonePe may send:
 *     - Header: `X-VERIFY` — SHA256(response + saltKey) + "###" + saltIndex
 *     - The callback body is still base64-encoded JSON with a `response` field.
 */
function verifyCallbackChecksum(
  response: string,
  received: string,
  saltKey: string,
  saltIndex: string,
): boolean {
  const digest = crypto.createHash('sha256').update(`${response}${saltKey}`).digest('hex');
  const computed = `${digest}###${saltIndex}`;

  const a = Buffer.from(computed);
  const b = Buffer.from(received);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

interface DecodedS2S {
  success?: unknown;
  code?: string;
  message?: string;
  data?: Record<string, unknown>;
}

export async function handlePhonePeS2S(request: NextRequest): Promise<Response> {
  try {
    if (!authorized(request)) {
      console.warn('[phonepe/s2s] missing or invalid bearer token');
      return NextResponse.json({ success: false }, { status: 401 });
    }

    if (!isPaymentRequestAllowed(request.headers)) {
      return NextResponse.json({ success: false }, { status: 403 });
    }

    const throttled = rateLimitResponse(request, {
      limit: 100,
      windowMs: 5 * 60 * 1000,
      key: `phonepe-s2s:${getClientIp(request)}`,
    });
    if (throttled) return throttled;

    const config = getPhonePeConfig();
    if (config.mode === 'mock') {
      return NextResponse.json({ success: true });
    }

    const body = await readJsonBody<{ response?: unknown }>(request, 64 * 1024);
    const responseB64 =
      body && typeof body.response === 'string' ? body.response.trim() : '';
    if (!responseB64) {
      return NextResponse.json({ success: false }, { status: 400 });
    }

    // Verify X-VERIFY signature. For v1 this is mandatory. For v2, if no salt
    // key is configured (OAuth2-only flow), skip signature verification but log
    // a warning — PhonePe still sends the header so verify when possible.
    const xVerify = request.headers.get('x-verify') ?? '';
    if (config.saltKey && config.saltIndex) {
      if (!xVerify || !verifyCallbackChecksum(responseB64, xVerify, config.saltKey, config.saltIndex)) {
        console.warn('[phonepe/s2s] signature verification failed', {
          status: 400,
          merchantTransactionId: null,
        });
        return NextResponse.json({ success: false }, { status: 400 });
      }
    } else if (!xVerify) {
      console.warn('[phonepe/s2s] no X-VERIFY header and no salt key configured — skipping signature check');
    }

    const decoded = decodeBase64Json<DecodedS2S>(responseB64);
    if (!decoded) {
      console.warn('[phonepe/s2s] could not decode callback payload');
      return NextResponse.json({ success: false }, { status: 400 });
    }

    const data = decoded.data ?? {};
    const merchantId = typeof data.merchantId === 'string' ? data.merchantId : '';
    const merchantTransactionId =
      typeof data.merchantTransactionId === 'string' ? data.merchantTransactionId : '';
    const reportedState = typeof data.state === 'string' ? data.state : '';
    const reportedAmount = Number(data.amount);

    if (merchantId && merchantId !== config.merchantId) {
      console.warn('[phonepe/s2s] merchantId mismatch', { status: 400 });
      return NextResponse.json({ success: false }, { status: 400 });
    }

    // Authoritative server-side status check — do not trust the callback body alone.
    let finalState = reportedState;
    let finalAmount = reportedAmount;
    let transactionId: string | undefined;
    if (merchantTransactionId && isMerchantTransactionId(merchantTransactionId)) {
      try {
        const status = await getPhonePePaymentStatus({
          merchantOrderId: merchantTransactionId,
          config,
        });
        if (status.ok && status.data) {
          finalState = status.data.state ?? finalState;
          if (status.data.amount !== undefined) finalAmount = status.data.amount;
          transactionId = status.data.transactionId;
        }
      } catch {
        console.error('[phonepe/s2s] status re-check failed, using verified callback data', {
          merchantTransactionId,
        });
      }
    }

    if (!isMerchantTransactionId(merchantTransactionId)) {
      console.warn('[phonepe/s2s] missing or invalid payment reference');
      return NextResponse.json({ success: false }, { status: 400 });
    }

    const orderId = Number(request.nextUrl.searchParams.get('orderId'));
    if (!Number.isInteger(orderId) || orderId <= 0) {
      console.warn('[phonepe/s2s] missing or invalid orderId', { merchantTransactionId });
      return NextResponse.json({ success: false }, { status: 400 });
    }

    if (finalState === 'COMPLETED') {
      const order = await getOrderById(orderId).catch(() => undefined);
      if (!order) {
        console.warn('[phonepe/s2s] order not found', { merchantTransactionId, orderId });
        return NextResponse.json({ success: false }, { status: 400 });
      }

      const orderPaise = Math.round(Number(order.total) * 100);
      if (
        !Number.isFinite(finalAmount) ||
        !Number.isFinite(orderPaise) ||
        finalAmount !== orderPaise
      ) {
        console.error('[phonepe/s2s] amount mismatch', {
          merchantTransactionId,
          orderId,
          orderPaise,
          reportedPaise: finalAmount,
        });
        return NextResponse.json({ success: false }, { status: 400 });
      }

      const transition = await markOrderPaidIfNeeded(orderId).catch(() => 'missing' as const);
      if (transition === 'paid') {
        console.log('[phonepe/s2s] order marked paid', {
          merchantTransactionId,
          orderId,
          transactionId,
          amountPaise: finalAmount,
        });
        await sendOrderSuccessNotification({
          name: order.billingName,
          phone: order.billingPhone,
          email: order.billingEmail,
          orderId: String(orderId),
          amountInr: orderPaise / 100,
          items: order.items,
        }).catch((error) => {
          console.error('[phonepe/s2s] failed to send order notification', error);
        });
      } else {
        console.log('[phonepe/s2s] order already paid, skipping', {
          merchantTransactionId,
          orderId,
          status: order.status,
        });
      }
    } else {
      console.log('[phonepe/s2s] non-completed callback received', {
        merchantTransactionId,
        orderId,
        state: finalState,
      });
    }

    return NextResponse.json(
      { success: true },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  } catch (error) {
    console.error('[phonepe/s2s] error', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
