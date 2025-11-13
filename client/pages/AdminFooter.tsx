import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "@/components/AdminLayout";
import { toast } from "sonner";
import { Save, AlertCircle } from "lucide-react";

interface FooterSettings {
  id: number;
  phone: string;
  email: string;
  location: string;
  facebookUrl?: string;
  instagramUrl?: string;
  twitterUrl?: string;
}

export default function AdminFooter() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [footerData, setFooterData] = useState<FooterSettings | null>(null);
  const [formData, setFormData] = useState<Partial<FooterSettings>>({
    phone: "",
    email: "",
    location: "",
    facebookUrl: "",
    instagramUrl: "",
    twitterUrl: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      navigate("/admin/login");
      return;
    }
    initTableAndFetch();
  }, [navigate]);

  const initTableAndFetch = async () => {
    try {
      setIsLoading(true);
      setError("");

      // First, ensure table exists
      const createTableResponse = await fetch("/api.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          table: "footer_settings",
          create_table: true,
          columns: {
            id: "INT PRIMARY KEY AUTO_INCREMENT",
            phone: "VARCHAR(255) NOT NULL",
            email: "VARCHAR(255) NOT NULL",
            location: "VARCHAR(255) NOT NULL",
            facebookUrl: "VARCHAR(255)",
            instagramUrl: "VARCHAR(255)",
            twitterUrl: "VARCHAR(255)",
            updatedAt:
              "TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP",
          },
        }),
      });

      if (!createTableResponse.ok) {
        console.warn(
          "Table creation response not ok:",
          createTableResponse.status,
        );
      }

      // Then fetch the data
      await fetchFooterSettings();
    } catch (err) {
      console.error("Error initializing table:", err);
      setError(
        "Failed to initialize footer settings. Please check database connection.",
      );
    }
  };

  const initializeFooterTable = async () => {
    try {
      const response = await fetch("/api.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          table: "footer_settings",
          create_table: true,
          columns: {
            id: "INT PRIMARY KEY AUTO_INCREMENT",
            phone: "VARCHAR(255) NOT NULL",
            email: "VARCHAR(255) NOT NULL",
            location: "VARCHAR(255) NOT NULL",
            facebookUrl: "VARCHAR(255)",
            instagramUrl: "VARCHAR(255)",
            twitterUrl: "VARCHAR(255)",
            updatedAt:
              "TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP",
          },
        }),
      });

      const result = await response.json();
      console.log("Table creation result:", result);

      // Insert default settings
      const insertResponse = await fetch("/api.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          table: "footer_settings",
          phone: "+254 (0) XXX XXX XXX",
          email: "info@cornbelt.co.ke",
          location: "Kenya",
          facebookUrl: "https://facebook.com",
          instagramUrl: "https://instagram.com",
          twitterUrl: "https://twitter.com",
        }),
      });

      const insertResult = await insertResponse.json();
      console.log("Insert result:", insertResult);

      if (insertResult.success) {
        toast.success("Footer table initialized successfully!");
        fetchFooterSettings();
      }
    } catch (err) {
      console.error("Error initializing footer table:", err);
      toast.error("Failed to initialize footer table");
    }
  };

  const fetchFooterSettings = async () => {
    try {
      setIsLoading(true);
      setError("");
      const token = localStorage.getItem("adminToken");

      // Use api.php admin endpoint directly (works on Apache without Node server)
      const response = await fetch("/api/admin/footer-settings", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response) {
        throw new Error("Network request failed");
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error ||
            `HTTP ${response.status}: Failed to fetch footer settings`,
        );
      }

      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        const settings = data[0];
        setFooterData(settings);
        setFormData({
          id: settings.id,
          phone: settings.phone || "",
          email: settings.email || "",
          location: settings.location || "",
          facebookUrl: settings.facebookUrl || "",
          instagramUrl: settings.instagramUrl || "",
          twitterUrl: settings.twitterUrl || "",
        });
      } else {
        // No data yet, seed default footer settings
        await seedDefaultFooterSettings();
      }
    } catch (err) {
      console.error("Error fetching footer settings:", err);
      setError(
        `Failed to load footer settings: ${err instanceof Error ? err.message : "Unknown error"}`,
      );
      // Provide empty form anyway
      setFormData({
        phone: "",
        email: "",
        location: "",
        facebookUrl: "",
        instagramUrl: "",
        twitterUrl: "",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const seedDefaultFooterSettings = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const defaultSettings = {
        phone: "+254 (0) XXX XXX XXX",
        email: "info@cornbelt.co.ke",
        location: "Kenya",
        facebookUrl: "https://facebook.com",
        instagramUrl: "https://instagram.com",
        twitterUrl: "https://twitter.com",
      };

      const response = await (
        await import("@/lib/adminApi")
      ).default("/api/admin/footer-settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(defaultSettings),
      });

      if (!response || !response.ok) {
        throw new Error("Failed to seed default footer settings");
      }

      const result = await response.json();
      setFormData(defaultSettings);
      setError("");
      await fetchFooterSettings();
    } catch (err) {
      console.error("Error seeding default footer settings:", err);
      setError(
        "Failed to initialize footer settings. Fill in the form and click 'Save Changes'.",
      );
      setFormData({
        phone: "",
        email: "",
        location: "",
        facebookUrl: "",
        instagramUrl: "",
        twitterUrl: "",
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError("");
      setSuccess("");

      if (!formData.phone || !formData.email || !formData.location) {
        setError("Phone, email, and location are required fields.");
        setIsSaving(false);
        return;
      }

      const token = localStorage.getItem("adminToken");
      const adminFetch = (await import("@/lib/adminApi")).default;

      // Prepare the body
      const payloadData = {
        phone: formData.phone,
        email: formData.email,
        location: formData.location,
        facebookUrl: formData.facebookUrl || "",
        instagramUrl: formData.instagramUrl || "",
        twitterUrl: formData.twitterUrl || "",
      };

      if (footerData?.id) {
        // Update existing - try Node endpoint first, fallback to PHP
        let response = await adminFetch(
          `/api/admin/footer-settings?id=${footerData.id}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(payloadData),
          },
        );

        // If Node endpoint fails, try PHP endpoint
        if (!response || !response.ok) {
          response = await fetch(
            `/api.php?table=footer_settings&id=${footerData.id}`,
            {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ id: footerData.id, ...payloadData }),
            },
          );
        }

        if (!response) {
          throw new Error("Network request failed");
        }

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.error || `HTTP ${response.status}: Failed to update`,
          );
        }

        setSuccess("Footer settings updated successfully!");
        toast.success("Footer settings updated successfully");
        await fetchFooterSettings();
      } else {
        // Create new - try Node endpoint first, fallback to PHP
        let response = await adminFetch("/api/admin/footer-settings", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payloadData),
        });

        // If Node endpoint fails, try PHP endpoint
        if (!response || !response.ok) {
          response = await fetch(`/api.php?table=footer_settings`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payloadData),
          });
        }

        if (!response) {
          throw new Error("Network request failed");
        }

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.error || `HTTP ${response.status}: Failed to create`,
          );
        }

        setSuccess("Footer settings created successfully!");
        toast.success("Footer settings created successfully");
        await fetchFooterSettings();
      }
    } catch (err) {
      console.error("Error saving footer settings:", err);
      const errorMsg =
        err instanceof Error
          ? `Failed to save: ${err.message}`
          : "Failed to save footer settings";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="container mx-auto px-4 md:px-6 py-12">
          <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 md:px-6 py-12">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Footer Settings
        </h1>
        <p className="text-muted-foreground mb-8">
          Manage footer contact information and social media links
        </p>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3 items-start">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-red-900">{error}</h3>
              {error.includes("Initialize") && (
                <button
                  onClick={initializeFooterTable}
                  className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm font-medium"
                >
                  Initialize Footer Table
                </button>
              )}
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-800">{success}</p>
          </div>
        )}

        <div className="bg-background border border-primary/10 rounded-lg p-6 md:p-8">
          <div className="space-y-6">
            {/* Contact Information Section */}
            <div className="border-b border-primary/10 pb-6">
              <h2 className="text-xl font-bold text-foreground mb-6">
                Contact Information
              </h2>

              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-foreground mb-2"
                  >
                    Phone Number
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    name="phone"
                    value={formData.phone || ""}
                    onChange={handleInputChange}
                    placeholder="+254 (0) XXX XXX XXX"
                    className="w-full px-4 py-2 border border-primary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-foreground mb-2"
                  >
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    value={formData.email || ""}
                    onChange={handleInputChange}
                    placeholder="info@cornbelt.co.ke"
                    className="w-full px-4 py-2 border border-primary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                  />
                </div>

                <div>
                  <label
                    htmlFor="location"
                    className="block text-sm font-medium text-foreground mb-2"
                  >
                    Location
                  </label>
                  <input
                    id="location"
                    type="text"
                    name="location"
                    value={formData.location || ""}
                    onChange={handleInputChange}
                    placeholder="Kenya"
                    className="w-full px-4 py-2 border border-primary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                  />
                </div>
              </div>
            </div>

            {/* Social Media Links Section */}
            <div>
              <h2 className="text-xl font-bold text-foreground mb-6">
                Social Media Links
              </h2>

              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="facebookUrl"
                    className="block text-sm font-medium text-foreground mb-2"
                  >
                    Facebook URL
                  </label>
                  <input
                    id="facebookUrl"
                    type="url"
                    name="facebookUrl"
                    value={formData.facebookUrl || ""}
                    onChange={handleInputChange}
                    placeholder="https://facebook.com/cornbelt"
                    className="w-full px-4 py-2 border border-primary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                  />
                </div>

                <div>
                  <label
                    htmlFor="instagramUrl"
                    className="block text-sm font-medium text-foreground mb-2"
                  >
                    Instagram URL
                  </label>
                  <input
                    id="instagramUrl"
                    type="url"
                    name="instagramUrl"
                    value={formData.instagramUrl || ""}
                    onChange={handleInputChange}
                    placeholder="https://instagram.com/cornbelt"
                    className="w-full px-4 py-2 border border-primary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                  />
                </div>

                <div>
                  <label
                    htmlFor="twitterUrl"
                    className="block text-sm font-medium text-foreground mb-2"
                  >
                    Twitter/X URL
                  </label>
                  <input
                    id="twitterUrl"
                    type="url"
                    name="twitterUrl"
                    value={formData.twitterUrl || ""}
                    onChange={handleInputChange}
                    placeholder="https://twitter.com/cornbelt"
                    className="w-full px-4 py-2 border border-primary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                  />
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="pt-6 border-t border-primary/10 flex gap-4">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                <Save className="w-5 h-5" />
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>

        {footerData && (
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-sm font-semibold text-blue-900 mb-2">
              Last Updated
            </h3>
            <p className="text-sm text-blue-800">
              {footerData.updatedAt
                ? new Date(footerData.updatedAt).toLocaleString()
                : "Never"}
            </p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
