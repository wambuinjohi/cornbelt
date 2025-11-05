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

    // First try /api/ping (node) then /api.php?action=ping (php) to determine which backend to prefer
    try {
      const nodePing = await fetch("/api/ping", { method: "GET" });
      if (nodePing.ok) {
        // Node is active; try node admin first
        try {
          const res = await fetch(adminUrl, init);
          if (res.ok)
            return {
              ok: true,
              status: res.status,
              json: async () => res.json(),
            };
        } catch (err) {
          // fallthrough to php fallback
        }
      }
    } catch (e) {
      // node ping failed, try php ping
    }

    try {
      const phpPingRes = await fetch("/api.php?action=ping", { method: "GET" });
      if (phpPingRes.ok) {
        // PHP backend active, prefer php fallback
        // continue to fallback handling below
      }
    } catch (e) {
      // no php ping
    }

    // Fallback to php api
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
      const phpRes = await fetch("/api.php?action=upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(init.headers || {}),
        },
        body: bodyObj ? JSON.stringify(bodyObj) : init.body,
      });
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
      const phpRes = await fetch(buildPhpUrlForResource("chat-sessions"));
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
      const phpRes = await fetch(buildPhpUrlForResource("chat", resourceId));
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
    const phpRes = await fetch(phpUrl, { method, headers, body: init.body });
    const contentType = phpRes.headers.get("content-type") || "";
    let parsed: any;
    if (contentType.includes("application/json")) parsed = await phpRes.json();
    else
      parsed = await phpRes.text().then((t) => {
        try {
          return JSON.parse(t);
        } catch {
          return t;
        }
      });
    return { ok: phpRes.ok, status: phpRes.status, json: async () => parsed };
  } catch (err) {
    console.error("adminFetch error", err);
    return null;
  }
}
