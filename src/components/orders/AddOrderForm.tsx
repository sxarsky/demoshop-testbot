import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import "@/styles/select-zindex-workaround.css";
import { useNavigate } from "react-router-dom";
import { getSessionIdFromCookie } from '../../lib/utils';

interface Product {
  product_id: string;
  name: string;
  price: number;
}

interface OrderProduct {
  product_id: string;
  quantity: number;
}

interface Order {
  customer_email: string;
  items: OrderProduct[];
}

const AddOrderForm: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [order, setOrder] = useState<Order>({
    customer_email: "",
    items: [],
  });
  const [productsList, setProductsList] = useState<Product[]>([]);
  const [addingProduct, setAddingProduct] = useState<OrderProduct>({ product_id: "", quantity: 1 });
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("https://dev.demoshop.skyramp.dev/api/v1/products?limit=50", {
      headers: { 'Authorization': `Bearer ${getSessionIdFromCookie()}` }
    })
      .then(res => res.json())
      .then(data => setProductsList(data))
      .catch(() => setProductsList([]));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setOrder(prev => ({ ...prev, [name]: value }));
  };

  const handleAddProduct = () => {
    console.log("Adding product:", addingProduct);
    console.log("Current order items:", order.items);
    if (!addingProduct.product_id || addingProduct.quantity < 1) return;
    // Prevent duplicate products
    if (order.items.some(p => p.product_id === addingProduct.product_id)) return;
    console.log("Adding product to order:", addingProduct);
    setOrder(prev => ({
      ...prev,
      items: [...prev.items, { ...addingProduct }],
    }));
    setAddingProduct({ product_id: "", quantity: 1 });
  };

  const handleRemoveProduct = (idx: number) => {
    setOrder(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== idx),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!order.customer_email || order.items.length === 0) {
      setError("All fields and at least one product are required.");
      return;
    }
    try {
      const res = await fetch("https://dev.demoshop.skyramp.dev/api/v1/orders", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          'Authorization': `Bearer ${getSessionIdFromCookie()}`
        },
        body: JSON.stringify(order),
      });
      if (!res.ok) throw new Error("Failed to create order");
      const data = await res.json();
      if (data && data.order_id) {
        navigate(`/orders/${data.order_id}`);
        onClose();
      }
    } catch (err) {
      setError("Failed to create order.");
    }
  };

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(31, 41, 55, 0.35)",
        position: "fixed",
        inset: 0,
        zIndex: 100,
      }}
    >
      <div
        style={{
          maxWidth: "40rem",
          minWidth: "28rem",
          minHeight: "32rem",
          width: "100%",
          background: "#fff",
          borderRadius: "0.75rem",
          boxShadow:
            "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)",
          padding: "1.5rem",
          position: "relative",
          display: "flex",
          flexDirection: "column",
          overflow: 'auto',
        }}
      >
        <button
          style={{
            position: "absolute",
            top: "1rem",
            right: "1rem",
            color: "#6b7280",
            background: "white",
            borderRadius: "9999px",
            fontSize: "1.25rem",
            fontWeight: 700,
            width: '1.75rem',
            height: '1.75rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 0,
            boxShadow: "0 1px 2px 0 rgba(0,0,0,0.05)",
            zIndex: 10,
            border: "1.5px solid #888",
            cursor: "pointer",
            transition: "color 0.2s, border-color 0.2s",
          }}
          onMouseOver={e => {
            e.currentTarget.style.color = "#000";
            e.currentTarget.style.borderColor = "#222";
          }}
          onMouseOut={e => {
            e.currentTarget.style.color = "#6b7280";
            e.currentTarget.style.borderColor = "#888";
          }}
          onClick={onClose}
          aria-label="Close"
          type="button"
        >
          ×
        </button>
        <h3 className="text-2xl font-semibold text-center mb-6">Add new order</h3>
        {error && <div className="text-red-500 text-center mb-2">{error}</div>}
        <form className="flex flex-col" style={{ gap: "1rem" }} onSubmit={handleSubmit}>
          <div className="pb-1">
            <label className="block text-sm font-medium text-gray-700 mb-1 text-left">Customer Email</label>
            <Input name="customer_email" placeholder="e.g. user@email.com" value={order.customer_email} onChange={handleChange} className="w-full min-w-[280px] max-w-full px-4 py-2" style={{ fontFamily: 'inherit', fontSize: '1rem', fontWeight: 400, border: '1.5px solid #d1d5db', outline: 'none', transition: 'border-color 0.2s, box-shadow 0.2s' }} onFocus={e => { e.currentTarget.style.border = '1.5px solid #6b7280'; e.currentTarget.style.boxShadow = '0 0 0 1.5px #6b7280'; }} onBlur={e => { e.currentTarget.style.border = '1.5px solid #d1d5db'; e.currentTarget.style.boxShadow = 'none'; }} />
          </div>
          <div className="pb-1">
            <label className="block text-sm font-medium text-gray-700 mb-1 text-left">Products</label>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <div style={{ position: 'relative', minWidth: '260px', flex: 1 }}>
                <Select
                  value={addingProduct.product_id}
                  onValueChange={val => setAddingProduct(ap => ({ ...ap, product_id: val }))}
                >
                  <SelectTrigger
                    style={{
                      border: '1.5px solid #d1d5db',
                      outline: 'none',
                      transition: 'border-color 0.2s, box-shadow 0.2s',
                      width: '100%',
                      minWidth: '260px',
                      padding: '0.5rem 1rem',
                      background: '#fff',
                      borderRadius: '0.375rem',
                      fontSize: '1rem',
                      fontWeight: 400,
                      color: '#111827',
                      textAlign: 'left',
                    }}
                  >
                    <SelectValue placeholder="Select product...">
                      {addingProduct.product_id && productsList.length > 0
                        ? (() => {
                            const selected = productsList.find(p => String(p.product_id).trim() === String(addingProduct.product_id).trim());
                            return selected
                              ? <span style={{fontWeight:500}}>{selected.name} <span style={{color:'#6b7280',fontWeight:400}}>${selected.price}</span></span>
                              : null;
                          })()
                        : null}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {productsList.map(p => (
                      <SelectItem key={p.product_id} value={p.product_id} style={{ paddingLeft: '0.5rem', borderBottom: '1px solid #e5e7eb' }}>
                        {p.name} (${p.price})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Input type="number" min={1} max={999} value={addingProduct.quantity} onChange={e => setAddingProduct(ap => ({ ...ap, quantity: Math.max(1, Number(e.target.value)) }))} style={{ border: '1.5px solid #d1d5db', fontSize: '1rem', width: '3.5rem', textAlign: 'center', paddingLeft: 0, paddingRight: 0, borderRadius: '0.375rem', height: '2.5rem' }} />
              <Button type="button" onClick={() => handleAddProduct()} style={{ background: '#f3f4f6', color: '#111', border: '1.5px solid transparent', outline: 'none', transition: 'background 0.2s, border-color 0.2s, outline 0.2s', marginLeft: '0.5rem', height: '2.5rem', borderRadius: '0.375rem', fontWeight: 500 }} onMouseOver={e => { e.currentTarget.style.background = '#d1d5db'; e.currentTarget.style.border = '1.5px solid #000'; }} onMouseOut={e => { e.currentTarget.style.background = '#f3f4f6'; e.currentTarget.style.border = '1.5px solid transparent'; }}>Add</Button>
            </div>
            {/* List of products to be added */}
            <div style={{ marginTop: '0.5rem', maxHeight: '14rem', overflowY: 'auto' }}>
              {order.items.length > 0 && (
                <div style={{ border: '1.5px solid #e5e7eb', borderRadius: '0.5rem', background: '#f9fafb', padding: '0.5rem 0.5rem 0.5rem 0.5rem', marginBottom: '0.5rem', minHeight: '3.5rem' }}>
                  <div style={{ display: 'flex', fontWeight: 600, color: '#374151', marginBottom: '0.25rem', fontSize: '1rem' }}>
                    <span style={{ flex: 2 }}>Name</span>
                    <span style={{ flex: 1, textAlign: 'center' }}>Quantity</span>
                    <span style={{ flex: 1, textAlign: 'center' }}>Unit Price</span>
                    <span style={{ flex: 1, textAlign: 'center' }}>Total</span>
                    <span style={{ flex: 0.5 }}></span>
                  </div>
                  {order.items.map((op, idx) => {
                    // Debug: log all product_ids and the one being searched
                    // console.log('productsList ids:', productsList.map(p => p.product_id));
                    // console.log('Searching for:', op.product_id);
                    const prod = productsList.find(p => String(p.product_id).trim() === String(op.product_id).trim());
                    return (
                      <div key={op.product_id + idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem', fontSize: '0.98rem', background: '#fff', borderRadius: '0.375rem', padding: '0.25rem 0.5rem' }}>
                        <span style={{ flex: 2 }}>{prod ? prod.name : op.product_id}</span>
                        <span style={{ flex: 1, textAlign: 'center' }}>x{op.quantity}</span>
                        <span style={{ flex: 1, textAlign: 'center', color: '#374151' }}>{prod ? `$${prod.price}` : '-'}</span>
                        <span style={{ flex: 1, textAlign: 'center', color: '#16a34a', fontWeight: 500 }}>{prod ? `$${(prod.price * op.quantity).toFixed(2)}` : '-'}</span>
                        <Button type="button" variant="link" style={{ color: '#dc2626', marginLeft: 'auto', flex: 0.5, fontWeight: 500 }} onClick={() => handleRemoveProduct(idx)}>Delete</Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
          <Button type="submit" className="w-full text-black mt-2" style={{ background: '#f3f4f6', color: '#111', border: '1.5px solid transparent', outline: 'none', transition: 'background 0.2s, border-color 0.2s, outline 0.2s', width: '100%', marginTop: '0.5rem' }} onMouseOver={e => { e.currentTarget.style.background = '#d1d5db'; e.currentTarget.style.border = '1.5px solid #000'; }} onMouseOut={e => { e.currentTarget.style.background = '#f3f4f6'; e.currentTarget.style.border = '1.5px solid transparent'; }}>Add Order</Button>
        </form>
      </div>
    </div>
  );
};

export default AddOrderForm;
