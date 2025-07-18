import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import ProductList from "./ProductList"
import AddProductForm from "./AddProductForm"
import { NavBar } from '../ui/navbar';

export default function ProductCatalog() {
  const [showAddForm, setShowAddForm] = useState(false)
  const [deletedBanner, setDeletedBanner] = useState<{ name: string } | null>(null);

  // Listen for custom close event from AddProductForm
  useEffect(() => {
    const handler = () => setShowAddForm(false);
    window.addEventListener('closeAddProductModal', handler);
    return () => window.removeEventListener('closeAddProductModal', handler);
  }, []);

  // Show deleted banner if present in localStorage
  useEffect(() => {
    const banner = localStorage.getItem('deletedProductBanner');
    if (banner) {
      setDeletedBanner(JSON.parse(banner));
      localStorage.removeItem('deletedProductBanner');
    }
  }, []);

  // Helper to get session ID from cookie
  function getSessionIdFromCookie() {
    const match = document.cookie.match(/(?:^|; )demoshop_session=([^;]*)/);
    return match ? decodeURIComponent(match[1]) : '';
  }

  return (
    <div className="min-h-screen bg-white px-6 py-10" style={{ width: '100%', maxWidth: '64rem', margin: '0 auto', paddingLeft: 0 }}>
      {/* Deleted Banner */}
      {deletedBanner && (
        <div className="max-w-xl mx-auto mb-6" data-testId="delete-message-box">
          <div
            className="flex items-center justify-between text-red-800 shadow-sm text-sm"
            style={{
              background: '#fee2e2', // light red
              borderRadius: '0.5rem', // rounded
              paddingLeft: '1.5rem',
              paddingRight: '1.5rem',
              paddingTop: '0.5rem',
              paddingBottom: '0.5rem',
              border: 'none',
            }}
          >
            <span data-testId="delete-message">Your product <b>{deletedBanner.name}</b> has been deleted!</span>
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
      <NavBar active="products" />

      {/* Page Heading directly below nav */}
      <h1
        className="text-4xl font-bold text-gray-900 text-center"
        style={{
          textAlign: 'center',
          width: '100%',
          margin: 0,
          paddingTop: '0.5rem',
          marginBottom: '1.5rem', // space below heading
        }}
        data-testId="product-catalog-heading"
      >
        Product Catalog
      </h1>

      <div className="flex flex-col items-center pb-4 mb-8 gap-4">
        <Button
          variant="default"
          type="button"
          onClick={() => {
            setShowAddForm(true);
          }}
          style={{
            transition: 'background 0.2s, border-color 0.2s, opacity 0.2s',
            border: '1.5px solid transparent', // Reserve border space to prevent size change
          }}
          onMouseOver={e => {
            e.currentTarget.style.opacity = '0.85';
            e.currentTarget.style.border = '1.5px solid #111';
          }}
          onMouseOut={e => {
            e.currentTarget.style.opacity = '1';
            e.currentTarget.style.border = '1.5px solid transparent';
          }}
        >
          Add Product
        </Button>
      </div>
      <div style={{ marginTop: '2rem' }}>
        <ProductList />
      </div>

      {/* Overlay for Add Product Form */}
      {showAddForm && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0,0,0,0.7)',
          }}
        >
          <div
            style={{
              zIndex: 101,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              height: '100%',
            }}
          >
            <div
              style={{
                minWidth: 320,
                maxWidth: 400,
                background: '#fff',
                padding: 24,
                borderRadius: '0.75rem',
                boxShadow:
                  '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)',
                height: 'auto',
                boxSizing: 'border-box',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                margin: 'auto', // ensures shadow is centered
              }}
            >
              <AddProductForm />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}