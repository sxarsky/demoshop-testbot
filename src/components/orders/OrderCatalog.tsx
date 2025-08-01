import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import OrderList from "./OrderList";
import { NavBar } from '@/components/ui/navbar';
import { getSessionIdFromCookie } from '@/lib/utils';

// Utility to get or generate a persistent session ID
async function getOrCreateSessionId() {
  const cookieName = 'demoshop_session_id';
  const match = document.cookie.match(/(?:^|; )demoshop_session_id=([^;]*)/);
  if (match) return match[1];
  // Generate new session ID using API
  try {
    const res = await fetch('https://dev.demoshop.skyramp.dev/api/v1/generate', {
      headers: { 'Authorization': `Bearer ${getSessionIdFromCookie()}` }
    });
    if (!res.ok) throw new Error('Failed to generate session ID');
    const data = await res.json();
    const sessionId = data.session_id || data.id || '';
    document.cookie = `${cookieName}=${sessionId}; path=/;`;
    return sessionId;
  } catch (err) {
    // Fallback to random words if API fails
    const words = [
      'apple', 'banana', 'cherry', 'delta', 'echo', 'foxtrot', 'golf', 'hotel', 'india', 'juliet',
      'kilo', 'lima', 'mango', 'november', 'oscar', 'papa', 'quebec', 'romeo', 'sierra', 'tango',
      'umbrella', 'victor', 'whiskey', 'xray', 'yankee', 'zulu', 'orange', 'peach', 'plum', 'berry',
      'cloud', 'river', 'mountain', 'forest', 'ocean', 'desert', 'prairie', 'meadow', 'valley', 'hill',
      'star', 'moon', 'sun', 'comet', 'nova', 'orbit', 'galaxy', 'asteroid', 'meteor', 'nebula'
    ];
    const pick = () => words[Math.floor(Math.random() * words.length)];
    const sessionId = `${pick()}-${pick()}-${pick()}`;
    document.cookie = `${cookieName}=${sessionId}; path=/;`;
    return sessionId;
  }
}

const AddOrderForm = React.lazy(() => import("./AddOrderForm"));

export default function OrderCatalog() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [deletedBanner, setDeletedBanner] = useState<{
    customer_email: string;
    itemCount: number;
  } | null>(null);
  const [sessionId, setSessionId] = useState('');

  // Show deleted banner if present in localStorage
  useEffect(() => {
    const banner = localStorage.getItem("deletedOrderBanner");
    if (banner) {
      setDeletedBanner(JSON.parse(banner));
      localStorage.removeItem("deletedOrderBanner");
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    getOrCreateSessionId().then(id => {
      if (mounted) setSessionId(id);
    });
    return () => { mounted = false; };
  }, []);

  return (
    <div className="min-h-screen bg-white px-6 py-10" style={{ width: '100%', maxWidth: '64rem', margin: '0 auto', paddingLeft: 0 }}>
      {/* Deleted Banner */}
      {deletedBanner && (
        <div className="max-w-xl mx-auto mb-6" data-testId="cancel-order-banner">
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
            data-testId="cancel-order-message-container"
          >
            <span data-testId="cancel-order-message">
              The order for <b data-testId="order-email">{deletedBanner.customer_email}</b> with <b data-testId="order-item-count">{deletedBanner.itemCount}</b> items has been cancelled.
            </span>
            <button
              className="ml-4 text-red-500 hover:text-red-700 font-bold text-lg px-2"
              aria-label="Dismiss"
              onClick={() => setDeletedBanner(null)}
              data-testId="cancel-order-banner-dismiss-btn"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Top Navigation */}
      <NavBar active="orders" />

      {/* Page Heading directly below nav */}
      <div style={{ width: '100%', marginLeft: 0 }}>
        <h1
          className="text-4xl font-bold text-gray-900"
          style={{
            textAlign: 'center',
            width: '100%',
            margin: 0,
            paddingTop: '0.5rem',
            marginBottom: '1.5rem',
          }}
          data-testId="order-catalog-heading"
        >
          Order Catalog
        </h1>
      </div>

      {/* Add Order Button */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
        <Button
          style={{
            width: '9rem',
            color: '#fff',
            background: '#111',
            border: '1.5px solid #111',
            transition: 'background 0.2s, border-color 0.2s, color 0.2s',
            fontWeight: 500,
            fontSize: '1.1rem',
            borderRadius: '0.5rem',
            padding: '0.75rem 0', // match Add Product button height
            boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
            outline: 'none',
            cursor: 'pointer',
          }}
          onMouseOver={e => {
            e.currentTarget.style.background = 'rgba(17,17,17,0.7)';
            e.currentTarget.style.borderColor = '#111';
            e.currentTarget.style.color = '#fff';
          }}
          onMouseOut={e => {
            e.currentTarget.style.background = '#111';
            e.currentTarget.style.borderColor = '#111';
            e.currentTarget.style.color = '#fff';
          }}
          onClick={() => setShowAddForm(true)}
          data-testId="add-order-btn"
        >
          Add Order
        </Button>
      </div>

      {/* AddOrderForm Modal */}
      {showAddForm && (
        <React.Suspense fallback={<div style={{position:'fixed',top:0,left:0,width:'100vw',height:'100vh',background:'rgba(31,41,55,0.35)',zIndex:100,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.5rem',color:'#374151'}}>Loading...</div>}>
          <AddOrderForm onClose={() => setShowAddForm(false)} />
        </React.Suspense>
      )}

      <div style={{ width: '100%' }}>
        <div style={{ maxWidth: '64rem', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <OrderList />
        </div>
      </div>
    </div>
  );
}
