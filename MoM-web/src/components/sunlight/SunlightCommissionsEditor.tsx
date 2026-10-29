import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { SunlightCommissionsService } from '../../services/SunlightCommissionsService';
import type { SunlightSampleBase } from '../../models/Sunlight';
import './SunlightCommissionsEditor.scss';

export function SunlightCommissionsEditor() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'art' | 'cassettes'>('art');

  const [artList, setArtList] = useState<SunlightSampleBase[]>([]);
  const [musicList, setMusicList] = useState<SunlightSampleBase[]>([]);

  // Load initial samples from cache or remote service
  useEffect(() => {
    const cached = SunlightCommissionsService.GetCachedSamples();
    if (cached && cached.length > 0) {
      setArtList(cached.filter((s) => s.Kind === 'cover'));
      setMusicList(cached.filter((s) => s.Kind === 'music'));
    }

    setLoading(true);
    SunlightCommissionsService.List().then((res) => {
      if (res.Result && res.Result.length > 0) {
        setArtList(res.Result.filter((s) => s.Kind === 'cover'));
        setMusicList(res.Result.filter((s) => s.Kind === 'music'));
      }
      setLoading(false);
    });
  }, []);

  // --- Digital Art Handlers ---
  const handleUpdateArt = (index: number, patch: Partial<SunlightSampleBase>) => {
    setArtList((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], ...patch };
      return copy;
    });
  };

  const handleAddArt = () => {
    const newId = Date.now();
    const newItem: SunlightSampleBase = {
      SampleID: newId,
      Key: `art-custom-${newId}`,
      Title: 'Nueva Pieza de Arte',
      Category: 'digital_art',
      Kind: 'cover',
      PriceUsd: 35,
      PriceMxn: 600,
      MediaUrl: '/sunlight-media/illustration.jpeg',
      Description: 'Descripción de la obra o estilo artístico',
      HasVinylDisc: true,
      Order: artList.length + 1,
      IsActive: true,
      IsDeleted: false,
    };
    setArtList((prev) => [...prev, newItem]);
  };

  const handleRemoveArt = (index: number) => {
    if (window.confirm('¿Deseas eliminar esta pieza de arte del catálogo?')) {
      setArtList((prev) => prev.filter((_, i) => i !== index));
    }
  };

  // --- Music & Cassette Handlers (Compiled 2 by 2 into Cara A and Cara B) ---
  const totalTapesCount = Math.ceil(musicList.length / 2);

  const handleUpdateTrack = (index: number, patch: Partial<SunlightSampleBase>) => {
    setMusicList((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], ...patch };
      return copy;
    });
  };

  const handleUpdateTapeTitle = (tapeIdx: number, newTitle: string) => {
    const trackAIdx = tapeIdx * 2;
    const trackBIdx = tapeIdx * 2 + 1;
    setMusicList((prev) => {
      const copy = [...prev];
      if (copy[trackAIdx]) {
        copy[trackAIdx] = { ...copy[trackAIdx], CassetteTitle: newTitle };
      }
      if (copy[trackBIdx]) {
        copy[trackBIdx] = { ...copy[trackBIdx], CassetteTitle: newTitle };
      }
      return copy;
    });
  };

  const handleAddCassette = () => {
    const nextTapeNum = totalTapesCount + 1;
    const now = Date.now();

    const trackA: SunlightSampleBase = {
      SampleID: now,
      Key: `track-${now}-a`,
      Title: `Pista A - Cinta ${String(nextTapeNum).padStart(2, '0')}`,
      Category: 'custom_song',
      Kind: 'music',
      PriceUsd: 30,
      PriceMxn: 550,
      MediaUrl: '/sunlight-media/instrumental.mp3',
      AudioUrl: '/sunlight-media/instrumental.mp3',
      Description: 'Producción musical instrumental o personalizada',
      Duration: '2:30',
      CassetteIndex: nextTapeNum,
      CassetteTitle: `Tape ${String(nextTapeNum).padStart(2, '0')}`,
      Side: 'A',
      Order: musicList.length + 1,
      IsActive: true,
      IsDeleted: false,
    };

    const trackB: SunlightSampleBase = {
      SampleID: now + 1,
      Key: `track-${now}-b`,
      Title: `Pista B - Cinta ${String(nextTapeNum).padStart(2, '0')}`,
      Category: 'custom_song',
      Kind: 'music',
      PriceUsd: 40,
      PriceMxn: 750,
      MediaUrl: '/sunlight-media/vocal-with-lyrics.mp3',
      AudioUrl: '/sunlight-media/vocal-with-lyrics.mp3',
      Description: 'Producción musical con arreglos o líricas',
      Duration: '2:15',
      CassetteIndex: nextTapeNum,
      CassetteTitle: `Tape ${String(nextTapeNum).padStart(2, '0')}`,
      Side: 'B',
      Order: musicList.length + 2,
      IsActive: true,
      IsDeleted: false,
    };

    setMusicList((prev) => [...prev, trackA, trackB]);
  };

  const handleRemoveCassette = (tapeIdx: number) => {
    if (window.confirm(`¿Deseas eliminar el Cassette ${tapeIdx + 1} y sus dos caras (A y B)?`)) {
      const trackAIdx = tapeIdx * 2;
      const trackBIdx = tapeIdx * 2 + 1;
      setMusicList((prev) => prev.filter((_, idx) => idx !== trackAIdx && idx !== trackBIdx));
    }
  };

  // --- Persistence Handler ---
  const handleSaveAll = async () => {
    setSaving(true);
    setFeedback(null);

    const fullCatalog: SunlightSampleBase[] = [
      ...artList.map((a, i) => ({ ...a, Order: i + 1 })),
      ...musicList.map((m, i) => ({ ...m, Order: artList.length + i + 1 })),
    ];

    try {
      const res = await SunlightCommissionsService.SaveAllSamples(fullCatalog);
      if (res.CodeNumber === 200) {
        setFeedback({
          type: 'success',
          message: 'Configuración guardada exitosamente en el servidor de la nube.',
        });
        setTimeout(() => setFeedback(null), 4500);
      } else {
        setFeedback({
          type: 'error',
          message: res.Message || 'Fallo al guardar la configuración.',
        });
      }
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err instanceof Error ? err.message : 'Error inesperado al persistir datos.',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="sl-intranet-editor">
      {/* Editor Header Banner */}
      <div className="sl-editor-header">
        <div className="sl-editor-title-wrap">
          <span className="sl-editor-tag">STUDIO CONFIGURATION · INTRANET</span>
          <h2 className="sl-editor-title">Editor de Comisiones de Sunlight Blue</h2>
          <p className="sl-editor-desc">
            Configura tu catálogo completo: piezas de arte digital con la casilla de modo disco (vinilo) y tu torre de cassettes con canciones compiladas de a dos (Cara A y B).
          </p>
        </div>

        <div className="sl-editor-top-actions">
          <Link
            to="/home/sunlight-blue/comisiones"
            target="_blank"
            rel="noopener noreferrer"
            className="sl-btn-preview"
          >
            Ver Estudio en Vivo →
          </Link>
          <button
            type="button"
            className="sl-btn-save-primary"
            onClick={handleSaveAll}
            disabled={saving}
          >
            {saving ? 'Guardando...' : 'Guardar Todo en la Nube'}
          </button>
        </div>
      </div>

      {loading && artList.length === 0 && (
        <div className="sl-editor-alert is-loading">
          <span>Cargando catálogo de comisiones desde la nube...</span>
        </div>
      )}

      {/* Real-time Notification Banner */}
      {feedback && (
        <div className={`sl-editor-alert is-${feedback.type}`}>
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Tabs Switcher: Art vs Cassettes */}
      <div className="sl-editor-tabs-bar">
        <button
          type="button"
          className={`sl-tab-btn ${activeTab === 'art' ? 'is-active' : ''}`}
          onClick={() => setActiveTab('art')}
        >
          <span className="sl-tab-title">Arte Digital & Vinilos</span>
          <span className="sl-tab-count">{artList.length} Obras</span>
        </button>

        <button
          type="button"
          className={`sl-tab-btn ${activeTab === 'cassettes' ? 'is-active' : ''}`}
          onClick={() => setActiveTab('cassettes')}
        >
          <span className="sl-tab-title">Torre de Cassettes (Caras A y B)</span>
          <span className="sl-tab-count">
            {totalTapesCount} {totalTapesCount === 1 ? 'Cassette' : 'Cassettes'} ({musicList.length} Canciones)
          </span>
        </button>
      </div>

      {/* Content Section: Digital Art */}
      {activeTab === 'art' && (
        <div className="sl-tab-content art-tab">
          <div className="sl-tab-subbar">
            <div>
              <h3 className="sl-subheading">Catálogo de Arte Digital</h3>
              <p className="sl-subtext">
                Edita títulos, precios y usa la checkmark interna para habilitar o deshabilitar el efecto de disco deslizable.
              </p>
            </div>
            <button
              type="button"
              className="sl-btn-add"
              onClick={handleAddArt}
            >
              + Agregar Nueva Pieza de Arte
            </button>
          </div>

          <div className="sl-art-items-grid">
            {artList.map((art, idx) => (
              <div key={art.Key || idx} className="sl-art-edit-card">
                <div className="sl-card-thumb-wrap">
                  <img
                    src={art.ImageBinary || art.MediaUrl}
                    alt={art.Title}
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = '/sunlight-media/illustration.jpeg';
                    }}
                  />
                  <span className={`sl-disc-indicator-tag ${art.HasVinylDisc ? 'has-disc' : 'no-disc'}`}>
                    {art.HasVinylDisc ? 'Modo Disco Activado' : 'Sin Disco (Arte Fijo)'}
                  </span>
                </div>

                <div className="sl-card-fields">
                  <div className="sl-form-group">
                    <label>Título de la Obra</label>
                    <input
                      type="text"
                      value={art.Title}
                      onChange={(e) => handleUpdateArt(idx, { Title: e.target.value })}
                      placeholder="Ej. Headshot, Full Body, Book Cover"
                    />
                  </div>

                  <div className="sl-form-row">
                    <div className="sl-form-group">
                      <label>Precio USD ($)</label>
                      <input
                        type="number"
                        min="0"
                        value={art.PriceUsd}
                        onChange={(e) => handleUpdateArt(idx, { PriceUsd: Number(e.target.value) })}
                      />
                    </div>
                    <div className="sl-form-group">
                      <label>Precio MXN ($)</label>
                      <input
                        type="number"
                        min="0"
                        value={art.PriceMxn}
                        onChange={(e) => handleUpdateArt(idx, { PriceMxn: Number(e.target.value) })}
                      />
                    </div>
                  </div>

                  <div className="sl-form-group">
                    <label>URL / Ruta de la Imagen</label>
                    <input
                      type="text"
                      value={art.MediaUrl}
                      onChange={(e) => handleUpdateArt(idx, { MediaUrl: e.target.value })}
                      placeholder="/sunlight-media/nombre-imagen.jpeg o https://..."
                    />
                  </div>

                  <div className="sl-form-group">
                    <label>Descripción / Detalles para Cotización</label>
                    <input
                      type="text"
                      value={art.Description || ''}
                      onChange={(e) => handleUpdateArt(idx, { Description: e.target.value })}
                      placeholder="Ej. Ilustración completa con fondo..."
                    />
                  </div>

                  {/* Internal Checkmark for Vinyl Disc Mode */}
                  <div className="sl-form-group sl-checkmark-group">
                    <label className="sl-custom-checkbox-label">
                      <input
                        type="checkbox"
                        checked={art.HasVinylDisc === true}
                        onChange={(e) => handleUpdateArt(idx, { HasVinylDisc: e.target.checked })}
                      />
                      <span className="sl-checkbox-text">
                        <strong>Modo de Disco de Vinilo</strong>
                        <small>
                          {art.HasVinylDisc
                            ? 'Activo: Al pasar el cursor, el disco de vinilo sale de la funda.'
                            : 'Inactivo: Se muestra como portada o ilustración fija sin disco deslizable.'}
                        </small>
                      </span>
                    </label>
                  </div>

                  <div className="sl-card-footer">
                    <button
                      type="button"
                      className="sl-btn-delete"
                      onClick={() => handleRemoveArt(idx)}
                      title="Eliminar obra"
                    >
                      Eliminar Pieza
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Content Section: Cassettes & Music */}
      {activeTab === 'cassettes' && (
        <div className="sl-tab-content cassettes-tab">
          <div className="sl-tab-subbar">
            <div>
              <h3 className="sl-subheading">Gestor de Torre de Cassettes (Caras A y B)</h3>
              <p className="sl-subtext">
                Las canciones se compilan de a dos por cassette. El diseño soporta hasta 10 cintas físicas (20 canciones) y despliega automáticamente la flecha de navegación al superar las 10 cintas.
              </p>
            </div>
            <button
              type="button"
              className="sl-btn-add"
              onClick={handleAddCassette}
            >
              + Agregar Nuevo Cassette (Caras A y B)
            </button>
          </div>

          <div className="sl-cassettes-list">
            {Array.from({ length: totalTapesCount }).map((_, tapeIdx) => {
              const tapeNumber = tapeIdx + 1;
              const trackAIdx = tapeIdx * 2;
              const trackBIdx = tapeIdx * 2 + 1;
              const trackA = musicList[trackAIdx];
              const trackB = musicList[trackBIdx];

              const currentTapeTitle =
                trackA?.CassetteTitle || trackB?.CassetteTitle || `Tape ${String(tapeNumber).padStart(2, '0')}`;

              return (
                <div key={`tape-editor-${tapeNumber}`} className="sl-tape-editor-card">
                  {/* Tape Spool Header */}
                  <div className="sl-tape-editor-header">
                    <div className="sl-tape-badge">
                      <span className="sl-tape-num">CINTA {String(tapeNumber).padStart(2, '0')}</span>
                      <span className="sl-tape-slot-info">Slot #{tapeNumber}</span>
                    </div>

                    <div className="sl-tape-title-field">
                      <label>Nombre del Cassette</label>
                      <input
                        type="text"
                        value={currentTapeTitle}
                        onChange={(e) => handleUpdateTapeTitle(tapeIdx, e.target.value)}
                        placeholder={`Ej. Tape ${tapeNumber}: Lo-Fi Sessions`}
                      />
                    </div>

                    <button
                      type="button"
                      className="sl-btn-remove-tape"
                      onClick={() => handleRemoveCassette(tapeIdx)}
                      title="Eliminar Cassette completo"
                    >
                      Eliminar Cinta
                    </button>
                  </div>

                  {/* Tape Dual Sides Grid (Cara A y Cara B) */}
                  <div className="sl-tape-sides-grid">
                    {/* Side A */}
                    {trackA && (
                      <div className="sl-side-box side-a">
                        <div className="sl-side-box-header">
                          <span className="sl-side-pill a">CARA A</span>
                          <span className="sl-side-track-name">{trackA.Title}</span>
                        </div>

                        <div className="sl-side-inputs">
                          <div className="sl-form-group">
                            <label>Título de la Canción (Cara A)</label>
                            <input
                              type="text"
                              value={trackA.Title}
                              onChange={(e) => handleUpdateTrack(trackAIdx, { Title: e.target.value })}
                            />
                          </div>

                          <div className="sl-form-row">
                            <div className="sl-form-group">
                              <label>Precio USD ($)</label>
                              <input
                                type="number"
                                min="0"
                                value={trackA.PriceUsd}
                                onChange={(e) =>
                                  handleUpdateTrack(trackAIdx, { PriceUsd: Number(e.target.value) })
                                }
                              />
                            </div>
                            <div className="sl-form-group">
                              <label>Precio MXN ($)</label>
                              <input
                                type="number"
                                min="0"
                                value={trackA.PriceMxn}
                                onChange={(e) =>
                                  handleUpdateTrack(trackAIdx, { PriceMxn: Number(e.target.value) })
                                }
                              />
                            </div>
                          </div>

                          <div className="sl-form-group">
                            <label>URL / Ruta del Audio (.mp3)</label>
                            <input
                              type="text"
                              value={trackA.AudioUrl || trackA.MediaUrl}
                              onChange={(e) =>
                                handleUpdateTrack(trackAIdx, {
                                  AudioUrl: e.target.value,
                                  MediaUrl: e.target.value,
                                })
                              }
                              placeholder="/sunlight-media/nombre.mp3 o URL"
                            />
                          </div>

                          <div className="sl-form-group">
                            <label>Descripción para el Cotizador</label>
                            <input
                              type="text"
                              value={trackA.Description || ''}
                              onChange={(e) =>
                                handleUpdateTrack(trackAIdx, { Description: e.target.value })
                              }
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Side B */}
                    {trackB && (
                      <div className="sl-side-box side-b">
                        <div className="sl-side-box-header">
                          <span className="sl-side-pill b">CARA B</span>
                          <span className="sl-side-track-name">{trackB.Title}</span>
                        </div>

                        <div className="sl-side-inputs">
                          <div className="sl-form-group">
                            <label>Título de la Canción (Cara B)</label>
                            <input
                              type="text"
                              value={trackB.Title}
                              onChange={(e) => handleUpdateTrack(trackBIdx, { Title: e.target.value })}
                            />
                          </div>

                          <div className="sl-form-row">
                            <div className="sl-form-group">
                              <label>Precio USD ($)</label>
                              <input
                                type="number"
                                min="0"
                                value={trackB.PriceUsd}
                                onChange={(e) =>
                                  handleUpdateTrack(trackBIdx, { PriceUsd: Number(e.target.value) })
                                }
                              />
                            </div>
                            <div className="sl-form-group">
                              <label>Precio MXN ($)</label>
                              <input
                                type="number"
                                min="0"
                                value={trackB.PriceMxn}
                                onChange={(e) =>
                                  handleUpdateTrack(trackBIdx, { PriceMxn: Number(e.target.value) })
                                }
                              />
                            </div>
                          </div>

                          <div className="sl-form-group">
                            <label>URL / Ruta del Audio (.mp3)</label>
                            <input
                              type="text"
                              value={trackB.AudioUrl || trackB.MediaUrl}
                              onChange={(e) =>
                                handleUpdateTrack(trackBIdx, {
                                  AudioUrl: e.target.value,
                                  MediaUrl: e.target.value,
                                })
                              }
                              placeholder="/sunlight-media/nombre.mp3 o URL"
                            />
                          </div>

                          <div className="sl-form-group">
                            <label>Descripción para el Cotizador</label>
                            <input
                              type="text"
                              value={trackB.Description || ''}
                              onChange={(e) =>
                                handleUpdateTrack(trackBIdx, { Description: e.target.value })
                              }
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Sticky Bottom Save Action Bar */}
      <div className="sl-editor-sticky-footer">
        <div className="sl-footer-info">
          <span>Configuración activa:</span>
          <strong>{artList.length} obras de arte</strong>
          <span>·</span>
          <strong>{totalTapesCount} cassettes ({musicList.length} canciones)</strong>
        </div>

        <button
          type="button"
          className="sl-btn-save-primary"
          onClick={handleSaveAll}
          disabled={saving}
        >
          {saving ? 'Guardando en Servidor...' : 'Guardar Todo en la Nube'}
        </button>
      </div>
    </div>
  );
}
