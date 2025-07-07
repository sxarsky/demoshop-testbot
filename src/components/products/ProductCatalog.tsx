import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import ProductList from "./ProductList"
import AddProductForm from "./AddProductForm"

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

  return (
    <div className="min-h-screen bg-white px-6 py-10">
      {/* Deleted Banner */}
      {deletedBanner && (
        <div className="max-w-xl mx-auto mb-6">
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
            <span>Your product <b>{deletedBanner.name}</b> has been deleted!</span>
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
            <a
              href="/products"
              className="underline underline-offset-4"
              style={{ color: '#60a5fa' }}
            >
              Products   
            </a>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            <a
              href="/orders"
              className="hover:underline"
              style={{ color: '#60a5fa' }}
            >
              Orders
            </a>
          </nav>
        </div>
      </header>

      <div className="flex flex-col items-center pb-4 mb-8 gap-4">
        <h1 className="text-4xl font-bold text-gray-900 text-center">Product Catalog</h1>
        <Button
          variant="default"
          type="button"
          onClick={() => {
            console.log('Add Product button clicked');
            setShowAddForm(true);
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70" style={{position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.7)'}}>
          <div className="relative w-full max-w-md mx-auto" style={{zIndex: 101}}>
            <div className="bg-white rounded-lg shadow-lg p-6" style={{zIndex: 101, minWidth: 320, maxWidth: 400, background: '#fff', padding: 24, height: 'auto', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
              <AddProductForm />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}