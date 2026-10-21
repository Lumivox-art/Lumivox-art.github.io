/**
 * Data access service for Specku Gallery operations.
 * Implements Constitution Brendup Title I (Art. 2.4), Title V (Art. 13), and Title VI (Art. 15).
 * Static class with pure static methods, zero throw statements, and transactional responses.
 */

import { ref, onValue, get } from 'firebase/database';
import { db } from '../firebase';
import type { GalleryItemBase, GalleryItemFilter, ResponseObject } from '../models/Gallery';

/// <summary>
/// Static service encapsulating all data operations for Specku's art gallery.
/// Strictly declared as static with zero instance state per Constitution Brendup Art. 2.4.
/// </summary>
export class SpeckuGalleryService {
  /// <summary>
  /// Fallback static dataset used when remote database is unavailable.
  /// </summary>
  private static readonly fallbackItems: GalleryItemBase[] = [
    {
      GalleryItemID: 1,
      Key: 'anima',
      Title: 'Anima',
      ImageBinary: null,
      AltText: 'Specku - Anima style artwork',
      Category: 'Illustration',
      Order: 1,
      IsActive: true,
      IsDeleted: false,
    },
    {
      GalleryItemID: 2,
      Key: 'semi-real',
      Title: 'Semi-Real',
      ImageBinary: null,
      AltText: 'Specku - Semi-Real style artwork',
      Category: 'Illustration',
      Order: 2,
      IsActive: true,
      IsDeleted: false,
    },
    {
      GalleryItemID: 3,
      Key: 'cutsey',
      Title: 'Cutsey',
      ImageBinary: null,
      AltText: 'Specku - Cutsey style artwork',
      Category: 'Style Sample',
      Order: 3,
      IsActive: true,
      IsDeleted: false,
    },
    {
      GalleryItemID: 4,
      Key: 'chibi',
      Title: 'Chibi+',
      ImageBinary: null,
      AltText: 'Specku - Chibi+ style artwork',
      Category: 'Style Sample',
      Order: 4,
      IsActive: true,
      IsDeleted: false,
    },
    {
      GalleryItemID: 5,
      Key: 'dull-eyes',
      Title: 'Dull-Eyes',
      ImageBinary: null,
      AltText: 'Specku - Dull-Eyes style artwork',
      Category: 'Style Sample',
      Order: 5,
      IsActive: true,
      IsDeleted: false,
    },
    {
      GalleryItemID: 6,
      Key: 'noodle',
      Title: 'Noodle',
      ImageBinary: null,
      AltText: 'Specku - Noodle style artwork',
      Category: 'Style Sample',
      Order: 6,
      IsActive: true,
      IsDeleted: false,
    },
  ];

  /// <summary>
  /// Maps a raw database snapshot item (from specku_galeria or legacy Specku_Gallery)
  /// into a strongly typed GalleryItemBase entity adhering to PascalCase properties.
  /// </summary>
  private static MapDatabaseRecord(key: string, record: Record<string, unknown>): GalleryItemBase {
    // Check Spanish constitutional schema first (specku_galeria_*)
    const rawId = record['specku_galeria_id'];
    const rawKey = record['specku_galeria_key'] ?? record['id'] ?? key;
    const rawTitle = record['specku_galeria_titulo'] ?? record['title'] ?? key;
    const rawBinary =
      record['specku_galeria_binario'] ?? record['src'] ?? record['url'] ?? null;
    const rawAlt =
      record['specku_galeria_texto_alt'] ?? record['alt'] ?? rawTitle ?? 'Specku artwork';
    const rawCategory = record['specku_galeria_categoria'] ?? record['category'] ?? 'Artwork';
    const rawOrder = record['specku_galeria_orden'] ?? record['order'] ?? 999;
    const rawActive = record['specku_galeria_activo'] ?? true;
    const rawDeleted = record['specku_galeria_borrado'] ?? false;

    return {
      GalleryItemID: typeof rawId === 'number' ? rawId : null,
      Key: typeof rawKey === 'string' ? rawKey : String(rawKey),
      Title: typeof rawTitle === 'string' ? rawTitle : String(rawTitle),
      ImageBinary: typeof rawBinary === 'string' ? rawBinary : null,
      AltText: typeof rawAlt === 'string' ? rawAlt : null,
      Category: typeof rawCategory === 'string' ? rawCategory : null,
      Order: typeof rawOrder === 'number' ? rawOrder : Number(rawOrder) || 999,
      IsActive: typeof rawActive === 'boolean' ? rawActive : Boolean(rawActive),
      IsDeleted: typeof rawDeleted === 'boolean' ? rawDeleted : Boolean(rawDeleted),
    };
  }

  /// <summary>
  /// Converts raw database snapshot data into an ordered list of GalleryItemBase entities.
  /// Filters out logically deleted or inactive items unless requested by filter.
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

