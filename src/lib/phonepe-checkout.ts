'use client';

declare global {
  interface Window {
    PhonePeCheckout?: {
      transact: (options: PhonePeTransactOptions) => void;
      closePage: () => void;
    };
  }
}

export interface PhonePeTransactOptions {
  tokenUrl: string;
  type?: 'IFRAME';
  callback?: (response: 'USER_CANCEL' | 'CONCLUDED') => void;
}

const PHONEPE_CHECKOUT_SCRIPT =
  process.env.NEXT_PUBLIC_PHONEPE_CHECKOUT_SCRIPT ??
  'https://mercury.phonepe.com/web/bundle/checkout.js';

type PhonePeCheckoutSdk = NonNullable<Window['PhonePeCheckout']>;

let scriptPromise: Promise<PhonePeCheckoutSdk> | null = null;

export function loadPhonePeCheckout(): Promise<PhonePeCheckoutSdk> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('PhonePe checkout is only available in the browser'));
  }

  if (window.PhonePeCheckout?.transact) {
    return Promise.resolve(window.PhonePeCheckout);
  }

  if (!scriptPromise) {
    scriptPromise = new Promise<PhonePeCheckoutSdk>((resolve, reject) => {
      const existing = document.querySelector<HTMLScriptElement>(
        `script[src="${PHONEPE_CHECKOUT_SCRIPT}"]`,
      );

      if (existing) {
        existing.addEventListener('load', () => {
          if (window.PhonePeCheckout?.transact) resolve(window.PhonePeCheckout);
          else reject(new Error('PhonePe checkout script did not expose PhonePeCheckout'));
        });
        existing.addEventListener('error', () =>
          reject(new Error('Failed to load PhonePe checkout script')),
        );
        return;
      }

      const script = document.createElement('script');
      script.src = PHONEPE_CHECKOUT_SCRIPT;
      script.async = true;
      script.onload = () => {
        if (window.PhonePeCheckout?.transact) resolve(window.PhonePeCheckout);
        else reject(new Error('PhonePe checkout script did not expose PhonePeCheckout'));
      };
      script.onerror = () => reject(new Error('Failed to load PhonePe checkout script'));
      document.head.appendChild(script);
    });
  }

  return scriptPromise;
}
