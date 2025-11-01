import React, { useEffect, useState } from "react";
import AdminLayout from "@/components/AdminLayout";

interface BotResponse {
  id: number;
  keyword: string;
  answer: string;
  createdAt?: string;
}

interface ChatSession {
  sessionId: string;
  lastMessageAt?: string;
}

export default function AdminChat() {
  const [responses, setResponses] = useState<BotResponse[]>([]);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [keyword, setKeyword] = useState("");
  const [answer, setAnswer] = useState("");

  const token = localStorage.getItem("adminToken");

  useEffect(() => {
    fetchResponses();
    fetchSessions();
  }, []);

  const fetchResponses = async () => {
    try {
      const res = await fetch("/api/admin/bot-responses", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      setResponses(data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchSessions = async () => {
    try {
      const res = await fetch("/api/admin/chat-sessions", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      setSessions(data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchSessionMessages = async (sessionId: string) => {
    try {
      const res = await fetch(
        `/api/admin/chat/${encodeURIComponent(sessionId)}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (!res.ok) return;
      const data = await res.json();
      setMessages(data);
      setSelectedSession(sessionId);
    } catch (e) {
      console.error(e);
    }
  };

  const createResponse = async () => {
    if (!keyword.trim() || !answer.trim()) return;
    try {
      const res = await fetch("/api/admin/bot-responses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          keyword: keyword.trim(),
          answer: answer.trim(),
        }),
      });
      if (res.ok) {
        setKeyword("");
        setAnswer("");
        fetchResponses();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 md:px-6 py-12">
        <h1 className="text-2xl font-bold mb-4">Chat & Bot Management</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 bg-primary/5 p-4 rounded-lg border border-primary/10">
            <h2 className="font-semibold mb-2">Bot Responses</h2>
            <div className="space-y-2">
              {responses.map((r) => (
                <div
                  key={r.id}
                  className="p-2 bg-background rounded border border-primary/10"
                >
                  <div className="text-sm font-medium">{r.keyword}</div>
                  <div className="text-sm text-muted-foreground">
                    {r.answer}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4">
              <input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Keyword"
                className="w-full p-2 border rounded mb-2"
              />
              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Answer"
                className="w-full p-2 border rounded mb-2"
              />
              <button
                onClick={createResponse}
                className="px-3 py-2 bg-primary text-white rounded"
              >
                Create
              </button>
            </div>
          </div>

          <div className="md:col-span-2 bg-primary/5 p-4 rounded-lg border border-primary/10">
            <h2 className="font-semibold mb-2">Active Sessions</h2>
            <div className="flex gap-4">
              <div className="w-1/3">
                <div className="space-y-2 max-h-96 overflow-auto">
                  {sessions.map((s) => (
                    <button
                      key={s.sessionId}
                      onClick={() => fetchSessionMessages(s.sessionId)}
                      className="w-full text-left p-2 bg-background rounded border border-primary/10"
                    >
                      <div className="font-medium">{s.sessionId}</div>
                      <div className="text-xs text-muted-foreground">
                        Last:{" "}
                        {s.lastMessageAt
                          ? new Date(s.lastMessageAt).toLocaleString()
                          : "-"}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex-1 bg-background p-2 rounded">
                <h3 className="font-medium mb-2">Conversation</h3>
                {selectedSession ? (
                  <div className="space-y-2 max-h-80 overflow-auto">
                    {messages.map((m, idx) => (
                      <div
                        key={idx}
                        className={`p-2 rounded ${m.sender === "bot" ? "bg-primary/5" : "bg-primary text-white"}`}
                      >
                        <div className="text-sm">{m.message}</div>
                        <div className="text-xs text-muted-foreground">
                          {m.sender} •{" "}
                          {m.createdAt
                            ? new Date(m.createdAt).toLocaleString()
                            : ""}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-muted-foreground">
                    Select a session to view messages
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
