/**
 * Data access service for Artist Media operations.
 * Implements Constitution Brendup Title I (Art. 2.4), Title V (Art. 13), and Title VI (Art. 15).
 * Static class with pure static methods, zero throw statements, and transactional responses.
 */

import { ref, onValue, get } from 'firebase/database';
import { db } from '../firebase';
import type { ArtistMediaBase, ArtistMediaFilter } from '../models/Artist';
import type { ResponseObject } from '../models/Response/ResponseObject';

/// <summary>
/// Static service encapsulating all data operations for artist media assets (splashes and icons).
/// Strictly declared as static with zero instance state per Constitution Brendup Art. 2.4.
/// </summary>
export class ArtistMediaService {
  /// <summary>
  /// Maps a raw database snapshot item (from artista_medio) into a strongly typed ArtistMediaBase entity.
  /// </summary>
  private static MapDatabaseRecord(key: string, record: Record<string, unknown>): ArtistMediaBase {
    const rawId = record['artista_medio_id'];
    const rawKey = record['artista_medio_key'] ?? key;
    const rawName = record['artista_medio_nombre'] ?? key;
    const rawSplash = record['artista_medio_splash_binario'] ?? null;
    const rawIcon = record['artista_medio_icono_binario'] ?? null;
    const rawActive = record['artista_medio_activo'] ?? true;
    const rawDeleted = record['artista_medio_borrado'] ?? false;

    return {
      ArtistMediaID: typeof rawId === 'number' ? rawId : null,
      Key: typeof rawKey === 'string' ? rawKey : String(rawKey),
      Name: typeof rawName === 'string' ? rawName : String(rawName),
      SplashBinary: typeof rawSplash === 'string' ? rawSplash : null,
      IconBinary: typeof rawIcon === 'string' ? rawIcon : null,
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
  /// Retrieves the list of artist media records once from Firebase RTDB.
  /// Returns a standardized ResponseObject per Constitution Brendup Art. 8.
  /// Zero throw statements are used; errors are caught and safely encapsulated.
  /// </summary>
  public static async List(
    filter?: ArtistMediaFilter
  ): Promise<ResponseObject<ArtistMediaBase[]>> {
    try {
      const mediaRef = ref(db, 'artista_medio');
      const snapshot = await get(mediaRef);

      if (snapshot.exists()) {
        const parsed = ArtistMediaService.ParseSnapshotData(snapshot.val(), filter);
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
  /// Subscribes to real-time changes on the artista_medio database node.
  /// Returns an unsubscribe cleanup callback function.
  /// Strictly catches errors with zero throw statements (Art. 15.2).
  /// </summary>
  public static Subscribe(
    onData: (response: ResponseObject<ArtistMediaBase[]>) => void,
    filter?: ArtistMediaFilter
  ): () => void {
    try {
      const mediaRef = ref(db, 'artista_medio');
      const unsubscribe = onValue(
        mediaRef,
        (snapshot) => {
          if (snapshot.exists()) {
            const items = ArtistMediaService.ParseSnapshotData(snapshot.val(), filter);
            onData({
              CodeNumber: 200,
              CodeName: 'OK',
              Message: null,
              ErrorNumber: null,
              ServerName: 'firebase-rtdb',
              Result: items,
            });
          } else {
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
          onData({
            CodeNumber: 503,
            CodeName: 'ServiceUnavailable',
            Message: error.message,
            ErrorNumber: 503,
            ServerName: 'firebase-rtdb',
            Result: [],
          });
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
      onData({
        CodeNumber: 500,
        CodeName: 'InternalServerError',
        Message: errorMessage,
        ErrorNumber: 500,
        ServerName: 'local-service',
        Result: [],
      });
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
