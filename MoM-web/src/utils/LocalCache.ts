/**
 * High-performance local storage cache with memory fallback.
 * Implements Constitution Brendup Title V (Art. 12, 13) and Title VI (Art. 15).
 * Guarantees zero throw statements and resilient persistence across page reloads.
 */

/// <summary>
/// Static cache manager providing instantaneous synchronous persistence via localStorage with in-memory fallback.
/// Strictly declared with static methods and zero throw statements per Constitution Brendup Art. 15.2.
/// </summary>
export class LocalCache {
  /// <summary>
  /// Volatile in-memory fallback store used in private browsing or quota-constrained environments.
  /// </summary>
  private static readonly memoryStore = new Map<string, string>();

  /// <summary>
  /// Retrieves a parsed cached object by key. Returns null if not present or corrupt.
  /// </summary>
  public static Get<T>(key: string): T | null {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const item = window.localStorage.getItem(key);
        if (item) {
          return JSON.parse(item) as T;
        }
      }
    } catch {
      // Safely fallback to memory store without throwing
    }

    try {
      const memItem = LocalCache.memoryStore.get(key);
      if (memItem) {
        return JSON.parse(memItem) as T;
      }
    } catch {
      // Zero throw per Art. 15.2
    }

    return null;
  }

  /// <summary>
  /// Persists a value under the specified key in both localStorage and memory store.
  /// Safely catches quota exceptions without throwing.
  /// </summary>
  public static Set<T>(key: string, value: T): void {
    try {
      const serialized = JSON.stringify(value);
      LocalCache.memoryStore.set(key, serialized);

      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, serialized);
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
