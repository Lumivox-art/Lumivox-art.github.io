/**
 * Data access service for Sunlight Blue 90's Record Label Commissions & Music Operations.
 * Implements Constitution Brendup Title I (Art. 2.4), Title V (Art. 13), and Title VI (Art. 15).
 * Static class with pure static methods, zero throw statements, resilient local caching,
 * and reliable standard HTTP REST synchronization.
 */

import { LocalCache } from '../utils/LocalCache';
import type { SunlightSampleBase, SunlightCompiledCassette } from '../models/Sunlight';
import type { ResponseObject } from '../models/Response/ResponseObject';

export class SunlightCommissionsService {
  private static readonly cacheKey = 'lvx_cache_sunlight_samples_v6';
  private static readonly restEndpoint =
    'https://multiverseofmadness21-fefd9-default-rtdb.firebaseio.com/sunlight_samples.json';

  /**
   * Static contingency dataset with real high-resolution artwork samples and audio metadata.
   */
  private static readonly fallbackItems: SunlightSampleBase[] = [
    {
      SampleID: 1,
      Key: 'headshot',
      Title: 'Headshot',
      Category: 'digital_art',
      Kind: 'cover',
      PriceUsd: 25,
      PriceMxn: 450,
      MediaUrl: '/sunlight-media/headshot.jpeg',
      Description: 'Headshot',
      HasVinylDisc: false,
      Order: 1,
      IsActive: true,
      IsDeleted: false,
    },
    {
      SampleID: 2,
      Key: 'fullbody',
      Title: 'Bust / Full body',
      Category: 'digital_art',
      Kind: 'cover',
      PriceUsd: 30,
      PriceMxn: 550,
      MediaUrl: '/sunlight-media/fullbody.jpeg',
      Description: 'Bust/Full body',
      HasVinylDisc: false,
      Order: 2,
      IsActive: true,
      IsDeleted: false,
    },
    {
      SampleID: 3,
      Key: 'illustration',
      Title: 'Illustration',
      Category: 'digital_art',
      Kind: 'cover',
      PriceUsd: 45,
      PriceMxn: 800,
      MediaUrl: '/sunlight-media/illustration.jpeg',
      Description: 'Ilustration (Starting on 45 USD / 800 MXN depending on complexity)',
      HasVinylDisc: false,
      Order: 3,
      IsActive: true,
      IsDeleted: false,
    },
    {
      SampleID: 4,
      Key: 'book-cover',
      Title: 'Book Cover',
      Category: 'digital_art',
      Kind: 'cover',
      PriceUsd: 45,
      PriceMxn: 800,
      MediaUrl: '/sunlight-media/book-cover.jpeg',
      Description: 'Book Cover (Starting on 45 USD / 800 MXN depending on complexity)',
      HasVinylDisc: false,
      Order: 4,
      IsActive: true,
      IsDeleted: false,
    },
    {
      SampleID: 5,
      Key: 'instrumental',
      Title: 'Instrumental',
      Category: 'custom_song',
      Kind: 'music',
      PriceUsd: 30,
      PriceMxn: 550,
      MediaUrl: '/sunlight-media/instrumental.mp3',
      AudioUrl: '/sunlight-media/instrumental.mp3',
      Description: 'Instrumental',
      Duration: '2:30',
      TrackNumber: 1,
      Order: 5,
      IsActive: true,
      IsDeleted: false,
    },
    {
      SampleID: 6,
      Key: 'vocal-with-lyrics',
      Title: 'Vocals with lyrics',
      Category: 'custom_song',
      Kind: 'music',
      PriceUsd: 55,
      PriceMxn: 1000,
      MediaUrl: '/sunlight-media/vocal-with-lyrics.mp3',
      AudioUrl: '/sunlight-media/vocal-with-lyrics.mp3',
      Description: 'Vocals with lyrics (English or Spanish)',
      Duration: '1:23',
      TrackNumber: 2,
      Order: 6,
      IsActive: true,
      IsDeleted: false,
    },
  ];

  /**
   * Synchronously retrieves cached items for instant 0ms initial render on page mount.
   */
  public static GetCachedSamples(): SunlightSampleBase[] {
    LocalCache.Remove('lvx_cache_sunlight_samples');
    LocalCache.Remove('lvx_cache_sunlight_samples_v2');
    LocalCache.Remove('lvx_cache_sunlight_samples_v3');
    LocalCache.Remove('lvx_cache_sunlight_samples_v4');
    LocalCache.Remove('lvx_cache_sunlight_samples_v5');
    const cached = LocalCache.Get<SunlightSampleBase[]>(SunlightCommissionsService.cacheKey);
    return cached && cached.length > 0 ? cached : SunlightCommissionsService.fallbackItems;
  }

