import React, { useEffect, useState } from "react";
import OrderItem from "./OrderItem";

export type Order = {
  order_id: number;
  customer_email: string;
  items: Array<any>;
  total_amount: number;
};

export default function OrderList() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch("https://demoshop.skyramp.dev/api/v1/orders?limit=50")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch orders");
        return res.json();
      })
      .then((data) => {
        // The API returns an array directly; filter out cancelled orders
        const filtered = Array.isArray(data) ? data.filter((order) => order.status !== 'cancelled') : [];
        setOrders(filtered);
        setError(null);
        console.log("order store", filtered);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-8">Loading orders...</div>;
  if (error) return <div className="text-center text-red-500 py-8">{error}</div>;
  if (!orders.length) return <div className="text-center py-8">No orders found.</div>;

  return (
    <div
      className="w-full max-w-3xl mx-auto flex flex-col"
      style={{ gap: '2.5rem', display: 'flex', flexDirection: 'column', maxWidth: '64rem', width: '100%', margin: '0 auto' }}
    >
      {orders.map((order) => (
        <OrderItem
          key={order.order_id}
          order={order}
          gapOverride={"16rem"}
          data-testId={`order-id-${order.customer_email} - ${order.items.length} items`}
        />
      ))}
    </div>
  );
}
