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

        // Ensure bot_responses table exists
        const botTableRes = await fetch(`/api.php`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            table: "bot_responses",
            create_table: true,
            columns: {
              id: "INT AUTO_INCREMENT PRIMARY KEY",
              keyword: "VARCHAR(255) NOT NULL",
              answer: "TEXT NOT NULL",
              createdAt: "DATETIME DEFAULT CURRENT_TIMESTAMP",
            },
          }),
        }).catch(() => null);

        if (botTableRes && botTableRes.ok) {
          console.log("Bot responses table initialized");
        }

        // Check if bot_responses table has any data
        console.log("Checking for existing bot responses...");
        const checkRes = await fetch(`/api.php?table=bot_responses`);
        if (checkRes.ok) {
          const botData = await checkRes.json();
          console.log("Existing bot responses:", botData);
          const isEmpty = !Array.isArray(botData) || botData.length === 0;

          // If empty, auto-seed with default responses
          if (isEmpty) {
            console.log("Bot responses table is empty, seeding defaults...");
            const defaultResponses = [
              {
                keyword: "hours",
                answer:
                  "Our business hours are Monday - Friday: 8:00 AM - 5:00 PM, Saturday: 9:00 AM - 2:00 PM, Sunday: Closed.",
              },
              {
                keyword: "location",
                answer:
                  "We are located at Cornbelt Flour Mill Limited, National Cereals & Produce Board Land, Kenya.",
              },
              {
                keyword: "contact",
                answer:
                  "You can reach us via email at info@cornbeltmill.com or support@cornbeltmill.com, or use the contact form on our website.",
              },
              {
                keyword: "products",
                answer:
                  "We offer a range of fortified maize meal and other products. Visit our Products page for more details.",
              },
              {
                keyword: "shipping",
                answer:
                  "For shipping inquiries, please contact our support team via email and provide your location so we can advise on availability and rates.",
              },
            ];

            // Seed default responses with better error handling
            let seededCount = 0;
            for (const response of defaultResponses) {
              try {
                const seedRes = await fetch(`/api.php?table=bot_responses`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(response),
                });
                if (seedRes.ok) {
                  seededCount++;
                  console.log("Seeded response:", response.keyword);
                } else {
                  console.warn(
                    "Failed to seed response:",
                    response.keyword,
                    seedRes.status,
                  );
                }
              } catch (e) {
                console.warn(
                  "Failed to seed bot response:",
                  response.keyword,
                  e,
                );
              }
            }

            console.log(
              `Default bot responses seeded: ${seededCount}/${defaultResponses.length}`,
            );
          } else {
            console.log(`Found ${botData.length} existing bot responses`);
          }
        } else {
          console.warn("Failed to fetch bot responses:", checkRes.status);
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
    console.log("Sending message:", text);

    // optimistic UI: show user message immediately
    setMessages((m) => [
      ...m,
      { sender: "user", message: text, createdAt: new Date().toISOString() },
    ]);
    setInput("");
    setLoading(true);

    try {
      // Save user message to PHP endpoint
      console.log("Saving user message...");
      const saveRes = await fetch(`/api.php?table=chats`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          sender: "user",
          message: text,
          createdAt: new Date().toISOString(),
        }),
      });
      console.log("User message saved:", saveRes.ok);

      // Fetch bot responses from PHP and compute reply on client
      console.log("Fetching bot responses...");
      const resp = await fetch(`/api.php?table=bot_responses`);
      console.log("Bot responses fetch status:", resp.status);

      let botReply: string | null = null;
      if (resp.ok) {
        const responses = await resp.json();
        console.log("Available bot responses:", responses);
        if (Array.isArray(responses) && responses.length > 0) {
          const lower = text.toLowerCase();
          for (const r of responses) {
            const keyword = (r.keyword || "").toLowerCase();
            if (!keyword) continue;
            if (lower.includes(keyword)) {
              botReply = r.answer;
              console.log("Matched keyword:", keyword);
              break;
            }
          }
        }
      } else {
        console.warn("Failed to fetch bot responses");
      }

      if (!botReply) {
        console.log("No keyword match, using default response");
        botReply =
          "Thanks for your message! Our team will get back to you shortly. You can also visit the Contact page for more ways to reach us.";
      }

      console.log("Bot reply:", botReply);

      // Save bot reply
      const botSaveRes = await fetch(`/api.php?table=chats`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          sender: "bot",
          message: botReply,
          createdAt: new Date().toISOString(),
        }),
      });
      console.log("Bot message saved:", botSaveRes.ok);

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
