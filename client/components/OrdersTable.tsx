import { Trash2, Edit2, ChevronDown } from "lucide-react";

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
  totalPrice: number | string;
  createdAt: string;
  updatedAt: string;
}

interface OrdersTableProps {
  orders: Order[];
  expandedOrderId: number | null;
  onExpandOrder: (orderId: number | null) => void;
  onEditOrder: (order: Order) => void;
  onDeleteOrder: (orderId: number) => void;
}

export default function OrdersTable({
  orders,
  expandedOrderId,
  onExpandOrder,
  onEditOrder,
  onDeleteOrder,
}: OrdersTableProps) {
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

  if (orders.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-primary/10 p-8 text-center">
        <p className="text-muted-foreground">No orders yet</p>
      </div>
    );
  }

  const expandedOrder = orders.find((o) => o.id === expandedOrderId);

  return (
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
                  KES{" "}
                  {order.totalPrice
                    ? typeof order.totalPrice === "string"
                      ? parseFloat(order.totalPrice).toFixed(2).toLocaleString()
                      : order.totalPrice.toFixed(2).toLocaleString()
                    : "-"}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                      order.status,
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
                      onClick={() => onEditOrder(order)}
                      title="Edit order"
                      className="p-1.5 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteOrder(order.id)}
                      title="Delete order"
                      className="p-1.5 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        onExpandOrder(expandedOrderId === order.id ? null : order.id);
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

      {expandedOrder && (
        <div className="border-t border-primary/10 bg-primary/5 p-4">
          <h3 className="font-semibold text-foreground mb-3">Order Details</h3>
          <div className="grid grid-cols-2 gap-3 text-sm max-w-2xl">
            <div>
              <p className="text-muted-foreground">Phone</p>
              <p className="font-medium">{expandedOrder.phone}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Location</p>
              <p className="font-medium">{expandedOrder.location}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Preferred Delivery Date</p>
              <p className="font-medium">{expandedOrder.deliveryDate || "-"}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Notes</p>
              <p className="font-medium">{expandedOrder.notes || "-"}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
