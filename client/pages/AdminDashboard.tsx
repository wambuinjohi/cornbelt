import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "@/components/AdminLayout";
import { toast } from "sonner";
import { Mail, Images, FileText } from "lucide-react";
import { useAuth } from "@/lib/authContext";

interface AdminUser {
  id: number;
  email: string;
  fullName: string;
  createdAt: string;
}

export default function AdminDashboard() {
  const { user, token } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [contactSubmissions, setContactSubmissions] = useState<any[]>([]);
  const [newsletterRequests, setNewsletterRequests] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      fetchContactSubmissions();
      fetchNewsletterRequests();
    }
    setIsLoading(false);
  }, [user]);

  const fetchContactSubmissions = async () => {
    try {
      const response = await (
        await import("@/lib/adminApi")
      ).default("/api/admin/contact-submissions", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response || !response.ok) {
        throw new Error("Failed to fetch submissions");
      }

      const data = await response.json();
      setContactSubmissions(data);
    } catch (error) {
      console.error("Error fetching submissions:", error);
      toast.error("Failed to load contact submissions");
    }
  };

  const fetchNewsletterRequests = async () => {
    try {
      const response = await (
        await import("@/lib/adminApi")
      ).default("/api/admin/newsletter-requests", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response || !response.ok) {
        throw new Error("Failed to fetch newsletter requests");
      }

      const data = await response.json();
      setNewsletterRequests(data);
    } catch (error) {
      console.error("Error fetching newsletter requests:", error);
      toast.error("Failed to load newsletter requests");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 md:px-6 py-12">
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Welcome, {user?.fullName}!
          </h2>
          <p className="text-muted-foreground">
            Manage your Cornbelt Flour Mill application from here.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <Link to="/admin/hero-images">
            <div className="bg-primary/5 p-6 rounded-lg border border-primary/10 hover:border-primary/30 transition-colors cursor-pointer h-full">
              <Images className="w-8 h-8 text-primary mb-4" />
              <h3 className="text-2xl font-bold text-foreground">
                Hero Images
              </h3>
              <p className="text-muted-foreground">Manage slider images</p>
            </div>
          </Link>
          <Link to="/admin/footer">
            <div className="bg-primary/5 p-6 rounded-lg border border-primary/10 hover:border-primary/30 transition-colors cursor-pointer h-full">
              <FileText className="w-8 h-8 text-primary mb-4" />
              <h3 className="text-2xl font-bold text-foreground">
                Footer Settings
              </h3>
              <p className="text-muted-foreground">
                Manage contact & social links
              </p>
            </div>
          </Link>
          <Link to="/admin/submissions">
            <div className="bg-primary/5 p-6 rounded-lg border border-primary/10 hover:border-primary/30 transition-colors cursor-pointer h-full">
              <Mail className="w-8 h-8 text-primary mb-4" />
              <h3 className="text-2xl font-bold text-foreground">
                {contactSubmissions.length}
              </h3>
              <p className="text-muted-foreground">Contact Submissions</p>
            </div>
          </Link>
          <Link to="/admin/newsletter">
            <div className="bg-primary/5 p-6 rounded-lg border border-primary/10 hover:border-primary/30 transition-colors cursor-pointer h-full">
              <Mail className="w-8 h-8 text-primary mb-4" />
              <h3 className="text-2xl font-bold text-foreground">
                {newsletterRequests.length}
              </h3>
              <p className="text-muted-foreground">Newsletter Subscribers</p>
            </div>
          </Link>
        </div>

        <section className="bg-primary/5 rounded-lg border border-primary/10 p-8">
          <h3 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
            <Mail className="w-6 h-6 text-primary" />
            Recent Contact Submissions
          </h3>

          {contactSubmissions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                No contact submissions yet.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-primary/10">
                    <th className="text-left py-3 px-4 font-semibold text-foreground">
                      Name
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">
                      Email
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">
                      Phone
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">
                      Subject
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {contactSubmissions.map((submission) => (
                    <tr
                      key={submission.id}
                      className="border-b border-primary/5 hover:bg-background transition-colors"
                    >
                      <td className="py-3 px-4">{submission.fullName}</td>
                      <td className="py-3 px-4">{submission.email}</td>
                      <td className="py-3 px-4">{submission.phone}</td>
                      <td className="py-3 px-4">{submission.subject}</td>
                      <td className="py-3 px-4 text-muted-foreground text-xs">
                        {new Date(submission.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-8">
          <h3 className="text-xl font-bold text-blue-900 mb-4">System Info</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-blue-800">
            <div>
              <p className="font-semibold">Admin Created</p>
              <p>
                {user?.createdAt
                  ? new Date(user.createdAt).toLocaleString()
                  : "N/A"}
              </p>
            </div>
            <div>
              <p className="font-semibold">Current Session</p>
              <p>Active and secure</p>
            </div>
          </div>
        </section>
      </div>
    </AdminLayout>
  );
}
