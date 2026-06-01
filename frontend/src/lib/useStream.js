import { useEffect, useRef } from 'react';

const DEFAULT_URL = '/api/stream';
const RECONNECT_BASE = 1000;
const RECONNECT_MAX = 30000;
const FALLBACK_AFTER_FAILS = 3;

/**
 * Subscribes to a Server-Sent Events endpoint.
 *
 * - `handlers` maps event name -> callback(data, event).
 * - Reconnects with exponential backoff, pauses while the tab is hidden.
 * - After FALLBACK_AFTER_FAILS consecutive failures it calls `onFallback`
 *   once, letting the caller switch to polling. The stream keeps retrying
 *   in the background so it can recover if the server comes back.
 */
export function useStream(handlers, {
  url = DEFAULT_URL,
  onFallback,
  enabled = true,
} = {}) {
  const handlersRef = useRef(handlers);

  useEffect(() => {
    handlersRef.current = handlers;
  });

  useEffect(() => {
    if (!enabled) return undefined;
    if (typeof window === 'undefined' || typeof EventSource === 'undefined') {
      if (onFallback) onFallback();
      return undefined;
    }

    let es = null;
    let reconnectTimer = null;
    let consecutiveFailures = 0;
    let fellBack = false;
    let cancelled = false;

    const wireHandlers = (source) => {
      Object.entries(handlersRef.current || {}).forEach(([eventName, fn]) => {
        if (typeof fn !== 'function') return;
        source.addEventListener(eventName, (ev) => {
          try { fn(ev.data, ev); }
          catch { /* swallow handler errors so the stream stays alive */ }
        });
      });
    };

    const scheduleReconnect = () => {
      if (cancelled) return;
      const exp = Math.min(consecutiveFailures, 5);
      const delay = Math.min(RECONNECT_BASE * (2 ** exp), RECONNECT_MAX);
      reconnectTimer = window.setTimeout(connect, delay);
    };

    const connect = () => {
      if (cancelled) return;
      try {
        es = new EventSource(url, { withCredentials: false });
      } catch {
        scheduleReconnect();
        return;
      }

      es.onopen = () => { consecutiveFailures = 0; };
      es.onerror = () => {
        consecutiveFailures += 1;
        try { if (es) es.close(); } catch { /* noop */ }
        if (!fellBack && consecutiveFailures >= FALLBACK_AFTER_FAILS && onFallback) {
          fellBack = true;
          onFallback();
        }
        scheduleReconnect();
      };

      wireHandlers(es);
    };

    const onVisibility = () => {
      if (document.hidden) {
        try { if (es) es.close(); } catch { /* noop */ }
        if (reconnectTimer) { clearTimeout(reconnectTimer); reconnectTimer = null; }
      } else if (!cancelled) {
        consecutiveFailures = 0;
        connect();
      }
    };

    document.addEventListener('visibilitychange', onVisibility);
    if (!document.hidden) connect();

    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', onVisibility);
      if (reconnectTimer) clearTimeout(reconnectTimer);
      try { if (es) es.close(); } catch { /* noop */ }
    };
  }, [url, enabled, onFallback]);
}
