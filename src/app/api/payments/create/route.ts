import { NextRequest, NextResponse } from 'next/server';
import { createOrder, WooCommerceError } from '@/lib/woocommerce';
import {
  createPhonePePayment,
  generateMerchantTransactionId,
  getPhonePeConfig,
  getRedirectBaseUrl,
  getRequestBaseUrl,
  isPaymentRequestAllowed,
  signOrderToken,
  ORDER_TOKEN_TTL_MS,
} from '@/lib/phonepe';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    if (!isPaymentRequestAllowed(request.headers)) {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json().catch(() => null);
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

    const customer =
      typeof body.customer === 'object' && body.customer ? body.customer : {};

    const name = typeof customer.name === 'string' ? customer.name.trim() : '';
    const phone = typeof customer.phone === 'string' ? customer.phone.trim() : '';

    if (!name || !phone) {
      return NextResponse.json(
        { success: false, message: 'Name and phone number are required' },
        { status: 400 },
      );
    }

    if (!/^[6-9]\d{9}$/.test(phone)) {
      return NextResponse.json(
        { success: false, message: 'Please enter a valid 10-digit phone number' },
        { status: 400 },
      );
    }

    const order = await createOrder({
      items,
      couponCode: typeof body.couponCode === 'string' ? body.couponCode : undefined,
      billing: {
        firstName: name,
        phone,
        email: typeof customer.email === 'string' ? customer.email.trim() : undefined,
        address: typeof customer.address === 'string' ? customer.address.trim() : undefined,
        city: typeof customer.city === 'string' ? customer.city.trim() : undefined,
        postcode: typeof customer.postcode === 'string' ? customer.postcode.trim() : undefined,
      },
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

    const config = getPhonePeConfig();
    const merchantTransactionId = generateMerchantTransactionId();
    const origin = getRedirectBaseUrl(request.headers);
    const redirectUrl = `${origin}/payment/status?merchantTransactionId=${merchantTransactionId}`;

    let paymentResponse;

    if (config.mode === 'mock') {
      paymentResponse = {
        ok: true,
        status: 200,
        data: {
          orderId: `MOCK${Date.now()}`,
          state: 'PENDING',
          redirectUrl: `${getRequestBaseUrl(request.headers)}/api/payments/mock-pay?merchantTransactionId=${merchantTransactionId}`,
        },
      };
    } else {
      paymentResponse = await createPhonePePayment({
        merchantOrderId: merchantTransactionId,
        amountPaise,
        mobileNumber: phone,
        redirectUrl,
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
          email: typeof customer.email === 'string' ? customer.email.trim() : '',
          address: typeof customer.address === 'string' ? customer.address.trim() : '',
          city: typeof customer.city === 'string' ? customer.city.trim() : '',
          pincode: typeof customer.postcode === 'string' ? customer.postcode.trim() : '',
        },
        exp: Date.now() + ORDER_TOKEN_TTL_MS,
      },
      config.signingSecret,
    );

    const response = NextResponse.json({
      success: true,
      redirectUrl: redirect,
      merchantTransactionId,
      embed: config.mode !== 'mock',
    });
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
    return NextResponse.json(
      { success: false, message: 'Could not start payment. Please try again.' },
      { status: 500 },
    );
  }
}