    // Apply filtering per Constitution Brendup Art. 4.3 & 22.2
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
  /// Retrieves the list of gallery items once from Firebase RTDB.
  /// Returns a standardized ResponseObject per Constitution Brendup Art. 8.
  /// Zero throw statements are used; any error is caught and safely encapsulated.
  /// </summary>
  public static async List(
    filter?: GalleryItemFilter
  ): Promise<ResponseObject<GalleryItemBase[]>> {
    try {
      // Query primary constitutional node: specku_galeria
      const primaryRef = ref(db, 'specku_galeria');
      const primarySnapshot = await get(primaryRef);

      if (primarySnapshot.exists()) {
        const parsed = SpeckuGalleryService.ParseSnapshotData(
          primarySnapshot.val(),
          filter
        );
        return {
          CodeNumber: 200,
          CodeName: 'OK',
          Message: null,
          ErrorNumber: null,
          ServerName: 'firebase-rtdb',
          Result: parsed,
        };
      }

      // Query fallback legacy node: Specku_Gallery
      const legacyRef = ref(db, 'Specku_Gallery');
      const legacySnapshot = await get(legacyRef);

      if (legacySnapshot.exists()) {
        const parsed = SpeckuGalleryService.ParseSnapshotData(
          legacySnapshot.val(),
          filter
        );
        return {
          CodeNumber: 302,
          CodeName: 'Found',
          Message: 'Retrieved from legacy Specku_Gallery node',
          ErrorNumber: null,
          ServerName: 'firebase-rtdb',
          Result: parsed,
        };
      }

      // Fallback defaults
      return {
        CodeNumber: 200,
        CodeName: 'OK',
        Message: 'Serving default fallback gallery items',
        ErrorNumber: null,
        ServerName: 'local-fallback',
        Result: [...SpeckuGalleryService.fallbackItems],
      };
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      return {
        CodeNumber: 500,
        CodeName: 'InternalServerError',
        Message: errorMessage,
        ErrorNumber: 500,
        ServerName: 'firebase-rtdb',
        Result: [...SpeckuGalleryService.fallbackItems],
      };
    }
  }

  /// <summary>
  /// Subscribes to real-time changes on the gallery database node.
  /// Automatically listens to specku_galeria with fallback to Specku_Gallery.
  /// Returns an unsubscribe cleanup callback function.
  /// Strictly catches errors with zero throw statements (Art. 15.2).
  /// </summary>
  public static Subscribe(
    onData: (response: ResponseObject<GalleryItemBase[]>) => void,
    filter?: GalleryItemFilter
  ): () => void {
    try {
      const primaryRef = ref(db, 'specku_galeria');
      const unsubscribePrimary = onValue(
        primaryRef,
        (snapshot) => {
          if (snapshot.exists()) {
            const items = SpeckuGalleryService.ParseSnapshotData(snapshot.val(), filter);
            onData({
              CodeNumber: 200,
              CodeName: 'OK',
              Message: null,
              ErrorNumber: null,
              ServerName: 'firebase-rtdb',
              Result: items,
            });
          } else {
            // Check legacy node if primary node is absent
            const legacyRef = ref(db, 'Specku_Gallery');
            get(legacyRef)
              .then((legacySnap) => {
                if (legacySnap.exists()) {
                  const items = SpeckuGalleryService.ParseSnapshotData(
                    legacySnap.val(),
                    filter
                  );
                  onData({
                    CodeNumber: 302,
                    CodeName: 'Found',
                    Message: 'Retrieved from legacy node',
                    ErrorNumber: null,
                    ServerName: 'firebase-rtdb',
                    Result: items,
                  });
                } else {
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
              .catch(() => {
                onData({
                  CodeNumber: 503,
                  CodeName: 'ServiceUnavailable',
                  Message: 'Database read failed',
                  ErrorNumber: 503,
                  ServerName: 'local-fallback',
                  Result: [...SpeckuGalleryService.fallbackItems],
                });
              });
          }
        },
        (error) => {
          onData({
            CodeNumber: 503,
            CodeName: 'ServiceUnavailable',
            Message: error.message,
            ErrorNumber: 503,
            ServerName: 'firebase-rtdb',
            Result: [...SpeckuGalleryService.fallbackItems],
          });
        }
      );

      return () => {
        try {
          unsubscribePrimary();
        } catch {
          // Zero throw per Art. 15.2
        }
      };
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      onData({
        CodeNumber: 500,
        CodeName: 'InternalServerError',
        Message: errorMessage,
        ErrorNumber: 500,
        ServerName: 'local-service',
        Result: [...SpeckuGalleryService.fallbackItems],
      });
      return () => {};
    }
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
          ServerName: 'firebase-rtdb',
          Result: item,
        };
      }

      return {
        CodeNumber: 404,
        CodeName: 'NotFound',
        Message: `Item with key '${key}' not found`,
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
