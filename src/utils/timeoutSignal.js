// ధర్మ — Cross-engine timeout AbortSignal helper
//
// `AbortSignal.timeout(ms)` is a recent static method (Node 17.3+,
// modern browsers, Hermes ≥0.74). On certain release-mode Android
// builds we've seen it return an unusable signal — fetch then aborts
// immediately and the request silently returns no data, which
// presents as "search box does nothing" on real devices.
//
// This helper prefers the native API when available and falls back
// to AbortController + setTimeout, which works on every JS engine
// since AbortController landed (RN ≥0.60, all modern browsers).

export function timeoutSignal(ms) {
  // Prefer native — if it works, no extra timer is created.
  if (typeof AbortSignal !== 'undefined' && typeof AbortSignal.timeout === 'function') {
    try {
      const sig = AbortSignal.timeout(ms);
      // Sanity check: a real signal has aborted=false at creation.
      if (sig && typeof sig === 'object' && 'aborted' in sig && !sig.aborted) {
        return sig;
      }
    } catch { /* fall through */ }
  }
  // Polyfill — works everywhere AbortController exists.
  const ctrl = new AbortController();
  setTimeout(() => {
    try { ctrl.abort(); } catch {}
  }, ms);
  return ctrl.signal;
}