  /**
   * Fetches latest samples from Firebase RTDB via HTTPS REST.
   */
  public static async List(): Promise<ResponseObject<SunlightSampleBase[]>> {
    try {
      const response = await fetch(SunlightCommissionsService.restEndpoint);
      if (response.ok) {
        const data = await response.json();
        if (data && typeof data === 'object') {
          const list: SunlightSampleBase[] = Object.entries(data)
            .map(([key, val]) => {
              const rec = val as Record<string, unknown>;
              return {
                SampleID: typeof rec.SampleID === 'number' ? rec.SampleID : null,
                Key: String(rec.Key || key),
                Title: String(rec.Title || key),
                Category: (rec.Category as 'digital_art' | 'custom_song') || 'digital_art',
                Kind: (rec.Kind as 'cover' | 'music') || 'cover',
                PriceUsd: Number(rec.PriceUsd) || 0,
                PriceMxn: Number(rec.PriceMxn) || 0,
                MediaUrl: String(rec.MediaUrl || ''),
                ImageBinary: typeof rec.ImageBinary === 'string' ? rec.ImageBinary : null,
                AudioUrl: typeof rec.AudioUrl === 'string' ? rec.AudioUrl : String(rec.MediaUrl || ''),
                Description: typeof rec.Description === 'string' ? rec.Description : null,
                Duration: typeof rec.Duration === 'string' ? rec.Duration : null,
                TrackNumber: typeof rec.TrackNumber === 'number' ? rec.TrackNumber : null,
                HasVinylDisc: rec.HasVinylDisc === true || rec.HasVinylDisc === 'true',
                CassetteTitle: typeof rec.CassetteTitle === 'string' ? rec.CassetteTitle : null,
                CassetteIndex: typeof rec.CassetteIndex === 'number' ? rec.CassetteIndex : null,
                Side: (rec.Side as 'A' | 'B') || null,
                Order: Number(rec.Order) || 99,
                IsActive: rec.IsActive !== false,
                IsDeleted: rec.IsDeleted === true,
              };
            })
            .filter((item) => item.IsActive && !item.IsDeleted)
            .sort((a, b) => a.Order - b.Order);

          if (list.length > 0) {
            LocalCache.Set(SunlightCommissionsService.cacheKey, list);
            return {
              CodeNumber: 200,
              CodeName: 'OK',
              Message: null,
              ErrorNumber: null,
              ServerName: 'firebase-rest',
              Result: list,
            };
          }
        }
      }

      // Fallback
      return {
        CodeNumber: 200,
        CodeName: 'FallbackSuccess',
        Message: null,
        ErrorNumber: null,
        ServerName: 'local-contingency',
        Result: SunlightCommissionsService.GetCachedSamples(),
      };
    } catch {
      return {
        CodeNumber: 200,
        CodeName: 'CacheFallback',
        Message: null,
        ErrorNumber: null,
        ServerName: 'local-cache',
        Result: SunlightCommissionsService.GetCachedSamples(),
      };
    }
  }

  /**
   * Realtime polling / wakeup subscription with instant callback.
   */
  public static Subscribe(callback: (response: ResponseObject<SunlightSampleBase[]>) => void): () => void {
    // Immediate callback with cached data
    callback({
      CodeNumber: 200,
      CodeName: 'InstantCache',
      Message: null,
      ErrorNumber: null,
      ServerName: 'local-cache',
      Result: SunlightCommissionsService.GetCachedSamples(),
    });

    let active = true;
    SunlightCommissionsService.List().then((res) => {
      if (active && res.Result) {
        callback(res);
      }
    });

    return () => {
      active = false;
    };
  }

