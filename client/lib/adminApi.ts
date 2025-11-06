export type MiniResponse = {
  ok: boolean;
  status: number;
  json: () => Promise<any>;
};

const map: Record<string, string> = {
  "contact-submissions": "contact_submissions",
  "hero-images": "hero_slider_images",
  "product-images": "product_images",
  testimonials: "testimonials",
  orders: "orders",
  "bot-responses": "bot_responses",
  "chat-sessions": "chats",
  chat: "chats",
  "visitor-tracking": "visitor_tracking",
  "support-chat": "support_chat",
  "admin-users": "admin_users",
};

function buildPhpUrlForResource(resource: string, id?: string | number) {
  const table = map[resource] || null;
  if (!table) return "/api.php";
  let url = `/api.php?table=${encodeURIComponent(table)}`;
  if (id) url += `&id=${encodeURIComponent(String(id))}`;
  return url;
}

export default async function adminFetch(
  path: string,
  init: RequestInit = {},
): Promise<MiniResponse | null> {
  try {
    const adminUrl = path.startsWith("/api/admin")
      ? path
      : `/api/admin/${path.replace(/^\/+/, "")}`;

    // Use cached backend preference if available (short TTL)
    try {
      const cached = sessionStorage.getItem("adminPreferredBackend");
      if (cached) {
        const parsed = JSON.parse(cached);
        const age = Date.now() - (parsed.ts || 0);
        const TTL = 60 * 1000; // 60s
        if (age >= 0 && age < TTL && parsed.backend) {
          if (parsed.backend === "node") {
            try {
              const res = await fetch(adminUrl, init);
              const ct = res.headers.get("content-type") || "";
              if (res.ok && ct.includes("application/json"))
                return {
                  ok: true,
                  status: res.status,
                  json: async () => res.json(),
                };
              // If non-JSON came back (e.g. HTML/doctype), treat as a miss and fall back
            } catch (e) {
              // try php fallback below
            }
          } else if (parsed.backend === "php") {
            // prefer php fallback - skip node check
            // continue to fallback handling below
          }
        }
      }
    } catch (e) {
      // ignore cache errors
    }

    // Probe backends to determine which to prefer and cache result
    let preferred: "node" | "php" | null = null;
    // Try multiple base origins: current origin and the canonical cornBelt host
    const bases = [window.location.origin, "https://cornbelt.co.ke"].filter(
      Boolean,
    );

    const tryFetchOnBases = async (path: string) => {
      for (const b of bases) {
        try {
          const url = path.startsWith("/") ? b + path : b + "/" + path;
          const res = await fetch(url, { method: "GET" });
          if (res.ok) return res;
        } catch (e) {
          // try next base
        }
      }
      return null;
    };

    try {
      const nodePing = await tryFetchOnBases("/api/ping");
      if (nodePing) {
        preferred = "node";
      }
    } catch (e) {
      // node ping failed
    }

    if (!preferred) {
      try {
        const phpPing = await tryFetchOnBases("/api.php?action=ping");
        if (phpPing) preferred = "php";
      } catch (e) {
        // both failed
      }
    }

    try {
      if (preferred)
        sessionStorage.setItem(
          "adminPreferredBackend",
          JSON.stringify({ backend: preferred, ts: Date.now() }),
        );
    } catch (e) {}

    // If node is preferred, try it first
    if (preferred === "node") {
      try {
        const res = await fetch(adminUrl, init);
        if (res.ok)
          return { ok: true, status: res.status, json: async () => res.json() };
      } catch (e) {
        // fallthrough to php
      }
    }

    // Otherwise fall through to php
    // parse resource and id
    const p = adminUrl.replace(/^\/api\/admin\/?/, "");
    const segs = p.split("/").filter(Boolean);
    const resource = segs[0] || "";
    const resourceId = segs[1] || undefined;
    const method = (init.method || "GET").toUpperCase();

    // Special-case upload -> use action=upload
    if (resource === "upload" && method === "POST") {
      // forward JSON body if present
      let bodyObj: any = null;
      try {
        bodyObj = init.body ? JSON.parse(init.body as string) : null;
      } catch {}
      // try upload across bases
      let phpRes: Response | null = null;
      for (const b of [window.location.origin, "https://cornbelt.co.ke"]) {
        try {
          const url = b + "/api.php?action=upload";
          phpRes = await fetch(url, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...(init.headers || {}),
            },
            body: bodyObj ? JSON.stringify(bodyObj) : init.body,
          });
          if (phpRes) break;
        } catch (e) {
          phpRes = null;
        }
      }
      if (!phpRes)
        return {
          ok: false,
          status: 0,
          json: async () => ({ error: "Network error" }),
        };
      const json = await (phpRes.ok
        ? phpRes.json()
        : phpRes.text().then((t) => {
            try {
              return JSON.parse(t);
            } catch {
              return { error: t };
            }
          }));
      return { ok: phpRes.ok, status: phpRes.status, json: async () => json };
    }

    // For chat-sessions -> fetch chats and group
    if (resource === "chat-sessions" && method === "GET") {
      // try fetch across bases
      let phpRes: Response | null = null;
      for (const b of [window.location.origin, "https://cornbelt.co.ke"]) {
        try {
          const url =
            b + buildPhpUrlForResource("chat-sessions").replace(/^[.\/]+/, "/");
          phpRes = await fetch(url);
          if (phpRes) break;
        } catch (e) {
          phpRes = null;
        }
      }
      if (!phpRes) return { ok: false, status: 0, json: async () => [] };
      if (!phpRes.ok)
        return {
          ok: false,
          status: phpRes.status,
          json: async () => await phpRes.json(),
        };
      const chats = await phpRes.json();
      const sessions: Record<string, any[]> = {};
      if (Array.isArray(chats)) {
        for (const m of chats) {
          sessions[m.sessionId] = sessions[m.sessionId] || [];
          sessions[m.sessionId].push(m);
        }
      }
      const sessionList = Object.keys(sessions).map((sid) => ({
        sessionId: sid,
        lastMessageAt:
          sessions[sid][sessions[sid].length - 1]?.createdAt || null,
        messages: sessions[sid],
      }));
      return { ok: true, status: 200, json: async () => sessionList };
    }

    // For chat/:sessionId -> fetch chats and filter
    if (resource === "chat" && resourceId && method === "GET") {
      // try fetch across bases for chat session
      let phpRes: Response | null = null;
      for (const b of [window.location.origin, "https://cornbelt.co.ke"]) {
        try {
          const url =
            b +
            buildPhpUrlForResource("chat", resourceId).replace(/^[.\/]+/, "/");
          phpRes = await fetch(url);
          if (phpRes) break;
        } catch (e) {
          phpRes = null;
        }
      }
      if (!phpRes) return { ok: false, status: 0, json: async () => [] };
      if (!phpRes.ok)
        return {
          ok: false,
          status: phpRes.status,
          json: async () => await phpRes.json(),
        };
      const messages = await phpRes.json();
      return { ok: true, status: 200, json: async () => messages };
    }

    // General CRUD fallback to /api.php?table=...
    const phpUrl = buildPhpUrlForResource(resource, resourceId);
    const headers: any = { ...(init.headers || {}) };
    if (!headers["Content-Type"] && init.body)
      headers["Content-Type"] = "application/json";

    // try across bases
    let finalPhpRes: Response | null = null;
    for (const b of [window.location.origin, "https://cornbelt.co.ke"]) {
      try {
        const url = b + phpUrl.replace(/^[.\/]+/, "/");
        finalPhpRes = await fetch(url, { method, headers, body: init.body });
        if (finalPhpRes) break;
      } catch (e) {
        finalPhpRes = null;
      }
    }
    if (!finalPhpRes)
      return {
        ok: false,
        status: 0,
        json: async () => ({ error: "Network error" }),
      };
    const contentType = finalPhpRes.headers.get("content-type") || "";
    let parsed: any;
    if (contentType.includes("application/json"))
      parsed = await finalPhpRes.json();
    else
      parsed = await finalPhpRes.text().then((t) => {
        try {
          return JSON.parse(t);
        } catch {
          return t;
        }
      });
    return {
      ok: finalPhpRes.ok,
      status: finalPhpRes.status,
      json: async () => parsed,
    };
  } catch (err) {
    console.error("adminFetch error", err);
    return null;
  }
}
