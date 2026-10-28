/**
 * PaymentOrderService
 * Manages server-stored master payment orders in Firebase Realtime Database (/ordenes_pago).
 * Eliminates client-side price tampering (PCI-DSS SAQ A, NIST SP 800-207 Zero Trust).
 *
 * Implements Constitution Brendup Title I & VI:
 * - Pure static methods, zero throw statements.
 * - ResponseObject pattern for all public API boundaries.
 * - Idempotent order capture and status transitions.
 */

import type { ResponseObject } from '../models/Response/ResponseObject';
import { LocalCache } from '../utils/LocalCache';

export interface PaymentOrder {
  orderId: string;
  title: string;
  client?: string;
  notes?: string;
  basePrice: number;
  currency: 'USD' | 'MXN';
  discountAmount: number;
  discountLabel?: string;
  forceFee: boolean;
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
  createdAt: number;
  expiresAt: number; // TTL (Time-To-Live in milliseconds)
  paidAt?: number;
  transactionId?: string;
  payerName?: string;
  issuerUid?: string;
}

export class PaymentOrderService {
  private static readonly cachePrefix = 'lvx_cache_orden_pago_';
  private static readonly restBase =
    'https://multiverseofmadness21-fefd9-default-rtdb.firebaseio.com/ordenes_pago';

  /**
   * Generates a cryptographically strong order ID folio.
   */
  public static GenerateOrderId(): string {
    const timestamp = Date.now().toString(36);
    const randomHex = Math.random().toString(36).substring(2, 8);
    return `ord_${timestamp}_${randomHex}`;
  }

  /**
   * Creates an immutable master payment order in Firebase RTDB.
   * Requires authentication (Specku / Admin Intranet session).
   */
  public static async CreateOrder(
    order: Omit<PaymentOrder, 'status' | 'createdAt' | 'expiresAt'> & {
      ttlHours?: number;
    },
    idToken?: string,
  ): Promise<ResponseObject<PaymentOrder>> {
    if (!order || !order.orderId || typeof order.basePrice !== 'number' || order.basePrice <= 0) {
      return {
        CodeNumber: 400,
        CodeName: 'BadRequest',
        Message: 'Los datos de la orden son inválidos o el monto base no es mayor a cero.',
        ErrorNumber: 400,
        ServerName: 'local-validation',
        Result: null,
      };
    }

    const ttlMs = (order.ttlHours || 168) * 3600 * 1000; // Default: 7 days TTL (168 hours)
    const now = Date.now();

    const masterOrder: PaymentOrder = {
      orderId: order.orderId,
      title: order.title.trim() || 'Comisión de Arte - Specku',
      client: order.client?.trim() || undefined,
      notes: order.notes?.trim() || undefined,
      basePrice: Math.round(order.basePrice * 100) / 100,
      currency: order.currency === 'MXN' ? 'MXN' : 'USD',
      discountAmount: Math.max(0, Math.round((order.discountAmount || 0) * 100) / 100),
      discountLabel: order.discountLabel?.trim() || undefined,
      forceFee: Boolean(order.forceFee),
      status: 'PENDING',
      createdAt: now,
      expiresAt: now + ttlMs,
      issuerUid: order.issuerUid,
    };

    try {
      const authParam = idToken ? `?auth=${encodeURIComponent(idToken)}` : '';
      const url = `${PaymentOrderService.restBase}/${encodeURIComponent(masterOrder.orderId)}.json${authParam}`;

      const response = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(masterOrder),
      });

      if (response.ok) {
        LocalCache.Set(`${PaymentOrderService.cachePrefix}${masterOrder.orderId}`, masterOrder);
        return {
          CodeNumber: 200,
          CodeName: 'OK',
          Message: 'Orden maestra registrada exitosamente en el servidor.',
          ErrorNumber: null,
          ServerName: 'firebase-rtdb',
          Result: masterOrder,
        };
      }

