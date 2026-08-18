import nodemailer from 'nodemailer';

export interface NotificationContact {
  name?: string;
  phone?: string;
  email?: string;
}

export interface NotificationItem {
  title?: string;
  quantity?: number;
  price?: number;
}

export interface OrderNotificationData extends NotificationContact {
  orderId?: string;
  amountInr?: number;
  items?: NotificationItem[];
}

function inr(amount: number | undefined): string {
  if (typeof amount !== 'number' || !Number.isFinite(amount) || amount <= 0) return '';
  return `₹${amount.toLocaleString('en-IN')}`;
}

function moneyLine(item: NotificationItem): string {
  const price = typeof item.price === 'number' ? ` (${inr(item.price)})` : '';
  const qty = typeof item.quantity === 'number' ? ` x${item.quantity}` : '';
  return `• ${item.title ?? 'Item'}${price}${qty}`;
}

function itemLines(items: NotificationItem[] | undefined): string {
  return (items ?? []).map(moneyLine).join('\n');
}

/* ───────── Plain-text messages ───────── */

export function orderSuccessMessage(data: OrderNotificationData): string {
  const amount = inr(data.amountInr);
  const lines = [
    `Order Confirmed ${amount ? `(${amount})` : ''}`,
    data.orderId ? `Order ID: ${data.orderId}` : '',
    '',
    'Thank you for ordering with Apni Padhai Publication.',
    'Your order has been placed successfully and will be shipped to you soon.',
  ].filter(Boolean);

  const items = itemLines(data.items);
  if (items) {
    lines.push('', 'Order items:', items);
  }

  return lines.join('\n');
}

export function cartReminderMessage(data: OrderNotificationData): string {
  const lines = [
    'You have items waiting in your cart at Apni Padhai Publication!',
    '',
    'Your cart contains:',
    ...((data.items ?? []).length ? itemLines(data.items) : ['• Items left in cart']),
    '',
    'Complete your order to confirm delivery before the stock runs out.',
    'Visit https://apnipadhai.com/checkout to finish your purchase.',
  ];

  return lines.join('\n');
}

/* ───────── HTML email templates ───────── */

function orderSuccessHtml(data: OrderNotificationData): string {
  const amount = inr(data.amountInr);
  const rows = (data.items ?? [])
    .map(
      (item) => `
      <tr>
        <td style="padding:8px 12px;border-bottom:1px solid #eee;font-size:14px;color:#333;">
          ${item.title ?? 'Item'}
          ${typeof item.quantity === 'number' ? `&times; ${item.quantity}` : ''}
        </td>
        <td style="padding:8px 12px;border-bottom:1px solid #eee;font-size:14px;color:#333;text-align:right;">
          ${typeof item.price === 'number' ? inr(item.price * (item.quantity ?? 1)) : ''}
        </td>
      </tr>`,
    )
    .join('');

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f7;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:8px;overflow:hidden;margin-top:20px;margin-bottom:20px;box-shadow:0 2px 8px rgba(0,0,0,0.08);">

    <!-- Header -->
    <div style="background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);padding:28px 24px;text-align:center;">
      <h1 style="color:#fff;margin:0;font-size:22px;font-weight:600;">Order Confirmed!</h1>
      ${data.orderId ? `<p style="color:rgba(255,255,255,0.85);margin:6px 0 0;font-size:14px;">Order #${data.orderId}</p>` : ''}
    </div>

    <div style="padding:24px;">
      <p style="font-size:15px;color:#333;margin:0 0 16px;">
        Hi ${data.name ?? 'Customer'}, thank you for your order with <strong>Apni Padhai Publication</strong>.
      </p>
      <p style="font-size:15px;color:#333;margin:0 0 20px;">
        Your order has been placed successfully and will be shipped to you soon.
      </p>

      ${rows
        ? `
      <table style="width:100%;border-collapse:collapse;margin:0 0 20px;">
        <thead>
          <tr>
            <th style="padding:8px 12px;border-bottom:2px solid #eee;text-align:left;font-size:13px;color:#666;text-transform:uppercase;">Item</th>
            <th style="padding:8px 12px;border-bottom:2px solid #eee;text-align:right;font-size:13px;color:#666;text-transform:uppercase;">Amount</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>`
        : ''}

      ${amount
        ? `
      <div style="background:#f8f9fa;border-radius:6px;padding:14px 18px;margin:0 0 20px;display:flex;justify-content:space-between;">
        <span style="font-size:15px;font-weight:600;color:#333;">Total Paid</span>
        <span style="font-size:18px;font-weight:700;color:#667eea;">${amount}</span>
      </div>`
        : ''}

      <p style="font-size:14px;color:#666;margin:0 0 8px;">
        You will receive a shipping notification once your order is dispatched.
      </p>
    </div>

    <!-- Footer -->
    <div style="background:#f8f9fa;padding:18px 24px;text-align:center;border-top:1px solid #eee;">
      <p style="margin:0;font-size:12px;color:#999;">
        Apni Padhai Publication &middot;
        <a href="https://apnipadhaipublication.com" style="color:#667eea;text-decoration:none;">apnipadhaipublication.com</a>
      </p>
    </div>
  </div>
</body>
</html>`;
}

/* ───────── Email (SMTP) ───────── */

const EMAIL_FROM =
  process.env.SMTP_FROM ?? process.env.SMTP_USER ?? 'Apni Padhai <no-reply@apnipadhai.com>';

export function isEmailConfigured(): boolean {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

let cachedTransporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter {
  if (!cachedTransporter) {
    cachedTransporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT ?? 587),
      secure: (process.env.SMTP_PORT ?? '587') === '465',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return cachedTransporter;
}

async function sendEmail(
  to: string,
  subject: string,
  text: string,
  html?: string,
): Promise<boolean> {
  if (!isEmailConfigured()) return false;

  try {
    await getTransporter().sendMail({
      from: EMAIL_FROM,
      to,
      subject,
      text,
      html: html ?? text,
    });
    console.log('[notifications/email] sent', { to, subject });
    return true;
  } catch (error) {
    console.error('[notifications/email] send failed', { to, subject, error });
    return false;
  }
}

/* ───────── SMS (MSG91) ───────── */

const MSG91_COUNTRY_CODE = process.env.MSG91_COUNTRY_CODE ?? '91';

export function isSmsConfigured(): boolean {
  return Boolean(process.env.MSG91_AUTH_KEY && process.env.MSG91_SENDER_ID);
}

async function sendSms(to: string, message: string): Promise<boolean> {
  if (!isSmsConfigured()) return false;

  const phone = `${MSG91_COUNTRY_CODE}${to.replace(/\D/g, '')}`;
  const params = new URLSearchParams({
    country: MSG91_COUNTRY_CODE,
    sender: process.env.MSG91_SENDER_ID!,
    route: '4',
    mobiles: phone,
    authkey: process.env.MSG91_AUTH_KEY!,
    message,
  });

  if (process.env.MSG91_TEMPLATE_ID) {
    params.set('template_id', process.env.MSG91_TEMPLATE_ID);
  }

  try {
    const res = await fetch(`https://api.msg91.com/api/v2/sendsms?${params.toString()}`, {
      method: 'POST',
      cache: 'no-store',
    });
    const ok = res.ok;
    if (!ok) {
      const body = await res.text().catch(() => '');
      console.error('[notifications/sms] failed', { phone, status: res.status, body });
    } else {
      console.log('[notifications/sms] sent', { phone });
    }
    return ok;
  } catch (error) {
    console.error('[notifications/sms] send failed', { phone, error });
    return false;
  }
}

