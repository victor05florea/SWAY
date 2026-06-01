const MEM = new Map();
const INFLIGHT = new Map();

function readStore(key) {
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed.t !== 'number') return null;
    return parsed;
  } catch { return null; }
}

function writeStore(key, value) {
  try { sessionStorage.setItem(key, JSON.stringify(value)); } catch { /* quota */ }
}

function isFresh(entry, ttl) {
  return entry && Date.now() - entry.t < ttl;
}

function doFetch(url, { signal, parser } = {}) {
  const key = `cj:${url}`;
  if (INFLIGHT.has(key)) return INFLIGHT.get(key);
  const p = fetch(url, signal ? { signal } : undefined)
    .then(res => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return parser ? parser(res) : res.json();
    })
    .then(v => {
      const entry = { t: Date.now(), v };
      MEM.set(key, entry);
      writeStore(key, entry);
      return v;
    })
    .finally(() => INFLIGHT.delete(key));
  INFLIGHT.set(key, p);
  return p;
}

export function cachedJson(url, { ttl = 60000, parser, signal } = {}) {
  const key = `cj:${url}`;
  const mem = MEM.get(key);
  if (isFresh(mem, ttl)) return Promise.resolve(mem.v);
  const store = readStore(key);
  if (isFresh(store, ttl)) {
    MEM.set(key, store);
    return Promise.resolve(store.v);
  }
  return doFetch(url, { signal, parser });
}

export function swrJson(url, onUpdate, {
  ttl = 30000,
  staleTtl = 5 * 60 * 1000,
  signal,
  parser,
  onError,
} = {}) {
  const key = `cj:${url}`;
  const mem = MEM.get(key) || readStore(key);

  if (isFresh(mem, ttl)) {
    onUpdate(mem.v, { fromCache: true, stale: false });
    return Promise.resolve(mem.v);
  }

  if (mem && Date.now() - mem.t < staleTtl) {
    onUpdate(mem.v, { fromCache: true, stale: true });
  }

  return doFetch(url, { signal, parser })
    .then(fresh => {
      onUpdate(fresh, { fromCache: false, stale: false });
      return fresh;
    })
    .catch(err => {
      if (err && err.name === 'AbortError') return mem ? mem.v : null;
      if (onError) onError(err);
      if (mem) return mem.v;
      throw err;
    });
}

export function invalidate(url) {
  const key = `cj:${url}`;
  MEM.delete(key);
  try { sessionStorage.removeItem(key); } catch { /* ignore */ }
}

export function peekCache(url) {
  const key = `cj:${url}`;
  return MEM.get(key) || readStore(key) || null;
}
