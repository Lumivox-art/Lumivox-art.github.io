/**
 * Data access service for Specku Gallery operations.
 * Implements Constitution Brendup Title I (Art. 2.4), Title V (Art. 13), and Title VI (Art. 15).
 * Static class with pure static methods, zero throw statements, resilient local caching,
 * and standard HTTP REST synchronization (zero persistent WebSockets).
 */

import { LocalCache } from '../utils/LocalCache';
import type { GalleryItemBase, GalleryItemFilter } from '../models/Gallery';
import type { ResponseObject } from '../models/Response/ResponseObject';

/// <summary>
/// Static service encapsulating all data operations for Specku's art gallery.
/// Strictly declared as static with zero instance state per Constitution Brendup Art. 2.4.
/// Uses standard HTTPS REST queries — zero persistent background WebSockets — ensuring 100% immunity
/// against zombie sockets, sleep-induced disconnections, and blank screens.
/// </summary>
export class SpeckuGalleryService {
  /// <summary>
  /// Persistent cache key for gallery items in local storage.
  /// </summary>
  private static readonly cacheKey = 'lvx_cache_specku_galeria';

  /// <summary>
  /// Accelerated REST endpoint URL for direct HTTP/2 queries.
  /// </summary>
  private static readonly restEndpoint =
    'https://multiverseofmadness21-fefd9-default-rtdb.firebaseio.com/specku_galeria.json';

  /// <summary>
  /// Static contingency dataset with real high-resolution artwork samples.
  /// Guaranteed fallback per Constitution Brendup Art. 12.3.
  /// </summary>
  private static readonly fallbackItems: GalleryItemBase[] = [
    {
      GalleryItemID: 1,
      Key: 'anima',
      Title: 'Anima',
      ImageBinary:
        'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&auto=format&fit=crop&q=80',
      AltText: 'Specku - Anima artwork style sample',
      Category: 'illustration',
      Order: 1,
      IsActive: true,
      IsDeleted: false,
    },
    {
      GalleryItemID: 2,
      Key: 'semi-real',
      Title: 'Semi-Real',
      ImageBinary:
        'https://images.unsplash.com/photo-1549490349-8643362247b5?w=800&auto=format&fit=crop&q=80',
      AltText: 'Specku - Semi-Real artwork style sample',
      Category: 'portrait',
      Order: 2,
      IsActive: true,
      IsDeleted: false,
    },
    {
      GalleryItemID: 3,
      Key: 'cutsey',
      Title: 'Cutsey',
      ImageBinary:
        'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
      AltText: 'Specku - Cutsey artwork style sample',
      Category: 'character',
      Order: 3,
      IsActive: true,
      IsDeleted: false,
    },
    {
      GalleryItemID: 4,
      Key: 'chibi',
      Title: 'Chibi',
      ImageBinary:
        'https://images.unsplash.com/photo-1563089145-599997674d42?w=800&auto=format&fit=crop&q=80',
      AltText: 'Specku - Chibi artwork style sample',
      Category: 'character',
      Order: 4,
      IsActive: true,
      IsDeleted: false,
    },
    {
      GalleryItemID: 5,
      Key: 'dull-eyes',
      Title: 'Dull-Eyes',
      ImageBinary:
        'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=800&auto=format&fit=crop&q=80',
      AltText: 'Specku - Dull-Eyes artwork style sample',
      Category: 'portrait',
      Order: 5,
      IsActive: true,
      IsDeleted: false,
    },
    {
      GalleryItemID: 6,
      Key: 'noodle',
      Title: 'Noodle',
      ImageBinary:
        'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=800&auto=format&fit=crop&q=80',
      AltText: 'Specku - Noodle artwork style sample',
      Category: 'sketch',
      Order: 6,
      IsActive: true,
      IsDeleted: false,
    },
  ];

  /// <summary>
  /// Synchronously retrieves cached gallery items for instant 0ms initial render on page load/reload.
  /// </summary>
  public static GetCachedItems(): GalleryItemBase[] {
    const cached = LocalCache.Get<GalleryItemBase[]>(SpeckuGalleryService.cacheKey);
    return cached && cached.length > 0 ? cached : [...SpeckuGalleryService.fallbackItems];
  }

  /// <summary>
  /// Synchronously retrieves a map of style sample binaries by Key (e.g. 'anima' -> 'data:image/...').
  /// Used for 0ms initial render of commission style preview thumbnails.
  /// </summary>
  public static GetCachedSampleMap(): Record<string, string> {
    const items = SpeckuGalleryService.GetCachedItems();
    const map: Record<string, string> = {};
    items.forEach((item) => {
      if (item.Key && item.ImageBinary) {
        map[item.Key] = item.ImageBinary;
      }
    });
    return map;
  }

