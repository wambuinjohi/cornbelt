import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Download, Plus } from "lucide-react";
import { toast } from "sonner";
import OrderStats from "@/components/OrderStats";
import OrdersTable from "@/components/OrdersTable";
import EditOrderModal from "@/components/EditOrderModal";
import CreateOrderModal from "@/components/CreateOrderModal";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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

interface CreateFormData {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  product: string;
  size: string;
  quantity: number;
  deliveryDate: string;
  notes: string;
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
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [createFormData, setCreateFormData] = useState<CreateFormData>({
    fullName: "",
    email: "",
    phone: "",
    location: "",
    product: "Jirani Maize Meal",
    size: "2kg",
    quantity: 1,
    deliveryDate: "",
    notes: "",
  });

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
      const adminFetch = (await import("@/lib/adminApi")).default;
      const response = await adminFetch("/api/admin/orders", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response || !response.ok) {
        if (response && response.status === 401) {
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
      const adminFetch = (await import("@/lib/adminApi")).default;
      const response = await adminFetch(`/api/admin/orders/${orderId}`, {
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

      if (!response || !response.ok) {
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

  const handleCreateOrder = async () => {
    if (
      !createFormData.fullName ||
      !createFormData.email ||
      !createFormData.phone ||
      !createFormData.product ||
      !createFormData.size ||
      !createFormData.quantity
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsCreatingOrder(true);
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(createFormData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create order");
      }

      const result = await response.json();
      toast.success("Order created successfully!");
      setShowCreateModal(false);
      setCreateFormData({
        fullName: "",
        email: "",
        phone: "",
        location: "",
        product: "Jirani Maize Meal",
        size: "2kg",
        quantity: 1,
        deliveryDate: "",
        notes: "",
      });
      fetchOrders();
    } catch (error) {
      console.error("Error creating order:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to create order",
      );
    } finally {
      setIsCreatingOrder(false);
    }
  };

  const handleDeleteOrder = async () => {
    if (!deleteOrderId) return;

    try {
      const adminFetch = (await import("@/lib/adminApi")).default;
      const response = await adminFetch(`/api/admin/orders/${deleteOrderId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response || !response.ok) {
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
          <div className="flex gap-2">
            <Button onClick={() => setShowCreateModal(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Create Order
            </Button>
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
        </div>

        {/* Stats Component */}
        <OrderStats orders={orders} />

        {/* Table Component */}
        <OrdersTable
          orders={orders}
          expandedOrderId={expandedOrderId}
          onExpandOrder={setExpandedOrderId}
          onEditOrder={(order) => {
            setSelectedOrder(order);
            setEditingStatus(order.status);
            setEditingNotes(order.notes || "");
          }}
          onDeleteOrder={(orderId) => {
            setDeleteOrderId(orderId);
            setShowDeleteDialog(true);
          }}
        />

        {/* Edit Order Modal */}
        {selectedOrder && (
          <EditOrderModal
            order={selectedOrder}
            status={editingStatus}
            notes={editingNotes}
            onStatusChange={setEditingStatus}
            onNotesChange={setEditingNotes}
            onClose={() => {
              setSelectedOrder(null);
              setEditingStatus("");
              setEditingNotes("");
            }}
            onSave={() => handleStatusUpdate(selectedOrder.id)}
          />
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

        {/* Create Order Modal */}
        {showCreateModal && (
          <CreateOrderModal
            formData={createFormData}
            isLoading={isCreatingOrder}
            onFormChange={setCreateFormData}
            onClose={() => {
              setShowCreateModal(false);
              setCreateFormData({
                fullName: "",
                email: "",
                phone: "",
                location: "",
                product: "Jirani Maize Meal",
                size: "2kg",
                quantity: 1,
                deliveryDate: "",
                notes: "",
              });
            }}
            onSubmit={handleCreateOrder}
          />
        )}
      </div>
    </AdminLayout>
  );
}
