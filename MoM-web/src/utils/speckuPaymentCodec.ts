/**
 * Specku Payment Link Codec and Calculator Utilities.
 * Encodes invoice metadata into URL-safe strings and calculates
 * pricing breakdowns, discounts, and PayPal processor fees.
 */

export interface SpeckuInvoicePayload {
  id: string;
  title: string;
  client?: string;
  notes?: string;
  basePrice: number;
  discountAmount: number;
  discountLabel?: string;
  forceFee: boolean;
  currency: 'USD' | 'MXN';
  createdAt: number;
}

export interface PaymentBreakdown {
  basePrice: number;
  discountAmount: number;
  subtotal: number;
  feeAmount: number;
  isFeeForced: boolean;
  isFeeApplied: boolean;
  total: number;
  totalMxn: number;
  currency: 'USD' | 'MXN';
}

const USD_TO_MXN_RATE = 17;

/**
 * Calculates PayPal processing fee according to currency.
 * USD standard: 3.49% + $0.49 USD
 * MXN standard: 3.95% + $4.00 MXN
 */
export function calculatePayPalFee(amount: number, currency: 'USD' | 'MXN' = 'USD'): number {
  if (amount <= 0) return 0;
  if (currency === 'MXN') {
    return Math.round((amount * 0.0395 + 4.0) * 100) / 100;
  }
  return Math.round((amount * 0.0349 + 0.49) * 100) / 100;
}

/**
 * Computes full payment breakdown given an invoice payload and whether the buyer opted into paying the fee.
 */
export function computeBreakdown(
  payload: SpeckuInvoicePayload,
  clientWantsToCoverFee: boolean,
): PaymentBreakdown {
  const basePrice = Math.max(0, payload.basePrice || 0);
  const discountAmount = Math.min(basePrice, Math.max(0, payload.discountAmount || 0));
  const subtotal = Math.round((basePrice - discountAmount) * 100) / 100;

  const feeAmount = calculatePayPalFee(subtotal, payload.currency);
  const isFeeForced = Boolean(payload.forceFee);
  const isFeeApplied = isFeeForced || clientWantsToCoverFee;

  const total = Math.round((subtotal + (isFeeApplied ? feeAmount : 0)) * 100) / 100;
  const totalMxn =
    payload.currency === 'MXN'
      ? total
      : Math.round(total * USD_TO_MXN_RATE * 100) / 100;

  return {
    basePrice,
    discountAmount,
    subtotal,
    feeAmount,
    isFeeForced,
    isFeeApplied,
    total,
    totalMxn,
    currency: payload.currency,
  };
}

/**
 * Encodes an invoice object into a URL-safe Base64 string.
 */
export function encodeInvoiceToUrl(payload: SpeckuInvoicePayload): string {
  try {
    const jsonStr = JSON.stringify(payload);
    // Handle UTF-8 strings safely with encodeURIComponent
    const binaryStr = encodeURIComponent(jsonStr).replace(/%([0-9A-F]{2})/g, (_, p1) =>
      String.fromCharCode(parseInt(p1, 16)),
    );
    const base64 = btoa(binaryStr);
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  } catch (error) {
    console.error('[speckuPaymentCodec] Failed to encode invoice:', error);
    return '';
  }
}

/**
 * Decodes a URL-safe Base64 string into a validated SpeckuInvoicePayload.
 */
export function decodeInvoiceFromUrl(raw: string): SpeckuInvoicePayload | null {
  if (!raw || typeof raw !== 'string') return null;

  try {
    // Restore base64 padding and standard chars
    let base64 = raw.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }

    const binaryStr = atob(base64);
    const jsonStr = decodeURIComponent(
      Array.from(binaryStr)
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join(''),
    );

    const obj = JSON.parse(jsonStr);
    if (!obj || typeof obj !== 'object') return null;

    const basePrice = Number(obj.basePrice);
    if (isNaN(basePrice) || basePrice <= 0) return null;

    const discountAmount = Number(obj.discountAmount) || 0;
    const forceFee = Boolean(obj.forceFee);
    const currency = obj.currency === 'MXN' ? 'MXN' : 'USD';

    return {
      id: String(obj.id || Date.now().toString(36)),
      title: String(obj.title || 'Comisión de Arte - Specku'),
      client: obj.client ? String(obj.client) : undefined,
      notes: obj.notes ? String(obj.notes) : undefined,
      basePrice,
      discountAmount,
      discountLabel: obj.discountLabel ? String(obj.discountLabel) : undefined,
      forceFee,
      currency,
      createdAt: Number(obj.createdAt) || Date.now(),
    };
  } catch (error) {
    console.warn('[speckuPaymentCodec] Invalid or corrupted invoice token:', error);
    return null;
  }
}