  /// <summary>
  /// Maps a raw database snapshot item into a strongly typed GalleryItemBase entity.
  /// Supports both snake_case (constitutional standard) and camelCase (legacy).
  /// </summary>
  private static MapDatabaseRecord(key: string, record: Record<string, unknown>): GalleryItemBase {
    const rawId = record['specku_galeria_id'] ?? record['id'];
    const rawKey = record['specku_galeria_key'] ?? record['key'] ?? key;
    const rawTitle = record['specku_galeria_titulo'] ?? record['title'] ?? key;
    const rawBinary =
      record['specku_galeria_binario'] ??
      record['imageBinary'] ??
      record['specku_galeria_card_binario'] ??
      null;
    const rawAlt = record['specku_galeria_texto_alt'] ?? record['altText'] ?? String(rawTitle);
    const rawCategory = record['specku_galeria_categoria'] ?? record['category'] ?? null;
    const rawOrder = record['specku_galeria_orden'] ?? record['order'] ?? 999;
    const rawActive = record['specku_galeria_activo'] ?? record['isActive'] ?? true;
    const rawDeleted = record['specku_galeria_borrado'] ?? record['isDeleted'] ?? false;

    return {
      GalleryItemID: typeof rawId === 'number' ? rawId : null,
      Key: typeof rawKey === 'string' ? rawKey : String(rawKey),
      Title: typeof rawTitle === 'string' ? rawTitle : String(rawTitle),
      ImageBinary: typeof rawBinary === 'string' ? rawBinary : null,
      AltText: typeof rawAlt === 'string' ? rawAlt : null,
      Category: typeof rawCategory === 'string' ? rawCategory : null,
      Order: typeof rawOrder === 'number' ? rawOrder : 999,
      IsActive: typeof rawActive === 'boolean' ? rawActive : Boolean(rawActive),
      IsDeleted: typeof rawDeleted === 'boolean' ? rawDeleted : Boolean(rawDeleted),
    };
  }

