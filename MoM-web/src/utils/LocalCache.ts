/**
 * High-performance local storage cache with memory fallback.
 * Implements Constitution Brendup Title V (Art. 12, 13) and Title VI (Art. 15).
 * Guarantees zero throw statements and resilient persistence across page reloads.
 */

/// <summary>
/// Static cache manager providing instantaneous synchronous persistence via localStorage with in-memory fallback.
/// Strictly declared with static methods and zero throw statements per Constitution Brendup Art. 15.2.
/// Protects against browser QuotaExceededError by keeping oversized binary payloads in memoryStore.
/// </summary>
export class LocalCache {
  /// <summary>
  /// Maximum serialized size (500 KB) allowed to be persisted to localStorage to prevent
  /// exhausting the browser's 5MB origin quota and breaking Firebase WebSockets or auth.
  /// </summary>
  private static readonly MAX_LOCAL_STORAGE_BYTES = 500_000;

  /// <summary>
  /// Volatile in-memory fallback store used in private browsing, quota-constrained environments,
  /// or for heavy binary payloads.
  /// </summary>
  private static readonly memoryStore = new Map<string, string>();

  /// <summary>
  /// Automatically runs on startup to clean up any oversized legacy keys from localStorage
  /// (e.g. multi-megabyte gallery data) that could trigger QuotaExceededError on tab wake-up.
  /// </summary>
  static {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const keysToRemove: string[] = [];
        for (let i = 0; i < window.localStorage.length; i++) {
          const k = window.localStorage.key(i);
          if (k && k.startsWith('lvx_cache_')) {
            const val = window.localStorage.getItem(k);
            if (val && val.length > LocalCache.MAX_LOCAL_STORAGE_BYTES) {
              keysToRemove.push(k);
            }
          }
        }
        keysToRemove.forEach((k) => window.localStorage.removeItem(k));
      }
    } catch {
      // Safe no-op per Constitution Brendup
    }
  }

  /// <summary>
  /// Retrieves a parsed cached object by key. Returns null if not present or corrupt.
  /// Checks fast in-memory store first, then falls back to localStorage.
  /// </summary>
  public static Get<T>(key: string): T | null {
    // 1. Check in-memory store first for instant 0ms access
    try {
      const memItem = LocalCache.memoryStore.get(key);
      if (memItem) {
        return JSON.parse(memItem) as T;
      }
    } catch {
      // Zero throw per Art. 15.2
    }

    // 2. Check localStorage if available
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const item = window.localStorage.getItem(key);
        if (item) {
          const parsed = JSON.parse(item) as T;
          LocalCache.memoryStore.set(key, item);
          return parsed;
        }
      }
    } catch {
      // Safely fallback without throwing
    }

    return null;
  }

  /// <summary>
  /// Persists a value under the specified key in memory store, and conditionally in localStorage
  /// if the payload is within safe quota bounds (< 500 KB).
  /// Safely catches quota exceptions without throwing.
  /// </summary>
  public static Set<T>(key: string, value: T): void {
    try {
      const serialized = JSON.stringify(value);
      LocalCache.memoryStore.set(key, serialized);

      if (typeof window !== 'undefined' && window.localStorage) {
        if (serialized.length <= LocalCache.MAX_LOCAL_STORAGE_BYTES) {
          window.localStorage.setItem(key, serialized);
        } else {
          // Payload is too large for 5MB localStorage; remove from localStorage if present
          // to preserve quota for critical flags, theme, and Firebase SDK internals.
          window.localStorage.removeItem(key);
        }
      }
    } catch {
      // Graceful quota fallback: in-memory copy remains valid
    }
  }

  /// <summary>
  /// Removes a cached key from both persistent and in-memory storage.
  /// </summary>
  public static Remove(key: string): void {
    try {
      LocalCache.memoryStore.delete(key);
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
      }
    } catch {
      // Zero throw per Art. 15.2
    }
  }
}
