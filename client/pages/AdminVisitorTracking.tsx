import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "@/components/AdminLayout";
import { toast } from "sonner";
import {
  ChevronDown,
  Download,
  Filter,
  RefreshCw,
  Search,
  TrendingUp,
} from "lucide-react";

interface VisitorRecord {
  id: number;
  page_url: string;
  previous_page: string | null;
  timestamp: string;
  user_agent: string;
  device_type: string;
  screen_resolution: string;
  browser_language: string;
  timezone: string;
  referrer: string;
  connection_type: string;
  geolocation_latitude: number | null;
  geolocation_longitude: number | null;
  geolocation_country?: string | null;
  geolocation_country_code?: string | null;
  geolocation_city?: string | null;
  geolocation_timezone?: string | null;
  ip_address: string | null;
  session_id: string;
  local_time: string;
  platform: string;
}

interface FilterState {
  deviceType: string;
  connectionType: string;
  dateRange: string;
  searchQuery: string;
}

function get_country_flag(country_code: string): string {
  if (!country_code || country_code.length !== 2) return "🌍";
  const code = country_code.toUpperCase();
  const offset = 127397;
  const codePoints = [
    code.charCodeAt(0) - 65 + offset,
    code.charCodeAt(1) - 65 + offset,
  ];
  return String.fromCodePoint(...codePoints);
}

