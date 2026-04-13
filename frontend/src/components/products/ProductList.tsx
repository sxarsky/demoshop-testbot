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

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100] as const;
type PageSize = typeof PAGE_SIZE_OPTIONS[number];

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  pageSize: PageSize;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: PageSize) => void;
}

function PaginationControls({
  currentPage,
  totalPages,
  pageSize,
  onPageChange,
  onPageSizeChange,
}: PaginationControlsProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        padding: '0.5rem 0',
        flexWrap: 'wrap',
        gap: '0.75rem',
      }}
      data-testId="pagination-controls"
    >
      {/* Page size selector */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <label
          htmlFor="page-size-select"
          style={{ fontSize: '0.875rem', color: '#374151', whiteSpace: 'nowrap' }}
        >
          Items per page:
        </label>
        <select
          id="page-size-select"
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value) as PageSize)}
          style={{
            border: '1px solid #d1d5db',
            borderRadius: '0.375rem',
            padding: '0.25rem 0.5rem',
            fontSize: '0.875rem',
            background: '#fff',
            cursor: 'pointer',
          }}
          data-testId="page-size-select"
        >
          {PAGE_SIZE_OPTIONS.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
      </div>

      {/* Page indicator + navigation */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <span
          style={{ fontSize: '0.875rem', color: '#374151', whiteSpace: 'nowrap' }}
          data-testId="page-indicator"
        >
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          style={{
            padding: '0.25rem 0.75rem',
            borderRadius: '0.375rem',
            border: '1px solid #d1d5db',
            background: currentPage <= 1 ? '#f3f4f6' : '#fff',
            color: currentPage <= 1 ? '#9ca3af' : '#111827',
            cursor: currentPage <= 1 ? 'not-allowed' : 'pointer',
            fontSize: '0.875rem',
            fontWeight: 500,
          }}
          data-testId="pagination-prev"
        >
          ← Previous
        </button>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          style={{
            padding: '0.25rem 0.75rem',
            borderRadius: '0.375rem',
            border: '1px solid #d1d5db',
            background: currentPage >= totalPages ? '#f3f4f6' : '#fff',
            color: currentPage >= totalPages ? '#9ca3af' : '#111827',
            cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer',
            fontSize: '0.875rem',
            fontWeight: 500,
          }}
          data-testId="pagination-next"
        >
          Next →
        </button>
      </div>
    </div>
  );
}

export default function ProductList() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState<PageSize>(25)
  const location = useLocation();

  const fetchingRef = useRef(false);
  const lastFetchTimeRef = useRef(0);
  const FETCH_COOLDOWN = 5000; // 5 seconds cooldown

  const fetchProducts = useCallback(() => {
    // Prevent multiple simultaneous fetches
    if (fetchingRef.current) {
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

    return fetch(apiUrl('/api/v1/products?limit=1000'), {
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
        setCurrentPage(1);
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
  }, []);

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

  const totalPages = Math.max(1, Math.ceil(products.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedProducts = products.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const handlePageSizeChange = (size: PageSize) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  if (loading) return <div>Loading products...</div>
  if (error) return <div className="text-red-500">{error}</div>

  return (
    <div style={{ width: '100%' }} data-testId="product-list-container">
      {/* Top pagination controls */}
      <PaginationControls
        currentPage={safePage}
        totalPages={totalPages}
        pageSize={pageSize}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
      />

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
          marginTop: '1rem',
          marginBottom: '1rem',
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

      {/* Bottom pagination controls */}
      <PaginationControls
        currentPage={safePage}
        totalPages={totalPages}
        pageSize={pageSize}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
      />
    </div>
  )
}