  /**
   * Updates HasVinylDisc flag for a specific sample in Firebase RTDB and LocalCache.
   */
  public static async SetDiscMode(key: string, hasVinylDisc: boolean): Promise<ResponseObject<boolean>> {
    try {
      // 1. Update cache
      const cached = SunlightCommissionsService.GetCachedSamples();
      const updated = cached.map((item) =>
        item.Key === key ? { ...item, HasVinylDisc: hasVinylDisc } : item
      );
      LocalCache.Set(SunlightCommissionsService.cacheKey, updated);

      // 2. Update remote RTDB
      const resp = await fetch(SunlightCommissionsService.restEndpoint);
      if (resp.ok) {
        const data = await resp.json();
        if (Array.isArray(data)) {
          const idx = data.findIndex((item) => item && (item.Key === key || item.Title === key));
          if (idx >= 0) {
            const patchUrl = `https://multiverseofmadness21-fefd9-default-rtdb.firebaseio.com/sunlight_samples/${idx}/HasVinylDisc.json`;
            await fetch(patchUrl, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(hasVinylDisc),
            });
          }
        } else if (data && typeof data === 'object') {
          const entry = Object.entries(data).find(
            ([_, v]) => (v as Record<string, unknown>).Key === key
          );
          if (entry) {
            const patchUrl = `https://multiverseofmadness21-fefd9-default-rtdb.firebaseio.com/sunlight_samples/${entry[0]}/HasVinylDisc.json`;
            await fetch(patchUrl, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(hasVinylDisc),
            });
          }
        }
      }

      return {
        CodeNumber: 200,
        CodeName: 'OK',
        Message: 'Modo de disco actualizado con éxito',
        ErrorNumber: null,
        ServerName: 'firebase-rest',
        Result: true,
      };
    } catch (err) {
      console.warn('SetDiscMode failed:', err);
      return {
        CodeNumber: 500,
        CodeName: 'InternalError',
        Message: err instanceof Error ? err.message : String(err),
        ErrorNumber: 500,
        ServerName: 'local-contingency',
        Result: false,
      };
    }
  }
  /**
   * Compiles flat music tracks into cassettes paired by 2 (Side A and Side B).
   * Supports 10+ cassettes seamlessly.
   */
  public static CompileCassettes(musicTracks: SunlightSampleBase[]): SunlightCompiledCassette[] {
    const activeTracks = musicTracks.filter((t) => t.Kind === 'music' && t.IsActive && !t.IsDeleted);
    const cassettes: SunlightCompiledCassette[] = [];

    for (let i = 0; i < activeTracks.length; i += 2) {
      const sideA = activeTracks[i];
      const sideB = activeTracks[i + 1] || null;
      const tapeNum = Math.floor(i / 2) + 1;
      const formattedNum = String(tapeNum).padStart(2, '0');

      const customTitle = sideA.CassetteTitle || sideB?.CassetteTitle;
      const defaultTitle = sideB
        ? `TAPE ${formattedNum}: ${sideA.Title.toUpperCase()} / ${sideB.Title.toUpperCase()}`
        : `TAPE ${formattedNum}: ${sideA.Title.toUpperCase()}`;

      cassettes.push({
        id: `tape-${tapeNum}`,
        tapeNumber: tapeNum,
        title: customTitle || defaultTitle,
        sideA: { ...sideA, Side: 'A', CassetteIndex: tapeNum },
        sideB: sideB ? { ...sideB, Side: 'B', CassetteIndex: tapeNum } : null,
      });
    }

    return cassettes;
  }

  /**
   * Persists the entire sample catalog to Firebase RTDB and LocalCache.
   */
  public static async SaveAllSamples(samples: SunlightSampleBase[]): Promise<ResponseObject<boolean>> {
    try {
      LocalCache.Set(SunlightCommissionsService.cacheKey, samples);

      const resp = await fetch(SunlightCommissionsService.restEndpoint, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(samples),
      });

      if (resp.ok) {
        return {
          CodeNumber: 200,
          CodeName: 'OK',
          Message: 'Catálogo guardado exitosamente en el servidor.',
          ErrorNumber: null,
          ServerName: 'firebase-rest',
          Result: true,
        };
      }

      return {
        CodeNumber: resp.status,
        CodeName: 'SaveFailed',
        Message: `Fallo al guardar en el servidor: HTTP ${resp.status}`,
        ErrorNumber: resp.status,
        ServerName: 'firebase-rest',
        Result: false,
      };
    } catch (err) {
      console.error('[SunlightCommissionsService] SaveAllSamples error:', err);
      return {
        CodeNumber: 500,
        CodeName: 'InternalError',
        Message: err instanceof Error ? err.message : String(err),
        ErrorNumber: 500,
        ServerName: 'local-contingency',
        Result: false,
      };
    }
  }
}
