let isInitialized = false;

/**
 * Initializes global handlers to catch stale deployment chunk errors
 * when returning to the tab after a new build has been deployed.
 * Since the app uses standard HTTPS REST queries instead of persistent WebSockets,
 * no socket connection resets are required.
 */
export function setupWakeupSync(): void {
  if (isInitialized || typeof window === 'undefined') {
    return;
  }
  isInitialized = true;

  // Catch stale deployment / missing chunk errors after long idle periods
  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    const msg = typeof reason === 'string' ? reason : (reason?.message ?? '');
    if (
      msg.includes('dynamically imported module') ||
      msg.includes('Loading chunk') ||
      msg.includes('Failed to fetch') ||
      msg.includes('error loading dynamically imported module')
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
