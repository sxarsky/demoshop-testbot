import React from 'react';
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

function SessionIdDisplay({ sessionId, onEdit, onCopy, copied }: { sessionId: string, onEdit: () => void, onCopy: () => void, copied: boolean }) {
  return (
    <>
      <span
        style={{ color: '#1e293b', fontWeight: 700, marginLeft: '0.5rem', cursor: 'pointer', position: 'relative', display: 'inline-block' }}
        title={copied ? 'Copied!' : 'Click to copy session ID'}
        data-testId='session-id-value'
      >
        {sessionId}
        {copied && (
          <span style={{
            position: 'absolute',
            left: '50%',
            top: '-2.2rem',
            transform: 'translateX(-50%)',
            background: '#f0fdf4',
            color: '#059669',
            fontSize: '0.95rem',
            fontWeight: 600,
            borderRadius: '0.25rem',
            padding: '0.18rem 0.7rem',
            boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
            zIndex: 10,
            whiteSpace: 'nowrap',
          }}>Copied!</span>
        )}
      </span>
      <button
        onClick={onCopy}
        style={{
          background: 'transparent',
          border: 'none',
          padding: '0.1rem 0.3rem',
          marginLeft: '0.3rem',
          cursor: 'pointer',
          verticalAlign: 'middle',
        }}
        title="Copy Session ID"
      >
        {/* Copy icon */}
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ verticalAlign: 'middle', position: 'relative', top: '-2px', marginRight: '0.05rem' }}>
          <rect x="9" y="9" width="13" height="13" rx="2" fill="#2563eb"/>
          <rect x="2" y="2" width="13" height="13" rx="2" fill="#60a5fa"/>
        </svg>
      </button>
      <button
        onClick={onEdit}
        style={{
          background: 'transparent',
          border: 'none',
          padding: '0.1rem 0.3rem',
          marginLeft: '0.1rem',
          cursor: 'pointer',
          verticalAlign: 'middle',
        }}
        title="Edit Session ID"
      >
        {/* Material Design pencil edit icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          style={{ verticalAlign: 'middle', position: 'relative', top: '-2px', marginRight: '0.05rem' }}
        >
          <path d="M3 17.25V21h3.75l11.06-11.06a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0L3 17.25z" fill="#2563eb"/>
          <path d="M20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.84-1.83z" fill="#2563eb"/>
        </svg>
      </button>
    </>
  );
}

function SessionIdEdit({ inputValue, setInputValue, onSave, onCancel, inputRef }: { inputValue: string, setInputValue: (v: string) => void, onSave: () => void, onCancel: () => void, inputRef: React.RefObject<HTMLInputElement | null> }) {
  return (
    <>
      <input
        ref={inputRef as React.RefObject<HTMLInputElement>}
        type="text"
        value={inputValue}
        onChange={e => setInputValue(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter') {
            onSave();
          } else if (e.key === ' ') {
            e.preventDefault();
            setInputValue(inputValue + '-');
          }
        }}
        style={{
          fontSize: '1rem',
          fontWeight: 700,
          color: '#1e293b',
          border: '1px solid #2563eb',
          borderRadius: '0.25rem',
          padding: '0.1rem 0.4rem',
          marginLeft: '0.5rem',
          marginRight: '0.2rem',
        }}
      />
      <button
        onClick={onSave}
        style={{
          background: 'none',
          border: 'none',
          padding: 0,
          marginLeft: '0.05rem',
          cursor: 'pointer',
          verticalAlign: 'middle',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        title="Save Session ID"
      >
        {/* Green checkmark icon only */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          width="18"
          height="18"
          style={{ verticalAlign: 'middle', color: '#22c55e', fill: 'none', stroke: '#22c55e', strokeWidth: 2.5 }}
        >
          <polyline points="7 12 10 15 16 6" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <button
        onClick={onCancel}
        style={{
          background: 'transparent',
          border: 'none',
          padding: '0.1rem 0.3rem',
          marginLeft: '0.1rem',
          cursor: 'pointer',
          verticalAlign: 'middle',
        }}
        title="Cancel"
      >
        {/* Cancel icon (X) */}
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ verticalAlign: 'middle', position: 'relative', top: '-2px' }}>
          <line x1="6" y1="6" x2="18" y2="18" stroke="#ef4444" strokeWidth="2" />
          <line x1="6" y1="18" x2="18" y2="6" stroke="#ef4444" strokeWidth="2" />
        </svg>
      </button>
    </>
  );
}

