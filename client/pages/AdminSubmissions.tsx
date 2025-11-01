import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "@/components/AdminLayout";
import { toast } from "sonner";
import { Mail } from "lucide-react";

interface Submission {
  id: number;
  fullName: string;
  email: string;
  phone?: string;
  subject?: string;
  message?: string;
  createdAt: string;
}

export default function AdminSubmissions() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [submissions, setSubmissions] = useState<Submission[]>([]);

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      navigate("/admin/login");
      return;
    }
    fetchSubmissions();
  }, [navigate]);

  const fetchSubmissions = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch("/api/admin/contact-submissions", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch submissions");
      const data = await res.json();
      setSubmissions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching submissions:", err);
      toast.error("Failed to load submissions");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading submissions...</p>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 md:px-6 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary flex items-center gap-2">
            <Mail className="w-7 h-7" /> Contact Submissions
          </h1>
          <p className="text-muted-foreground mt-2">
            {submissions.length} submission{submissions.length === 1 ? "" : "s"}
          </p>
        </div>

        {submissions.length === 0 ? (
          <div className="text-center py-12 bg-primary/5 border border-primary/10 rounded-lg">
            <p className="text-muted-foreground">No contact submissions yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto bg-primary/5 border border-primary/10 rounded-lg">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-primary/10">
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Name</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Email</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Phone</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Subject</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Message</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Date</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((s) => (
                  <tr key={s.id} className="border-b border-primary/5 hover:bg-background transition-colors align-top">
                    <td className="py-3 px-4">{s.fullName}</td>
                    <td className="py-3 px-4">
                      <a href={`mailto:${s.email}`} className="text-primary hover:underline">
                        {s.email}
                      </a>
                    </td>
                    <td className="py-3 px-4">{s.phone || "-"}</td>
                    <td className="py-3 px-4">{s.subject || "-"}</td>
                    <td className="py-3 px-4 max-w-[320px] whitespace-pre-wrap">{s.message || "-"}</td>
                    <td className="py-3 px-4 text-muted-foreground text-xs">
                      {new Date(s.createdAt).toLocaleString()}
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
