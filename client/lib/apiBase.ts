// client/lib/apiBase.ts
// Finds the running API in dev (3001–3005) and caches it for this tab.
// In prod, set NEXT_PUBLIC_API_BASE and this will just use it.

type Health = { ok?: boolean; service?: string; timestamp?: string };

const CANDIDATE_PORTS = [3001, 3002, 3003, 3004, 3005];

async function checkHealth(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, { method: 'GET' });
    if (!res.ok) return false;
    const data: Health = await res.json();
    return !!data?.ok;
  } catch {
    return false;
  }
}

/**
 * Detect the API base URL.
 * Order of preference:
 * 1) NEXT_PUBLIC_API_BASE (prod/manual override)
 * 2) sessionStorage cache (per-tab)
 * 3) Probe localhost ports for /api/health
 */
export async function detectApiBase(): Promise<string> {
  // 1) Env var wins (especially in production)
  const envBase = process.env.NEXT_PUBLIC_API_BASE;
  if (envBase) return envBase.replace(/\/+$/, '');

  // During SSR there is no window; return a sensible default.
  if (typeof window === 'undefined') {
    return 'http://localhost:3001';
  }

  // 2) Cached in this tab?
  const cached = sessionStorage.getItem('apiBase');
  if (cached) return cached;

  // 3) Probe common dev ports
  for (const port of CANDIDATE_PORTS) {
    const base = `http://localhost:${port}`;
    const healthy = await checkHealth(`${base}/api/health`);
    if (healthy) {
      sessionStorage.setItem('apiBase', base);
      return base;
    }
  }

  throw new Error('Could not detect API base. Is the server running?');
}