export default function AdminVisitorTracking() {
  const navigate = useNavigate();
  const [visitors, setVisitors] = useState<VisitorRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortField, setSortField] = useState<keyof VisitorRecord>("timestamp");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [filters, setFilters] = useState<FilterState>({
    deviceType: "",
    connectionType: "",
    dateRange: "",
    searchQuery: "",
  });
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      navigate("/admin/login");
      return;
    }

    fetchVisitorData();
  }, [navigate]);

  const fetchVisitorData = async () => {
    setIsLoading(true);
    try {
      const adminFetch = (await import("@/lib/adminApi")).default;
      const token = localStorage.getItem("adminToken");
      const res = await adminFetch("/api/admin/visitor-tracking", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res || !res.ok) {
        const json = res ? await res.json().catch(() => ({})) : {};
        const msg = json?.error || `Status ${res ? res.status : "network"}`;
        throw new Error(msg);
      }
      const data = await res.json();
      if (data && typeof data === "object" && "error" in data) {
        throw new Error((data as any).error || "Unknown error");
      }
      if (!Array.isArray(data)) {
        throw new Error("Invalid response from server");
      }
      setVisitors(data);
      toast.success("Visitor data loaded successfully");
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error("Error fetching visitor data:", errorMsg);
      toast.error(`Failed to load visitor data: ${errorMsg}`);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredVisitors = visitors.filter((visitor) => {
    if (filters.deviceType && visitor.device_type !== filters.deviceType) {
      return false;
    }
    if (
      filters.connectionType &&
      visitor.connection_type !== filters.connectionType
    ) {
      return false;
    }
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      return (
        visitor.page_url.toLowerCase().includes(query) ||
        visitor.ip_address?.toLowerCase().includes(query) ||
        visitor.session_id.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const sortedVisitors = [...filteredVisitors].sort((a, b) => {
    const aVal = a[sortField];
    const bVal = b[sortField];

    if (typeof aVal === "string" && typeof bVal === "string") {
      return sortDirection === "asc"
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    }

    if (typeof aVal === "number" && typeof bVal === "number") {
      return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
    }

    return 0;
  });

  const paginatedVisitors = sortedVisitors.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage,
  );
  const totalPages = Math.ceil(sortedVisitors.length / itemsPerPage);

  const deviceTypes = [...new Set(visitors.map((v) => v.device_type))];
  const connectionTypes = [...new Set(visitors.map((v) => v.connection_type))];

  const handleSort = (field: keyof VisitorRecord) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const handleExportCSV = () => {
    const headers = [
      "Timestamp",
      "Page URL",
      "Previous Page",
      "Device Type",
      "Screen Resolution",
      "Browser Language",
      "Connection Type",
      "IP Address",
      "Latitude",
      "Longitude",
      "Session ID",
    ];

    const rows = sortedVisitors.map((v) => [
      v.timestamp,
      v.page_url,
      v.previous_page || "N/A",
      v.device_type,
      v.screen_resolution,
      v.browser_language,
      v.connection_type,
      v.ip_address || "N/A",
      v.geolocation_latitude || "N/A",
      v.geolocation_longitude || "N/A",
      v.session_id,
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `visitor_tracking_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast.success("Data exported successfully");
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Visitor Tracking
            </h1>
            <p className="text-muted-foreground mt-1">
              Monitor and analyze visitor data and page analytics
            </p>
          </div>
          <button
            onClick={fetchVisitorData}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-6 border border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Visitors</p>
                <p className="text-3xl font-bold text-foreground mt-2">
                  {visitors.length}
                </p>
              </div>
              <TrendingUp className="w-10 h-10 text-primary/20" />
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 border border-border">
            <div>
              <p className="text-sm text-muted-foreground">Unique Sessions</p>
              <p className="text-3xl font-bold text-foreground mt-2">
                {new Set(visitors.map((v) => v.session_id)).size}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 border border-border">
            <div>
              <p className="text-sm text-muted-foreground">Pages Visited</p>
              <p className="text-3xl font-bold text-foreground mt-2">
                {new Set(visitors.map((v) => v.page_url)).size}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 border border-border">
            <div>
              <p className="text-sm text-muted-foreground">
                Most Common Device
              </p>
              <p className="text-xl font-bold text-foreground mt-2">
                {deviceTypes.length > 0
                  ? deviceTypes.sort(
                      (a, b) =>
                        visitors.filter((v) => v.device_type === b).length -
                        visitors.filter((v) => v.device_type === a).length,
                    )[0]
                  : "N/A"}
              </p>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg p-6 border border-border space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Filters</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Page URL, IP, Session ID..."
                  value={filters.searchQuery}
                  onChange={(e) =>
                    setFilters({ ...filters, searchQuery: e.target.value })
                  }
                  className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Device Type
              </label>
              <select
                value={filters.deviceType}
                onChange={(e) =>
                  setFilters({ ...filters, deviceType: e.target.value })
                }
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">All Devices</option>
                {deviceTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Connection Type
              </label>
              <select
                value={filters.connectionType}
                onChange={(e) =>
                  setFilters({ ...filters, connectionType: e.target.value })
                }
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">All Connections</option>
                {connectionTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Actions
              </label>
              <button
                onClick={handleExportCSV}
                className="w-full px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </button>
            </div>
          </div>
        </div>

        {/* Visitor Table */}
        <div className="bg-white rounded-lg border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <button
                      onClick={() => handleSort("timestamp")}
                      className="flex items-center gap-2 font-semibold text-foreground hover:text-primary"
                    >
                      Timestamp
                      <ChevronDown
                        className={`w-4 h-4 transition-transform ${
                          sortField === "timestamp" && sortDirection === "asc"
                            ? "rotate-180"
                            : ""
                        }`}
                      />
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left">
                    <button
                      onClick={() => handleSort("page_url")}
                      className="flex items-center gap-2 font-semibold text-foreground hover:text-primary"
                    >
                      Page URL
                      <ChevronDown
                        className={`w-4 h-4 transition-transform ${
                          sortField === "page_url" && sortDirection === "asc"
                            ? "rotate-180"
                            : ""
                        }`}
                      />
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left">
                    <button
                      onClick={() => handleSort("device_type")}
                      className="flex items-center gap-2 font-semibold text-foreground hover:text-primary"
                    >
                      Device
                      <ChevronDown
                        className={`w-4 h-4 transition-transform ${
                          sortField === "device_type" && sortDirection === "asc"
                            ? "rotate-180"
                            : ""
                        }`}
                      />
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left">
                    <button
                      onClick={() => handleSort("screen_resolution")}
                      className="flex items-center gap-2 font-semibold text-foreground hover:text-primary"
                    >
                      Resolution
                      <ChevronDown
                        className={`w-4 h-4 transition-transform ${
                          sortField === "screen_resolution" &&
                          sortDirection === "asc"
                            ? "rotate-180"
                            : ""
                        }`}
                      />
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left">
                    <button
                      onClick={() => handleSort("connection_type")}
                      className="flex items-center gap-2 font-semibold text-foreground hover:text-primary"
                    >
                      Connection
                      <ChevronDown
                        className={`w-4 h-4 transition-transform ${
                          sortField === "connection_type" &&
                          sortDirection === "asc"
                            ? "rotate-180"
                            : ""
                        }`}
                      />
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left font-semibold text-foreground">
                    IP Address
                  </th>
                  <th className="px-6 py-3 text-left font-semibold text-foreground">
                    Country
                  </th>
                  <th className="px-6 py-3 text-left font-semibold text-foreground">
                    City
                  </th>
                  <th className="px-6 py-3 text-left">
                    <button
                      onClick={() => handleSort("browser_language")}
                      className="flex items-center gap-2 font-semibold text-foreground hover:text-primary"
                    >
                      Language
                      <ChevronDown
                        className={`w-4 h-4 transition-transform ${
                          sortField === "browser_language" &&
                          sortDirection === "asc"
                            ? "rotate-180"
                            : ""
                        }`}
                      />
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedVisitors.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center">
                      <p className="text-muted-foreground">
                        No visitor data found
                      </p>
                    </td>
                  </tr>
                ) : (
                  paginatedVisitors.map((visitor) => (
                    <tr
                      key={visitor.id}
                      className="border-b border-border hover:bg-muted/50 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {new Date(visitor.timestamp).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-foreground max-w-xs truncate">
                        {visitor.page_url}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className="inline-flex px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                          {visitor.device_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {visitor.screen_resolution}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className="inline-flex px-3 py-1 bg-secondary/10 text-secondary rounded-full text-xs font-medium">
                          {visitor.connection_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground font-mono">
                        {visitor.ip_address || "N/A"}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className="inline-flex items-center gap-2">
                          {visitor.geolocation_country_code ? (
                            <>
                              <span className="text-base">
                                {get_country_flag(
                                  visitor.geolocation_country_code
                                )}
                              </span>
                              <span>{visitor.geolocation_country || "N/A"}</span>
                            </>
                          ) : (
                            <span className="text-muted-foreground">N/A</span>
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {visitor.geolocation_city || "N/A"}
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {visitor.browser_language}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-muted/30">
              <p className="text-sm text-muted-foreground">
                Showing {(page - 1) * itemsPerPage + 1} to{" "}
                {Math.min(page * itemsPerPage, sortedVisitors.length)} of{" "}
                {sortedVisitors.length} records
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 border border-border rounded-lg hover:bg-muted disabled:opacity-50"
                >
                  Previous
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }).map(
                    (_, i) => {
                      const pageNum = i + 1;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setPage(pageNum)}
                          className={`px-3 py-2 rounded-lg ${
                            page === pageNum
                              ? "bg-primary text-primary-foreground"
                              : "border border-border hover:bg-muted"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    },
                  )}
                </div>
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 border border-border rounded-lg hover:bg-muted disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
