import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { LogOut, LayoutDashboard, Mail } from "lucide-react";

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

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    toast.success("Logged out successfully");
    navigate("/admin/login");
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-primary/10 bg-primary/5">
        <div className="container mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <LayoutDashboard className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold text-primary">
              Admin Dashboard
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="font-semibold text-foreground">{user?.fullName}</p>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 md:px-6 py-12">
        {/* Welcome Section */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Welcome, {user?.fullName}!
          </h2>
          <p className="text-muted-foreground">
            Manage your Cornbelt Flour Mill application from here.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-primary/5 p-6 rounded-lg border border-primary/10">
            <Mail className="w-8 h-8 text-primary mb-4" />
            <h3 className="text-2xl font-bold text-foreground">
              {contactSubmissions.length}
            </h3>
            <p className="text-muted-foreground">Contact Submissions</p>
          </div>
          <div className="bg-primary/5 p-6 rounded-lg border border-primary/10">
            <h3 className="text-2xl font-bold text-foreground">Admin Panel</h3>
            <p className="text-muted-foreground">All systems operational</p>
          </div>
          <div className="bg-primary/5 p-6 rounded-lg border border-primary/10">
            <h3 className="text-2xl font-bold text-foreground">Active</h3>
            <p className="text-muted-foreground">Account status</p>
          </div>
        </div>

        {/* Contact Submissions */}
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

        {/* System Info */}
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
      </main>
    </div>
  );
}
