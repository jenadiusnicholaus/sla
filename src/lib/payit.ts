export const PAYIT_ORIGIN = "https://payit.co.tz";
export const PAYIT_SDK_URL = `${PAYIT_ORIGIN}/sdk/checkout-v1.js`;

export const PAYIT_SLUG =
  (import.meta.env.VITE_PAYIT_SLUG as string | undefined) || "Street-Labs-Africa";

export const PAYIT_STANDALONE_URL = `${PAYIT_ORIGIN}/pay/${PAYIT_SLUG}`;

export type PayItCheckoutMode = "modal" | "inline" | "redirect";

export type PayItCallbackStatus =
  | "PROCESSING"
  | "SUCCEEDED"
  | "ATTEMPTS_EXHAUSTED"
  | "EXPIRED"
  | "CANCELLED";

export type PayItCloseReason = "merchant_close" | "iframe_close" | "destroyed";

export interface PayItResult {
  payment_id: string;
  status: PayItCallbackStatus;
}

export interface PayItCloseResult {
  reason: PayItCloseReason;
}

export interface PayItCheckoutOptions {
  slug: string;
  mode?: PayItCheckoutMode;
  container?: string | HTMLElement;
  onReady?: () => void;
  onProcessing?: (result: PayItResult) => void;
  onSuccess?: (result: PayItResult) => void;
  onFailure?: (result: PayItResult) => void;
  onClose?: (result: PayItCloseResult) => void;
}

export interface PayItCheckoutInstance {
  open: () => void;
  close: () => void;
  destroy: () => void;
  isOpen: () => boolean;
}

interface PayItGlobal {
  checkout: (options: PayItCheckoutOptions) => PayItCheckoutInstance;
}

declare global {
  interface Window {
    PayIt?: PayItGlobal;
  }
}

let sdkPromise: Promise<PayItGlobal> | null = null;

/**
 * Loads the hosted PayIt checkout SDK once and resolves with `window.PayIt`.
 * Repeated calls reuse the same in-flight or resolved promise.
 */
export function loadPayItSdk(): Promise<PayItGlobal> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("PayIt SDK requires a browser environment"));
  }

  if (window.PayIt) return Promise.resolve(window.PayIt);
  if (sdkPromise) return sdkPromise;

  sdkPromise = new Promise<PayItGlobal>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${PAYIT_SDK_URL}"]`,
    );

    const settle = (): void => {
      if (window.PayIt) resolve(window.PayIt);
      else reject(new Error("PayIt SDK loaded but window.PayIt is unavailable"));
    };

    const fail = (): void => {
      sdkPromise = null;
      reject(new Error("Failed to load the PayIt checkout SDK"));
    };

    if (existing) {
      existing.addEventListener("load", settle, { once: true });
      existing.addEventListener("error", fail, { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = PAYIT_SDK_URL;
    script.async = true;
    script.addEventListener("load", settle, { once: true });
    script.addEventListener("error", fail, { once: true });
    document.head.appendChild(script);
  });

  return sdkPromise;
}
