import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import ProductItem from "../products/ProductItem";

export default function OrderDetail() {
  const { order_id } = useParams<{ order_id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (!order_id) return;
    setLoading(true);
    fetch(`https://demoshop.skyramp.dev/api/v1/orders/${order_id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch order details");
        return res.json();
      })
      .then((data) => {
        setOrder(data);
        setError(null);
        // Fetch product details for each order item
        if (data.items && data.items.length > 0) {
          Promise.all(
            data.items.map((item: any) =>
              fetch(`https://demoshop.skyramp.dev/api/v1/products/${item.product_id}`)
                .then((res) => res.ok ? res.json() : null)
                .catch(() => null)
            )
          ).then((products) => setProducts(products.filter(Boolean)));
        } else {
          setProducts([]);
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [order_id]);

  const handleCancelOrder = async () => {
    if (!order_id) return;
    setCancelling(true);
    try {
      const res = await fetch(`https://demoshop.skyramp.dev/api/v1/orders/${order_id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to cancel order');
      // Show banner on /orders
      localStorage.setItem(
        'deletedOrderBanner',
        JSON.stringify({ customer_email: order.customer_email, itemCount: order.items.length })
      );
      navigate('/orders');
    } catch (err: any) {
      alert(err.message || 'Failed to cancel order');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) return <div className="text-center py-8">Loading order details...</div>;
  if (error) return <div className="text-center text-red-500 py-8">{error}</div>;
  if (!order) return <div className="text-center py-8">Order not found.</div>;

  return (
    <div className="min-h-screen bg-white px-6 py-10 flex justify-start items-start" style={{ width: '100%', maxWidth: '48rem', margin: '0 auto' }}>
      <div className="w-full">
        <div className="mb-8">
          <h1 style={{ fontWeight: 700, fontSize: '1.5rem', lineHeight: '2rem' }} className="mb-2 text-left">Order #{order.order_id}</h1>
          <div style={{ marginBottom: '1rem' }} className="mb-1 text-left">
            <span style={{ color: '#9ca3af' }}>Customer Email:</span>
            <div style={{ fontSize: '1.125rem', fontWeight: 500 }} className="text-gray-900 mt-1">{order.customer_email}</div>
          </div>
          <div style={{ marginBottom: '1rem' }} className="mb-1 text-left">
            <span style={{ color: '#9ca3af' }}>Status:</span>
            <div style={{ fontSize: '1.125rem', fontWeight: 500, textTransform: 'capitalize' }} className="text-gray-900 mt-1">{order.status === 'confirmed' ? 'Confirmed' : order.status}</div>
          </div>
          <div style={{ marginBottom: '1rem' }} className="mb-1 text-left">
            <span style={{ color: '#9ca3af' }}>Total:</span>
            <div style={{ fontSize: '1.125rem', fontWeight: 500 }} className="text-gray-900 mt-1">${order.total_amount.toFixed(2)}</div>
          </div>
        </div>
        <h2 style={{ fontWeight: 700, fontSize: '1.5rem', lineHeight: '2rem' }} className="mb-4 text-left">Order Items</h2>
        <div className="flex flex-col gap-4 mb-8">
          {products.length === 0 && <div className="text-gray-500 text-left">No products found for this order.</div>}
          {products.map((product, idx) => (
            <ProductItem key={product.product_id || idx} product={product} />
          ))}
        </div>
        {order.status !== 'cancelled' && (
          <div className="flex justify-start" style={{ marginTop: '3rem' }}>
            <Button
              variant="destructive"
              className="w-fit"
              onClick={handleCancelOrder}
              disabled={cancelling}
              style={{ color: '#fff' }}
            >
              {cancelling ? 'Cancelling...' : 'Cancel Order'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
