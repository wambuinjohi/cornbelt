let cached: null | boolean = null;

function readCache(): boolean | null {
  if (cached !== null) return cached;
  try {
    const v = sessionStorage.getItem("apiAvailable");
    if (v === "1") cached = true;
    else if (v === "0") cached = false;
    else cached = null;
  } catch {
    cached = null;
  }
  return cached;
}

async function checkAvailability(): Promise<boolean> {
  const existing = readCache();
  if (existing !== null) return existing;

  // Use Promise.race-based timeout instead of AbortController to avoid
  // issues with third-party scripts that patch fetch and may not support signals.
  const timeoutMs = 2000;
  const timer = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error("timeout")), timeoutMs),
  );

  try {
    const fetchPromise = fetch("/api/ping", {
      method: "GET",
      headers: { Accept: "application/json" },
    });

    const res = (await Promise.race([fetchPromise, timer])) as Response;

    const ok =
      res instanceof Response &&
      res.ok &&
      (res.headers.get("content-type") || "").includes("application/json");

    cached = ok;
    try {
      sessionStorage.setItem("apiAvailable", ok ? "1" : "0");
    } catch {}
    return ok;
  } catch (err) {
    // Any error (network, timeout, or sync exception) -> treat as unavailable
    cached = false;
    try {
      sessionStorage.setItem("apiAvailable", "0");
    } catch {}
    return false;
  }
}

export async function fetchJsonIfApi<T = any>(path: string): Promise<T | null> {
  const ok = await checkAvailability();
  if (!ok) return null;
  try {
    const res = await fetch(path, { headers: { Accept: "application/json" } });
    const ct = res.headers.get("content-type") || "";
    if (!res.ok || !ct.includes("application/json")) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export function isApiAvailableSync(): boolean | null {
  return readCache();
}