/* ───────── WhatsApp (Meta Cloud API) ───────── */

export function isWhatsAppConfigured(): boolean {
  return Boolean(
    process.env.WHATSAPP_ACCESS_TOKEN &&
      process.env.WHATSAPP_PHONE_NUMBER_ID &&
      process.env.WHATSAPP_FROM,
  );
}

async function sendWhatsApp(to: string, message: string): Promise<boolean> {
  if (!isWhatsAppConfigured()) return false;

  const phone = `${MSG91_COUNTRY_CODE}${to.replace(/\D/g, '')}`;

  const body: Record<string, unknown> = {
    messaging_product: 'whatsapp',
    to: phone,
    type: 'text',
    text: { body: message },
  };

  try {
    const res = await fetch(
      `https://graph.facebook.com/v21.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
        },
        body: JSON.stringify(body),
        cache: 'no-store',
      },
    );
    const ok = res.ok;
    if (!ok) {
      const resp = await res.text().catch(() => '');
      console.error('[notifications/whatsapp] failed', { phone, status: res.status, body: resp });
    } else {
      console.log('[notifications/whatsapp] sent', { phone });
    }
    return ok;
  } catch (error) {
    console.error('[notifications/whatsapp] send failed', { phone, error });
    return false;
  }
}

/* ───────── Dispatcher ───────── */

export interface SendResult {
  email: boolean;
  sms: boolean;
  whatsapp: boolean;
  attempted: boolean;
}

async function dispatch(
  contact: NotificationContact,
  subject: string,
  message: string,
  html?: string,
): Promise<SendResult> {
  const results = await Promise.allSettled([
    contact.email ? sendEmail(contact.email, subject, message, html) : Promise.resolve(false),
    contact.phone ? sendSms(contact.phone, message) : Promise.resolve(false),
    contact.phone ? sendWhatsApp(contact.phone, message) : Promise.resolve(false),
  ]);

  const email = results[0].status === 'fulfilled' && results[0].value;
  const sms = results[1].status === 'fulfilled' && results[1].value;
  const whatsapp = results[2].status === 'fulfilled' && results[2].value;

  console.log('[notifications/dispatch]', {
    email: contact.email ? email : 'skipped',
    sms: contact.phone ? sms : 'skipped',
    whatsapp: contact.phone ? whatsapp : 'skipped',
  });

  return {
    email,
    sms,
    whatsapp,
    attempted: Boolean(contact.email || contact.phone),
  };
}

export async function sendOrderSuccessNotification(
  data: OrderNotificationData,
): Promise<SendResult> {
  const subject = `Order Confirmed ${data.orderId ? `- ${data.orderId}` : ''}`;
  const text = orderSuccessMessage(data);
  const html = orderSuccessHtml(data);
  return dispatch(data, subject, text, html);
}

export async function sendCartReminderNotification(
  data: OrderNotificationData,
): Promise<SendResult> {
  return dispatch(data, 'Your cart is waiting at Apni Padhai', cartReminderMessage(data));
}
