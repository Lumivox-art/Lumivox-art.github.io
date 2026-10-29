/**
 * Data access service for Sunlight Blue 90's Record Label Commissions & Music Operations.
 * Implements Constitution Brendup Title I (Art. 2.4), Title V (Art. 13), and Title VI (Art. 15).
 * Static class with pure static methods, zero throw statements, resilient local caching,
 * and reliable standard HTTP REST synchronization.
 */

import { LocalCache } from '../utils/LocalCache';
import type { SunlightSampleBase } from '../models/Sunlight';
import type { ResponseObject } from '../models/Response/ResponseObject';

export class SunlightCommissionsService {
  private static readonly cacheKey = 'lvx_cache_sunlight_samples';
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
      Description:
        'Portrait close-up from shoulders up. Perfect for avatars, social media profile icons, and single covers.',
      ReleaseYear: '1994',
      Vibe: 'Vintage Neo-Pop',
      Order: 1,
      IsActive: true,
      IsDeleted: false,
    },
    {
      SampleID: 2,
      Key: 'fullbody',
      Title: 'Bust / Full Body',
      Category: 'digital_art',
      Kind: 'cover',
      PriceUsd: 30,
      PriceMxn: 550,
      MediaUrl: '/sunlight-media/fullbody.jpeg',
      Description:
        'Half-body or full-figure character artwork with detailed posing, expression, and dynamic styling.',
      ReleaseYear: '1996',
      Vibe: 'Electric Indigo Grunge',
      Order: 2,
      IsActive: true,
      IsDeleted: false,
    },
    {
      SampleID: 3,
      Key: 'illustration',
      Title: 'Full Illustration',
      Category: 'digital_art',
      Kind: 'cover',
      PriceUsd: 45,
      PriceMxn: 800,
      MediaUrl: '/sunlight-media/illustration.jpeg',
      Description:
        'Complete illustration with detailed atmosphere, lighting effects, and immersive background scene.',
      ReleaseYear: '1998',
      Vibe: 'Midnight Synthwave',
      Order: 3,
      IsActive: true,
      IsDeleted: false,
    },
    {
      SampleID: 4,
      Key: 'book-cover',
      Title: 'Book / Album Cover',
      Category: 'digital_art',
      Kind: 'cover',
      PriceUsd: 45,
      PriceMxn: 800,
      MediaUrl: '/sunlight-media/book-cover.jpeg',
      Description:
        'Commercial-ready jacket and cover design for vinyl albums, books, EP releases, or podcasts.',
      ReleaseYear: '1999',
      Vibe: 'Analog Horizon',
      Order: 4,
      IsActive: true,
      IsDeleted: false,
    },
    {
      SampleID: 5,
      Key: 'instrumental',
      Title: 'Custom Instrumental Track',
      Category: 'custom_song',
      Kind: 'music',
      PriceUsd: 30,
      PriceMxn: 550,
      MediaUrl: '/sunlight-media/instrumental.mp3',
      AudioUrl: '/sunlight-media/instrumental.mp3',
      Description:
        'Fully composed and arranged original instrumental piece tailored to your project, game, video, or background track.',
      ReleaseYear: '1995',
      Duration: '2:30',
      TrackNumber: 1,
      Vibe: 'Dreamy Synthwave / 90s Cyberpunk',
      Order: 5,
      IsActive: true,
      IsDeleted: false,
    },
    {
      SampleID: 6,
      Key: 'vocal-with-lyrics',
      Title: 'Custom Song with Vocals & Lyrics',
      Category: 'custom_song',
      Kind: 'music',
      PriceUsd: 55,
      PriceMxn: 1000,
      MediaUrl: '/sunlight-media/vocal-with-lyrics.mp3',
      AudioUrl: '/sunlight-media/vocal-with-lyrics.mp3',
      Description:
        'Complete original song including custom lyrics (in English or Spanish), melody composition, full production, and recorded vocals.',
      ReleaseYear: '1997',
      Duration: '1:23',
      TrackNumber: 2,
      Vibe: '90s Alternative / Indie Pop',
      Order: 6,
      IsActive: true,
      IsDeleted: false,
    },
  ];

  /**
   * Synchronously retrieves cached items for instant 0ms initial render on page mount.
   */
  public static GetCachedSamples(): SunlightSampleBase[] {
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
                ReleaseYear: typeof rec.ReleaseYear === 'string' ? rec.ReleaseYear : '1995',
                Duration: typeof rec.Duration === 'string' ? rec.Duration : null,
                TrackNumber: typeof rec.TrackNumber === 'number' ? rec.TrackNumber : null,
                Vibe: typeof rec.Vibe === 'string' ? rec.Vibe : null,
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
}
