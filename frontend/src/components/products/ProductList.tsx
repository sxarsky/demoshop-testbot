import { useEffect, useState, useRef, useCallback } from "react"
import { useLocation } from "react-router-dom"
import ProductItem from "./ProductItem"
import { getSessionIdFromCookie } from '../../lib/utils';
import { apiUrl } from '../../config';

interface Product {
  product_id: number
  name: string
  price: number
  category: string
  description: string
  image_url: string
  created_at: string
}

export default function ProductList() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const location = useLocation();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const fetchingRef = useRef(false);
    const lastFetchTimeRef = useRef(0);
    const FETCH_COOLDOWN = 5000; // 5 seconds cooldown

    const fetchProducts = useCallback(() => {
      // Prevent multiple simultaneous fetches
      if (fetchingRef.current) {
        // If already fetching, skip this call
        return Promise.resolve();
      }

      // Implement cooldown to prevent rapid successive fetches
      const now = Date.now();
      if (now - lastFetchTimeRef.current < FETCH_COOLDOWN) {
        console.log("Fetch cooldown active, skipping...");
        return Promise.resolve();
      }

      // Proceed with fetching products
      fetchingRef.current = true;
      setLoading(true);
      lastFetchTimeRef.current = now;

      const sessionId = getSessionIdFromCookie();

      // Fetch with pagination
      return fetch(apiUrl(`/api/v1/products?limit=100`), {
        headers: { 'Authorization': `Bearer ${sessionId}` }
      })
        .then(res => {
          if (!res.ok) throw new Error("Failed to fetch products");
          return res.json();
        })
        .then((data) => {
          const sorted = (data || []).sort(
            (a: { product_id: number; }, b: { product_id: number; }) => b.product_id - a.product_id
          );
          setProducts(sorted);

          // BUG: Total page calculation is off-by-one
          // Should be Math.ceil(sorted.length / pageSize), but we add 1 more page
          setTotalPages(Math.ceil(sorted.length / pageSize) + 1); // BUG: Off-by-one error

          return sorted;
        })
        .catch(err => {
          setError(err.message);
          throw err;
        })
        .finally(() => {
          setLoading(false);
          fetchingRef.current = false;
        });
    }, [pageSize]);

  useEffect(() => {
    fetchProducts();
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        fetchProducts();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [location, fetchProducts]);

  // Get paginated products
  const paginatedProducts = products.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleNextPage = () => {
    // BUG: Clicking Next on last page does nothing confusing - no error message
    // Just silently fails to do anything meaningful
    setCurrentPage(prev => prev + 1); // Will go past totalPages
  };

  const handlePrevPage = () => {
    setCurrentPage(prev => Math.max(1, prev - 1));
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    // BUG: Doesn't reset to page 1 when changing page size
    // If you're on page 10 and change size, you might show "page 10 of 2"
    // setCurrentPage(1); // This line is intentionally missing
  };

  if (loading) return <div>Loading products...</div>
  if (error) return <div className="text-red-500">{error}</div>

  return (
    <div style={{ width: '100%' }}>
      {/* Pagination controls at top */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.5rem',
        padding: '1rem',
        background: '#f9fafb',
        borderRadius: '0.5rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
            Page {currentPage} of {totalPages}
          </span>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              style={{
                padding: '0.5rem 1rem',
                background: currentPage === 1 ? '#e5e7eb' : '#111',
                color: currentPage === 1 ? '#9ca3af' : '#fff',
                border: 'none',
                borderRadius: '0.25rem',
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                fontSize: '0.875rem'
              }}
            >
              Previous
            </button>
            <button
              onClick={handleNextPage}
              disabled={currentPage >= totalPages}
              style={{
                padding: '0.5rem 1rem',
                background: currentPage >= totalPages ? '#e5e7eb' : '#111',
                color: currentPage >= totalPages ? '#9ca3af' : '#fff',
                border: 'none',
                borderRadius: '0.25rem',
                cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer',
                fontSize: '0.875rem'
              }}
            >
              Next
            </button>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <label htmlFor="pageSize" style={{ fontSize: '0.875rem', color: '#6b7280' }}>
            Items per page:
          </label>
          <select
            id="pageSize"
            value={pageSize}
            onChange={(e) => handlePageSizeChange(Number(e.target.value))}
            style={{
              padding: '0.5rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.25rem',
              fontSize: '0.875rem',
              background: 'white'
            }}
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
      </div>

      {/* Product grid */}
      <div
        style={{
          width: '100%',
          display: 'flex',
          flexWrap: 'wrap',
          columnGap: '2.5rem',
          rowGap: '2.5rem',
          justifyContent: 'center',
          alignItems: 'stretch',
        }}
        data-testId="product-list"
      >
        {paginatedProducts.map(product => (
          <div
            key={product.product_id}
            style={{
              flex: '0 1 27%',
              minWidth: '160px',
              maxWidth: '27%',
              height: '420px',
              display: 'flex',
              alignItems: 'stretch',
            }}
          >
            <ProductItem product={product} minHeight={400} data-testId={`product-name-${product.name}`} />
          </div>
        ))}
      </div>

      {/* Pagination controls at bottom */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: '2rem',
        padding: '1rem',
      }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            style={{
              padding: '0.5rem 1rem',
              background: currentPage === 1 ? '#e5e7eb' : '#111',
              color: currentPage === 1 ? '#9ca3af' : '#fff',
              border: 'none',
              borderRadius: '0.25rem',
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
              fontSize: '0.875rem'
            }}
          >
            Previous
          </button>
          <span style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', color: '#6b7280' }}>
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={handleNextPage}
            disabled={currentPage >= totalPages}
            style={{
              padding: '0.5rem 1rem',
              background: currentPage >= totalPages ? '#e5e7eb' : '#111',
              color: currentPage >= totalPages ? '#9ca3af' : '#fff',
              border: 'none',
              borderRadius: '0.25rem',
              cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer',
              fontSize: '0.875rem'
            }}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  )
}
