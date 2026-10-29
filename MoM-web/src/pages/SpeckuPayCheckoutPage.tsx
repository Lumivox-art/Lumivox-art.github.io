import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { LumivoxBrand } from '../components/LumivoxBrand';
import { ThemeToggle } from '../components/ThemeToggle';
import { LanguageToggle } from '../components/LanguageToggle';
import { useTheme } from '../components/ThemeContext';
import { useLang } from '../i18n';
import { PaymentOrderService, PaymentOrder } from '../services/PaymentOrderService';
import {
  decodeInvoiceFromUrl,
  computeBreakdown,
  SpeckuInvoicePayload,
} from '../utils/speckuPaymentCodec';
import { SPECKU_DISCORD_PROFILE_URL } from '../utils/discordMessage';
import './SpeckuPayCheckout.scss';

const DEFAULT_PAYPAL_CLIENT_ID =
  'BAA-aiHBfRBEkWGGh8umZAuwjJwpsUA104wjv6EJFoaDieVF93wwOrNXdSZjvP__hya21sARA2sWhVjUHg';
const PAYPAL_CLIENT_ID = import.meta.env.VITE_PAYPAL_CLIENT_ID || DEFAULT_PAYPAL_CLIENT_ID;

export function SpeckuPayCheckoutPage() {
  const { theme } = useTheme();
  const { t } = useLang();
  const [searchParams] = useSearchParams();

  const orderIdParam = searchParams.get('id');
  const invParam = searchParams.get('inv');

  // Server-stored master order state (Zero Trust & Anti-Tampering)
  const [serverOrder, setServerOrder] = useState<PaymentOrder | null>(null);
  const [isLoadingServer, setIsLoadingServer] = useState<boolean>(Boolean(orderIdParam));
  const [isAlreadyPaid, setIsAlreadyPaid] = useState<boolean>(false);
  const [isExpired, setIsExpired] = useState<boolean>(false);

  // Fetch verified order from Firebase RTDB if orderIdParam is present
  useEffect(() => {
    let isCancelled = false;

    async function loadServerOrder(id: string) {
      setIsLoadingServer(true);
      const res = await PaymentOrderService.GetOrder(id);

      if (isCancelled) return;
      setIsLoadingServer(false);

      if (res.Result) {
        setServerOrder(res.Result);
        if (res.Result.status === 'COMPLETED') {
          setIsAlreadyPaid(true);
        } else if (res.Result.expiresAt && Date.now() > res.Result.expiresAt) {
          setIsExpired(true);
        }
      }
    }

    if (orderIdParam) {
      loadServerOrder(orderIdParam);
    } else {
      setIsLoadingServer(false);
    }

    return () => {
      isCancelled = true;
    };
  }, [orderIdParam]);

  // Decode invoice payload: Server order takes absolute priority over URL parameter
  const invoicePayload: SpeckuInvoicePayload | null = useMemo(() => {
    if (serverOrder) {
      return {
        id: serverOrder.orderId,
        title: serverOrder.title,
        client: serverOrder.client,
        notes: serverOrder.notes,
        basePrice: serverOrder.basePrice,
        discountAmount: serverOrder.discountAmount,
        discountLabel: serverOrder.discountLabel,
        forceFee: serverOrder.forceFee,
        currency: serverOrder.currency,
        createdAt: serverOrder.createdAt,
      };
    }
    if (invParam) {
      return decodeInvoiceFromUrl(invParam);
    }
    return null;
  }, [serverOrder, invParam]);

  // Client fee selection: defaults to true if forced by Specku, or false if optional
  const [clientWantsToCoverFee, setClientWantsToCoverFee] = useState<boolean>(() => {
    return Boolean(invoicePayload?.forceFee);
  });

  // Keep state in sync if invoice changes
  useEffect(() => {
    if (invoicePayload?.forceFee) {
      setClientWantsToCoverFee(true);
    }
  }, [invoicePayload]);

  // Success / capture state
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [transactionId, setTransactionId] = useState<string>('');
  const [payerName, setPayerName] = useState<string>('');
  const [paymentError, setPaymentError] = useState<string | null>(null);

  // Loading state while checking server order integrity
  if (isLoadingServer) {
    return (
      <div className="specku-pay-checkout" data-theme={theme}>
        <div className="spc-topbar">
          <LumivoxBrand />
          <div className="spc-topbar-actions">
            <LanguageToggle />
            <ThemeToggle />
          </div>
        </div>
        <main className="spc-container">
          <div className="spc-card spc-invalid-card">
            <div className="spinner-border text-danger mb-3" role="status" />
            <h2>{t('specku.pay.checkout.verifying') || 'Verificando autenticidad de la orden en el servidor...'}</h2>
            <p>Conectando con el registro seguro de Firebase para garantizar la integridad de los importes.</p>
          </div>
        </main>
      </div>
    );
  }

  // Already Paid Order state (Anti-Replay / Double Charging protection)
  if (isAlreadyPaid && serverOrder) {
    return (
      <div className="specku-pay-checkout" data-theme={theme}>
        <div className="spc-topbar">
          <LumivoxBrand />
          <div className="spc-topbar-actions">
            <LanguageToggle />
            <ThemeToggle />
          </div>
        </div>
        <main className="spc-container">
          <div className="spc-card spc-invalid-card">

            <h2>{t('specku.pay.checkout.already_paid.title') || 'Esta Orden Ya Fue Liquidada'}</h2>
            <p>
              {t('specku.pay.checkout.already_paid.desc') ||
                'Esta orden de pago ya ha sido liquidada con anterioridad. Por políticas de seguridad, no se admiten cobros duplicados.'}
            </p>
            <div className="spc-receipt-box" style={{ maxWidth: '420px', margin: '0 auto 1.5rem', textAlign: 'left' }}>
              <div className="spc-receipt-row">
                <span>Folio:</span>
                <code>{serverOrder.orderId}</code>
              </div>
              <div className="spc-receipt-row">
                <span>Concepto:</span>
                <strong>{serverOrder.title}</strong>
              </div>
              {serverOrder.transactionId && (
                <div className="spc-receipt-row">
                  <span>Transacción PayPal:</span>
                  <code className="spc-receipt-code">{serverOrder.transactionId}</code>
                </div>
              )}
              {serverOrder.paidAt && (
                <div className="spc-receipt-row">
                  <span>Fecha de Liquidación:</span>
                  <span>{new Date(serverOrder.paidAt).toLocaleString()}</span>
                </div>
              )}
            </div>
            <div className="spc-invalid-actions">
              <a
                href={SPECKU_DISCORD_PROFILE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="spc-btn-primary"
              >
                Contactar a Specku en Discord
              </a>
              <Link to="/home/specku/comisiones" className="spc-btn-secondary">
                Ver Galería de Specku
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Expired Link state (TTL policy enforcement)
  if (isExpired && serverOrder) {
    return (
      <div className="specku-pay-checkout" data-theme={theme}>
        <div className="spc-topbar">
          <LumivoxBrand />
          <div className="spc-topbar-actions">
            <LanguageToggle />
            <ThemeToggle />
          </div>
        </div>
        <main className="spc-container">
          <div className="spc-card spc-invalid-card">

            <h2>{t('specku.pay.checkout.expired.title') || 'Enlace de Pago Expirado'}</h2>
            <p>
              {t('specku.pay.checkout.expired.desc') ||
                'Por políticas de seguridad y protección contra alteraciones (política TTL), esta liga ha expirado. Por favor solicita un nuevo enlace a Specku.'}
            </p>
            <div className="spc-invalid-actions">
              <a
                href={SPECKU_DISCORD_PROFILE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="spc-btn-primary"
              >
                Solicitar Nueva Liga en Discord
              </a>
              <Link to="/home/specku/comisiones" className="spc-btn-secondary">
                Ver Comisiones
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // If no valid invoice payload found
  if (!invoicePayload) {
    return (
      <div className="specku-pay-checkout" data-theme={theme}>
        <div className="spc-topbar">
          <LumivoxBrand />
          <div className="spc-topbar-actions">
            <LanguageToggle />
            <ThemeToggle />
          </div>
        </div>

        <main className="spc-container">
          <div className="spc-card spc-invalid-card">

            <h2>{t('specku.pay.checkout.invalid.title') || 'Enlace de Pago No Válido o Incompleto'}</h2>
            <p>
              {t('specku.pay.checkout.invalid.desc') ||
                'Esta pasarela de pago requiere un enlace de cobro generado previamente por Specku. Para adquirir una comisión personalizada o solicitar tu enlace de pago, por favor contacta al artista.'}
            </p>
            <div className="spc-invalid-actions">
              <a
                href={SPECKU_DISCORD_PROFILE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="spc-btn-primary"
              >
                {t('specku.pay.checkout.contact') || 'Contactar a Specku en Discord'}
              </a>
              <Link to="/home/specku/comisiones" className="spc-btn-secondary">
                {t('specku.pay.checkout.view_commissions') || 'Ver Galería y Precios'}
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Calculate live financial breakdown
  const breakdown = computeBreakdown(invoicePayload, clientWantsToCoverFee);

  const handleDiscordNotify = () => {
    const message = encodeURIComponent(
      `¡Hola Specku! Ya completé el pago de mi comisión "${invoicePayload.title}" por $${breakdown.total.toFixed(2)} ${breakdown.currency}.\nFolio de Orden: ${invoicePayload.id}\nID de Transacción: ${transactionId}`,
    );
    window.open(`${SPECKU_DISCORD_PROFILE_URL}?message=${message}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="specku-pay-checkout" data-theme={theme}>
      {/* Topbar */}
      <div className="spc-topbar">
        <LumivoxBrand />
        <div className="spc-topbar-actions">
          <Link to="/home/specku/comisiones" className="spc-back-link">
            ← {t('artists.back') || 'Comisiones'}
          </Link>
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </div>

      <main className="spc-container">
        {/* Payment Success View */}
        {isSuccess ? (
          <div className="spc-card spc-success-card animate-zoom-in">
            <div className="spc-success-emblem">
              <svg viewBox="0 0 24 24" width="32" height="32" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <span className="spc-badge-pill">TRANSACCIÓN COMPLETADA</span>
            <h1 className="spc-success-title">
              {t('specku.pay.checkout.success.title') || '¡Pago Realizado con Éxito!'}
            </h1>
            <p className="spc-success-intro">
              Muchas gracias{payerName ? `, ${payerName}` : ''}. Tu pago por{' '}
              <strong>${breakdown.total.toFixed(2)} {breakdown.currency}</strong> ha sido
              procesado y acreditado a Specku.
            </p>

            <div className="spc-receipt-box">
              <div className="spc-receipt-row">
                <span>Folio de Orden:</span>
                <code>{invoicePayload.id}</code>
              </div>
              <div className="spc-receipt-row">
                <span>Concepto:</span>
                <strong>{invoicePayload.title}</strong>
              </div>
              {invoicePayload.client && (
                <div className="spc-receipt-row">
                  <span>Destinatario:</span>
                  <span>{invoicePayload.client}</span>
                </div>
              )}
              <div className="spc-receipt-row">
                <span>ID de Transacción PayPal:</span>
                <code className="spc-receipt-code">{transactionId || 'Capturado'}</code>
              </div>
              <div className="spc-receipt-row">
                <span>Fecha:</span>
                <span>{new Date().toLocaleString()}</span>
              </div>
              <div className="spc-receipt-row spc-receipt-total">
                <span>Monto Pagado:</span>
                <strong>${breakdown.total.toFixed(2)} {breakdown.currency} (~${breakdown.totalMxn.toFixed(2)} MXN)</strong>
              </div>
            </div>

            <div className="spc-success-actions">
              <button
                type="button"
                className="spc-btn-primary"
                onClick={handleDiscordNotify}
              >
                Notificar a Specku por Discord
              </button>
              <button
                type="button"
                className="spc-btn-secondary"
                onClick={() => window.print()}
              >
                Imprimir / Guardar Recibo
              </button>
              <Link to="/home/specku/comisiones" className="spc-btn-link">
                ← Volver a Comisiones
              </Link>
            </div>
          </div>
        ) : (
          /* Checkout View */
          <div className="spc-card spc-checkout-card">
            {/* Header Badge & Title */}
            <header className="spc-card-header">
              <div className="spc-artist-pill">
                <span className="spc-artist-dot" />
                <span>SPECKU · ORDEN OFICIAL DE PAGO</span>
              </div>
              <h1 className="spc-order-title">{invoicePayload.title}</h1>
              {invoicePayload.client && (
                <div className="spc-order-client">
                  Preparado especialmente para: <strong>{invoicePayload.client}</strong>
                </div>
              )}
              {invoicePayload.notes && (
                <div className="spc-order-notes">
                  <span className="spc-notes-label">Detalles:</span> {invoicePayload.notes}
                </div>
              )}
            </header>

            {/* Error Message */}
            {paymentError && (
              <div className="spc-error-alert animate-shake">
                <span>{paymentError}</span>
              </div>
            )}

            {/* Price Breakdown */}
            <section className="spc-breakdown-section">
              <h2 className="spc-section-heading">Resumen de la Orden</h2>

              <div className="spc-line-item">
                <span>Precio base de obra</span>
                <span>${breakdown.basePrice.toFixed(2)} {breakdown.currency}</span>
              </div>

              {breakdown.discountAmount > 0 && (
                <div className="spc-line-item spc-line-discount">
                  <span>
                    {invoicePayload.discountLabel || 'Descuento especial'}
                  </span>
                  <span>-${breakdown.discountAmount.toFixed(2)} {breakdown.currency}</span>
                </div>
              )}

              <div className="spc-line-item spc-line-subtotal">
                <span>Subtotal neto</span>
                <span>${breakdown.subtotal.toFixed(2)} {breakdown.currency}</span>
              </div>

              {/* PayPal Fee Checkbox Row */}
              <div className={`spc-fee-card ${invoicePayload.forceFee ? 'fee-forced' : 'fee-optional'} ${clientWantsToCoverFee ? 'fee-active' : ''}`}>
                <label className="spc-fee-label">
                  <input
                    type="checkbox"
                    className="spc-fee-checkbox"
                    checked={clientWantsToCoverFee}
                    disabled={invoicePayload.forceFee}
                    onChange={(e) => {
                      if (!invoicePayload.forceFee) {
                        setClientWantsToCoverFee(e.target.checked);
                      }
                    }}
                  />
                  <div className="spc-fee-text-col">
                    <div className="spc-fee-title-row">
                      <strong>Cubrir la comisión de procesamiento PayPal</strong>
                      <span className="spc-fee-amount-badge">
                        +${breakdown.feeAmount.toFixed(2)} {breakdown.currency}
                      </span>
                    </div>

                    {invoicePayload.forceFee ? (
                      <p className="spc-fee-desc spc-forced-notice">
                        <em>Incluido en el acuerdo de la comisión por el artista.</em>
                      </p>
                    ) : (
                      <p className="spc-fee-desc">
                        Apoya a Specku asumiendo la tarifa del procesador para que reciba el valor neto de su trabajo.
                      </p>
                    )}
                  </div>
                </label>
              </div>

              {/* Final Total */}
              <div className="spc-total-container">
                <div className="spc-total-label">Total Final:</div>
                <div className="spc-total-stack">
                  <div className="spc-total-amount">
                    ${breakdown.total.toFixed(2)} {breakdown.currency}
                  </div>
                  <div className="spc-total-approx">
                    (~${breakdown.totalMxn.toFixed(2)} MXN)
                  </div>
                </div>
              </div>
            </section>

            {/* PayPal Live Buttons */}
            <section className="spc-paypal-section">
              <div className="spc-paypal-intro">
                <span>Paga de forma segura con saldo PayPal, tarjeta de débito o crédito</span>
              </div>

              <div className="spc-paypal-buttons-wrapper">
                <PayPalScriptProvider
                  options={{
                    clientId: PAYPAL_CLIENT_ID,
                    currency: breakdown.currency,
                    intent: 'capture',
                  }}
                >
                  <PayPalButtons
                    style={{
                      layout: 'vertical',
                      color: 'gold',
                      shape: 'rect',
                      label: 'pay',
                      height: 48,
                      tagline: false,
                    }}
                    forceReRender={[breakdown.total, breakdown.currency]}
                    createOrder={(_data, actions) => {
                      return actions.order.create({
                        intent: 'CAPTURE',
                        application_context: {
                          brand_name: 'Specku - Lumivox Art',
                          landing_page: 'NO_PREFERENCE',
                          shipping_preference: 'NO_SHIPPING',
                          user_action: 'PAY_NOW',
                        },
                        purchase_units: [
                          {
                            description: `${invoicePayload.title} - Specku Commission (${invoicePayload.id})`,
                            custom_id: invoicePayload.id,
                            amount: {
                              currency_code: breakdown.currency,
                              value: breakdown.total.toFixed(2),
                              breakdown: {
                                item_total: {
                                  currency_code: breakdown.currency,
                                  value: breakdown.total.toFixed(2),
                                },
                              },
                            },
                            items: [
                              {
                                name: invoicePayload.title,
                                description: invoicePayload.notes || 'Comisión de Ilustración Digital',
                                unit_amount: {
                                  currency_code: breakdown.currency,
                                  value: breakdown.total.toFixed(2),
                                },
                                quantity: '1',
                                category: 'DIGITAL_GOODS',
                              },
                            ],
                          },
                        ],
                      });
                    }}
                    onApprove={async (_data, actions) => {
                      try {
                        if (!actions.order) return;
                        const details = await actions.order.capture();
                        const id = details.id || _data.orderID || '';
                        const name =
                          details.payer?.name?.given_name ||
                          details.payer?.name?.surname ||
                          '';

                        // Settle order on Firebase RTDB master record
                        if (invoicePayload.id) {
                          await PaymentOrderService.MarkOrderPaid(invoicePayload.id, id, name);
                        }

                        setTransactionId(id);
                        setPayerName(name);
                        setIsSuccess(true);
                      } catch (err) {
                        console.error('[SpeckuPay] Capture error:', err);
                        setPaymentError(
                          'No se pudo completar el cobro. Por favor verifica los fondos en tu cuenta de PayPal o tarjeta.',
                        );
                      }
                    }}
                    onError={(err) => {
                      console.error('[SpeckuPay] PayPal error:', err);
                      setPaymentError('Hubo un inconveniente al conectar con PayPal. Por favor intenta de nuevo.');
                    }}
                    onCancel={() => {
                      setPaymentError('El proceso de pago fue cancelado por el usuario.');
                    }}
                  />
                </PayPalScriptProvider>
              </div>

              <div className="spc-security-badge">
                <span>Transacción encriptada directa con PayPal (PCI-DSS SAQ A) · Bienes Digitales (Sin costos de envío)</span>
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