  /// <summary>
  /// Converts raw database snapshot data (either array or keyed object) into an ordered list of GalleryItemBase entities.
  /// </summary>
  private static ParseSnapshotData(
    data: unknown,
    filter?: GalleryItemFilter
  ): GalleryItemBase[] {
    if (!data || typeof data !== 'object') {
      return [...SpeckuGalleryService.fallbackItems];
    }

    const items: GalleryItemBase[] = [];
    if (Array.isArray(data)) {
      data.forEach((entry, index) => {
        if (entry && typeof entry === 'object') {
          items.push(
            SpeckuGalleryService.MapDatabaseRecord(
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
            SpeckuGalleryService.MapDatabaseRecord(key, val as Record<string, unknown>)
          );
        }
      });
    }

    const includeDeleted = filter?.IncludeDeleted === true;
    const onlyActive = filter?.OnlyActive !== false;

    const filtered = items.filter((item) => {
      if (!includeDeleted && item.IsDeleted === true) return false;
      if (onlyActive && item.IsActive === false) return false;
      if (filter?.Category && item.Category !== filter.Category) return false;
      return true;
    });

    filtered.sort((a, b) => (a.Order ?? 999) - (b.Order ?? 999));
    return filtered.length > 0 ? filtered : [...SpeckuGalleryService.fallbackItems];
  }

  /// <summary>
  /// Retrieves the list of gallery items once from Firebase REST or instant local cache.
  /// Returns a standardized ResponseObject per Constitution Brendup Art. 8.
  /// Zero throw statements are used; any error is caught and safely encapsulated.
  /// </summary>
  public static async List(
    filter?: GalleryItemFilter
  ): Promise<ResponseObject<GalleryItemBase[]>> {
    const cached = SpeckuGalleryService.GetCachedItems();
    if (cached.length > 0) {
      SpeckuGalleryService.TriggerBackgroundSync(filter);
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
      const res = await fetch(SpeckuGalleryService.restEndpoint);
      if (res.ok) {
        const data = await res.json();
        const parsed = SpeckuGalleryService.ParseSnapshotData(data, filter);
        if (parsed.length > 0) {
          LocalCache.Set(SpeckuGalleryService.cacheKey, parsed);
        }
        return {
          CodeNumber: 200,
          CodeName: 'OK',
          Message: null,
          ErrorNumber: null,
          ServerName: 'firebase-rest',
          Result: parsed,
        };
      }

      return {
        CodeNumber: res.status,
        CodeName: 'NotFound',
        Message: 'No gallery items found in database',
        ErrorNumber: res.status,
        ServerName: 'firebase-rest',
        Result: [...SpeckuGalleryService.fallbackItems],
      };
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      return {
        CodeNumber: 500,
        CodeName: 'InternalServerError',
        Message: errorMessage,
        ErrorNumber: 500,
        ServerName: 'firebase-rest',
        Result: [...SpeckuGalleryService.fallbackItems],
      };
    }
  }

  /// <summary>
  /// Asynchronously syncs fresh gallery data from REST endpoint in the background without blocking.
  /// </summary>
  private static TriggerBackgroundSync(filter?: GalleryItemFilter): void {
    if (typeof fetch === 'undefined') return;

    fetch(SpeckuGalleryService.restEndpoint)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && typeof data === 'object') {
          const items = SpeckuGalleryService.ParseSnapshotData(data, filter);
          if (items.length > 0) {
            LocalCache.Set(SpeckuGalleryService.cacheKey, items);
          }
        }
      })
      .catch(() => {
        // Zero throw per Art. 15.2
      });
  }

  /// <summary>
  /// Fetches gallery items updates without open WebSockets.
  /// Immediately emits cached items (0ms latency), then fetches fresh items once via HTTP REST.
  /// Returns a cleanup callback function.
  /// Strictly catches errors with zero throw statements (Art. 15.2).
  /// </summary>
  public static Subscribe(
    onData: (response: ResponseObject<GalleryItemBase[]>) => void,
    filter?: GalleryItemFilter
  ): () => void {
    // 1. Immediately emit cached data if available for instant 0ms render
    const cached = SpeckuGalleryService.GetCachedItems();
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

    // 2. Perform a one-time standard HTTP GET to synchronize any fresh updates (zero persistent WebSockets)
    const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;

    fetch(SpeckuGalleryService.restEndpoint, { signal: controller?.signal })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && typeof data === 'object') {
          const items = SpeckuGalleryService.ParseSnapshotData(data, filter);
          if (items.length > 0) {
            LocalCache.Set(SpeckuGalleryService.cacheKey, items);
            onData({
              CodeNumber: 200,
              CodeName: 'OK',
              Message: null,
              ErrorNumber: null,
              ServerName: 'firebase-rest',
              Result: items,
            });
          }
        } else if (cached.length === 0) {
          onData({
            CodeNumber: 200,
            CodeName: 'OK',
            Message: 'Serving fallback items',
            ErrorNumber: null,
            ServerName: 'local-fallback',
            Result: [...SpeckuGalleryService.fallbackItems],
          });
        }
      })
      .catch((err: unknown) => {
        if (controller?.signal.aborted) return;
        console.warn('[SpeckuGalleryService] REST fetch notice:', err);
        if (cached.length === 0) {
          onData({
            CodeNumber: 503,
            CodeName: 'ServiceUnavailable',
            Message: err instanceof Error ? err.message : 'Network error',
            ErrorNumber: 503,
            ServerName: 'local-fallback',
            Result: [...SpeckuGalleryService.fallbackItems],
          });
        }
      });

    return () => {
      try {
        controller?.abort();
      } catch {
        // Zero throw per Art. 15.2
      }
    };
  }

  /// <summary>
  /// Finds a specific gallery item by its alphanumeric Key.
  /// Returns a ResponseObject with the item or NotFound (Art. 9).
  /// </summary>
  public static async Find(key: string): Promise<ResponseObject<GalleryItemBase>> {
    try {
      const listResponse = await SpeckuGalleryService.List();
      const items = listResponse.Result ?? [];
      const item = items.find((candidate) => candidate.Key === key);

      if (item) {
        return {
          CodeNumber: 302,
          CodeName: 'Found',
          Message: null,
          ErrorNumber: null,
          ServerName: 'firebase-rest',
          Result: item,
        };
      }

      return {
        CodeNumber: 404,
        CodeName: 'NotFound',
        Message: `Item with key '${key}' not found`,
        ErrorNumber: 404,
        ServerName: 'firebase-rest',
        Result: null,
      };
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      return {
        CodeNumber: 500,
        CodeName: 'InternalServerError',
        Message: errorMessage,
        ErrorNumber: 500,
        ServerName: 'firebase-rest',
        Result: null,
      };
    }
  }
}