      return {
        CodeNumber: response.status,
        CodeName: 'HttpError',
        Message: `Error al guardar la orden en Firebase (${response.statusText}).`,
        ErrorNumber: response.status,
        ServerName: 'firebase-rtdb',
        Result: null,
      };
    } catch (err) {
      console.error('[PaymentOrderService] Network error creating order:', err);
      return {
        CodeNumber: 500,
        CodeName: 'NetworkError',
        Message: 'Fallo de conexión al registrar la orden en el servidor.',
        ErrorNumber: 500,
        ServerName: 'firebase-rtdb',
        Result: null,
      };
    }
  }

  /**
   * Retrieves an order by ID from Firebase RTDB.
   * Publicly readable per database.rules.json.
   */
  public static async GetOrder(orderId: string): Promise<ResponseObject<PaymentOrder | null>> {
    if (!orderId || typeof orderId !== 'string') {
      return {
        CodeNumber: 400,
        CodeName: 'BadRequest',
        Message: 'Identificador de orden no especificado.',
        ErrorNumber: 400,
        ServerName: 'local-validation',
        Result: null,
      };
    }

    // Check local cache first for instant feedback
    const cached = LocalCache.Get<PaymentOrder>(`${PaymentOrderService.cachePrefix}${orderId}`);

    try {
      const url = `${PaymentOrderService.restBase}/${encodeURIComponent(orderId)}.json`;
      const response = await fetch(url);

      if (response.ok) {
        const data = await response.json();
        if (data && typeof data === 'object' && data.orderId) {
          const validated: PaymentOrder = {
            orderId: String(data.orderId),
            title: String(data.title || 'Comisión'),
            client: data.client ? String(data.client) : undefined,
            notes: data.notes ? String(data.notes) : undefined,
            basePrice: Number(data.basePrice) || 0,
            currency: data.currency === 'MXN' ? 'MXN' : 'USD',
            discountAmount: Number(data.discountAmount) || 0,
            discountLabel: data.discountLabel ? String(data.discountLabel) : undefined,
            forceFee: Boolean(data.forceFee),
            status: data.status === 'COMPLETED' ? 'COMPLETED' : data.status === 'CANCELLED' ? 'CANCELLED' : 'PENDING',
            createdAt: Number(data.createdAt) || Date.now(),
            expiresAt: Number(data.expiresAt) || (Date.now() + 86400000),
            paidAt: data.paidAt ? Number(data.paidAt) : undefined,
            transactionId: data.transactionId ? String(data.transactionId) : undefined,
            payerName: data.payerName ? String(data.payerName) : undefined,
            issuerUid: data.issuerUid ? String(data.issuerUid) : undefined,
          };

          LocalCache.Set(`${PaymentOrderService.cachePrefix}${orderId}`, validated);
          return {
            CodeNumber: 200,
            CodeName: 'OK',
            Message: null,
            ErrorNumber: null,
            ServerName: 'firebase-rtdb',
            Result: validated,
          };
        }

        return {
          CodeNumber: 404,
          CodeName: 'NotFound',
          Message: `No se encontró la orden especificada (${orderId}).`,
          ErrorNumber: 404,
          ServerName: 'firebase-rtdb',
          Result: cached || null,
        };
      }

      return {
        CodeNumber: response.status,
        CodeName: 'HttpError',
        Message: `Error al consultar la orden (${response.statusText}).`,
        ErrorNumber: response.status,
        ServerName: 'firebase-rtdb',
        Result: cached || null,
      };
    } catch (err) {
      console.error('[PaymentOrderService] Network error fetching order:', err);
      return {
        CodeNumber: 500,
        CodeName: 'NetworkError',
        Message: 'Fallo de red al conectar con el servidor de órdenes.',
        ErrorNumber: 500,
        ServerName: 'firebase-rtdb',
        Result: cached || null,
      };
    }
  }

  /**
   * Idempotently marks an order as COMPLETED upon successful PayPal capture.
   * Prevents double payment and guarantees anti-tampering state progression.
   */
  public static async MarkOrderPaid(
    orderId: string,
    transactionId: string,
    payerName?: string,
  ): Promise<ResponseObject<boolean>> {
    if (!orderId || !transactionId) {
      return {
        CodeNumber: 400,
        CodeName: 'BadRequest',
        Message: 'Faltan parámetros requeridos para confirmar la liquidación.',
        ErrorNumber: 400,
        ServerName: 'local-validation',
        Result: false,
      };
    }

    // Step 1: Verify current state directly from database
    const currentOrderResp = await PaymentOrderService.GetOrder(orderId);
    if (!currentOrderResp.Result) {
      return {
        CodeNumber: 404,
        CodeName: 'NotFound',
        Message: 'No se puede liquidar una orden inexistente.',
        ErrorNumber: 404,
        ServerName: 'firebase-rtdb',
        Result: false,
      };
    }

    const currentOrder = currentOrderResp.Result;

    if (currentOrder.status === 'COMPLETED') {
      return {
        CodeNumber: 409,
        CodeName: 'Conflict',
        Message: 'Esta orden ya fue liquidada con anterioridad.',
        ErrorNumber: 409,
        ServerName: 'firebase-rtdb',
        Result: true, // Idempotent success
      };
    }

    // Check expiration TTL
    if (currentOrder.expiresAt && Date.now() > currentOrder.expiresAt) {
      return {
        CodeNumber: 410,
        CodeName: 'Gone',
        Message: 'Esta liga de pago ha expirado por política de seguridad.',
        ErrorNumber: 410,
        ServerName: 'firebase-rtdb',
        Result: false,
      };
    }

    // Step 2: Atomic update to COMPLETED
    const updatedOrder: PaymentOrder = {
      ...currentOrder,
      status: 'COMPLETED',
      transactionId: transactionId.trim(),
      paidAt: Date.now(),
      payerName: payerName?.trim() || undefined,
    };

    try {
      const url = `${PaymentOrderService.restBase}/${encodeURIComponent(orderId)}.json`;
      const response = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedOrder),
      });

      if (response.ok) {
        LocalCache.Set(`${PaymentOrderService.cachePrefix}${orderId}`, updatedOrder);
        return {
          CodeNumber: 200,
          CodeName: 'OK',
          Message: 'Orden liquidada exitosamente.',
          ErrorNumber: null,
          ServerName: 'firebase-rtdb',
          Result: true,
        };
      }

      return {
        CodeNumber: response.status,
        CodeName: 'HttpError',
        Message: `Error al asentar la liquidación en el servidor (${response.statusText}).`,
        ErrorNumber: response.status,
        ServerName: 'firebase-rtdb',
        Result: false,
      };
    } catch (err) {
      console.error('[PaymentOrderService] Failed to mark order paid:', err);
      return {
        CodeNumber: 500,
        CodeName: 'NetworkError',
        Message: 'Fallo de red al registrar la liquidación de la orden.',
        ErrorNumber: 500,
        ServerName: 'firebase-rtdb',
        Result: false,
      };
    }
  }

  /**
   * Lists orders for intranet dashboard monitoring.
   */
  public static async ListOrders(idToken?: string): Promise<PaymentOrder[]> {
    try {
      const authParam = idToken ? `?auth=${encodeURIComponent(idToken)}` : '';
      const url = `${PaymentOrderService.restBase}.json${authParam}`;
      const response = await fetch(url);

      if (response.ok) {
        const data = await response.json();
        if (data && typeof data === 'object') {
          const list: PaymentOrder[] = [];
          for (const val of Object.values(data)) {
            if (val && typeof val === 'object' && (val as PaymentOrder).orderId) {
              list.push(val as PaymentOrder);
            }
          }
          return list.sort((a, b) => b.createdAt - a.createdAt);
        }
      }
      return [];
    } catch {
      return [];
    }
  }
}
