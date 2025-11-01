import { useEffect, useState } from "react";
import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import AdminLayout from "@/components/AdminLayout";
import { toast } from "sonner";
import { Mail, Images } from "lucide-react";

interface AdminUser {
  id: number;
  email: string;
  fullName: string;
  createdAt: string;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [contactSubmissions, setContactSubmissions] = useState<any[]>([]);

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem("adminToken");
    const userData = localStorage.getItem("adminUser");

    if (!token || !userData) {
      navigate("/admin/login");
      return;
    }

    try {
      setUser(JSON.parse(userData));
      fetchContactSubmissions();
    } catch (error) {
      console.error("Error parsing user data:", error);
      localStorage.removeItem("adminToken");
      localStorage.removeItem("adminUser");
      navigate("/admin/login");
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  const fetchContactSubmissions = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch("/api/admin/contact-submissions", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch submissions");
      }

      const data = await response.json();
      setContactSubmissions(data);
    } catch (error) {
      console.error("Error fetching submissions:", error);
      toast.error("Failed to load contact submissions");
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Link to="/admin/hero-images">
            <div className="bg-primary/5 p-6 rounded-lg border border-primary/10 hover:border-primary/30 transition-colors cursor-pointer h-full">
              <Images className="w-8 h-8 text-primary mb-4" />
              <h3 className="text-2xl font-bold text-foreground">
                Hero Images
              </h3>
              <p className="text-muted-foreground">Manage slider images</p>
            </div>
          </Link>
          <div className="bg-primary/5 p-6 rounded-lg border border-primary/10">
            <Mail className="w-8 h-8 text-primary mb-4" />
            <h3 className="text-2xl font-bold text-foreground">
              {contactSubmissions.length}
            </h3>
            <p className="text-muted-foreground">Contact Submissions</p>
          </div>
          <div className="bg-primary/5 p-6 rounded-lg border border-primary/10">
            <h3 className="text-2xl font-bold text-foreground">Active</h3>
            <p className="text-muted-foreground">Account status</p>
          </div>
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
