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

// ---- Email (SMTP) ----

const EMAIL_FROM =
  process.env.SMTP_FROM ?? process.env.SMTP_USER ?? 'Apni Padhai <no-reply@apnipadhai.com>';

export function isEmailConfigured(): boolean {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

async function sendEmail(to: string, subject: string, text: string): Promise<boolean> {
  if (!isEmailConfigured()) return false;

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: (process.env.SMTP_PORT ?? '587') === '465',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  try {
    await transporter.sendMail({
      from: EMAIL_FROM,
      to,
      subject,
      text,
    });
    return true;
  } catch (error) {
    console.error('[notifications/email] send failed', error);
    return false;
  }
}

// ---- SMS (MSG91) ----

const MSG91_COUNTRY_CODE = process.env.MSG91_COUNTRY_CODE ?? '91';

export function isSmsConfigured(): boolean {
  return Boolean(process.env.MSG91_AUTH_KEY && process.env.MSG91_SENDER_ID);
}

async function sendSms(to: string, message: string): Promise<boolean> {
  if (!isSmsConfigured()) return false;

  const params = new URLSearchParams({
    country: MSG91_COUNTRY_CODE,
    sender: process.env.MSG91_SENDER_ID!,
    route: '4',
    mobiles: `${MSG91_COUNTRY_CODE}${to.replace(/\D/g, '')}`,
    authkey: process.env.MSG91_AUTH_KEY!,
    message,
  });

  try {
    const res = await fetch(`https://api.msg91.com/api/v2/sendsms?${params.toString()}`, {
      method: 'POST',
      cache: 'no-store',
    });
    return res.ok;
  } catch (error) {
    console.error('[notifications/sms] send failed', error);
    return false;
  }
}

// ---- WhatsApp (Meta Cloud API) ----

export function isWhatsAppConfigured(): boolean {
  return Boolean(
    process.env.WHATSAPP_ACCESS_TOKEN &&
      process.env.WHATSAPP_PHONE_NUMBER_ID &&
      process.env.WHATSAPP_FROM,
  );
}

async function sendWhatsApp(to: string, message: string): Promise<boolean> {
  if (!isWhatsAppConfigured()) return false;

  try {
    const res = await fetch(
      `https://graph.facebook.com/v21.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: `${MSG91_COUNTRY_CODE}${to.replace(/\D/g, '')}`,
          type: 'text',
          text: { body: message },
        }),
        cache: 'no-store',
      },
    );
    return res.ok;
  } catch (error) {
    console.error('[notifications/whatsapp] send failed', error);
    return false;
  }
}

// ---- Dispatcher ----

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
): Promise<SendResult> {
  const email = contact.email ? await sendEmail(contact.email, subject, message) : false;
  const sms = contact.phone ? await sendSms(contact.phone, message) : false;
  const whatsapp = contact.phone ? await sendWhatsApp(contact.phone, message) : false;

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
  return dispatch(data, `Order Confirmed ${data.orderId ? `- ${data.orderId}` : ''}`, orderSuccessMessage(data));
}

export async function sendCartReminderNotification(
  data: OrderNotificationData,
): Promise<SendResult> {
  return dispatch(data, 'Your cart is waiting at Apni Padhai', cartReminderMessage(data));
}
