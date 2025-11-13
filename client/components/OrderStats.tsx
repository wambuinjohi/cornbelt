interface Order {
  id: number;
  status: string;
  totalPrice: number;
}

interface OrderStatsProps {
  orders: Order[];
}

export default function OrderStats({ orders }: OrderStatsProps) {
  const totalRevenue = orders.reduce(
    (sum, o) => sum + (typeof o.totalPrice === "string" ? parseFloat(o.totalPrice) : o.totalPrice || 0),
    0,
  );
  const pendingCount = orders.filter((o) => o.status === "pending").length;
  const confirmedCount = orders.filter((o) => o.status === "confirmed").length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="bg-white p-4 rounded-lg border border-primary/10">
        <p className="text-sm text-muted-foreground mb-1">Total Orders</p>
        <p className="text-3xl font-bold text-primary whitespace-nowrap">
          {orders.length}
        </p>
      </div>
      <div className="bg-white p-4 rounded-lg border border-primary/10">
        <p className="text-sm text-muted-foreground mb-1">Pending</p>
        <p className="text-3xl font-bold text-yellow-600 whitespace-nowrap">
          {pendingCount}
        </p>
      </div>
      <div className="bg-white p-4 rounded-lg border border-primary/10">
        <p className="text-sm text-muted-foreground mb-1">Confirmed</p>
        <p className="text-3xl font-bold text-blue-600 whitespace-nowrap">
          {confirmedCount}
        </p>
      </div>
      <div className="bg-white p-4 rounded-lg border border-primary/10">
        <p className="text-sm text-muted-foreground mb-1">Total Revenue</p>
        <p className="text-2xl font-bold text-green-600 whitespace-nowrap break-words">
          KES {totalRevenue.toFixed(2).toLocaleString()}
        </p>
      </div>
    </div>
  );
}
