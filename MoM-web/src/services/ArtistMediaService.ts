/**
 * Data access service for Artist Media operations.
 * Implements Constitution Brendup Title I (Art. 2.4), Title V (Art. 13), and Title VI (Art. 15).
 * Static class with pure static methods, zero throw statements, resilient local caching,
 * and accelerated Stale-While-Revalidate synchronization.
 */

import { ref, onValue, get } from 'firebase/database';
import { db } from '../firebase';
import { LocalCache } from '../utils/LocalCache';
import type { ArtistMediaBase, ArtistMediaFilter } from '../models/Artist';
import type { ResponseObject } from '../models/Response/ResponseObject';
import type { Artist } from '../data/artists';

/// <summary>
/// Static service encapsulating all data operations for artist media assets (splashes and icons).
/// Strictly declared as static with zero instance state per Constitution Brendup Art. 2.4.
/// Implements instant local caching to prevent image loss upon reloading.
/// </summary>
export class ArtistMediaService {
  /// <summary>
  /// Persistent cache key for artist media records in local storage.
  /// </summary>
  private static readonly cacheKey = 'lvx_cache_artista_medio';

  /// <summary>
  /// Accelerated REST endpoint URL for direct HTTP/2 queries.
  /// </summary>
  private static readonly restEndpoint =
    'https://multiverseofmadness21-fefd9-default-rtdb.firebaseio.com/artista_medio.json';

  /// <summary>
  /// Synchronously retrieves locally cached artist media records for instant 0ms initial render on page load/reload.
  /// </summary>
  public static GetCachedMedia(): ArtistMediaBase[] {
    return LocalCache.Get<ArtistMediaBase[]>(ArtistMediaService.cacheKey) ?? [];
  }

  /// <summary>
  /// Synchronously merges cached binary splashes and icons into the default artist roster.
  /// Eliminates image flash on page reloads.
  /// </summary>
  public static GetHydratedArtists(defaultArtists: Artist[]): Artist[] {
    const visibleArtists = defaultArtists.filter((a) => !a.hidden);
    const cached = ArtistMediaService.GetCachedMedia();
    if (cached.length === 0) return visibleArtists;

    const mediaMap = new Map(cached.map((m) => [m.Key, m]));
    return visibleArtists.map((a) => {
      const found = mediaMap.get(a.handle);
      if (found) {
        return {
          ...a,
          splash: found.SplashBinary ?? a.splash,
          icon: found.IconBinary ?? a.icon,
        };
      }
      return a;
    });
  }

  /// <summary>
  /// Maps a raw database snapshot item (from artista_medio) into a strongly typed ArtistMediaBase entity.
  /// </summary>
  private static MapDatabaseRecord(key: string, record: Record<string, unknown>): ArtistMediaBase {
    const rawId = record['artista_medio_id'];
    const rawKey = record['artista_medio_key'] ?? key;
    const rawName = record['artista_medio_nombre'] ?? key;
    const rawCardHome = record['artista_medio_card_home_binario'] ?? null;
    const rawSplash =
      record['artista_medio_splash_binario'] ??
      rawCardHome ??
      null;
    const rawIcon = record['artista_medio_icono_binario'] ?? null;
    const rawLogo =
      record['artista_medio_logo_binario'] ??
      record['artista_medio_emblema_binario'] ??
      null;
    const rawActive = record['artista_medio_activo'] ?? true;
    const rawDeleted = record['artista_medio_borrado'] ?? false;

    return {
      ArtistMediaID: typeof rawId === 'number' ? rawId : null,
      Key: typeof rawKey === 'string' ? rawKey : String(rawKey),
      Name: typeof rawName === 'string' ? rawName : String(rawName),
      SplashBinary: typeof rawSplash === 'string' ? rawSplash : null,
      CardHomeBinary:
        typeof rawCardHome === 'string'
          ? rawCardHome
          : typeof rawSplash === 'string'
            ? rawSplash
            : null,
      IconBinary: typeof rawIcon === 'string' ? rawIcon : null,
      LogoBinary: typeof rawLogo === 'string' ? rawLogo : null,
      IsActive: typeof rawActive === 'boolean' ? rawActive : Boolean(rawActive),
      IsDeleted: typeof rawDeleted === 'boolean' ? rawDeleted : Boolean(rawDeleted),
    };
  }

