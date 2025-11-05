import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Edit2, Trash2, Plus, MessageSquare, Clock, User } from "lucide-react";

interface BotResponse {
  id: number;
  keyword: string;
  answer: string;
  createdAt?: string;
}

interface ChatSession {
  sessionId: string;
  lastMessageAt?: string;
  messages?: ChatMessage[];
}

interface ChatMessage {
  id?: number;
  sessionId: string;
  sender: "user" | "bot" | "admin";
  message: string;
  createdAt?: string;
}

export default function AdminChat() {
  const navigate = useNavigate();
  const [responses, setResponses] = useState<BotResponse[]>([]);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [keyword, setKeyword] = useState("");
  const [answer, setAnswer] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const token = localStorage.getItem("adminToken");

  // Check authentication
  useEffect(() => {
    if (!token) {
      navigate("/admin/login");
      return;
    }
    fetchData();
  }, [token, navigate]);

  // Auto-refresh sessions every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (!token) return;
      fetchSessions();
      if (selectedSession) {
        fetchSessionMessages(selectedSession);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [token, selectedSession]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([fetchResponses(), fetchSessions()]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchResponses = async () => {
    try {
      const adminFetch = (await import('@/lib/adminApi')).default;
      const res = await adminFetch("/api/admin/bot-responses", { headers: { Authorization: `Bearer ${token}` } });
      if (!res || !res.ok) throw new Error("Failed to fetch responses");
      const data = await res.json();
      setResponses(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load bot responses");
    }
  };

  const fetchSessions = async () => {
    try {
      const adminFetch = (await import('@/lib/adminApi')).default;
      const res = await adminFetch("/api/admin/chat-sessions", { headers: { Authorization: `Bearer ${token}` } });
      if (!res || !res.ok) throw new Error("Failed to fetch sessions");
      const data = await res.json();
      setSessions(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load chat sessions");
    }
  };

  const fetchSessionMessages = async (sessionId: string) => {
    try {
      const adminFetch = (await import('@/lib/adminApi')).default;
      const res = await adminFetch(`/api/admin/chat/${encodeURIComponent(sessionId)}`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res || !res.ok) throw new Error("Failed to fetch messages");
      const data = await res.json();
      setMessages(Array.isArray(data) ? data : []);
      setSelectedSession(sessionId);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load conversation");
    }
  };

  const createResponse = async () => {
    if (!keyword.trim() || !answer.trim()) {
      toast.error("Keyword and answer are required");
      return;
    }

    try {
      const adminFetch = (await import('@/lib/adminApi')).default;
      const res = await adminFetch("/api/admin/bot-responses", {
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

      if (!res || !res.ok) throw new Error("Failed to create response");

      toast.success("Bot response created successfully");
      setKeyword("");
      setAnswer("");
      setCreateDialogOpen(false);
      await fetchResponses();
    } catch (e) {
      console.error(e);
      toast.error("Failed to create bot response");
    }
  };

  const updateResponse = async (id: number) => {
    if (!keyword.trim() || !answer.trim()) {
      toast.error("Keyword and answer are required");
      return;
    }

    try {
      const adminFetch = (await import('@/lib/adminApi')).default;
      const res = await adminFetch(`/api/admin/bot-responses/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          keyword: keyword.trim(),
          answer: answer.trim(),
        }),
      });

      if (!res || !res.ok) throw new Error("Failed to update response");

      toast.success("Bot response updated successfully");
      setKeyword("");
      setAnswer("");
      setEditingId(null);
      setCreateDialogOpen(false);
      await fetchResponses();
    } catch (e) {
      console.error(e);
      toast.error("Failed to update bot response");
    }
  };

  const deleteResponse = async (id: number) => {
    try {
      const res = await fetch(`/api/admin/bot-responses/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to delete response");

      toast.success("Bot response deleted successfully");
      await fetchResponses();
    } catch (e) {
      console.error(e);
      toast.error("Failed to delete bot response");
    }
  };

  const reseedDefaultResponses = async () => {
    try {
      const res = await fetch("/api/admin/reseed-bot-responses", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to reseed responses");

      const data = await res.json();
      toast.success(`Default responses loaded (${data.count} responses)`);
      await fetchResponses();
    } catch (e) {
      console.error(e);
      toast.error("Failed to reseed default responses");
    }
  };

  const handleEdit = (response: BotResponse) => {
    setEditingId(response.id);
    setKeyword(response.keyword);
    setAnswer(response.answer);
    setCreateDialogOpen(true);
  };

  const handleCancel = () => {
    setEditingId(null);
    setKeyword("");
    setAnswer("");
    setCreateDialogOpen(false);
  };

  const handleSubmit = () => {
    if (editingId) {
      updateResponse(editingId);
    } else {
      createResponse();
    }
  };

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 md:px-6 py-12 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Chat & Bot Management
          </h1>
          <p className="text-muted-foreground">
            Manage chatbot responses and view active conversations
          </p>
        </div>

        <Tabs defaultValue="responses" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="responses">Bot Responses</TabsTrigger>
            <TabsTrigger value="sessions">Chat Sessions</TabsTrigger>
          </TabsList>

          {/* Bot Responses Tab */}
          <TabsContent value="responses" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-semibold">Manage Bot Responses</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Create and manage automated responses for common keywords
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={reseedDefaultResponses}
                  variant="outline"
                  className="gap-2"
                >
                  Load Default Responses
                </Button>
                <Dialog
                  open={createDialogOpen}
                  onOpenChange={setCreateDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button
                      onClick={() => {
                        setEditingId(null);
                        setKeyword("");
                        setAnswer("");
                      }}
                      className="gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Add Response
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>
                        {editingId ? "Edit Response" : "Create Response"}
                      </DialogTitle>
                      <DialogDescription>
                        {editingId
                          ? "Update the keyword and answer for this bot response"
                          : "Create a new automated response for a keyword"}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Keyword</label>
                        <Input
                          placeholder="e.g., hours, shipping, contact"
                          value={keyword}
                          onChange={(e) => setKeyword(e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">
                          The bot will match messages containing this keyword
                        </p>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          Response Answer
                        </label>
                        <Textarea
                          placeholder="Enter the bot's response..."
                          value={answer}
                          onChange={(e) => setAnswer(e.target.value)}
                          rows={5}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={handleCancel}>
                        Cancel
                      </Button>
                      <Button onClick={handleSubmit}>
                        {editingId ? "Update" : "Create"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            <div className="grid gap-4">
              {responses.length === 0 ? (
                <Card className="text-center py-12">
                  <CardContent>
                    <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground mb-4 opacity-50" />
                    <p className="text-muted-foreground mb-4">
                      No bot responses yet. Create your first one!
                    </p>
                    <Dialog
                      open={createDialogOpen}
                      onOpenChange={setCreateDialogOpen}
                    >
                      <DialogTrigger asChild>
                        <Button
                          onClick={() => {
                            setEditingId(null);
                            setKeyword("");
                            setAnswer("");
                          }}
                          className="gap-2"
                        >
                          <Plus className="w-4 h-4" />
                          Create Response
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Create Response</DialogTitle>
                          <DialogDescription>
                            Create a new automated response for a keyword
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium">
                              Keyword
                            </label>
                            <Input
                              placeholder="e.g., hours, shipping, contact"
                              value={keyword}
                              onChange={(e) => setKeyword(e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground">
                              The bot will match messages containing this
                              keyword
                            </p>
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium">
                              Response Answer
                            </label>
                            <Textarea
                              placeholder="Enter the bot's response..."
                              value={answer}
                              onChange={(e) => setAnswer(e.target.value)}
                              rows={5}
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={handleCancel}>
                            Cancel
                          </Button>
                          <Button onClick={handleSubmit}>Create</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </CardContent>
                </Card>
              ) : (
                responses.map((response) => (
                  <Card
                    key={response.id}
                    className="hover:shadow-md transition-shadow"
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg font-semibold text-primary">
                            {response.keyword}
                          </CardTitle>
                          <CardDescription className="mt-2">
                            {response.answer}
                          </CardDescription>
                          {response.createdAt && (
                            <div className="flex items-center gap-1 mt-3 text-xs text-muted-foreground">
                              <Clock className="w-3 h-3" />
                              {new Date(
                                response.createdAt,
                              ).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(response)}
                            className="gap-1"
                          >
                            <Edit2 className="w-4 h-4" />
                            Edit
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="gap-1 text-destructive hover:text-destructive"
                              >
                                <Trash2 className="w-4 h-4" />
                                Delete
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Delete Response?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this bot
                                  response? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteResponse(response.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Chat Sessions Tab */}
          <TabsContent value="sessions" className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold">Active Chat Sessions</h2>
              <p className="text-sm text-muted-foreground mt-1">
                View and monitor conversations from your website visitors
              </p>
            </div>

            <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
              {/* Sessions List */}
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle className="text-lg">Sessions</CardTitle>
                  <CardDescription>
                    {sessions.length} active session
                    {sessions.length !== 1 ? "s" : ""}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {sessions.length === 0 ? (
                    <div className="text-center py-8">
                      <MessageSquare className="w-8 h-8 mx-auto text-muted-foreground mb-2 opacity-50" />
                      <p className="text-sm text-muted-foreground">
                        No active sessions yet
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-[600px] overflow-auto">
                      {sessions.map((session) => (
                        <button
                          key={session.sessionId}
                          onClick={() =>
                            fetchSessionMessages(session.sessionId)
                          }
                          className={`w-full text-left p-3 rounded-lg border transition-colors ${
                            selectedSession === session.sessionId
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/50"
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <User className="w-3 h-3" />
                            <code className="text-xs font-mono truncate flex-1">
                              {session.sessionId.slice(0, 16)}...
                            </code>
                          </div>
                          {session.lastMessageAt && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="w-3 h-3" />
                              {new Date(session.lastMessageAt).toLocaleString()}
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Conversation View */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-lg">Conversation</CardTitle>
                  {selectedSession ? (
                    <CardDescription>
                      Session: {selectedSession.slice(0, 20)}...
                    </CardDescription>
                  ) : (
                    <CardDescription>
                      Select a session to view conversation
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  {selectedSession ? (
                    <div className="space-y-3 max-h-[500px] overflow-auto">
                      {messages.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          No messages in this session
                        </div>
                      ) : (
                        messages.map((msg, idx) => (
                          <div
                            key={idx}
                            className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                          >
                            <div
                              className={`max-w-xs px-4 py-2 rounded-lg ${
                                msg.sender === "user"
                                  ? "bg-primary text-primary-foreground"
                                  : msg.sender === "bot"
                                    ? "bg-muted"
                                    : "bg-orange-100 text-orange-900"
                              }`}
                            >
                              <div className="text-sm break-words">
                                {msg.message}
                              </div>
                              <div
                                className={`text-xs mt-1 ${
                                  msg.sender === "user"
                                    ? "text-primary-foreground/70"
                                    : "text-muted-foreground"
                                }`}
                              >
                                {msg.sender}
                                {msg.createdAt &&
                                  ` • ${new Date(msg.createdAt).toLocaleTimeString()}`}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      Select a session from the list to view the conversation
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
