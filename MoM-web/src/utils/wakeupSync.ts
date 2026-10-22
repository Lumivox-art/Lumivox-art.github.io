import { goOffline, goOnline } from 'firebase/database';
import { db } from '../firebase';

let isInitialized = false;
let reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
let lastHiddenTimestamp = 0;

/**
 * Initializes listeners for tab visibility and network reconnection.
 * Resolves zombie WebSocket connections caused by tab sleep or prolonged inactivity,
 * and recovers gracefully without requiring a manual page refresh.
 */
export function setupWakeupSync(): void {
  if (isInitialized || typeof window === 'undefined' || typeof document === 'undefined') {
    return;
  }
  isInitialized = true;

  // 1. Detect tab visibility change (sleeping tabs, minimizing window, or screen lock)
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      lastHiddenTimestamp = Date.now();
    } else {
      const elapsedInactive = lastHiddenTimestamp > 0 ? Date.now() - lastHiddenTimestamp : 0;

      // If tab was inactive for >= 30 seconds or coming from cold wake,
      // the TCP WebSocket connection is likely terminated or in a zombie half-open state.
      if (elapsedInactive >= 30_000 || elapsedInactive === 0) {
        try {
          // Immediately tear down stale socket to prevent hanging requests
          goOffline(db);
        } catch {
          // Zero throw per Constitution Brendup
        }

        if (reconnectTimeout) {
          clearTimeout(reconnectTimeout);
        }

        // Brief delay allows the browser's network stack to resume before reconnecting
        reconnectTimeout = setTimeout(() => {
          try {
            goOnline(db);
          } catch {
            // Zero throw
          }
        }, 200);
      }
    }
  });

  // 2. Detect network connectivity return (e.g. WiFi reconnects after laptop sleep)
  window.addEventListener('online', () => {
    try {
      goOnline(db);
    } catch {
      // Zero throw
    }
  });

  // 3. Catch stale deployment / missing chunk errors after long idle periods
  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    const msg = typeof reason === 'string' ? reason : (reason?.message ?? '');
    if (
      msg.includes('dynamically imported module') ||
      msg.includes('Loading chunk') ||
      msg.includes('Failed to fetch')
    ) {
      const reloadKey = 'lvx_chunk_reload_lock';
      if (!sessionStorage.getItem(reloadKey)) {
        try {
          sessionStorage.setItem(reloadKey, '1');
        } catch {
          // safe
        }
        window.location.reload();
      }
    }
  });
}