export function NavBar({ active, forceUnderlineProducts, hideLinks }: { active: 'products' | 'orders', forceUnderlineProducts?: boolean, hideLinks?: boolean }) {
  const [ordersHover, setOrdersHover] = React.useState(false);
  const [productsHover, setProductsHover] = React.useState(false);
  const [newSessionHover, setNewSessionHover] = React.useState(false);
  const [sessionId, setSessionId] = React.useState('');
  const [editing, setEditing] = React.useState(false);
  const [inputValue, setInputValue] = React.useState('');
  const [copied, setCopied] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Always fetch session from cookie on mount
  React.useEffect(() => {
    const id = getSessionIdFromCookie();
    setSessionId(id);
    setInputValue(id);
  }, []);

  // Save session ID from input, validate, update cookie, refresh page, exit edit mode
  const handleSessionIdSave = React.useCallback(() => {
    const newSessionId = inputValue.trim();
    if (!newSessionId || newSessionId.length < 5) {
      alert('Session ID must be at least 5 characters.');
      return;
    }
    if (newSessionId === sessionId) {
      setEditing(false);
      return;
    }
    document.cookie = `demoshop_session_id=${newSessionId}; path=/;`;
    setSessionId(newSessionId);
    setEditing(false);
    window.location.href = '/products'; // Redirect to products page
  }, [inputValue, sessionId]);

  // Responsive width and spacing
  const navWidth = '100%';
  const navMaxWidth = '64rem';
  const logoGap = '0.5rem';
  const textMarginLeft = '0.5rem';
  // Add extra space between brand and nav links on OrderDetail page
  const navLinksGap = active === 'orders' ? '2.5rem' : '1rem';

  return (
    <header className="w-full" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', width: '100%' }} data-testId="navbar-header">
      {/* First line: Logo + Brand + Nav Links */}
      <div
        className={`mx-auto px-0 py-4 flex items-center justify-between`}
        style={{ width: hideLinks ? '800px' : navWidth, maxWidth: hideLinks ? '800px' : navMaxWidth }}
        data-testId="navbar-container"
      >
        {/* Logo + Brand (always left-aligned) */}
        <div className="flex items-center" style={{ gap: logoGap }} data-testId="navbar-brand-container">
          <a href="/products" data-testId="navbar-logo">
            <img
              src="/logo.avif"
              alt="Skyramp Logo"
              width={150}
              height={100}
              className="object-contain"
              style={{ cursor: 'pointer' }}
            />
          </a>
          <span
            data-testId="navbar-title"
            style={{
              fontSize: '1.25rem',
              fontWeight: 600,
              color: '#111827',
              marginLeft: textMarginLeft,
              letterSpacing: '-0.01em',
              userSelect: 'none',
              textAlign: 'left',
              whiteSpace: 'nowrap',
            }}
          >
            Demo Shop Admin Console
          </span>
        </div>
        {/* Nav Links */}
        {!hideLinks && (
          <nav className="flex items-center text-sm font-medium justify-end" style={{ gap: '0.1rem', marginLeft: 'auto' }} data-testId="navbar-nav">
            <a
              href="/products"
              data-testId="navbar-products"
              style={{
                color: '#60a5fa',
                textDecoration: (active === 'products' || forceUnderlineProducts) ? 'underline' : productsHover ? 'underline' : 'none',
                textUnderlineOffset: (active === 'products' || forceUnderlineProducts || productsHover) ? '4px' : undefined,
                fontWeight: 500,
                padding: '0.5rem 0.75rem',
                borderRadius: '0.375rem',
                transition: 'background 0.2s',
                background: 'transparent',
                marginRight: '0', // Minimal gap to Orders
              }}
              onMouseEnter={() => setProductsHover(true)}
              onMouseLeave={() => setProductsHover(false)}
            >
              Products
            </a>
            <a
              href="/orders"
              data-testId="navbar-orders"
              style={{
                color: '#60a5fa',
                textDecoration: active === 'orders' && !forceUnderlineProducts ? 'underline' : ordersHover ? 'underline' : 'none', // Underline only on OrderCatalog or hover
                textUnderlineOffset: (active === 'orders' && !forceUnderlineProducts) || ordersHover ? '4px' : undefined,
                fontWeight: 500,
                padding: '0.5rem 0.75rem',
                borderRadius: '0.375rem',
                transition: 'background 0.2s',
                background: 'transparent',
                marginLeft: '0', // Minimal gap to Products
                marginRight: '1.5rem', // Increased gap to Clear State
              }}
              onMouseEnter={() => setOrdersHover(true)}
              onMouseLeave={() => setOrdersHover(false)}
            >
              Orders
            </a>
            <a
              href="#"
              data-testId="navbar-clear-state"
              style={{
                color: '#fff',
                background: newSessionHover ? '#2563eb' : '#3b82f6',
                borderRadius: '0.5rem',
                padding: '0.5rem 1.25rem',
                fontWeight: 600,
                boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
                border: 'none',
                textDecoration: 'none',
                transition: 'background 0.2s, color 0.2s',
                display: 'inline-block', // Ensure one line
                whiteSpace: 'nowrap', // Prevent wrapping
                lineHeight: '1.5', // Normal line height
              }}
              onMouseEnter={() => setNewSessionHover(true)}
              onMouseLeave={() => setNewSessionHover(false)}
              onClick={async (e) => {
                e.preventDefault();
                try {
                  const sessionId = typeof document !== 'undefined' ? (document.cookie.match(/(?:^|; )demoshop_session_id=([^;]*)/)?.[1] || '') : '';
                  await fetch('https://dev.demoshop.skyramp.dev/api/v1/reset', {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${sessionId}` }
                  });
                  window.location.reload();
                } catch (err) {
                  alert('Failed to reset state.');
                }
              }}
            >
              Clear State
            </a>
          </nav>
        )}
      </div>
      {/* Second line: Session ID container */}
      <div
        className="w-full flex items-center justify-center"
        style={{ minHeight: '3.2rem', borderBottom: '1px solid #e5e7eb' }}
        data-testId="navbar-sessionid-row"
      >
        <span
          data-testId="session-id-container"
          style={{
            fontSize: '1rem',
            fontWeight: 500,
            color: '#2563eb',
            background: '#dbeafe',
            borderRadius: '0.375rem',
            padding: '0.25rem 0.75rem',
            letterSpacing: '0.01em',
            userSelect: 'none',
            textAlign: 'left',
            whiteSpace: 'nowrap',
            display: 'inline-block',
            margin: '0.1rem 0 0.1rem 0',
            position: 'relative',
            top: '-1.1rem', // Shift up more
          }}
        >
          Session ID: {editing ? (
            <SessionIdEdit
              inputValue={inputValue}
              setInputValue={setInputValue}
              onSave={handleSessionIdSave}
              onCancel={() => { setEditing(false); setInputValue(sessionId); }}
              inputRef={inputRef}
              data-testId="session-id-edit"
            />
          ) : (
            <SessionIdDisplay
              sessionId={sessionId}
              onEdit={() => setEditing(true)}
              onCopy={async () => {
                try {
                  await navigator.clipboard.writeText(sessionId);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1200);
                } catch (err) {
                  alert('Failed to copy session ID');
                }
              }}
              copied={copied}
              data-testId="session-id-display"
            />
          )}
        </span>
      </div>
    </header>
  );
}