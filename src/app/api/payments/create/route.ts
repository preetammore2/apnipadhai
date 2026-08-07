import { NextRequest, NextResponse } from 'next/server';
import {
  createPhonePePayment,
  generateMerchantTransactionId,
  generateMerchantUserId,
  getPhonePeConfig,
  getRequestBaseUrl,
  signOrderToken,
  ORDER_TOKEN_TTL_MS,
} from '@/lib/phonepe';
import { computeOrderTotal, type OrderLineInput } from '@/lib/pricing';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ success: false, message: 'Invalid request body' }, { status: 400 });
    }

    const items: OrderLineInput[] = Array.isArray(body.items) ? body.items : [];
    const couponCode = typeof body.couponCode === 'string' ? body.couponCode : null;
    const customer = typeof body.customer === 'object' && body.customer ? body.customer : {};

    const name = typeof customer.name === 'string' ? customer.name.trim() : '';
    const phone = typeof customer.phone === 'string' ? customer.phone.trim() : '';

    if (!name || !phone) {
      return NextResponse.json(
        { success: false, message: 'Name and phone number are required' },
        { status: 400 },
      );
    }

    const amount = computeOrderTotal(items, couponCode);
    if (amount === null) {
      return NextResponse.json(
        { success: false, message: 'One or more items in the order are invalid' },
        { status: 400 },
      );
    }
    if (amount <= 0) {
      return NextResponse.json(
        { success: false, message: 'Order total must be greater than zero' },
        { status: 400 },
      );
    }

    const amountPaise = amount * 100;

    const config = getPhonePeConfig();
    const merchantTransactionId = generateMerchantTransactionId();
    const origin = getRequestBaseUrl(request.headers);
    const redirectUrl = `${origin}/payment/status`;
    const callbackUrl = `${origin}/api/payments/callback`;

    let paymentResponse;

    if (config.mode === 'mock') {
      paymentResponse = {
        ok: true,
        status: 200,
        data: {
          success: true,
          code: 'PAYMENT_INITIATED',
          data: {
            merchantTransactionId,
            redirectUrl: `${origin}/api/payments/mock-pay?merchantTransactionId=${merchantTransactionId}`,
          },
        },
      };
    } else {
      paymentResponse = await createPhonePePayment({
        merchantId: config.merchantId,
        merchantTransactionId,
        merchantUserId: generateMerchantUserId(),
        amountPaise,
        mobileNumber: phone,
        redirectUrl,
        callbackUrl,
        baseUrl: config.baseUrl,
        saltKey: config.saltKey,
        saltIndex: config.saltIndex,
      });
    }

    const redirect = paymentResponse?.data?.data?.redirectUrl;
    if (!paymentResponse?.data?.success || !redirect) {
      console.error('[payments/create] PhonePe initiation failed', {
        status: paymentResponse?.status,
        data: paymentResponse?.data,
      });
      return NextResponse.json(
        { success: false, message: paymentResponse?.data?.message || 'Payment initiation failed' },
        { status: 502 },
      );
    }

    const token = signOrderToken(
      {
        merchantTransactionId,
        amountPaise,
        customer: {
          name,
          phone,
          email: typeof customer.email === 'string' ? customer.email.trim() : '',
          address: typeof customer.address === 'string' ? customer.address.trim() : '',
          city: typeof customer.city === 'string' ? customer.city.trim() : '',
          pincode: typeof customer.pincode === 'string' ? customer.pincode.trim() : '',
        },
        exp: Date.now() + ORDER_TOKEN_TTL_MS,
      },
      config.signingSecret,
    );

    const response = NextResponse.json({
      success: true,
      redirectUrl: redirect,
      merchantTransactionId,
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
    return NextResponse.json(
      { success: false, message: 'Could not start payment. Please try again.' },
      { status: 500 },
    );
  }
}
