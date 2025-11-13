import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "@/components/AdminLayout";
import { toast } from "sonner";
import { Mail, Trash2, Copy, Download } from "lucide-react";

interface NewsletterRequest {
  id: number;
  email: string;
  createdAt: string;
}

export default function AdminNewsletter() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [newsletter, setNewsletter] = useState<NewsletterRequest[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      navigate("/admin/login");
      return;
    }
    fetchNewsletter();
  }, [navigate]);

  const fetchNewsletter = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await (
        await import("@/lib/adminApi")
      ).default("/api/admin/newsletter-requests", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res || !res.ok) throw new Error("Failed to fetch newsletter requests");
      const data = await res.json();
      setNewsletter(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching newsletter requests:", err);
      toast.error("Failed to load newsletter requests");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this subscription?")) {
      return;
    }

    try {
      const token = localStorage.getItem("adminToken");
      const res = await (
        await import("@/lib/adminApi")
      ).default(`/api/admin/newsletter-requests/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res && res.ok) {
        toast.success("Subscription deleted");
        setNewsletter(newsletter.filter((n) => n.id !== id));
        setSelectedIds((prev) => {
          const updated = new Set(prev);
          updated.delete(id);
          return updated;
        });
      } else {
        toast.error("Failed to delete subscription");
      }
    } catch (err) {
      console.error("Error deleting subscription:", err);
      toast.error("Failed to delete subscription");
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) {
      toast.error("No subscriptions selected");
      return;
    }

    if (
      !confirm(
        `Delete ${selectedIds.size} subscription${selectedIds.size === 1 ? "" : "s"}?`
      )
    ) {
      return;
    }

    try {
      const token = localStorage.getItem("adminToken");
      let deletedCount = 0;

      for (const id of selectedIds) {
        const res = await (
          await import("@/lib/adminApi")
        ).default(`/api/admin/newsletter-requests/${id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res && res.ok) {
          deletedCount++;
        }
      }

      if (deletedCount > 0) {
        toast.success(`Deleted ${deletedCount} subscription${deletedCount === 1 ? "" : "s"}`);
        setNewsletter(newsletter.filter((n) => !selectedIds.has(n.id)));
        setSelectedIds(new Set());
        await fetchNewsletter();
      }
    } catch (err) {
      console.error("Error during bulk delete:", err);
      toast.error("Failed to delete some subscriptions");
    }
  };

  const handleSelectAll = () => {
    if (selectedIds.size === newsletter.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(newsletter.map((n) => n.id)));
    }
  };

  const handleSelectOne = (id: number) => {
    const updated = new Set(selectedIds);
    if (updated.has(id)) {
      updated.delete(id);
    } else {
      updated.add(id);
    }
    setSelectedIds(updated);
  };

  const copyEmails = () => {
    const emails = newsletter.map((n) => n.email).join("\n");
    navigator.clipboard.writeText(emails);
    toast.success("Emails copied to clipboard");
  };

  const exportCSV = () => {
    const headers = ["Email", "Subscribed Date"];
    const rows = newsletter.map((n) => [
      n.email,
      new Date(n.createdAt).toLocaleString(),
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `newsletter-subscribers-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading newsletter requests...</p>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 md:px-6 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary flex items-center gap-2">
            <Mail className="w-7 h-7" /> Newsletter Subscriptions
          </h1>
          <p className="text-muted-foreground mt-2">
            {newsletter.length} subscriber{newsletter.length === 1 ? "" : "s"}
          </p>
        </div>

        {newsletter.length > 0 && (
          <div className="mb-6 flex flex-wrap gap-3">
            <button
              onClick={copyEmails}
              className="inline-flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors font-semibold text-sm"
            >
              <Copy className="w-4 h-4" />
              Copy Emails
            </button>
            <button
              onClick={exportCSV}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-semibold text-sm"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
            {selectedIds.size > 0 && (
              <button
                onClick={handleBulkDelete}
                className="inline-flex items-center gap-2 px-4 py-2 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition-colors font-semibold text-sm"
              >
                <Trash2 className="w-4 h-4" />
                Delete {selectedIds.size} Selected
              </button>
            )}
          </div>
        )}

        {newsletter.length === 0 ? (
          <div className="text-center py-12 bg-primary/5 border border-primary/10 rounded-lg">
            <p className="text-muted-foreground">No newsletter subscriptions yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto bg-primary/5 border border-primary/10 rounded-lg">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-primary/10">
                  <th className="text-left py-3 px-4 font-semibold text-foreground">
                    <input
                      type="checkbox"
                      checked={selectedIds.size === newsletter.length && newsletter.length > 0}
                      onChange={handleSelectAll}
                      className="cursor-pointer"
                    />
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">
                    Email
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">
                    Subscribed Date
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {newsletter.map((sub) => (
                  <tr
                    key={sub.id}
                    className="border-b border-primary/5 hover:bg-background transition-colors"
                  >
                    <td className="py-3 px-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(sub.id)}
                        onChange={() => handleSelectOne(sub.id)}
                        className="cursor-pointer"
                      />
                    </td>
                    <td className="py-3 px-4">
                      <a
                        href={`mailto:${sub.email}`}
                        className="text-primary hover:underline"
                      >
                        {sub.email}
                      </a>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground text-xs">
                      {new Date(sub.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleDelete(sub.id)}
                        className="inline-flex items-center gap-1 px-3 py-1 text-xs bg-destructive/10 text-destructive rounded hover:bg-destructive/20 transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