  /// <summary>
  /// Converts raw database snapshot data into an ordered list of ArtistMediaBase entities.
  /// </summary>
  private static ParseSnapshotData(
    data: unknown,
    filter?: ArtistMediaFilter
  ): ArtistMediaBase[] {
    if (!data || typeof data !== 'object') {
      return [];
    }

    const items: ArtistMediaBase[] = [];
    if (Array.isArray(data)) {
      data.forEach((entry, index) => {
        if (entry && typeof entry === 'object') {
          items.push(
            ArtistMediaService.MapDatabaseRecord(
              String(index),
              entry as Record<string, unknown>
            )
          );
        }
      });
    } else {
      Object.entries(data as Record<string, unknown>).forEach(([key, val]) => {
        if (val && typeof val === 'object') {
          items.push(
            ArtistMediaService.MapDatabaseRecord(key, val as Record<string, unknown>)
          );
        }
      });
    }

    const includeDeleted = filter?.IncludeDeleted === true;
    const onlyActive = filter?.OnlyActive !== false;

    return items.filter((item) => {
      if (!includeDeleted && item.IsDeleted === true) return false;
      if (onlyActive && item.IsActive === false) return false;
      return true;
    });
  }

  /// <summary>
  /// Asynchronously syncs fresh artist media data from REST endpoint in the background without blocking.
  /// </summary>
  private static TriggerBackgroundSync(filter?: ArtistMediaFilter): void {
    if (typeof fetch === 'undefined') return;

    fetch(ArtistMediaService.restEndpoint)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && typeof data === 'object') {
          const items = ArtistMediaService.ParseSnapshotData(data, filter);
          if (items.length > 0) {
            LocalCache.Set(ArtistMediaService.cacheKey, items);
          }
        }
      })
      .catch(() => {
        // Zero throw per Art. 15.2
      });
  }

  /// <summary>
  /// Retrieves the list of artist media records once from Firebase RTDB or instant local cache.
  /// Returns a standardized ResponseObject per Constitution Brendup Art. 8.
  /// Zero throw statements are used; errors are caught and safely encapsulated.
  /// </summary>
  public static async List(
    filter?: ArtistMediaFilter
  ): Promise<ResponseObject<ArtistMediaBase[]>> {
    // Check instant synchronous cache first
    const cached = ArtistMediaService.GetCachedMedia();
    if (cached.length > 0) {
      ArtistMediaService.TriggerBackgroundSync(filter);
      return {
        CodeNumber: 200,
        CodeName: 'OK',
        Message: 'Served instantly from persistent cache',
        ErrorNumber: null,
        ServerName: 'local-cache',
        Result: cached,
      };
    }

    try {
      const mediaRef = ref(db, 'artista_medio');
      const snapshot = await get(mediaRef);

      if (snapshot.exists()) {
        const parsed = ArtistMediaService.ParseSnapshotData(snapshot.val(), filter);
        if (parsed.length > 0) {
          LocalCache.Set(ArtistMediaService.cacheKey, parsed);
        }
        return {
          CodeNumber: 200,
          CodeName: 'OK',
          Message: null,
          ErrorNumber: null,
          ServerName: 'firebase-rtdb',
          Result: parsed,
        };
      }

      return {
        CodeNumber: 404,
        CodeName: 'NotFound',
        Message: 'No artist media found in database',
        ErrorNumber: 404,
        ServerName: 'firebase-rtdb',
        Result: [],
      };
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      return {
        CodeNumber: 500,
        CodeName: 'InternalServerError',
        Message: errorMessage,
        ErrorNumber: 500,
        ServerName: 'firebase-rtdb',
        Result: [],
      };
    }
  }

  /// <summary>
  /// Subscribes to real-time changes on the artista_medio database node with Stale-While-Revalidate caching.
  /// Immediately emits cached data (0ms latency on reload), while keeping real-time listeners active.
  /// Returns an unsubscribe cleanup callback function.
  /// Strictly catches errors with zero throw statements (Art. 15.2).
  /// </summary>
  public static Subscribe(
    onData: (response: ResponseObject<ArtistMediaBase[]>) => void,
    filter?: ArtistMediaFilter
  ): () => void {
    // 1. Immediately emit cached data if available for instant 0ms render
    const cached = ArtistMediaService.GetCachedMedia();
    if (cached.length > 0) {
      onData({
        CodeNumber: 200,
        CodeName: 'OK',
        Message: 'Served instantly from persistent cache',
        ErrorNumber: null,
        ServerName: 'local-cache',
        Result: cached,
      });
    }

    // 2. Parallel fast REST accelerator to beat potential WebSocket connection latency
    ArtistMediaService.TriggerBackgroundSync(filter);

    try {
      const mediaRef = ref(db, 'artista_medio');
      const unsubscribe = onValue(
        mediaRef,
        (snapshot) => {
          if (snapshot.exists()) {
            const items = ArtistMediaService.ParseSnapshotData(snapshot.val(), filter);
            if (items.length > 0) {
              LocalCache.Set(ArtistMediaService.cacheKey, items);
            }
            onData({
              CodeNumber: 200,
              CodeName: 'OK',
              Message: null,
              ErrorNumber: null,
              ServerName: 'firebase-rtdb',
              Result: items,
            });
          } else if (cached.length === 0) {
            onData({
              CodeNumber: 404,
              CodeName: 'NotFound',
              Message: 'No artist media found in database',
              ErrorNumber: 404,
              ServerName: 'firebase-rtdb',
              Result: [],
            });
          }
        },
        (error) => {
          if (cached.length === 0) {
            onData({
              CodeNumber: 503,
              CodeName: 'ServiceUnavailable',
              Message: error.message,
              ErrorNumber: 503,
              ServerName: 'firebase-rtdb',
              Result: [],
            });
          }
        }
      );

      return () => {
        try {
          unsubscribe();
        } catch {
          // Zero throw per Art. 15.2
        }
      };
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      if (cached.length === 0) {
        onData({
          CodeNumber: 500,
          CodeName: 'InternalServerError',
          Message: errorMessage,
          ErrorNumber: 500,
          ServerName: 'local-service',
          Result: [],
        });
      }
      return () => {};
    }
  }

  /// <summary>
  /// Finds an artist media record by their unique key (e.g. "luis-m", "specku", "sam").
  /// Returns a ResponseObject with the entity or NotFound (Art. 9).
  /// </summary>
  public static async Find(key: string): Promise<ResponseObject<ArtistMediaBase>> {
    try {
      const listResponse = await ArtistMediaService.List();
      const items = listResponse.Result ?? [];
      const item = items.find((candidate) => candidate.Key === key);

      if (item) {
        return {
          CodeNumber: 302,
          CodeName: 'Found',
          Message: null,
          ErrorNumber: null,
          ServerName: 'firebase-rtdb',
          Result: item,
        };
      }

      return {
        CodeNumber: 404,
        CodeName: 'NotFound',
        Message: `Artist media with key '${key}' not found`,
        ErrorNumber: 404,
        ServerName: 'firebase-rtdb',
        Result: null,
      };
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      return {
        CodeNumber: 500,
        CodeName: 'InternalServerError',
        Message: errorMessage,
        ErrorNumber: 500,
        ServerName: 'firebase-rtdb',
        Result: null,
      };
    }
  }
}
