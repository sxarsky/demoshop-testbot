import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import OrderList from "./OrderList";

export default function OrderCatalog() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [deletedBanner, setDeletedBanner] = useState<{
    customer_email: string;
    itemCount: number;
  } | null>(null);

  // Show deleted banner if present in localStorage
  useEffect(() => {
    const banner = localStorage.getItem("deletedOrderBanner");
    if (banner) {
      setDeletedBanner(JSON.parse(banner));
      localStorage.removeItem("deletedOrderBanner");
    }
  }, []);

  return (
    <div className="min-h-screen bg-white px-6 py-10" style={{ width: '100%', maxWidth: '64rem', margin: '0 auto' }}>
      {/* Deleted Banner */}
      {deletedBanner && (
        <div className="max-w-xl mx-auto mb-6">
          <div
            className="flex items-center justify-between text-red-800 shadow-sm text-sm"
            style={{
              background: "#fee2e2",
              borderRadius: "0.5rem",
              paddingLeft: "1.5rem",
              paddingRight: "1.5rem",
              paddingTop: "0.5rem",
              paddingBottom: "0.5rem",
              border: "none",
            }}
          >
            <span>
              The order for <b>{deletedBanner.customer_email}</b> with <b>{deletedBanner.itemCount}</b> items has been cancelled.
            </span>
            <button
              className="ml-4 text-red-500 hover:text-red-700 font-bold text-lg px-2"
              aria-label="Dismiss"
              onClick={() => setDeletedBanner(null)}
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Top Navigation */}
      <header className="w-full">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo + Brand */}
          <div className="flex items-center gap-2">
            <a href="https://skyramp.dev" target="_blank" rel="noopener noreferrer">
              <img
                src="/logo.avif"
                alt="Skyramp Logo"
                width={150}
                height={100}
                className="object-contain"
                style={{ cursor: 'pointer' }}
              />
            </a>
          </div>

          {/* Nav Links */}
          <nav className="flex items-center text-sm font-medium gap-x-16">
            <a href="/products" className="hover:underline" style={{ color: '#60a5fa' }}>
              Products
            </a>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            <a href="/orders" className="underline underline-offset-4" style={{ color: '#60a5fa' }}>
              Orders
            </a>
          </nav>
        </div>
      </header>

      <div className="flex flex-col items-center pb-4 mb-8 gap-4">
        <h1 className="text-4xl font-bold text-gray-900 text-center" style={{}}>
          Orders Catalog
        </h1>
      </div>
      <div style={{ width: '100%', maxWidth: '48rem', margin: '0 auto' }}>
        <OrderList />
      </div>
    </div>
  );
}
