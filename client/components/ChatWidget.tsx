import React, { useEffect, useState } from "react";

function generateSessionId() {
  let id = localStorage.getItem("chatSessionId");
  if (!id) {
    id = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem("chatSessionId", id);
  }
  return id;
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [sessionId] = useState(generateSessionId());
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<
    { sender: string; message: string; createdAt?: string }[]
  >([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // load history from PHP api.php (public CRUD endpoint)
    const load = async () => {
      try {
        // First ensure the chats table exists
        const createRes = await fetch(`/api.php`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            table: "chats",
            create_table: true,
            columns: {
              id: "INT AUTO_INCREMENT PRIMARY KEY",
              sessionId: "VARCHAR(255) NOT NULL",
              sender: "VARCHAR(50) NOT NULL",
              message: "TEXT NOT NULL",
              createdAt: "DATETIME DEFAULT CURRENT_TIMESTAMP",
            },
          }),
        }).catch(() => null);

        if (createRes && createRes.ok) {
          console.log("Chats table initialized");
        }

        // Now fetch messages
        const res = await fetch(`/api.php?table=chats`);
        if (res.ok) {
          const data = await res.json();
          const filtered = Array.isArray(data)
            ? data
                .filter((m: any) => m.sessionId === sessionId)
                .map((m: any) => ({
                  sender: m.sender,
                  message: m.message,
                  createdAt: m.createdAt,
                }))
            : [];
          setMessages(filtered);
        }
      } catch (e) {
        console.error("Failed to load chat history:", e);
      }
    };
    load();
  }, [sessionId]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const text = input.trim();

    // optimistic UI: show user message immediately
    setMessages((m) => [
      ...m,
      { sender: "user", message: text, createdAt: new Date().toISOString() },
    ]);
    setInput("");
    setLoading(true);

    try {
      // Save user message to PHP endpoint
      await fetch(`/api.php?table=chats`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          sender: "user",
          message: text,
          createdAt: new Date().toISOString(),
        }),
      });

      // Fetch bot responses from PHP and compute reply on client
      const resp = await fetch(`/api.php?table=bot_responses`);
      let botReply: string | null = null;
      if (resp.ok) {
        const responses = await resp.json();
        if (Array.isArray(responses)) {
          const lower = text.toLowerCase();
          for (const r of responses) {
            const keyword = (r.keyword || "").toLowerCase();
            if (!keyword) continue;
            if (lower.includes(keyword)) {
              botReply = r.answer;
              break;
            }
          }
        }
      }

      if (!botReply) {
        botReply =
          "Thanks for your message! Our team will get back to you shortly. You can also visit the Contact page for more ways to reach us.";
      }

      // Save bot reply
      await fetch(`/api.php?table=chats`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          sender: "bot",
          message: botReply,
          createdAt: new Date().toISOString(),
        }),
      });

      // Append bot reply to UI
      setMessages((m) => [
        ...m,
        {
          sender: "bot",
          message: botReply!,
          createdAt: new Date().toISOString(),
        },
      ]);
    } catch (e) {
      console.error("Chat send error:", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="flex flex-col items-end">
        {open && (
          <div className="w-80 max-h-96 bg-background rounded-lg shadow-lg border border-primary/10 overflow-hidden flex flex-col">
            <div className="px-4 py-2 bg-primary/5 border-b border-primary/10 font-semibold">
              Help Chat
            </div>
            <div
              className="p-3 overflow-auto flex-1 space-y-2"
              style={{ minHeight: 200 }}
            >
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex ${m.sender === "bot" ? "justify-start" : "justify-end"}`}
                >
                  <div
                    className={`px-3 py-2 rounded-md ${m.sender === "bot" ? "bg-primary/5 text-foreground" : "bg-primary text-white"}`}
                  >
                    {m.message}
                  </div>
                </div>
              ))}
            </div>
            <div className="p-3 border-t border-primary/10">
              <div className="flex gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") sendMessage();
                  }}
                  className="flex-1 border border-primary/10 rounded-md px-3 py-2 bg-transparent"
                  placeholder="Type your message..."
                />
                <button
                  onClick={sendMessage}
                  disabled={loading}
                  className="px-3 py-2 bg-primary text-white rounded-md"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        )}

        <button
          className="mt-3 w-12 h-12 rounded-full bg-primary text-white shadow-lg flex items-center justify-center"
          onClick={() => setOpen((o) => !o)}
          aria-label="Open chat"
        >
          {open ? "×" : "💬"}
        </button>
      </div>
    </div>
  );
}
