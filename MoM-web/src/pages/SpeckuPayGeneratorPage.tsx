import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LumivoxBrand } from '../components/LumivoxBrand';
import { ThemeToggle } from '../components/ThemeToggle';
import { LanguageToggle } from '../components/LanguageToggle';
import { useTheme } from '../components/ThemeContext';
import { useLang } from '../i18n';
import { useAuth } from '../components/AuthContext';
import { PaymentOrderService } from '../services/PaymentOrderService';
import {
  SpeckuInvoicePayload,
  encodeInvoiceToUrl,
  computeBreakdown,
  calculatePayPalFee,
} from '../utils/speckuPaymentCodec';
import './SpeckuPayGenerator.scss';

const LOCAL_STORAGE_HISTORY_KEY = 'specku_payment_links_history_v1';

const PRESET_CONCEPTS = [
  'Cutsey Character (Boceto)',
  'Chibi Full-Color',
  'Dull-Eyes Render',
  'Anima Half-Body',
  'Semi-Real Portrait',
  'Adelanto 50% Comisión',
  'Liquidación 50% Final',
];

const PRESET_PRICES = [10, 15, 25, 40, 60, 85, 120];

export function SpeckuPayGeneratorPage() {
  const { theme } = useTheme();
  const { t } = useLang();
  const { currentUser } = useAuth();

  // Master server order folio
  const [orderId, setOrderId] = useState<string>(() => PaymentOrderService.GenerateOrderId());

  // Form states
  const [title, setTitle] = useState('Comisión Personalizada - Specku');
  const [client, setClient] = useState('');
  const [notes, setNotes] = useState('');
  const [basePrice, setBasePrice] = useState<number>(35);
  const [currency] = useState<'USD' | 'MXN'>('USD');

  // Discount options
  const [discountType, setDiscountType] = useState<'none' | 'fixed' | 'percent'>('none');
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [discountLabel, setDiscountLabel] = useState('Descuento especial');

  // Force Fee toggle
  const [forceFee, setForceFee] = useState<boolean>(true);

  // Output link & copy state
  const [generatedLink, setGeneratedLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [isSavingServer, setIsSavingServer] = useState(false);
  const [serverSaveSuccess, setServerSaveSuccess] = useState<boolean | null>(null);

  // Saved history in localStorage
  const [history, setHistory] = useState<
    { id: string; title: string; client?: string; total: number; link: string; date: string; status?: string }[]
  >([]);

  // Load history on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_HISTORY_KEY);
      if (raw) {
        setHistory(JSON.parse(raw));
      }
    } catch (e) {
      console.warn('Could not read history from localStorage', e);
    }
  }, []);

  // Compute calculated discount amount
  const calculatedDiscount =
    discountType === 'none'
      ? 0
      : discountType === 'fixed'
        ? Math.min(basePrice, Math.max(0, discountValue))
        : Math.round(basePrice * (Math.min(100, Math.max(0, discountValue)) / 100) * 100) / 100;

  // Real-time breakdown calculation
  const dummyPayload: SpeckuInvoicePayload = {
    id: orderId,
    title: title || 'Comisión',
    client: client || undefined,
    notes: notes || undefined,
    basePrice,
    discountAmount: calculatedDiscount,
    discountLabel: discountType !== 'none' ? discountLabel : undefined,
    forceFee,
    currency,
    createdAt: Date.now(),
  };

  const previewBreakdown = computeBreakdown(dummyPayload, true);
  const estimatedFee = calculatePayPalFee(previewBreakdown.subtotal, currency);

  // Recalculate link whenever inputs change
  useEffect(() => {
    if (basePrice <= 0) {
      setGeneratedLink('');
      return;
    }

    const payload: SpeckuInvoicePayload = {
      id: orderId,
      title: title.trim() || 'Comisión de Ilustración - Specku',
      client: client.trim() || undefined,
      notes: notes.trim() || undefined,
      basePrice,
      discountAmount: calculatedDiscount,
      discountLabel: discountType !== 'none' ? discountLabel.trim() : undefined,
      forceFee,
      currency,
      createdAt: Date.now(),
    };

    const token = encodeInvoiceToUrl(payload);
    const origin = window.location.origin;
    const base = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');
    // Zero-Trust link: primary lookup by id (server-stored immutable order) with legacy inv fallback
    const fullUrl = `${origin}${base}/home/specku/pagar?id=${orderId}&inv=${token}`;
    setGeneratedLink(fullUrl);
    setServerSaveSuccess(null);
  }, [orderId, title, client, notes, basePrice, discountType, discountValue, discountLabel, forceFee, currency, calculatedDiscount]);

  const handleCopyLink = async () => {
    if (!generatedLink || basePrice <= 0) return;

    setIsSavingServer(true);
    let idToken: string | undefined = undefined;
    if (currentUser) {
      try {
        idToken = await currentUser.getIdToken();
      } catch {
        // Safe failover
      }
    }

    // Persist immutable master order to Firebase RTDB (/ordenes_pago/{orderId})
    const orderResp = await PaymentOrderService.CreateOrder(
      {
        orderId,
        title: title.trim() || 'Comisión de Ilustración - Specku',
        client: client.trim() || undefined,
        notes: notes.trim() || undefined,
        basePrice,
        currency,
        discountAmount: calculatedDiscount,
        discountLabel: discountType !== 'none' ? discountLabel.trim() : undefined,
        forceFee,
        issuerUid: currentUser?.uid,
      },
      idToken,
    );

    setIsSavingServer(false);
    setServerSaveSuccess(orderResp.CodeNumber === 200);

    navigator.clipboard.writeText(generatedLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);

      // Save to history
      try {
        const newEntry = {
          id: orderId,
          title: title || 'Comisión',
          client: client || undefined,
          total: previewBreakdown.total,
          link: generatedLink,
          date: new Date().toLocaleDateString(),
          status: 'PENDING',
        };
        const updated = [newEntry, ...history.filter((h) => h.id !== orderId)].slice(0, 8);
        setHistory(updated);
        localStorage.setItem(LOCAL_STORAGE_HISTORY_KEY, JSON.stringify(updated));
      } catch (e) {
        console.warn('Failed saving link to history', e);
      }
    });
  };

  const handleNewFolio = () => {
    const newId = PaymentOrderService.GenerateOrderId();
    setOrderId(newId);
    setServerSaveSuccess(null);
  };

  const handleClearHistory = () => {
    setHistory([]);
    localStorage.removeItem(LOCAL_STORAGE_HISTORY_KEY);
  };

  return (
    <div className="specku-pay-generator" data-theme={theme}>
      {/* Topbar */}
      <div className="spg-topbar">
        <LumivoxBrand />
        <div className="spg-topbar-actions">
          <Link to="/home/specku/comisiones" className="spg-back-link">
            ← {t('artists.back') || 'Comisiones'}
          </Link>
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </div>

      {/* Hero Header */}
      <header className="spg-hero">
        <div className="spg-badge">ADMIN / SPECKU</div>
        <h1>{t('specku.pay.generator.title') || 'Generador de Enlaces de Pago'}</h1>
        <p className="spg-subtitle">
          {t('specku.pay.generator.subtitle') ||
            'Configura el precio, descuentos y la cobertura de comisión para generar un enlace único de PayPal para tu cliente.'}
        </p>
      </header>

      {/* Main Grid Content */}
      <main className="spg-container">
        <div className="spg-layout">
          {/* Left Column: Generator Form Controls */}
          <section className="spg-form-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 className="spg-section-title" style={{ margin: 0 }}>
                <span className="spg-num-badge">1</span> Detalles del Cobro
              </h2>
              <button
                type="button"
                onClick={handleNewFolio}
                className="spg-chip-btn"
                style={{ fontSize: '0.78rem', padding: '0.3rem 0.6rem' }}
                title="Generar un nuevo folio de cobro"
              >
                🔄 Nuevo Folio
              </button>
            </div>

            <div style={{ fontSize: '0.8rem', color: 'var(--spg-muted)', marginBottom: '1rem' }}>
              Folio Asignado: <code style={{ fontWeight: 700, color: 'var(--spg-primary)' }}>{orderId}</code>
            </div>

            {/* Concept / Title */}
            <div className="spg-field-group">
              <label htmlFor="spg-title" className="spg-label">
                Concepto o Título de la Comisión:
              </label>
              <input
                id="spg-title"
                type="text"
                className="spg-input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej. Ilustración Semi-Real - Cuerpo Completo"
              />
              <div className="spg-chips-row">
                {PRESET_CONCEPTS.map((concept) => (
                  <button
                    key={concept}
                    type="button"
                    className="spg-chip-btn"
                    onClick={() => setTitle(concept)}
                  >
                    {concept}
                  </button>
                ))}
              </div>
            </div>

            {/* Client / Handle (Optional) */}
            <div className="spg-field-group">
              <label htmlFor="spg-client" className="spg-label">
                Cliente o Referencia (Opcional):
              </label>
              <input
                id="spg-client"
                type="text"
                className="spg-input"
                value={client}
                onChange={(e) => setClient(e.target.value)}
                placeholder="Ej. @UsuarioDiscord o Nombre del cliente"
              />
            </div>

            {/* Notes / Description (Optional) */}
            <div className="spg-field-group">
              <label htmlFor="spg-notes" className="spg-label">
                Notas adicionales para el cliente (Opcional):
              </label>
              <textarea
                id="spg-notes"
                className="spg-textarea"
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ej. Entrega estimada en 7 días hábiles. Incluye 2 revisiones en boceto."
              />
            </div>

            {/* Pricing Section */}
            <h2 className="spg-section-title mt-4">
              <span className="spg-num-badge">2</span> Precio y Descuentos
            </h2>

            {/* Base Price */}
            <div className="spg-field-group">
              <label htmlFor="spg-price" className="spg-label">
                Precio Base (USD):
              </label>
              <div className="spg-input-currency-wrapper">
                <span className="spg-currency-prefix">$</span>
                <input
                  id="spg-price"
                  type="number"
                  min={1}
                  step={1}
                  className="spg-input spg-input-currency"
                  value={basePrice || ''}
                  onChange={(e) => setBasePrice(Math.max(0, parseFloat(e.target.value) || 0))}
                />
                <span className="spg-currency-suffix">USD</span>
              </div>
              <div className="spg-chips-row">
                {PRESET_PRICES.map((p) => (
                  <button
                    key={p}
                    type="button"
                    className={`spg-chip-btn ${basePrice === p ? 'active' : ''}`}
                    onClick={() => setBasePrice(p)}
                  >
                    ${p} USD
                  </button>
                ))}
              </div>
            </div>

            {/* Discount Selector */}
            <div className="spg-field-group">
              <label className="spg-label">Aplicar Descuento:</label>
              <div className="spg-radio-group">
                <label className="spg-radio-label">
                  <input
                    type="radio"
                    name="discountType"
                    checked={discountType === 'none'}
                    onChange={() => setDiscountType('none')}
                  />
                  <span>Sin descuento</span>
                </label>
                <label className="spg-radio-label">
                  <input
                    type="radio"
                    name="discountType"
                    checked={discountType === 'fixed'}
                    onChange={() => setDiscountType('fixed')}
                  />
                  <span>Monto Fijo ($ USD)</span>
                </label>
                <label className="spg-radio-label">
                  <input
                    type="radio"
                    name="discountType"
                    checked={discountType === 'percent'}
                    onChange={() => setDiscountType('percent')}
                  />
                  <span>Porcentaje (%)</span>
                </label>
              </div>

              {discountType !== 'none' && (
                <div className="spg-discount-inputs animate-fade-in">
                  <div className="spg-row-inputs">
                    <div className="spg-subfield">
                      <label htmlFor="spg-discount-val" className="spg-sublabel">
                        {discountType === 'fixed' ? 'Monto a descontar ($):' : 'Porcentaje a descontar (%):'}
                      </label>
                      <input
                        id="spg-discount-val"
                        type="number"
                        min={0}
                        max={discountType === 'percent' ? 100 : basePrice}
                        step={1}
                        className="spg-input"
                        value={discountValue || ''}
                        onChange={(e) => setDiscountValue(Math.max(0, parseFloat(e.target.value) || 0))}
                      />
                    </div>
                    <div className="spg-subfield">
                      <label htmlFor="spg-discount-lbl" className="spg-sublabel">
                        Etiqueta del descuento:
                      </label>
                      <input
                        id="spg-discount-lbl"
                        type="text"
                        className="spg-input"
                        value={discountLabel}
                        onChange={(e) => setDiscountLabel(e.target.value)}
                        placeholder="Ej. Promo especial, Descuento amigos"
                      />
                    </div>
                  </div>
                  <div className="spg-discount-calc-notice">
                    Descuento calculado: <strong>-${calculatedDiscount.toFixed(2)} USD</strong> (Subtotal: ${(basePrice - calculatedDiscount).toFixed(2)} USD)
                  </div>
                </div>
              )}
            </div>

            {/* Fee Coverage Switch */}
            <h2 className="spg-section-title mt-4">
              <span className="spg-num-badge">3</span> Comisión de PayPal
            </h2>

            <div className={`spg-fee-toggle-box ${forceFee ? 'is-forced' : ''}`}>
              <label className="spg-switch-container">
                <input
                  type="checkbox"
                  className="spg-switch-checkbox"
                  checked={forceFee}
                  onChange={(e) => setForceFee(e.target.checked)}
                />
                <span className="spg-switch-slider" />
                <span className="spg-switch-label-text">
                  <strong>Forzar al cliente a pagar la comisión de PayPal</strong>
                </span>
              </label>

              <div className="spg-fee-explanation">
                {forceFee ? (
                  <p className="spg-notice-forced">
                    🔒 <strong>Modo Forzado:</strong> En el enlace de cobro, la casilla de comisión de PayPal aparecerá <strong>marcada y bloqueada</strong> para el cliente. Verá que está seleccionada pero no podrá quitarla, sumando automáticamente la comisión a su total.
                  </p>
                ) : (
                  <p className="spg-notice-optional">
                    🤝 <strong>Modo Opcional:</strong> El cliente verá una casilla libre donde podrá decidir voluntariamente si desea apoyar cubriendo la comisión (+${estimatedFee.toFixed(2)} USD) o pagar únicamente el subtotal de la obra.
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* Right Column: Live Preview & Generated Link */}
          <section className="spg-preview-column">
            {/* Live Invoice Preview */}
            <div className="spg-preview-card">
              <div className="spg-preview-header">
                <div className="spg-preview-tag">VISTA PREVIA DEL CLIENTE</div>
                <h3 className="spg-preview-title">{title || 'Comisión de Ilustración'}</h3>
                {client && <div className="spg-preview-client">Para: {client}</div>}
              </div>

              <div className="spg-preview-breakdown">
                <div className="spg-breakdown-row">
                  <span>Precio de obra</span>
                  <span>${basePrice.toFixed(2)} USD</span>
                </div>

                {calculatedDiscount > 0 && (
                  <div className="spg-breakdown-row spg-row-discount">
                    <span>
                      {discountLabel} ({discountType === 'percent' ? `${discountValue}%` : 'fijo'})
                    </span>
                    <span>-${calculatedDiscount.toFixed(2)} USD</span>
                  </div>
                )}

                <div className="spg-breakdown-row spg-row-subtotal">
                  <span>Subtotal</span>
                  <span>${previewBreakdown.subtotal.toFixed(2)} USD</span>
                </div>

                {/* PayPal Fee Row */}
                <div className={`spg-breakdown-row spg-row-fee ${forceFee ? 'fee-locked' : 'fee-optional'}`}>
                  <span>
                    Comisión PayPal ({forceFee ? '🔒 Obligatoria' : '🤝 Opcional'})
                  </span>
                  <span>+${estimatedFee.toFixed(2)} USD</span>
                </div>

                {/* Total */}
                <div className="spg-breakdown-total">
                  <div className="spg-total-label">Total a pagar:</div>
                  <div className="spg-total-values">
                    <span className="spg-total-usd">${previewBreakdown.total.toFixed(2)} USD</span>
                    <span className="spg-total-mxn">(~${previewBreakdown.totalMxn.toFixed(2)} MXN)</span>
                  </div>
                </div>
              </div>

              {/* Action Box: Generated Link */}
              <div className="spg-output-box">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <label className="spg-label" style={{ margin: 0 }}>Enlace de Pago Generado:</label>
                  <span style={{ fontSize: '0.72rem', color: '#1b8a4f', fontWeight: 700 }}>
                    🛡️ Zero Trust Server-Bound
                  </span>
                </div>
                <div className="spg-url-display" title={generatedLink}>
                  {generatedLink || 'Ingresa un precio válido para generar el enlace'}
                </div>

                <div className="spg-actions-row">
                  <button
                    type="button"
                    className={`spg-btn-copy ${copied ? 'is-copied' : ''}`}
                    onClick={handleCopyLink}
                    disabled={!generatedLink || isSavingServer}
                  >
                    {isSavingServer
                      ? '⏳ Registrando en Servidor...'
                      : copied
                        ? '✓ ¡Enlace Copiado y Registrado!'
                        : '📋 Copiar Enlace para el Cliente'}
                  </button>

                  {generatedLink && (
                    <a
                      href={generatedLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="spg-btn-test"
                    >
                      👁️ Abrir Vista
                    </a>
                  )}
                </div>

                {serverSaveSuccess === true && (
                  <div style={{ fontSize: '0.75rem', color: '#1b8a4f', marginTop: '0.5rem', textAlign: 'center' }}>
                    ✓ Orden maestra asentada de forma inmutable en Firebase RTDB.
                  </div>
                )}
              </div>
            </div>

            {/* Recent History Card */}
            {history.length > 0 && (
              <div className="spg-history-card">
                <div className="spg-history-header">
                  <h4>Enlaces Generados Recientemente</h4>
                  <button type="button" className="spg-btn-clear" onClick={handleClearHistory}>
                    Limpiar
                  </button>
                </div>
                <div className="spg-history-list">
                  {history.map((item) => (
                    <div key={item.id} className="spg-history-item">
                      <div className="spg-history-info">
                        <strong>{item.title}</strong>
                        {item.client && <span> ({item.client})</span>}
                        <div className="spg-history-meta">
                          ${item.total.toFixed(2)} USD · Folio: <code>{item.id}</code> · {item.date}
                        </div>
                      </div>
                      <button
                        type="button"
                        className="spg-history-copy-btn"
                        onClick={() => {
                          navigator.clipboard.writeText(item.link);
                          alert('¡Enlace copiado al portapapeles!');
                        }}
                      >
                        Copiar
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
