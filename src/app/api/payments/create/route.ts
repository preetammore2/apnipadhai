import { NextRequest, NextResponse } from 'next/server';
import { createOrder, getBooks, WooCommerceError } from '@/lib/woocommerce';
import { computeCartTotals } from '@/lib/pricing';
import { getStoreSettings } from '@/lib/store-settings';
import { getClientIp, rateLimitResponse } from '@/lib/rate-limit';
import { readJsonBody } from '@/lib/request-security';
import { normalizePhone, normalizePincode } from '@/lib/validation';
import {
  createPhonePePayment,
  generateMerchantTransactionId,
  getPhonePeConfig,
  getRedirectBaseUrl,
  getRequestBaseUrl,
  isPaymentRequestAllowed,
  signOrderToken,
  ORDER_TOKEN_TTL_MS,
  type PhonePePaymentData,
} from '@/lib/phonepe';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    if (!isPaymentRequestAllowed(request.headers)) {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
    }

    const throttled = rateLimitResponse(request, {
      limit: 20,
      windowMs: 60 * 60 * 1000,
      key: `payment-create:${getClientIp(request)}`,
    });
    if (throttled) return throttled;

    const body = await readJsonBody<{
      items?: unknown;
      customer?: unknown;
      couponCode?: unknown;
    }>(request);
    if (!body) {
      return NextResponse.json({ success: false, message: 'Invalid request body' }, { status: 400 });
    }

    const rawItems = Array.isArray(body.items) ? body.items : [];
    const items = rawItems
      .map((item: unknown) => {
        if (typeof item !== 'object' || item === null) return null;
        const { productId, quantity } = item as { productId?: unknown; quantity?: unknown };
        const pid = Number(productId);
        const qty = Number(quantity);
        if (!Number.isInteger(pid) || pid <= 0) return null;
        if (!Number.isInteger(qty) || qty < 1 || qty > 99) return null;
        return { productId: pid, quantity: qty };
      })
      .filter((item: unknown): item is { productId: number; quantity: number } => item !== null);

    if (items.length === 0) {
      return NextResponse.json({ success: false, message: 'Your cart is empty' }, { status: 400 });
    }

    const rawCustomer = body.customer;
    const customer: Record<string, unknown> =
      typeof rawCustomer === 'object' && rawCustomer !== null
        ? (rawCustomer as Record<string, unknown>)
        : {};

    const name = typeof customer.name === 'string' ? customer.name.trim().slice(0, 120) : '';
    const phone = normalizePhone(customer.phone);

    if (!name || !phone) {
      return NextResponse.json(
        { success: false, message: 'Name and phone number are required' },
        { status: 400 },
      );
    }

    const phoneThrottled = rateLimitResponse(request, {
      limit: 5,
      windowMs: 60 * 60 * 1000,
      key: `payment-create-phone:${phone}`,
    });
    if (phoneThrottled) return phoneThrottled;

    const email =
      typeof customer.email === 'string' ? customer.email.trim().slice(0, 254) : '';
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { success: false, message: 'Please enter a valid email address' },
        { status: 400 },
      );
    }

    const address =
      typeof customer.address === 'string' ? customer.address.trim().slice(0, 300) : '';
    const city = typeof customer.city === 'string' ? customer.city.trim().slice(0, 100) : '';
    const pincode = normalizePincode(customer.postcode);
    if (!address || !city) {
      return NextResponse.json(
        { success: false, message: 'Address and city are required' },
        { status: 400 },
      );
    }
    if (!pincode) {
      return NextResponse.json(
        { success: false, message: 'Please enter a valid 6-digit pincode' },
        { status: 400 },
      );
    }

    const couponCode = typeof body.couponCode === 'string' ? body.couponCode : undefined;
    const [settings, books] = await Promise.all([getStoreSettings(), getBooks()]);
    const bookPrices = new Map(books.map((book) => [Number(book.id), book.price]));
    const subtotal = items.reduce(
      (sum: number, item: { productId: number; quantity: number }) => {
        const price = bookPrices.get(item.productId);
        return sum + (price ?? 0) * item.quantity;
      },
      0,
    );
    const totals = computeCartTotals(subtotal, settings, couponCode);

    const config = getPhonePeConfig();
    const merchantTransactionId = generateMerchantTransactionId();

    const order = await createOrder({
      items,
      billing: {
        firstName: name,
        phone,
        email: email || undefined,
        address: address || undefined,
        city: city || undefined,
        postcode: pincode,
      },
      shippingAmount: totals.shipping,
      shippingLabel: settings.shipping.label,
      discountAmount: totals.discount,
      discountLabel: totals.discountLabel,
      merchantTransactionId,
    });

    const amountPaise = Math.round(Number(order.total) * 100);
    if (!Number.isFinite(amountPaise) || amountPaise <= 0) {
      return NextResponse.json(
        { success: false, message: 'Order total must be greater than zero' },
        { status: 400 },
      );
    }
    if (amountPaise < 100) {
      return NextResponse.json(
        { success: false, message: 'Order total must be at least ₹1' },
        { status: 400 },
      );
    }

    const origin = getRedirectBaseUrl();
    const redirectUrl = `${origin}/payment/status?merchantTransactionId=${merchantTransactionId}`;
    const callbackUrl = `${origin}/api/phonepe/callback?orderId=${order.id}`;

    let paymentResponse;

    if (config.mode === 'mock') {
      paymentResponse = {
        ok: true,
        status: 200,
        data: {
          merchantTransactionId,
          orderId: `MOCK${Date.now()}`,
          state: 'PENDING',
          redirectUrl: `${getRequestBaseUrl(request.headers)}/api/payments/mock-pay?merchantTransactionId=${merchantTransactionId}`,
          code: 'PAYMENT_INITIATED',
          message: 'Mock payment initiated',
        } as PhonePePaymentData,
      };
    } else {
      paymentResponse = await createPhonePePayment({
        merchantOrderId: merchantTransactionId,
        amountPaise,
        mobileNumber: phone,
        redirectUrl,
        callbackUrl,
        config,
      });
    }

    const redirect = paymentResponse?.data?.redirectUrl;
    if (!paymentResponse?.ok || !redirect) {
      const data = paymentResponse?.data;
      const code = data?.code ?? data?.errorCode ?? data?.detailedErrorCode ?? 'PAYMENT_INITIATION_FAILED';
      console.error('[payments/create] PhonePe initiation failed', {
        status: paymentResponse?.status,
        data,
      });
      return NextResponse.json(
        {
          success: false,
          code,
          message:
            data?.message ??
            (code !== 'PAYMENT_INITIATION_FAILED'
              ? `Payment gateway error (${code})`
              : 'Payment initiation failed'),
        },
        { status: 502 },
      );
    }

    const token = signOrderToken(
      {
        merchantTransactionId,
        woocommerceOrderId: order.id,
        amountPaise,
        redirectUrl: redirect,
        items: items.map((item: { productId: number; quantity: number }) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
        customer: {
          name,
          phone,
          email,
          address,
          city,
          pincode,
        },
        exp: Date.now() + ORDER_TOKEN_TTL_MS,
      },
      config.signingSecret,
    );

    const response = NextResponse.json(
      {
        success: true,
        redirectUrl: redirect,
        merchantTransactionId,
        embed: false,
      },
      { headers: { 'Cache-Control': 'no-store' } },
    );
    response.cookies.set('ap_order', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: Math.floor(ORDER_TOKEN_TTL_MS / 1000),
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('[payments/create] error', error);
    if (error instanceof WooCommerceError) {
      return NextResponse.json(
        { success: false, message: error.message || 'Could not create order' },
        { status: error.status >= 400 && error.status < 600 ? error.status : 502 },
      );
    }
    const message =
      error instanceof Error && error.message.includes('PhonePe')
        ? error.message
        : 'Could not start payment. Please try again.';
    return NextResponse.json(
      { success: false, message },
      { status: 500 },
    );
  }
}
