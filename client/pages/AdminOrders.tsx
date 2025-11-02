import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Trash2,
  Edit2,
  Eye,
  Download,
  ChevronDown,
  X,
} from "lucide-react";
import { toast } from "sonner";

interface Order {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  location: string;
  product: string;
  size: string;
  quantity: number;
  deliveryDate: string;
  notes: string;
  status: string;
  totalPrice: number;
  createdAt: string;
  updatedAt: string;
}

export default function AdminOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [editingStatus, setEditingStatus] = useState<string>("");
  const [editingNotes, setEditingNotes] = useState<string>("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteOrderId, setDeleteOrderId] = useState<number | null>(null);
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);

  const token = localStorage.getItem("adminToken");

  useEffect(() => {
    if (!token) {
      navigate("/admin/login");
      return;
    }
    fetchOrders();
  }, [token, navigate]);

  const fetchOrders = async () => {
    try {
      const response = await fetch("/api/admin/orders", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          navigate("/admin/login");
          return;
        }
        throw new Error("Failed to fetch orders");
      }

      const data = await response.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId: number) => {
    if (!editingStatus) {
      toast.error("Please select a status");
      return;
    }

    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: editingStatus,
          notes: editingNotes,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update order");
      }

      toast.success("Order updated successfully");
      setSelectedOrder(null);
      setEditingStatus("");
      setEditingNotes("");
      fetchOrders();
    } catch (error) {
      console.error("Error updating order:", error);
      toast.error("Failed to update order");
    }
  };

  const handleDeleteOrder = async () => {
    if (!deleteOrderId) return;

    try {
      const response = await fetch(`/api/admin/orders/${deleteOrderId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete order");
      }

      toast.success("Order deleted successfully");
      setShowDeleteDialog(false);
      setDeleteOrderId(null);
      fetchOrders();
    } catch (error) {
      console.error("Error deleting order:", error);
      toast.error("Failed to delete order");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "confirmed":
        return "bg-blue-100 text-blue-800";
      case "shipped":
        return "bg-purple-100 text-purple-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const exportToCSV = () => {
    const headers = [
      "ID",
      "Full Name",
      "Email",
      "Phone",
      "Location",
      "Product",
      "Size",
      "Quantity",
      "Total Price",
      "Status",
      "Delivery Date",
      "Created Date",
    ];

    const rows = orders.map((order) => [
      order.id,
      order.fullName,
      order.email,
      order.phone,
      order.location,
      order.product,
      order.size,
      order.quantity,
      order.totalPrice,
      order.status,
      order.deliveryDate || "-",
      new Date(order.createdAt).toLocaleDateString(),
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `orders-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-20">
          <p className="text-muted-foreground">Loading orders...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Orders</h1>
            <p className="text-muted-foreground mt-1">
              Manage customer orders and track shipments
            </p>
          </div>
          <Button
            onClick={exportToCSV}
            variant="outline"
            className="gap-2"
            disabled={orders.length === 0}
          >
            <Download className="w-4 h-4" />
            Export to CSV
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg border border-primary/10">
            <p className="text-sm text-muted-foreground mb-1">Total Orders</p>
            <p className="text-3xl font-bold text-primary">{orders.length}</p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-primary/10">
            <p className="text-sm text-muted-foreground mb-1">Pending</p>
            <p className="text-3xl font-bold text-yellow-600">
              {orders.filter((o) => o.status === "pending").length}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-primary/10">
            <p className="text-sm text-muted-foreground mb-1">Confirmed</p>
            <p className="text-3xl font-bold text-blue-600">
              {orders.filter((o) => o.status === "confirmed").length}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-primary/10">
            <p className="text-sm text-muted-foreground mb-1">Total Revenue</p>
            <p className="text-3xl font-bold text-green-600">
              KES {orders.reduce((sum, o) => sum + (o.totalPrice || 0), 0).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Orders Table */}
        {orders.length === 0 ? (
          <div className="bg-white rounded-lg border border-primary/10 p-8 text-center">
            <p className="text-muted-foreground">No orders yet</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-primary/10 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-primary/5 border-b border-primary/10">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                      Customer
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                      Product
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                      Qty/Size
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                      Price
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                      Date
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-foreground">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-primary/10">
                  {orders.map((order) => (
                    <tr
                      key={order.id}
                      className="hover:bg-primary/5 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-foreground">
                            {order.fullName}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {order.email}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-foreground">
                        {order.product}
                      </td>
                      <td className="px-4 py-3 text-sm text-foreground">
                        {order.quantity} x {order.size}
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-primary">
                        KES {order.totalPrice?.toLocaleString() || "-"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                            order.status
                          )}`}
                        >
                          {order.status.charAt(0).toUpperCase() +
                            order.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => {
                              setSelectedOrder(order);
                              setEditingStatus(order.status);
                              setEditingNotes(order.notes || "");
                            }}
                            title="Edit order"
                            className="p-1.5 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setDeleteOrderId(order.id);
                              setShowDeleteDialog(true);
                            }}
                            title="Delete order"
                            className="p-1.5 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setExpandedOrderId(
                                expandedOrderId === order.id ? null : order.id
                              );
                            }}
                            title="View details"
                            className="p-1.5 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                          >
                            <ChevronDown className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Expanded Details Row */}
            {expandedOrderId && (
              <div className="border-t border-primary/10 bg-primary/5 p-4">
                {orders.find((o) => o.id === expandedOrderId) && (
                  <div className="max-w-2xl">
                    <h3 className="font-semibold text-foreground mb-3">
                      Order Details
                    </h3>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-muted-foreground">Phone</p>
                        <p className="font-medium">
                          {orders.find((o) => o.id === expandedOrderId)?.phone}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Location</p>
                        <p className="font-medium">
                          {orders.find((o) => o.id === expandedOrderId)?.location}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">
                          Preferred Delivery Date
                        </p>
                        <p className="font-medium">
                          {orders.find((o) => o.id === expandedOrderId)
                            ?.deliveryDate || "-"}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Notes</p>
                        <p className="font-medium">
                          {orders.find((o) => o.id === expandedOrderId)?.notes ||
                            "-"}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Edit Order Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-primary/10">
                <h2 className="text-2xl font-bold text-foreground">
                  Edit Order #{selectedOrder.id}
                </h2>
                <button
                  onClick={() => {
                    setSelectedOrder(null);
                    setEditingStatus("");
                    setEditingNotes("");
                  }}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Status
                  </label>
                  <Select value={editingStatus} onValueChange={setEditingStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="shipped">Shipped</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Notes
                  </label>
                  <Textarea
                    value={editingNotes}
                    onChange={(e) => setEditingNotes(e.target.value)}
                    placeholder="Add any notes about this order..."
                    className="min-h-24"
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="flex gap-3 p-6 border-t border-primary/10 bg-primary/5">
                <button
                  onClick={() => {
                    setSelectedOrder(null);
                    setEditingStatus("");
                    setEditingNotes("");
                  }}
                  className="flex-1 px-4 py-2 border border-primary text-primary rounded-lg hover:bg-primary/5 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleStatusUpdate(selectedOrder.id)}
                  className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogTitle>Delete Order?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this order? This action cannot be
              undone.
            </AlertDialogDescription>
            <div className="flex gap-3 justify-end">
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteOrder}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete
              </AlertDialogAction>
            </div>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminLayout>
  );
}
